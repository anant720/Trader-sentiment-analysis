import { create } from 'zustand';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const useTasksStore = create((set, get) => ({
  tasks: [],
  isLoading: false,

  subscribeTasks: (uid) => {
    if (!uid) return;
    set({ isLoading: true });

    const q = collection(db, 'tasks', uid, 'items');

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ tasks: data, isLoading: false });
    }, (error) => {
      console.error("Tasks Error:", error);
      set({ isLoading: false });
      alert(`Firestore Error (Tasks): ${error.message}`);
    });

    return unsub;
  },

  addTask: async (uid, task) => {
    if (!uid) return;
    const { title, subject, priority, dueDate, notes } = task;
    await addDoc(collection(db, 'tasks', uid, 'items'), {
      title,
      subject,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || '',
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  updateTask: async (uid, taskId, task) => {
    if (!uid || !taskId) return;
    const { title, subject, priority, dueDate, notes } = task;
    const docRef = doc(db, 'tasks', uid, 'items', taskId);
    await updateDoc(docRef, {
      title,
      subject,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes || '',
      updatedAt: serverTimestamp(),
    });
  },

  toggleComplete: async (uid, taskId, isCompleted) => {
    if (!uid) return;
    const docRef = doc(db, 'tasks', uid, 'items', taskId);
    await updateDoc(docRef, { 
      isCompleted: !isCompleted,
      updatedAt: serverTimestamp()
    });
  },

  deleteTask: async (uid, taskId) => {
    if (!uid) return;
    const docRef = doc(db, 'tasks', uid, 'items', taskId);
    await deleteDoc(docRef);
  }
}));

export default useTasksStore;

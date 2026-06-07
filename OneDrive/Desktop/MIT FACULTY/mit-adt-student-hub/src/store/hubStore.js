import { create } from 'zustand';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const useHubStore = create((set) => ({
  announcements: [],
  events: [],
  isLoading: false,

  subscribeHub: () => {
    set({ isLoading: true });

    // Announcements listener
    const qAnn = query(
      collection(db, 'announcements'),
      where('isActive', '==', true)
      // orderBy('publishedAt', 'desc')
    );

    const unsubAnn = onSnapshot(qAnn, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ announcements: data, isLoading: false });
    }, (error) => {
      console.error("Announcements Error:", error);
      set({ isLoading: false });
      alert(`Firestore Error (Announcements): ${error.message}`);
    });

    // Events listener
    const qEv = query(
      collection(db, 'events'),
      where('isActive', '==', true)
      // orderBy('startTime', 'asc')
    );

    const unsubEv = onSnapshot(qEv, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ events: data });
    }, (error) => {
      console.error("Events Error:", error);
      alert(`Firestore Error (Events): ${error.message}`);
    });

    return () => {
      unsubAnn();
      unsubEv();
    };
  }
}));

export default useHubStore;

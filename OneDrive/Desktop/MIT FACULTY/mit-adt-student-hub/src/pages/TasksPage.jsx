import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTasksStore from '../store/tasksStore';
import TaskItem from '../components/tasks/TaskItem';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';

export default function TasksPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = useAuthStore(s => s.isAdmin);
  const tasks = useTasksStore(s => s.tasks);
  const isLoading = useTasksStore(s => s.isLoading);
  const subscribeTasks = useTasksStore(s => s.subscribeTasks);
  const toggleComplete = useTasksStore(s => s.toggleComplete);
  const deleteTask = useTasksStore(s => s.deleteTask);
  const [filter, setFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeTasks(user.uid);
    return unsub;
  }, [user?.uid, subscribeTasks]);

  const filteredTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      if ((a.isCompleted ? 1 : 0) !== (b.isCompleted ? 1 : 0)) {
        return (a.isCompleted ? 1 : 0) - (b.isCompleted ? 1 : 0);
      }
      const aDate = a.dueDate?.toDate ? a.dueDate.toDate().getTime() : Infinity;
      const bDate = b.dueDate?.toDate ? b.dueDate.toDate().getTime() : Infinity;
      return aDate - bDate;
    });

    if (filter === 'pending') return sorted.filter(task => !task.isCompleted);
    if (filter === 'completed') return sorted.filter(task => task.isCompleted);
    return sorted;
  }, [tasks, filter]);

  const openCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingTask(null);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 pb-28 pt-4 md:px-8">
      {/* Header Area */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-black/5 pb-4 mb-6 md:bg-transparent md:border-none md:backdrop-blur-none" style={{ paddingTop: 'max(16px, var(--safe-top))' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-black tracking-tight text-[var(--color-text)]">Tasks Hub</h1>
            <p className="text-[var(--color-text-secondary)] mt-1 font-medium text-[15px]">Organize your academic workload.</p>
          </div>
          <button
            onClick={openCreate}
            className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="mt-6 flex gap-2 overflow-x-auto scroll-hide">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`chip ${filter === key ? 'chip-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-[24px] bg-white border border-black/[0.04] animate-pulse shadow-sm" />
          ))
        ) : filteredTasks.length ? (
          filteredTasks.map((task, index) => {
            return (
              <div key={task.id}>
                <TaskItem
                  task={task}
                  onToggle={(id, isCompleted) => toggleComplete(user.uid, id, isCompleted)}
                  onDelete={(id) => deleteTask(user.uid, id)}
                  onEdit={openEdit}
                />
              </div>
            );
          })
        ) : (
          <div className="rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] mt-8">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg)] mx-auto mb-5 flex items-center justify-center">
              <Plus size={28} className="text-[var(--color-icon)] opacity-50" />
            </div>
            <p className="text-[var(--color-text)] text-[20px] font-black tracking-tight">
              {filter === 'completed' ? 'No completed tasks yet' : 'You are all caught up!'}
            </p>
            <p className="text-[var(--color-text-secondary)] text-[15px] mt-2 font-medium">
              Tap the plus button to add your first task.
            </p>
            <button onClick={openCreate} className="btn-primary w-full mt-6">
              Create New Task
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <TaskForm onClose={closeForm} task={editingTask} />
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Calendar, Flag, BookOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useTasksStore from '../../store/tasksStore';

const SUBJECTS = ['CSE', 'ECE', 'ME', 'IT', 'CE', 'Design Thinking', 'Other'];

export default function TaskForm({ onClose, task }) {
  const user = useAuthStore(s => s.user);
  const addTask = useTasksStore(s => s.addTask);
  const updateTask = useTasksStore(s => s.updateTask);
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    subject: task?.subject || 'CSE',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate?.toDate
      ? task.dueDate.toDate().toISOString().split('T')[0]
      : task?.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    notes: task?.notes || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !user) return;
    
    setLoading(true);
    try {
      if (task?.id) {
        await updateTask(user.uid, task.id, formData);
      } else {
        await addTask(user.uid, formData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 scroll-hide">
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">Title</label>
            <input 
              required
              className="w-full bg-[var(--color-bg-secondary)] rounded-[16px] p-4 text-[15px] font-bold outline-none border border-black/5 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all placeholder:text-[var(--color-icon)]" 
              placeholder="E.g., Complete UI Design"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
              <BookOpen size={12} strokeWidth={2.5} /> Subject
            </label>
            <select 
              className="w-full bg-[var(--color-bg-secondary)] rounded-[16px] p-4 text-[15px] font-bold outline-none border border-black/5 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all appearance-none"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
              <Flag size={12} strokeWidth={2.5} /> Priority
            </label>
            <select 
              className="w-full bg-[var(--color-bg-secondary)] rounded-[16px] p-4 text-[15px] font-bold outline-none border border-black/5 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all appearance-none"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2 flex items-center gap-1">
            <Calendar size={12} strokeWidth={2.5} /> Due Date
          </label>
          <input 
            type="date"
            className="w-full bg-[var(--color-bg-secondary)] rounded-[16px] p-4 text-[15px] font-bold outline-none border border-black/5 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all" 
            value={formData.dueDate}
            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">Notes (Optional)</label>
          <textarea 
            rows={3}
            className="w-full bg-[var(--color-bg-secondary)] rounded-[16px] p-4 text-[15px] font-medium outline-none border border-black/5 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all resize-none" 
            placeholder="Add some details..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </form>

      <div className="px-6 py-5 border-t border-black/5 bg-[var(--color-bg)]">
        <button 
          disabled={loading}
          onClick={handleSubmit}
          className="btn-primary w-full h-14 text-[16px] rounded-[16px]"
        >
          {loading ? (task?.id ? 'Saving...' : 'Creating...') : (task?.id ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </div>
  );
}

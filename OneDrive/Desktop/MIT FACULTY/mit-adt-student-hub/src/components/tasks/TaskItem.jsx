import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle2, Circle, Trash2, Clock, AlertTriangle, Pencil } from 'lucide-react';

const PRIORITY_COLORS = {
  high:   '#EF4444', // Red-500
  medium: '#F59E0B', // Amber-500
  low:    '#3B82F6'  // Blue-500
};

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const { id, title, subject, priority, dueDate, isCompleted, notes } = task;
  
  // Swipe logic
  const x = useMotionValue(0);
  const background = useTransform(x, [-100, 0], ['#EF4444', '#FFFFFF00']);
  const opacity = useTransform(x, [-100, -50], [1, 0]);

  const dateStr = dueDate?.toDate 
    ? dueDate.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'No date';

  const isOverdue = !isCompleted && dueDate?.toDate && dueDate.toDate() < new Date();

  return (
    <div className="relative mb-4 group">
      {/* Delete Background */}
      <motion.div 
        className="absolute inset-0 bg-red-500 rounded-[24px] flex items-center justify-end px-6 text-white shadow-inner"
        style={{ opacity }}
      >
        <Trash2 size={24} />
      </motion.div>

      {/* Foreground Swipeable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) onDelete(id);
        }}
        className={`relative z-10 p-5 rounded-[24px] bg-white border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-start gap-4 transition-opacity duration-300 ${isCompleted ? 'opacity-60 bg-gray-50/50' : ''}`}
      >
        {/* Priority Bar Indicator */}
        <div 
          className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full"
          style={{ background: PRIORITY_COLORS[priority] || '#D1D5DB' }}
        />

        {/* Checkbox */}
        <button 
          onClick={() => onToggle(id, isCompleted)}
          className={`flex-shrink-0 mt-0.5 transition-all active:scale-90 ${isCompleted ? 'text-green-500' : 'text-[var(--color-icon)] hover:text-[var(--color-primary)]'}`}
        >
          {isCompleted ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <Circle size={24} strokeWidth={2} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className={`text-[17px] font-bold text-[var(--color-text)] leading-tight tracking-tight ${isCompleted ? 'line-through text-[var(--color-text-secondary)]' : ''}`}>
              {title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center flex-shrink-0 transition-colors active:bg-gray-200"
            >
              <Pencil size={14} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {!!notes && (
            <p className={`mt-2 text-[14px] text-[var(--color-text-secondary)] leading-[1.5] ${isCompleted ? 'line-through' : ''}`}>
              {notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest ${isCompleted ? 'bg-gray-200 text-gray-500 line-through' : 'bg-blue-50 text-blue-700'}`}>
              {subject}
            </div>
            
            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-md' : 'text-[var(--color-text-secondary)]'}`}>
              {isOverdue ? <AlertTriangle size={12} strokeWidth={2.5} /> : <Clock size={12} strokeWidth={2.5} />}
              <span className={`text-[12px] font-bold tracking-wide ${isCompleted ? 'line-through' : ''}`}>{dateStr}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

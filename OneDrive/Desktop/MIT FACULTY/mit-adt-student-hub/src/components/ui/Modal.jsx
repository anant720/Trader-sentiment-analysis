import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal — centered floating card with backdrop blur.
 * Usage:
 *   <Modal isOpen={bool} onClose={fn} title="Optional">
 *     ...children
 *   </Modal>
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = '400px' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            className="relative w-full bg-[var(--color-bg)] rounded-[32px] shadow-2xl border border-black/5 flex flex-col overflow-hidden max-h-[90vh]"
            style={{ maxWidth }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header row */}
            {title && (
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-[20px] font-black text-[var(--color-text)] tracking-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-bg-secondary)] hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <X size={18} className="text-[var(--color-text-secondary)]" strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto scroll-hide">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

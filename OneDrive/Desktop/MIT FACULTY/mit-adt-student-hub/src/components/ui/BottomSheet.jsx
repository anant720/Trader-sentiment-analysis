import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * BottomSheet — slide-up modal with drag-to-dismiss.
 * Usage:
 *   <BottomSheet isOpen={bool} onClose={fn} title="Optional">
 *     ...children
 *   </BottomSheet>
 */
export default function BottomSheet({ isOpen, onClose, title, children, maxHeight = '90dvh' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="bottom-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="bottom-sheet"
            style={{ maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            {/* Handle */}
            <div className="sheet-handle" />

            {/* Header row */}
            {title && (
              <div className="flex items-center justify-between px-4 pb-3">
                <h3 className="text-[17px] font-bold text-[var(--color-text)]">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-bg-secondary)] active:opacity-70"
                >
                  <X size={16} color="var(--color-text-secondary)" />
                </button>
              </div>
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto scroll-hide" style={{ maxHeight: 'calc(90dvh - 60px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

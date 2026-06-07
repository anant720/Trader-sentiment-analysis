import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

const ICONS = {
  success: <CheckCircle2 size={18} color="#4ADE80" />,
  error:   <XCircle      size={18} color="#F87171" />,
  info:    <Info         size={18} color="#60A5FA" />,
};

/**
 * Toast — appears above the bottom nav, auto-dismisses.
 */
export default function Toast({ message, type = 'info', visible, onHide }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="toast"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {ICONS[type]}
          <span className="flex-1">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Simple hook for toast state */
import { useState, useCallback } from 'react';
export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const show = useCallback((message, type = 'info') => {
    setToast({ visible: true, message, type });
  }, []);
  const hide = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);
  return { toast, show, hide };
}

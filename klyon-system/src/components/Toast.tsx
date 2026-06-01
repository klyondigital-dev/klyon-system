import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-[#0f172a]/90 border-accent-blue text-accent-blue';
      case 'error':
        return 'bg-[#0f172a]/90 border-red-500 text-red-500';
      case 'info':
      default:
        return 'bg-[#0f172a]/90 border-accent-purple text-accent-purple';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-6 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl border border-opacity-50 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] ${getColors()}`}
          style={{
            boxShadow: type === 'success' ? '0 0 20px rgba(0, 240, 255, 0.2)' : type === 'error' ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(138, 43, 226, 0.2)'
          }}
        >
          {type === 'success' ? <CheckCircle className="w-5 h-5" /> : type === 'error' ? <XCircle className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current animate-pulse" />}
          <span className="font-medium text-gray-100">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

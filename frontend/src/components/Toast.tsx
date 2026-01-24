import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <AlertCircle className="w-5 h-5 text-blue-400" />
  };

  const styles = {
    success: 'bg-slate-900 border-emerald-500/20 text-emerald-100',
    error: 'bg-slate-900 border-rose-500/20 text-rose-100',
    info: 'bg-slate-900 border-blue-500/20 text-blue-100'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl shadow-black/20 animate-in slide-in-from-right-10 fade-in duration-300 ${styles[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium pr-4">{message}</p>
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-auto"
      >
        <X className="w-4 h-4 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
};

export default Toast;

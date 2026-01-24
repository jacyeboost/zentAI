import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  children,
  confirmLabel = 'Confirmar', 
  cancelLabel = 'Cancelar',
  isDestructive = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-4xl w-full p-6 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          {message && (
             <div className={`p-3 rounded-xl ${isDestructive ? 'bg-rose-500/10 text-rose-400' : 'bg-primary-500/10 text-primary-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}
          <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            {message && <p className="text-slate-400 text-sm leading-relaxed mb-4">{message}</p>}
            {children}
          </div>
        </div>

        {(onConfirm) && (
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-lg transition-all ${
                isDestructive 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' 
                  : 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/20'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

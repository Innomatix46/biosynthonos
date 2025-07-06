/**
 * @file UI components for the Toast notification system.
 */
import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../hooks/useToast';

interface ToastProps extends ToastMessage {
  onRemove: () => void;
}

const ICONS: Record<ToastMessage['type'], React.ReactNode> = {
  success: <CheckCircle className="text-brand-green" />,
  error: <XCircle className="text-brand-pink" />,
  info: <Info className="text-brand-blue" />,
};

const TYPE_CLASSES: Record<ToastMessage['type'], string> = {
    success: 'border-brand-green',
    error: 'border-brand-pink',
    info: 'border-brand-blue'
};


const Toast: React.FC<ToastProps> = ({ message, type, onRemove }) => {
  return (
    <div 
        className={`flex items-start p-4 mb-4 text-white bg-gray-800 border-l-4 rounded-r-lg shadow-lg animate-toast-in ${TYPE_CLASSES[type]}`} 
        role="alert"
        aria-live="assertive"
    >
      <div className="mr-3 shrink-0">{ICONS[type]}</div>
      <div className="flex-1 text-sm font-medium text-gray-300">{message}</div>
      <button onClick={onRemove} className="ml-4 -mr-2 -mt-2 p-2 text-gray-500 hover:text-white transition-colors rounded-full" aria-label="Close">
        <X size={18} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: (ToastMessage & { id: string })[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 right-0 z-[100] p-4 w-full max-w-sm" aria-live="polite">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};
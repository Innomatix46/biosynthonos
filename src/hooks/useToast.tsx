/**
 * @file A custom hook and provider for a simple, global toast notification system.
 */
import React, { useState, useCallback, useMemo, useContext, createContext } from 'react';
import { nanoid } from 'nanoid';
import { ToastContainer } from '../components/ui/Toast';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Toast extends ToastMessage {
  id: string;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((type: ToastMessage['type'], message: string, duration = 5000) => {
    const id = nanoid();
    setToasts(prevToasts => [...prevToasts, { id, type, message }]);
    
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);

    // This return is not strictly necessary for functionality but good practice for cleanup
    // if the provider were to unmount, which it won't in this app's lifecycle.
    return () => clearTimeout(timer);
  }, [removeToast]);

  const toastApi = useMemo(() => ({
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
    info: (message: string, duration?: number) => addToast('info', message, duration),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: toastApi }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
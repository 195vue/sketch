import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let toastId = 0;
const listeners: Array<(toast: ToastItem) => void> = [];

export const showToast = (message: string, type: ToastType = 'success') => {
  const toast: ToastItem = {
    id: ++toastId,
    type,
    message,
  };
  listeners.forEach((listener) => listener(toast));
};

export const Toast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: ToastItem) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3000);
  }, []);

  useState(() => {
    listeners.push(addToast);
    return () => {
      const index = listeners.indexOf(addToast);
      if (index > -1) listeners.splice(index, 1);
    };
  });

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'error':
        return 'bg-danger-50 border-danger-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextClass = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-success-800';
      case 'error':
        return 'text-danger-800';
      case 'warning':
        return 'text-warning-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-fadeIn min-w-[280px] ${getBgClass(toast.type)}`}
        >
          {getIcon(toast.type)}
          <span className={`flex-1 text-sm font-medium ${getTextClass(toast.type)}`}>
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

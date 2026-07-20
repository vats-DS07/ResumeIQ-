import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 3000 }) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, title, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toastHelper = {
    success: (title, message, duration) => addToast({ title, message, type: 'success', duration }),
    error: (title, message, duration) => addToast({ title, message, type: 'error', duration }),
    warning: (title, message, duration) => addToast({ title, message, type: 'warning', duration }),
    info: (title, message, duration) => addToast({ title, message, type: 'info', duration }),
    custom: addToast,
  };

  return (
    <ToastContext.Provider value={toastHelper}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard = ({ toast, onClose }) => {
  const { title, message, type } = toast;
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-danger shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
    info: <Info className="w-5 h-5 text-primary shrink-0" />,
  };

  const borders = {
    success: 'border-l-4 border-l-emerald-500',
    error: 'border-l-4 border-l-danger',
    warning: 'border-l-4 border-l-warning',
    info: 'border-l-4 border-l-primary',
  };

  return (
    <div
      className={clsx(
        'w-full bg-surface border border-border p-4 rounded-md shadow-elevated flex gap-3 pointer-events-auto transition-all duration-200 animate-slide-in-right',
        borders[type]
      )}
      style={{
        animation: 'slideInRight 0.25s ease forwards'
      }}
    >
      {icons[type]}
      <div className="flex-1 flex flex-col gap-0.5">
        {title && <h4 className="font-semibold text-sm text-text leading-tight">{title}</h4>}
        {message && <p className="text-xs text-text-secondary leading-normal">{message}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-text-secondary hover:text-text cursor-pointer p-0.5 rounded hover:bg-bg self-start transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

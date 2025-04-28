import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (data: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: Toast = {
      id,
      title: data.title,
      description: data.description,
      variant: data.variant || 'default',
      duration: data.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto dismiss
    setTimeout(() => {
      dismiss(id);
    }, newToast.duration);
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const Toaster: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4 w-full sm:max-w-sm z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-lg shadow-lg ${
              toast.variant === 'destructive' ? 'bg-red-600 text-white' :
              toast.variant === 'success' ? 'bg-green-600 text-white' :
              toast.variant === 'warning' ? 'bg-yellow-600 text-white' :
              'bg-white text-neutral-800 border border-neutral-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{toast.title}</h3>
                {toast.description && (
                  <p className={`mt-1 text-sm ${
                    toast.variant === 'destructive' || toast.variant === 'success' || toast.variant === 'warning'
                      ? 'text-white text-opacity-90' 
                      : 'text-neutral-600'
                  }`}>
                    {toast.description}
                  </p>
                )}
              </div>
              <button 
                onClick={() => dismiss(toast.id)}
                className={`p-1 rounded-full ${
                  toast.variant === 'destructive' || toast.variant === 'success' || toast.variant === 'warning'
                    ? 'text-white text-opacity-70 hover:text-opacity-100'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Initialize the provider in a composite component
export default function ToastRoot({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  );
}

export { ToastContext }
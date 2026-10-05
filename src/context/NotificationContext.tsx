import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from '../components/common/ToastContainer';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration?: number;
  timestamp: number;
}

export interface ShowToastOptions {
  message: string;
  type?: ToastType;
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  toasts: ToastItem[];
  showToast: (options: ShowToastOptions) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    ({ message, type = 'info', title, duration = 4000 }: ShowToastOptions): string => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const newToast: ToastItem = {
        id,
        message,
        title,
        type,
        duration,
        timestamp: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, type: 'success', title, duration }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, type: 'error', title, duration }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, type: 'info', title, duration }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, type: 'warning', title, duration }),
    [showToast]
  );

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        info,
        warning,
        dismissToast,
        clearAll,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Convenient alias for useNotification
export const useToast = useNotification;

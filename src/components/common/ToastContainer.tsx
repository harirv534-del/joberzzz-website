import React from 'react';
import { ToastItem, ToastType } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </aside>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const toastTypeStyles: Record<
  ToastType,
  {
    bg: string;
    border: string;
    text: string;
    titleColor: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    progressBg: string;
  }
> = {
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200',
    text: 'text-slate-700',
    titleColor: 'text-emerald-950',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    progressBg: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-white',
    border: 'border-rose-200',
    text: 'text-slate-700',
    titleColor: 'text-rose-950',
    icon: AlertCircle,
    iconColor: 'text-rose-600',
    progressBg: 'bg-rose-500',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    text: 'text-slate-700',
    titleColor: 'text-amber-950',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    progressBg: 'bg-amber-500',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    text: 'text-slate-700',
    titleColor: 'text-blue-950',
    icon: Info,
    iconColor: 'text-blue-600',
    progressBg: 'bg-blue-500',
  },
};

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const styles = toastTypeStyles[toast.type] || toastTypeStyles.info;
  const IconComponent = styles.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-full rounded-xl ${styles.bg} border ${styles.border} shadow-lg shadow-slate-900/5 p-3.5 transition-all transform duration-200 ease-out flex items-start gap-3 relative overflow-hidden`}
    >
      <div className={`shrink-0 mt-0.5 ${styles.iconColor}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        {toast.title && (
          <h4 className={`text-xs font-bold leading-tight mb-0.5 ${styles.titleColor}`}>
            {toast.title}
          </h4>
        )}
        <p className={`text-xs font-medium leading-relaxed ${styles.text}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress animation line if duration is set */}
      {toast.duration && toast.duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-0.5 ${styles.progressBg} opacity-80`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
            width: '100%',
          }}
        />
      )}
    </div>
  );
};

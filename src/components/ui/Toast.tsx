import { forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ message, type = 'info', duration = 5000, onClose, className }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
      success: 'bg-green-500 text-white border-green-600',
      error: 'bg-red-500 text-white border-red-600',
      warning: 'bg-yellow-500 text-white border-yellow-600',
      info: 'bg-blue-500 text-white border-blue-600'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed top-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300',
          typeStyles[type],
          className
        )}
      >
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
            className="ml-4 text-current opacity-70 hover:opacity-100 focus:outline-none"
            aria-label="Cerrar notificación"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);
Toast.displayName = 'Toast';

// Toast Container para múltiples toasts
interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export type { ToastProps };

import { forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, children, className }, ref) => {
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal content */}
        <div
          ref={ref}
          className={cn(
            'relative z-10 max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-surface p-6 shadow-xl',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4 flex items-center justify-between', className)}
    >
      {children}
    </div>
  )
);
ModalHeader.displayName = 'ModalHeader';

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ children, className }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold text-foreground', className)}
    >
      {children}
    </h2>
  )
);
ModalTitle.displayName = 'ModalTitle';

interface ModalCloseButtonProps {
  onClick: () => void;
  className?: string;
}

const ModalCloseButton = forwardRef<HTMLButtonElement, ModalCloseButtonProps>(
  ({ onClick, className }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        'rounded-full p-1 text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary-500',
        className
      )}
      aria-label="Cerrar modal"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  )
);
ModalCloseButton.displayName = 'ModalCloseButton';

export { Modal, ModalHeader, ModalTitle, ModalCloseButton };


import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-2 border-border border-t-primary-500',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner = ({ text = 'Cargando...', size = 'md', className }: LoadingSpinnerProps) => (
  <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
    <Spinner size={size} />
    {text && <p className="text-sm text-muted-foreground">{text}</p>}
  </div>
);

export { Spinner, LoadingSpinner };

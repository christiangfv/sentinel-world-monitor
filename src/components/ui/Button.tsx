'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'plasma' | 'ghost' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'plasma', size = 'md', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      plasma: 'bg-gradient-to-r from-plasma to-plasma-hover text-primary-foreground shadow-[0_4px_16px_rgba(212,181,122,0.25)] hover:shadow-[0_6px_24px_rgba(212,181,122,0.4)] hover:scale-[1.02] active:scale-[0.98]',
      ghost: 'bg-transparent text-smoke hover:bg-shadow/60 hover:text-muted hover:backdrop-blur-sm',
      outline: 'bg-transparent border border-border text-muted hover:border-plasma/30 hover:bg-shadow/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
      glass: 'glass-subtle text-muted hover:text-foreground hover:border-plasma/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_20px_rgba(212,181,122,0.06)]',
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }

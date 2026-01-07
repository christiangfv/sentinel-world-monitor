'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'plasma' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'plasma', size = 'md', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      plasma: 'bg-gradient-to-r from-[#D4B57A] to-[#A8925A] text-[#0D0E14] hover:shadow-[0_0_20px_rgba(212,181,122,0.3)]',
      ghost: 'bg-transparent text-[#8890A0] hover:bg-[#1A1B22] hover:text-[#E8E8F0]',
      outline: 'bg-transparent border border-[#4A5060] text-[#E8E8F0] hover:border-[#7088A0] hover:bg-[#1A1B22]',
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

'use client'

import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'plasma' | 'mist' | 'success' | 'warning' | 'danger' | 'secondary'
}

export function Badge({ className, variant = 'plasma', ...props }: BadgeProps) {
  const variants = {
    plasma: 'bg-[#D4B57A]/15 text-[#D4B57A] border-[#D4B57A]/30',
    mist: 'bg-[#7088A0]/15 text-[#7088A0] border-[#7088A0]/30',
    success: 'bg-[#4ADE80]/15 text-[#4ADE80] border-[#4ADE80]/30',
    warning: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
    danger: 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30',
    secondary: 'bg-[#4A5060]/30 text-[#8890A0] border-[#4A5060]/40',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

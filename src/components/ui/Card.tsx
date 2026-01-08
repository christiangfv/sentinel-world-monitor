'use client'

import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-[#1A1B22]/85 backdrop-blur-xl border border-[#D4B57A]/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
        'transition-all duration-300 ease-out',
        'hover:border-[#D4B57A]/30 hover:bg-[#1A1B22]/95',
        'ring-1 ring-white/5 ring-inset',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pb-2', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[#E8E8F0] font-semibold tracking-tight', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-[#8890A0] text-sm mt-1.5 leading-relaxed', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0 flex gap-2', className)} {...props} />
}

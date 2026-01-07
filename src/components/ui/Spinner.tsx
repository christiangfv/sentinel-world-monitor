'use client'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }

  return (
    <div
      className={`${sizes[size]} border-[#D4B57A] border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

export function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Spinner size="lg" />
      {text && <p className="text-[#8890A0] text-sm">{text}</p>}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const initial = (user.displayName || user.email || 'U')[0].toUpperCase()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Usuario'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[#D4B57A] flex items-center justify-center text-[#0D0E14] text-sm font-medium">
            {initial}
          </div>
        )}
        <span className="hidden md:block text-sm text-[#E8E8F0]">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <svg
          className={`h-4 w-4 text-[#8890A0] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <Card className="absolute right-0 top-full mt-2 z-50 w-56 p-0 shadow-xl">
            <div className="p-4 border-b border-[#4A5060]/30">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#D4B57A] flex items-center justify-center text-[#0D0E14] font-medium">
                    {initial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#E8E8F0] font-medium truncate">
                    {user.displayName || 'Usuario'}
                  </p>
                  <p className="text-xs text-[#8890A0] truncate">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => { setIsOpen(false); window.location.href = '/dashboard' }}
                className="w-full px-3 py-2 text-sm text-left text-[#8890A0] hover:text-[#E8E8F0] hover:bg-[#1A1B22] rounded-md flex items-center gap-2"
              >
                <span>📊</span> Panel
              </button>
              <button
                onClick={() => { setIsOpen(false); window.location.href = '/settings' }}
                className="w-full px-3 py-2 text-sm text-left text-[#8890A0] hover:text-[#E8E8F0] hover:bg-[#1A1B22] rounded-md flex items-center gap-2"
              >
                <span>⚙️</span> Config
              </button>

              <div className="border-t border-[#4A5060]/30 my-2" />

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm text-left text-[#F87171] hover:bg-[#F87171]/10 rounded-md flex items-center gap-2"
              >
                <span>🚪</span> Salir
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

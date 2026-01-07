'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoginButton } from '@/components/auth/LoginButton'
import { UserMenu } from '@/components/auth/UserMenu'
import { SentinelLogo } from '@/components/icons/DisasterIcons'

export function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/', label: 'Mapa', requiresAuth: false },
    { href: '/dashboard', label: 'Panel', requiresAuth: true },
    { href: '/settings', label: 'Config', requiresAuth: true },
  ]

  const filteredNav = navItems.filter(item => !item.requiresAuth || user)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#4A5060]/30 bg-[#0D0E14]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-105">
            <SentinelLogo size={36} className="drop-shadow-[0_0_10px_rgba(212,181,122,0.3)]" />
          </div>
          <span className="font-semibold text-[#D4B57A] tracking-wider hidden sm:block">SENTINEL</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-[#D4B57A]/10 text-[#D4B57A]'
                  : 'text-[#8890A0] hover:text-[#E8E8F0] hover:bg-[#1A1B22]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? <UserMenu /> : <LoginButton />}
          
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-[#8890A0] hover:text-[#E8E8F0]"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t border-[#4A5060]/30 bg-[#0D0E14] p-4 space-y-1">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm ${
                isActive(item.href)
                  ? 'bg-[#D4B57A]/10 text-[#D4B57A]'
                  : 'text-[#8890A0] hover:text-[#E8E8F0]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

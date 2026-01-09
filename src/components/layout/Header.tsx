'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoginButton } from '@/components/auth/LoginButton'
import { UserMenu } from '@/components/auth/UserMenu'

const navIcons = {
  '/': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  '/dashboard': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  '/settings': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

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
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-plasma/10 rounded-none">
      {/* Gradient border at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-plasma/20 to-transparent" />
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Image
              src="/logo.svg"
              alt="Sentinel Logo"
              fill
              className="object-contain drop-shadow-[0_0_12px_rgba(212,181,122,0.4)]"
            />
          </div>
          <span className="font-bold text-plasma tracking-wider hidden sm:block font-display text-lg">
            SENTINEL
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 p-1.5 glass-subtle rounded-2xl">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive(item.href)
                  ? 'bg-plasma/15 text-plasma border border-plasma/25 shadow-[0_0_15px_rgba(212,181,122,0.1)]'
                  : 'text-smoke hover:text-muted hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`transition-transform ${isActive(item.href) ? 'scale-110' : ''}`}>
                {navIcons[item.href as keyof typeof navIcons]}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? <UserMenu /> : <LoginButton />}

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-smoke hover:text-muted hover:bg-shadow/50 border border-transparent hover:border-border transition-all"
            aria-label="Menu"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
      <div
        className={`md:hidden border-t border-white/5 glass-panel rounded-none overflow-hidden transition-all duration-300 ${
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {filteredNav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-plasma/10 text-plasma border border-plasma/20'
                  : 'text-smoke hover:text-muted hover:bg-shadow/50 border border-transparent'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {navIcons[item.href as keyof typeof navIcons]}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

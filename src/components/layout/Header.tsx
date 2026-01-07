'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoginButton } from '@/components/auth/LoginButton';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <span className="text-lg">🌍</span>
          </div>
          <span className="font-bold text-xl">Sentinel</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary-600 ${
              isActive('/') ? 'text-primary-600' : 'text-muted-foreground'
            }`}
          >
            Mapa
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  isActive('/dashboard') ? 'text-primary-600' : 'text-muted-foreground'
                }`}
              >
                Panel
              </Link>
              <Link
                href="/settings"
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  isActive('/settings') ? 'text-primary-600' : 'text-muted-foreground'
                }`}
              >
                Configuración
              </Link>
            </>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center">
          {user ? <UserMenu /> : <LoginButton />}
        </div>
      </div>
    </header>
  );
}

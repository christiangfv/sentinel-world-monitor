'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function AuthGuard({
  children,
  redirectTo = '/login',
  requireAuth = true
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Usuario no autenticado, redirigir a login
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        // Usuario autenticado en página pública, redirigir a inicio
        router.push('/');
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Verificando sesión..." />
      </div>
    );
  }

  // Si requiere auth y no hay usuario, no renderizar nada (se redirigirá)
  if (requireAuth && !user) {
    return null;
  }

  // Si no requiere auth pero hay usuario, no renderizar nada (se redirigirá)
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}


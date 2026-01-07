'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '@/lib/types';
import { signInWithGoogle, signOut, onAuthStateChange } from '@/lib/firebase/auth';
import { initializeNotifications } from '@/lib/firebase/messaging';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener para cambios de estado de autenticación
    const unsubscribe = onAuthStateChange(async (userData) => {
      setUser(userData);
      setLoading(false);

      // Inicializar notificaciones si el usuario está autenticado
      if (userData) {
        try {
          await initializeNotifications(userData.uid);
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    // Esta función puede ser útil para refrescar datos del usuario
    // Por ahora, el listener de auth se encarga de mantener el estado actualizado
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook simplificado para componentes que solo necesitan el usuario
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

// Hook para verificar si el usuario está autenticado
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && user !== null;
}

// Hook para obtener el UID del usuario
export function useUserId(): string | null {
  const { user } = useAuth();
  return user?.uid || null;
}

'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '@/lib/types';
import { signInWithGoogle, signOut, onAuthStateChange } from '@/lib/firebase/auth';
import { initializeNotifications } from '@/lib/firebase/messaging';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  mockSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario mock persistido
    const savedMockUser = localStorage.getItem('sentinel_mock_user');
    if (savedMockUser) {
      try {
        const mockUser = JSON.parse(savedMockUser);
        setUser(mockUser);
        setLoading(false);
        // Si hay mock user, no inicializamos el listener de Firebase por ahora
        return;
      } catch (e) {
        console.error('Error parsing saved mock user:', e);
        localStorage.removeItem('sentinel_mock_user');
      }
    }

    // Listener para cambios de estado de autenticación real
    const unsubscribe = onAuthStateChange(async (userData) => {
      // Solo actualizar si no hay un usuario mock activo (evitar colisiones)
      if (!localStorage.getItem('sentinel_mock_user')) {
        setUser(userData);
        setLoading(false);

        if (userData) {
          try {
            await initializeNotifications(userData.uid);
          } catch (error) {
            console.error('Error initializing notifications:', error);
          }
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

  const mockSignIn = async () => {
    try {
      setLoading(true);
      // Simular usuario de prueba
      const mockUser: User = {
        uid: 'mock-user-123',
        email: 'test@sentinel.app',
        displayName: 'Usuario de Prueba',
        settings: {
          language: 'es',
          darkMode: true,
          soundEnabled: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setUser(mockUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sentinel_mock_user', JSON.stringify(mockUser));
      }
      setLoading(false);

      // Intentar inicializar notificaciones
      try {
        await initializeNotifications(mockUser.uid);
      } catch (e) {
        console.warn('Mock status: Notifications initialization skipped or failed in test environment');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('sentinel_mock_user');
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
    mockSignIn,
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

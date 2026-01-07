import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/lib/types';

// Provider de Google
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Inicia sesión con Google
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Crear o actualizar usuario en Firestore
    const userData: Omit<User, 'uid'> = {
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
      photoURL: firebaseUser.photoURL || undefined,
      fcmToken: undefined, // Se establecerá después
      settings: {
        language: 'es',
        darkMode: false,
        soundEnabled: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return {
      uid: firebaseUser.uid,
      ...userData
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw handleAuthError(error as AuthError);
  }
}

/**
 * Cierra sesión
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Error al cerrar sesión');
  }
}

/**
 * Listener para cambios de estado de autenticación
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Obtener datos adicionales de Firestore
      try {
        const userDoc = await getUserData(firebaseUser.uid);
        callback(userDoc);
      } catch (error) {
        console.error('Error getting user data:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Obtiene datos del usuario de Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await import('firebase/firestore').then(({ getDoc, doc }) =>
      getDoc(doc(db, 'users', uid))
    );

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        fcmToken: data.fcmToken,
        settings: data.settings || {
          language: 'es',
          darkMode: false,
          soundEnabled: true
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

/**
 * Actualiza el FCM token del usuario
 */
export async function updateUserFcmToken(uid: string, fcmToken: string | null): Promise<void> {
  try {
    await import('firebase/firestore').then(async ({ updateDoc, doc, serverTimestamp }) => {
      await updateDoc(doc(db, 'users', uid), {
        fcmToken,
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error updating FCM token:', error);
  }
}

/**
 * Actualiza configuración del usuario
 */
export async function updateUserSettings(uid: string, settings: Partial<User['settings']>): Promise<void> {
  try {
    await import('firebase/firestore').then(async ({ updateDoc, doc, serverTimestamp }) => {
      await updateDoc(doc(db, 'users', uid), {
        settings,
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw new Error('Error al actualizar configuración');
  }
}

/**
 * Maneja errores de autenticación
 */
function handleAuthError(error: AuthError): Error {
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return new Error('Inicio de sesión cancelado');
    case 'auth/popup-blocked':
      return new Error('Popup bloqueado por el navegador');
    case 'auth/network-request-failed':
      return new Error('Error de conexión');
    case 'auth/too-many-requests':
      return new Error('Demasiados intentos. Inténtalo más tarde');
    default:
      return new Error('Error al iniciar sesión');
  }
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Obtiene el usuario actual
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}


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

// Configurar scopes adicionales si es necesario
// googleProvider.addScope('email');
// googleProvider.addScope('profile');

/**
 * Inicia sesión con Google
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    console.log('signInWithGoogle: Starting authentication...');

    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    console.log('signInWithGoogle: Authentication successful for user:', firebaseUser.email);

    // Crear o actualizar usuario en Firestore
    const userData: any = {
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
      settings: {
        language: 'es',
        darkMode: false,
        soundEnabled: true,
        onboardingCompleted: false // Asegurar que nuevos usuarios hagan onboarding
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Agregar photoURL solo si existe
    if (firebaseUser.photoURL) {
      userData.photoURL = firebaseUser.photoURL;
    }

    console.log('signInWithGoogle: Saving user data to Firestore...');

    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('signInWithGoogle: User data saved successfully');
    } catch (firestoreError) {
      console.error('signInWithGoogle: Firestore error:', firestoreError);
      // Si hay error de Firestore, aún devolver el usuario (puede que las reglas no permitan escritura)
      console.warn('signInWithGoogle: Continuing despite Firestore error');
    }

    return {
      uid: firebaseUser.uid,
      ...userData
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);

    // Si el error viene de Firestore (permission-denied, etc.)
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as AuthError;
      if (firebaseError.code.includes('permission') || firebaseError.code.includes('firestore')) {
        console.error('signInWithGoogle: Firestore permission error');
        throw new Error('Error al guardar datos del usuario. Contacta al administrador.');
      }
    }

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
          soundEnabled: true,
          onboardingCompleted: false
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
    // Use setDoc with merge to create document if it doesn't exist
    await import('firebase/firestore').then(async ({ setDoc, doc, serverTimestamp }) => {
      await setDoc(doc(db, 'users', uid), {
        settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
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
  console.error('Firebase Auth Error:', error.code, error.message);

  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return new Error('Inicio de sesión cancelado');
    case 'auth/popup-blocked':
      return new Error('Popup bloqueado por el navegador. Permite popups para este sitio.');
    case 'auth/network-request-failed':
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    case 'auth/too-many-requests':
      return new Error('Demasiados intentos. Inténtalo más tarde.');
    case 'auth/invalid-api-key':
      return new Error('Configuración de Firebase incorrecta. Contacta al administrador.');
    case 'auth/app-deleted':
      return new Error('Aplicación Firebase eliminada. Contacta al administrador.');
    case 'auth/operation-not-allowed':
      return new Error('Inicio de sesión con Google no está habilitado.');
    case 'auth/invalid-client-id':
      return new Error('ID de cliente inválido. Contacta al administrador.');
    case 'auth/web-storage-unsupported':
      return new Error('Tu navegador no soporta el almacenamiento necesario para el inicio de sesión.');
    case 'auth/argument-error':
      return new Error('Error en la configuración del inicio de sesión.');
    case 'permission-denied':
      return new Error('No tienes permisos para acceder a esta función.');
    default:
      return new Error(`Error al iniciar sesión: ${error.message || 'Error desconocido'}`);
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


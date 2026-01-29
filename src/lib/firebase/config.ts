import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Configuración desde variables de entorno (inyectadas en build time)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar configuración
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMsg = 'Firebase configuration is incomplete.';
  console.error(errorMsg, {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAuthDomain: !!firebaseConfig.authDomain,
  });
  throw new Error(errorMsg);
}

// Inicializar Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  hasAuth: true,
  hasDb: true,
  apiKey: 'Set',
  initialized: true
});

// Messaging ELIMINADO completamente para costo 0
export const messaging = null;

// VAPID Key ELIMINADA para costo 0
export const VAPID_KEY = null;

// Configuración de emuladores para desarrollo
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  // Configurar emuladores aquí si es necesario
  console.log('🔥 Using Firebase Emulators');
}

export default app;

// Función de messaging ELIMINADA para costo 0
// export async function initializeMessaging() { ... }

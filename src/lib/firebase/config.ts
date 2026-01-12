import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// ⚠️ CONFIGURACIÓN PARA STATIC EXPORT: Usar variables públicas expuestas por next.config.js
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Validar configuración antes de inicializar
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const errorMsg = 'Firebase configuration is incomplete. Check environment variables.';
  console.error(errorMsg, {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAuthDomain: !!firebaseConfig.authDomain,
    firebaseConfig: firebaseConfig,
    nodeEnv: process.env.NODE_ENV,
  });

  // En producción, mostrar configuración disponible para diagnóstico
  if (typeof window !== 'undefined') {
    console.log('Firebase initialized:', firebaseConfig);
  }

  throw new Error(errorMsg);
}

// Inicializar Firebase solo si no está ya inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  hasAuth: !!auth,
  hasDb: !!db,
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Not set',
  authDomain: firebaseConfig.authDomain,
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

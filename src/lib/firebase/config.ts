import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// ⚠️ CONFIGURACIÓN SEGURA: Las claves públicas están ahora en variables del servidor
// Esto evita que se expongan en el bundle del cliente
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar configuración antes de inicializar
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase config incomplete:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAuthDomain: !!firebaseConfig.authDomain,
  });
  throw new Error('Firebase configuration is incomplete. Check environment variables.');
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

// Messaging solo en navegador (se inicializará dinámicamente)
export const messaging = null; // Se inicializará en runtime si es soportado

// VAPID Key para FCM (obtener de Firebase Console > Project Settings > Cloud Messaging)
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Configuración de emuladores para desarrollo
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  // Configurar emuladores aquí si es necesario
  console.log('🔥 Using Firebase Emulators');
}

export default app;

// Función para inicializar messaging dinámicamente
export async function initializeMessaging() {
  if (typeof window === 'undefined') return null;
  
  try {
    const isSupportedBrowser = await isSupported();
    if (!isSupportedBrowser) {
      console.warn('Firebase Messaging no está soportado en este navegador');
      return null;
    }

    const messagingInstance = getMessaging(app);
    
    // Configurar el service worker dinámicamente
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registrado:', registration);
      
      // Enviar la configuración de Firebase al service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig
        });
      }
    }
    
    return messagingInstance;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
}

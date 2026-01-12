import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// ⚠️ CONFIGURACIÓN SENCILLA: Usar valores directos
// Firebase API keys son públicas por diseño - la seguridad viene de las reglas
const firebaseConfig = {
  apiKey: "AIzaSyCwDxE9fG8hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC",
  authDomain: "sentinel-prod-9c937.firebaseapp.com",
  projectId: "sentinel-prod-9c937",
  storageBucket: "sentinel-prod-9c937.appspot.com",
  messagingSenderId: "846642937822",
  appId: "1:846642937822:web:b0db6f6c5f3db4c3d3274f"
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

import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { messaging, VAPID_KEY } from './config';
import { updateUserFcmToken } from './auth';

// Verificar si FCM está disponible
export function isMessagingSupported(): boolean {
  return messaging !== null;
}

/**
 * Solicita permiso para notificaciones push
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isMessagingSupported()) {
    console.warn('Firebase Messaging no está soportado en este navegador');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Obtiene el FCM token del dispositivo
 */
export async function getFcmToken(): Promise<string | null> {
  if (!isMessagingSupported()) {
    return null;
  }

  if (!VAPID_KEY) {
    console.error('VAPID_KEY no configurada');
    return null;
  }

  try {
    const token = await getToken(messaging!, {
      vapidKey: VAPID_KEY
    });

    return token || null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Registra el FCM token en el usuario actual
 */
export async function registerFcmToken(userId: string): Promise<boolean> {
  try {
    const token = await getFcmToken();
    if (token) {
      await updateUserFcmToken(userId, token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
}

/**
 * Remueve el FCM token del usuario
 */
export async function unregisterFcmToken(userId: string): Promise<void> {
  try {
    await updateUserFcmToken(userId, null);
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
  }
}

/**
 * Listener para mensajes FCM cuando la app está en primer plano
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!isMessagingSupported()) {
    console.warn('Firebase Messaging no disponible para mensajes en primer plano');
    return () => {};
  }

  return onMessage(messaging!, (payload) => {
    console.log('Mensaje recibido en primer plano:', payload);

    // Mostrar notificación nativa del navegador si es necesario
    if (Notification.permission === 'granted') {
      const { title, body } = payload.notification || {};
      if (title && body) {
        new Notification(title, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          tag: payload.data?.eventId || 'sentinel-notification'
        });
      }
    }

    callback(payload);
  });
}

/**
 * Muestra una notificación de prueba
 */
export async function showTestNotification(): Promise<void> {
  if (Notification.permission === 'granted') {
    new Notification('🔔 Sentinel - Prueba', {
      body: 'Esta es una notificación de prueba de Sentinel',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'sentinel-test'
    });
  } else {
    console.warn('Permiso de notificaciones no concedido');
  }
}

/**
 * Verifica el estado del permiso de notificaciones
 */
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission;
}

/**
 * Verifica si las notificaciones están habilitadas
 */
export function areNotificationsEnabled(): boolean {
  return Notification.permission === 'granted';
}

/**
 * Inicializa el sistema de notificaciones
 */
export async function initializeNotifications(userId: string): Promise<boolean> {
  if (!isMessagingSupported()) {
    console.warn('Firebase Messaging no soportado');
    return false;
  }

  // Solicitar permiso si no está concedido
  if (Notification.permission === 'default') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return false;
    }
  }

  // Si ya está concedido, registrar token
  if (Notification.permission === 'granted') {
    return await registerFcmToken(userId);
  }

  return false;
}

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  GeoPoint,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';
import {
  DisasterEvent,
  UserZone,
  AlertPreference,
  Notification,
  EventFilters,
  DisasterType
} from '@/lib/types';

// ================================
// FUNCIONES PARA EVENTOS
// ================================

/**
 * Obtiene eventos con filtros aplicados
 */
export async function getEvents(filters: EventFilters = {}): Promise<DisasterEvent[]> {
  try {
    const constraints: QueryConstraint[] = [];

    // Filtro por tipos de desastre
    if (filters.disasterTypes && filters.disasterTypes.length > 0) {
      constraints.push(where('disasterType', 'in', filters.disasterTypes));
    }

    // Filtro por severidad mínima
    if (filters.minSeverity && filters.minSeverity > 1) {
      constraints.push(where('severity', '>=', filters.minSeverity));
    }

    // Ordenar por tiempo de evento (más recientes primero)
    constraints.push(orderBy('eventTime', 'desc'));

    // Limitar resultados
    constraints.push(limit(100));

    const q = query(collection(db, 'events'), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        location: {
          lat: data.location.latitude,
          lng: data.location.longitude
        },
        eventTime: data.eventTime.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as DisasterEvent;
    });
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error('Error al obtener eventos');
  }
}

/**
 * Obtiene un evento por ID
 */
export async function getEventById(eventId: string): Promise<DisasterEvent | null> {
  try {
    const docRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        location: {
          lat: data.location.latitude,
          lng: data.location.longitude
        },
        eventTime: data.eventTime.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as DisasterEvent;
    }

    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    return null;
  }
}

/**
 * Listener en tiempo real para eventos
 */
export function subscribeToEvents(
  callback: (events: DisasterEvent[]) => void,
  filters: EventFilters = {}
) {
  const constraints: QueryConstraint[] = [];

  // Filtro por tipos de desastre
  if (filters.disasterTypes && filters.disasterTypes.length > 0) {
    constraints.push(where('disasterType', 'in', filters.disasterTypes));
  }

  // Filtro por severidad mínima
  if (filters.minSeverity && filters.minSeverity > 1) {
    constraints.push(where('severity', '>=', filters.minSeverity));
  }

  // Ordenar por tiempo de evento
  constraints.push(orderBy('eventTime', 'desc'));
  constraints.push(limit(50));

  const q = query(collection(db, 'events'), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        location: {
          lat: data.location.latitude,
          lng: data.location.longitude
        },
        eventTime: data.eventTime.toDate(),
        expiresAt: data.expiresAt?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as DisasterEvent;
    });

    callback(events);
  }, (error) => {
    console.error('Error subscribing to events:', error);
  });
}

// ================================
// FUNCIONES PARA ZONAS DE USUARIO
// ================================

/**
 * Obtiene zonas del usuario
 */
export async function getUserZones(userId: string): Promise<UserZone[]> {
  try {
    const q = query(
      collection(db, 'users', userId, 'zones'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId,
        ...data,
        location: {
          lat: data.location.latitude,
          lng: data.location.longitude
        },
        createdAt: data.createdAt.toDate()
      } as UserZone;
    });
  } catch (error) {
    console.error('Error getting user zones:', error);
    throw new Error('Error al obtener zonas');
  }
}

/**
 * Agrega una nueva zona
 */
export async function addUserZone(userId: string, zone: Omit<UserZone, 'id' | 'userId' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'zones'), {
      ...zone,
      location: new GeoPoint(zone.location.lat, zone.location.lng),
      createdAt: Timestamp.now()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding zone:', error);
    throw new Error('Error al agregar zona');
  }
}

/**
 * Actualiza una zona
 */
export async function updateUserZone(userId: string, zoneId: string, updates: Partial<UserZone>): Promise<void> {
  try {
    const updateData: any = { ...updates };
    if (updates.location) {
      updateData.location = new GeoPoint(updates.location.lat, updates.location.lng);
    }

    await updateDoc(doc(db, 'users', userId, 'zones', zoneId), updateData);
  } catch (error) {
    console.error('Error updating zone:', error);
    throw new Error('Error al actualizar zona');
  }
}

/**
 * Elimina una zona
 */
export async function deleteUserZone(userId: string, zoneId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId, 'zones', zoneId));
  } catch (error) {
    console.error('Error deleting zone:', error);
    throw new Error('Error al eliminar zona');
  }
}

// ================================
// FUNCIONES PARA PREFERENCIAS DE ALERTA
// ================================

/**
 * Obtiene preferencias de alerta del usuario
 */
export async function getUserAlertPreferences(userId: string): Promise<Record<DisasterType, AlertPreference>> {
  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'alertPrefs'));

    const preferences: Record<DisasterType, AlertPreference> = {} as Record<DisasterType, AlertPreference>;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      preferences[doc.id as DisasterType] = {
        disasterType: doc.id as DisasterType,
        minSeverity: data.minSeverity || 1,
        pushEnabled: data.pushEnabled ?? true,
        emailEnabled: data.emailEnabled ?? false
      };
    });

    // Establecer valores por defecto para tipos no configurados
    const disasterTypes: DisasterType[] = ['earthquake', 'tsunami', 'volcano', 'wildfire', 'flood', 'storm', 'landslide'];
    disasterTypes.forEach(type => {
      if (!preferences[type]) {
        preferences[type] = {
          disasterType: type,
          minSeverity: 1,
          pushEnabled: true,
          emailEnabled: false
        };
      }
    });

    return preferences;
  } catch (error) {
    console.error('Error getting alert preferences:', error);
    throw new Error('Error al obtener preferencias de alerta');
  }
}

/**
 * Actualiza preferencias de alerta
 */
export async function updateAlertPreference(
  userId: string,
  disasterType: DisasterType,
  preference: Omit<AlertPreference, 'disasterType'>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId, 'alertPrefs', disasterType), preference);
  } catch (error) {
    console.error('Error updating alert preference:', error);
    throw new Error('Error al actualizar preferencias de alerta');
  }
}

// ================================
// FUNCIONES PARA NOTIFICACIONES
// ================================

/**
 * Obtiene notificaciones del usuario
 */
export async function getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('sentAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        sentAt: data.sentAt.toDate(),
        readAt: data.readAt?.toDate()
      } as Notification;
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Marca notificación como leída
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      readAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

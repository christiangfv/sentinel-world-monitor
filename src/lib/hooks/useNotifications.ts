'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/lib/types';
import { useAuth } from './useAuth';
import { getUserNotifications, markNotificationAsRead } from '@/lib/firebase/firestore';

// NOTIFICACIONES PUSH COMPLETAMENTE ELIMINADAS PARA COSTO 0
// Solo mantenemos notificaciones almacenadas en Firestore

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = user?.uid;

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userNotifications = await getUserNotifications(userId);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.readAt).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // NOTIFICACIONES PUSH ELIMINADAS - No hay listeners FCM

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, readAt: new Date() }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error al marcar notificación como leída');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.readAt);

    try {
      await Promise.all(
        unreadNotifications.map(n => markNotificationAsRead(n.id))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Error al marcar todas las notificaciones como leídas');
    }
  }, [notifications, markNotificationAsRead]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications
  };
}

export function useNotificationSettings() {
  // NOTIFICACIONES PUSH COMPLETAMENTE ELIMINADAS PARA COSTO 0
  return {
    permission: 'denied' as NotificationPermission,
    enabled: false,
    loading: false,
    initialize: async () => false,
    testNotification: async () => {},
    canRequestPermission: false,
    isGranted: false,
    isDenied: true
  };
}

// Hook para notificaciones recientes (últimas 24 horas)
export function useRecentNotifications(hours: number = 24) {
  const { notifications, loading, error } = useNotifications();
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  const recentNotifications = notifications.filter(n => n.sentAt >= cutoffTime);

  return {
    notifications: recentNotifications,
    loading,
    error
  };
}


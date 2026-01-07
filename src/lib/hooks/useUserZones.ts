'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserZone } from '@/lib/types';
import { useAuth } from './useAuth';
import {
  getUserZones,
  addUserZone,
  updateUserZone,
  deleteUserZone
} from '@/lib/firebase/firestore';

export function useUserZones() {
  const { user } = useAuth();
  const [zones, setZones] = useState<UserZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.uid;

  const loadZones = useCallback(async () => {
    if (!userId) {
      setZones([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userZones = await getUserZones(userId);
      setZones(userZones);
    } catch (err) {
      console.error('Error loading zones:', err);
      setError('Error al cargar zonas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const createZone = useCallback(async (zoneData: Omit<UserZone, 'id' | 'userId' | 'createdAt'>) => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setError(null);
      const zoneId = await addUserZone(userId, zoneData);
      await loadZones(); // Recargar zonas
      return zoneId;
    } catch (err) {
      console.error('Error creating zone:', err);
      setError('Error al crear zona');
      throw err;
    }
  }, [userId, loadZones]);

  const updateZone = useCallback(async (zoneId: string, updates: Partial<UserZone>) => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setError(null);
      await updateUserZone(userId, zoneId, updates);
      await loadZones(); // Recargar zonas
    } catch (err) {
      console.error('Error updating zone:', err);
      setError('Error al actualizar zona');
      throw err;
    }
  }, [userId, loadZones]);

  const removeZone = useCallback(async (zoneId: string) => {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setError(null);
      await deleteUserZone(userId, zoneId);
      await loadZones(); // Recargar zonas
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError('Error al eliminar zona');
      throw err;
    }
  }, [userId, loadZones]);

  const toggleZone = useCallback(async (zoneId: string, isActive: boolean) => {
    return updateZone(zoneId, { isActive });
  }, [updateZone]);

  // Zonas activas (solo las que están habilitadas)
  const activeZones = zones.filter(zone => zone.isActive);

  // Verificar si una ubicación está dentro de alguna zona activa
  const isLocationInUserZones = useCallback((lat: number, lng: number, radiusKm: number = 0) => {
    return activeZones.some(zone => {
      const distance = calculateDistance(lat, lng, zone.location.lat, zone.location.lng);
      return distance <= (zone.radiusKm + radiusKm);
    });
  }, [activeZones]);

  return {
    zones,
    activeZones,
    loading,
    error,
    createZone,
    updateZone,
    removeZone,
    toggleZone,
    refresh: loadZones,
    isLocationInUserZones
  };
}

// Función helper para calcular distancia (duplicada de geo.ts para evitar dependencias)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat1 - lat2) * Math.PI / 180;
  const dLng = (lng1 - lng2) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat2 * Math.PI / 180) * Math.cos(lat1 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

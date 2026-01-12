'use client';

import { useState, useEffect, useCallback } from 'react';
import { DisasterEvent, EventFilters } from '@/lib/types';
import { getEvents, subscribeToEvents, getEventById } from '@/lib/firebase/firestore';

export function useEvents(filters: EventFilters = { disasterTypes: [], minSeverity: 1 }) {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Cargar eventos iniciales
    getEvents(filters)
      .then((initialEvents) => {
        setEvents(initialEvents);
        setIsInitialLoad(false); // Marcar que ya se completó la carga inicial
      })
      .catch((err) => {
        console.error('Error loading events:', err);
        setError('Error al cargar eventos');
        setIsInitialLoad(false);
      })
      .finally(() => setLoading(false));

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToEvents(
      (updatedEvents) => {
        // Solo detectar eventos nuevos después de la carga inicial
        if (!isInitialLoad) {
          const existingIds = new Set(events.map(e => e.id));
          const newIds = new Set<string>();

          updatedEvents.forEach(event => {
            if (!existingIds.has(event.id)) {
              newIds.add(event.id);
            }
          });

          // Agregar nuevos eventos al conjunto de destacados
          if (newIds.size > 0) {
            setNewEventIds(prev => new Set([...prev, ...newIds]));
          }
        }

        setEvents(updatedEvents);
        setError(null);
      },
      filters
    );

    // REMOVIDO: Auto-refresh cada 2 minutos (innecesario con realtime subscriptions)
    // Esto ahorra lecturas costosas en Firestore

    return () => {
      unsubscribe();
    };
  }, [
    filters.disasterTypes?.join(','),
    filters.minSeverity,
    filters.dateRange?.start.getTime(),
    filters.dateRange?.end.getTime(),
    filters.nearLocation?.lat,
    filters.nearLocation?.lng,
    filters.nearLocation?.radiusKm
  ]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const freshEvents = await getEvents(filters);
      setEvents(freshEvents);
    } catch (err) {
      console.error('Error refreshing events:', err);
      setError('Error al actualizar eventos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const markEventAsSeen = useCallback((eventId: string) => {
    setNewEventIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  }, []);

  return {
    events,
    loading,
    error,
    refresh,
    newEventIds,
    markEventAsSeen
  };
}

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<DisasterEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Error al cargar evento');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  return {
    event,
    loading,
    error,
    refetch: () => {
      if (eventId) {
        const loadEvent = async () => {
          try {
            setLoading(true);
            setError(null);
            const eventData = await getEventById(eventId);
            setEvent(eventData);
          } catch (err) {
            console.error('Error refetching event:', err);
            setError('Error al recargar evento');
          } finally {
            setLoading(false);
          }
        };
        loadEvent();
      }
    }
  };
}

// Hook para eventos recientes (últimos N eventos)
export function useRecentEvents(limit: number = 10) {
  const filters: EventFilters = {
    disasterTypes: [],
    minSeverity: 1,
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      end: new Date()
    }
  };

  const { events, loading, error } = useEvents(filters);

  return {
    events: events.slice(0, limit),
    loading,
    error
  };
}

// Hook para eventos por tipo de desastre
export function useEventsByType(disasterType: string) {
  const filters: EventFilters = {
    disasterTypes: [disasterType as any],
    minSeverity: 1
  };

  return useEvents(filters);
}

// Hook para contar eventos por severidad
export function useEventCounts() {
  const { events, loading } = useEvents();

  const counts = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    counts,
    total: events.length,
    loading
  };
}

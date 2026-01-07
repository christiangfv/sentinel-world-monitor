'use client';

import { useState } from 'react';
import { DisasterEvent, EventFilters, DisasterType } from '@/lib/types';
import { DISASTER_TYPES } from '@/lib/constants/disasters';
import { EventCard } from './EventCard';
import { EventFilters as EventFiltersComponent } from './EventFiltersComponent';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

interface EventFeedProps {
  events: DisasterEvent[];
  loading?: boolean;
  error?: string | null;
  showFilters?: boolean;
  compact?: boolean;
  maxItems?: number;
  onEventClick?: (event: DisasterEvent) => void;
  className?: string;
}

export function EventFeed({
  events,
  loading = false,
  error = null,
  showFilters = true,
  compact = false,
  maxItems,
  onEventClick,
  className = ''
}: EventFeedProps) {
  const [filters, setFilters] = useState<EventFilters>({
    minSeverity: 1,
    disasterTypes: DISASTER_TYPES
  });

  const [showAll, setShowAll] = useState(false);

  // Aplicar filtros
  const filteredEvents = events.filter(event => {
    // Filtro por severidad
    if (event.severity < filters.minSeverity) return false;

    // Filtro por tipos de desastre
    if (filters.disasterTypes && filters.disasterTypes.length > 0) {
      if (!filters.disasterTypes.includes(event.disasterType)) return false;
    }

    // Filtro por rango de fechas
    if (filters.dateRange) {
      const eventDate = event.eventTime;
      if (eventDate < filters.dateRange.start || eventDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  });

  // Limitar número de elementos mostrados
  const displayedEvents = maxItems && !showAll
    ? filteredEvents.slice(0, maxItems)
    : filteredEvents;

  const handleEventClick = (event: DisasterEvent) => {
    onEventClick?.(event);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner text="Cargando eventos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">⚠️ Error al cargar eventos</div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filtros */}
      {showFilters && (
        <div className="mb-6">
          <EventFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      )}

      {/* Lista de eventos */}
      {displayedEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
          <p className="text-muted-foreground">
            No hay eventos que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              compact={compact}
              onClick={() => handleEventClick(event)}
            />
          ))}
        </div>
      )}

      {/* Botón "Mostrar más" */}
      {maxItems && filteredEvents.length > maxItems && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Mostrar menos' : `Mostrar ${filteredEvents.length - maxItems} más`}
          </Button>
        </div>
      )}

      {/* Estadísticas */}
      <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
        <span>
          Mostrando {displayedEvents.length} de {filteredEvents.length} eventos
          {filteredEvents.length !== events.length && ` (filtrados de ${events.length} totales)`}
        </span>
      </div>
    </div>
  );
}

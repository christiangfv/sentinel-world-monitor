'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DisasterEvent, UserZone } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { MapControls } from './MapControls';

// Importar MapContainer dinámicamente para evitar problemas con SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false, loading: () => <LoadingSpinner text="Cargando mapa..." /> }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);

// Importar componentes personalizados
const EventMarker = dynamic(
  () => import('./EventMarker').then(mod => ({ default: mod.EventMarker })),
  { ssr: false }
);

const ZoneCircle = dynamic(
  () => import('./ZoneCircle').then(mod => ({ default: mod.ZoneCircle })),
  { ssr: false }
);

// Importar leaflet CSS
import 'leaflet/dist/leaflet.css';

interface DisasterMapProps {
  events: DisasterEvent[];
  userZones?: UserZone[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showControls?: boolean;
  showZones?: boolean;
  onEventClick?: (event: DisasterEvent) => void;
  onZoneClick?: (zone: UserZone) => void;
  onMyLocation?: () => void;
  onToggleZones?: () => void;
  onFilterChange?: (filters: any) => void;
  className?: string;
}

export function DisasterMap({
  events,
  userZones = [],
  center = [-33.45, -70.65], // Santiago, Chile por defecto
  zoom = 5,
  height = '400px',
  showControls = true,
  showZones = true,
  onEventClick,
  onZoneClick,
  onMyLocation,
  onToggleZones,
  onFilterChange,
  className = ''
}: DisasterMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [showUserZones, setShowUserZones] = useState(showZones);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Solo renderizar en el cliente
  if (!isClient) {
    return (
      <div
        className={`bg-surface border border-border rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <LoadingSpinner text="Cargando mapa..." />
      </div>
    );
  }

  const handleToggleZones = () => {
    setShowUserZones(!showUserZones);
    onToggleZones?.();
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Renderizar zonas del usuario si están activadas */}
        {showUserZones && userZones.map((zone) => (
          <ZoneCircle
            key={`zone-${zone.id}`}
            zone={zone}
            onClick={onZoneClick}
          />
        ))}

        {/* Renderizar eventos de desastre */}
        {events.map((event) => (
          <EventMarker
            key={`event-${event.id}`}
            event={event}
            onClick={onEventClick}
          />
        ))}
      </MapContainer>

      {/* Controles del mapa */}
      {showControls && (
        <MapControls
          onMyLocation={onMyLocation}
          onToggleZones={handleToggleZones}
          showZones={showUserZones}
          onFilterChange={onFilterChange}
        />
      )}
    </div>
  );
}

// Componente para markers de eventos
interface EventMarkerProps {
  event: DisasterEvent;
  onClick?: (event: DisasterEvent) => void;
}

function EventMarker({ event, onClick }: EventMarkerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Crear icono personalizado basado en el tipo y severidad
  const getMarkerIcon = () => {
    // Esto se implementará con iconos personalizados
    // Por ahora usamos el marker por defecto
    return null;
  };

  const getSeverityColor = (severity: number) => {
    const colors = {
      1: '#22c55e',
      2: '#eab308',
      3: '#f97316',
      4: '#ef4444'
    };
    return colors[severity as keyof typeof colors] || colors[1];
  };

  return (
    <Marker
      position={[event.location.lat, event.location.lng]}
      icon={getMarkerIcon()}
      eventHandlers={{
        click: () => onClick?.(event),
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            {event.description || 'Sin descripción'}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="px-2 py-1 rounded text-white text-xs font-medium"
              style={{ backgroundColor: getSeverityColor(event.severity) }}
            >
              Severidad {event.severity}
            </span>
            <span className="text-muted-foreground">
              {event.disasterType}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {event.locationName}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

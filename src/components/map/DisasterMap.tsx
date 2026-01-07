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
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
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

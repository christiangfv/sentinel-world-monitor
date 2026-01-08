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

const MapController = dynamic(
  () => import('./MapController').then(mod => ({ default: mod.MapController })),
  { ssr: false }
);

// Importar leaflet CSS
import 'leaflet/dist/leaflet.css';

// Componente interno para manejar movimientos del mapa


interface DisasterMapProps {
  events: DisasterEvent[];
  selectedEvent?: DisasterEvent | null;
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
  selectedEvent,
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
  // Detectar tema actual
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const root = document.documentElement;
      setIsLightMode(root.classList.contains('light'));
    };

    // Verificar tema inicial
    checkTheme();

    // Escuchar cambios en el DOM
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);
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
        className="leaflet-container-themed"
      >
        <MapController selectedEvent={selectedEvent} />
        <TileLayer
          url={isLightMode
            ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
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

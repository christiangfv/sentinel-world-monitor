'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DisasterEvent, UserZone } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { MapControls } from './MapControls';

// Estados del mapa para debugging
enum MapState {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  FALLBACK = 'fallback'
}

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
  const [mapState, setMapState] = useState<MapState>(MapState.LOADING);
  const [useFallbackTiles, setUseFallbackTiles] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Timeout para detectar problemas de carga
  useEffect(() => {
    if (mapState === MapState.LOADING) {
      const timeout = setTimeout(() => {
        console.warn('⏰ Timeout cargando mapa, intentando fallback');
        setUseFallbackTiles(true);
        setMapState(MapState.FALLBACK);
      }, 10000); // 10 segundos timeout

      return () => clearTimeout(timeout);
    }
  }, [mapState]);

  // Handler para errores de tiles
  const handleTileError = (e: any) => {
    console.warn('🌐 Error cargando tiles CARTO:', e);
    console.log('🌐 User-Agent:', navigator.userAgent);
    console.log('🌐 URL actual:', window.location.href);
    console.log('🌐 Cambiando a fallback OpenStreetMap');

    // Solo cambiar a fallback si no lo hemos hecho ya
    if (!useFallbackTiles) {
      setUseFallbackTiles(true);
      setMapState(MapState.FALLBACK);
    }
  };

  // Handler para carga exitosa del mapa
  const handleMapLoad = () => {
    console.log('🗺️ Mapa cargado exitosamente');
    setMapState(MapState.LOADED);
  };

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

  // Mostrar estado del mapa si hay error
  const getStatusMessage = () => {
    switch (mapState) {
      case MapState.LOADING:
        return "Cargando mapa...";
      case MapState.ERROR:
        return "Error: mapa no disponible";
      case MapState.FALLBACK:
        return "Mapa alternativo activo";
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  // Configuración específica para producción
  const isProduction = typeof window !== 'undefined' &&
    window.location.hostname.includes('sentinel-prod-9c937.web.app');

  const handleToggleZones = () => {
    setShowUserZones(!showUserZones);
    onToggleZones?.();
  };

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Indicador de estado del mapa */}
      {statusMessage && (
        <div className={`absolute top-2 right-2 z-[1000] backdrop-blur-sm px-3 py-1 rounded-md text-sm border ${
          mapState === MapState.ERROR
            ? 'bg-red-500/20 text-red-400 border-red-500/50'
            : mapState === MapState.FALLBACK
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
            : 'bg-background/80 text-foreground border-border'
        }`}>
          {useFallbackTiles && <span className="text-orange-500">🔄 </span>}
          {statusMessage}
          {isProduction && mapState === MapState.FALLBACK && (
            <span className="ml-2 text-xs opacity-75">(OpenStreetMap)</span>
          )}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="leaflet-container-themed"
        maxZoom={18}
        minZoom={3}
        maxBounds={[
          [-85, -180], // Suroeste (limitado para estabilidad)
          [85, 180]    // Noreste (limitado para estabilidad)
        ]}
        maxBoundsViscosity={1.0}
        preferCanvas={false} // Evitar problemas de compatibilidad
        whenReady={handleMapLoad}
      >
        <MapController selectedEvent={selectedEvent} />
        <TileLayer
          url={useFallbackTiles
            ? (isLightMode
                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                : "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              )
            : (isLightMode
                ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              )
          }
          attribution={useFallbackTiles
            ? (isLightMode
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                : '&copy; <a href="https://www.openstreetmap.fr/" target="_blank">OpenStreetMap France</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              )
            : '&copy; <a href="https://carto.com/">CARTO</a>'
          }
          maxZoom={18}
          minZoom={3}
          subdomains={['a', 'b', 'c']}
          errorTileUrl="" // Evitar tiles de error
          updateWhenZooming={false}
          updateWhenIdle={true}
          keepBuffer={2}
          crossOrigin={true}
          eventHandlers={{
            load: handleMapLoad,
            tileerror: handleTileError,
            tileloadstart: () => {
              if (mapState === MapState.LOADING) {
                setMapState(MapState.LOADED);
              }
            }
          }}
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

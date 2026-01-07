'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Icon, DivIcon } from 'leaflet';
import { DisasterEvent, DisasterType } from '@/lib/types';
import { DISASTER_CONFIGS, BRAND_COLORS } from '@/lib/constants/disasters';
import { getSeverityColor } from '@/lib/utils/severity';

// Importar componentes de react-leaflet dinámicamente
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

// SVG icons inline para Leaflet (no puede usar componentes React directamente)
const DISASTER_SVG_ICONS: Record<DisasterType, (color: string) => string> = {
  earthquake: (color) => `
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${BRAND_COLORS.shadow}" stroke="${color}" stroke-width="2"/>
      <path d="M12 28 L18 20 L24 32 L30 16 L36 36 L44 28" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  tsunami: (color) => `
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${BRAND_COLORS.shadow}" stroke="${color}" stroke-width="2"/>
      <path d="M8 30 Q14 22 20 30 Q26 38 32 30 Q38 22 44 30 Q50 38 56 30" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M10 38 Q16 30 22 38 Q28 46 34 38 Q40 30 46 38" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </svg>
  `,
  volcano: (color) => `
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${BRAND_COLORS.shadow}" stroke="${color}" stroke-width="2"/>
      <path d="M14 44 L24 24 L28 28 L32 24 L42 44 Z" fill="${BRAND_COLORS.abyss}" stroke="${color}" stroke-width="2"/>
      <ellipse cx="28" cy="24" rx="4" ry="2" fill="${BRAND_COLORS.plasma}"/>
      <circle cx="28" cy="16" r="3" fill="${BRAND_COLORS.plasma}" opacity="0.7"/>
    </svg>
  `,
  wildfire: (color) => `
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${BRAND_COLORS.shadow}" stroke="${color}" stroke-width="2"/>
      <path d="M28 44 C20 44 16 36 16 30 C16 24 20 20 24 18 C22 22 24 26 28 26 C26 22 28 16 32 12 C32 20 36 22 38 26 C40 30 40 36 36 40 C34 42 32 44 28 44 Z" fill="${color}"/>
      <path d="M28 44 C24 44 22 40 22 36 C22 32 24 30 26 28 C25 31 26 33 28 33 C27 31 28 28 30 26 C30 30 32 32 33 34 C34 36 34 40 32 42 C31 43 30 44 28 44 Z" fill="${BRAND_COLORS.muted}" opacity="0.8"/>
    </svg>
  `,
  flood: (color) => `
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${BRAND_COLORS.shadow}" stroke="${color}" stroke-width="2"/>
      <path d="M8 24 Q14 18 20 24 Q26 30 32 24 Q38 18 44 24" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 32 Q14 26 20 32 Q26 38 32 32 Q38 26 44 32" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M8 40 Q14 34 20 40 Q26 46 32 40 Q38 34 44 40" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </svg>
  `,
  storm: (color) => `
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${BRAND_COLORS.shadow}" stroke="${color}" stroke-width="2"/>
      <circle cx="28" cy="28" r="8" fill="none" stroke="${color}" stroke-width="2"/>
      <line x1="28" y1="8" x2="28" y2="16" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <line x1="28" y1="40" x2="28" y2="48" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="28" x2="16" y2="28" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <line x1="40" y1="28" x2="48" y2="28" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  landslide: (color) => `
    <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="24" fill="${BRAND_COLORS.shadow}" stroke="${color}" stroke-width="2"/>
      <path d="M16 16 L40 16 L28 44 Z" fill="none" stroke="${color}" stroke-width="2"/>
      <circle cx="28" cy="24" r="3" fill="${color}"/>
      <circle cx="24" cy="32" r="2.5" fill="${color}" opacity="0.8"/>
      <circle cx="32" cy="32" r="2.5" fill="${color}" opacity="0.8"/>
    </svg>
  `,
};

interface EventMarkerProps {
  event: DisasterEvent;
  onClick?: (event: DisasterEvent) => void;
}

export function EventMarker({ event, onClick }: EventMarkerProps) {
  // Validar que las coordenadas existan y sean válidas
  if (!event.location || typeof event.location.lat !== 'number' || typeof event.location.lng !== 'number' ||
      isNaN(event.location.lat) || isNaN(event.location.lng)) {
    console.warn('EventMarker: Invalid coordinates for event:', event.id, event.location);
    return null; // No renderizar el marker si las coordenadas son inválidas
  }

  const markerIcon = useMemo(() => {
    const config = DISASTER_CONFIGS[event.disasterType];
    const severityColor = getSeverityColor(event.severity);
    const svgIcon = DISASTER_SVG_ICONS[event.disasterType](severityColor);

    // Crear icono personalizado con SVG del brand book
    const iconHtml = `
      <div style="
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        transition: transform 0.2s ease;
      " class="disaster-marker">
        ${svgIcon}
      </div>
    `;

    return new DivIcon({
      html: iconHtml,
      className: 'custom-event-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, [event.disasterType, event.severity]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    }).format(date);
  };

  const getSeverityLabel = () => {
    const config = DISASTER_CONFIGS[event.disasterType];
    return config.severityLabels[event.severity];
  };

  return (
    <Marker
      position={[event.location.lat, event.location.lng]}
      icon={markerIcon}
      eventHandlers={{
        click: () => onClick?.(event),
      }}
    >
      <Popup>
        <div className="p-3 max-w-sm">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 flex-shrink-0"
              dangerouslySetInnerHTML={{
                __html: DISASTER_SVG_ICONS[event.disasterType](DISASTER_CONFIGS[event.disasterType].color)
                  .replace('width="32"', 'width="40"')
                  .replace('height="32"', 'height="40"')
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1 leading-tight">
                {event.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {event.locationName}
              </p>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-1 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: getSeverityColor(event.severity) }}
                >
                  {getSeverityLabel()}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {DISASTER_CONFIGS[event.disasterType].nameEs}
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>📅 {formatTime(event.eventTime)}</div>
                {event.magnitude && (
                  <div>📊 Magnitud: {event.magnitude.toFixed(1)}</div>
                )}
                {event.depth && (
                  <div>📏 Profundidad: {event.depth}km</div>
                )}
              </div>

              {event.description && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

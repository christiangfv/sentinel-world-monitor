'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Icon, DivIcon } from 'leaflet';
import { DisasterEvent } from '@/lib/types';
import { DISASTER_CONFIGS } from '@/lib/constants/disasters';
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

interface EventMarkerProps {
  event: DisasterEvent;
  onClick?: (event: DisasterEvent) => void;
}

export function EventMarker({ event, onClick }: EventMarkerProps) {
  const markerIcon = useMemo(() => {
    const config = DISASTER_CONFIGS[event.disasterType];
    const severityColor = getSeverityColor(event.severity);

    // Crear icono personalizado con HTML/CSS
    const iconHtml = `
      <div style="
        background-color: ${severityColor};
        border: 2px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${config.icon}
      </div>
    `;

    return new DivIcon({
      html: iconHtml,
      className: 'custom-event-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
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
            <div className="text-2xl">{DISASTER_CONFIGS[event.disasterType].icon}</div>
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

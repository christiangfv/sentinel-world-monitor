'use client';

import dynamic from 'next/dynamic';
import { DisasterEvent } from '@/lib/types';
import { getSeverityColor } from '@/lib/utils/severity';

const Circle = dynamic(
  () => import('react-leaflet').then(mod => mod.Circle),
  { ssr: false }
);

// Tipos de desastre que son eventos de área (no de punto)
// Earthquakes y tsunamis no se visualizan como área
const AREA_DISASTER_TYPES = new Set(['wildfire', 'flood', 'storm', 'landslide', 'volcano']);

interface EventAreaCircleProps {
  event: DisasterEvent;
  isSelected?: boolean;
}

export function EventAreaCircle({ event, isSelected = false }: EventAreaCircleProps) {
  // Solo renderizar para eventos de área con radiusKm válido
  if (!AREA_DISASTER_TYPES.has(event.disasterType)) return null;
  if (!event.radiusKm || event.radiusKm <= 0) return null;
  if (!event.location?.lat || !event.location?.lng) return null;
  if (isNaN(event.location.lat) || isNaN(event.location.lng)) return null;

  const color = getSeverityColor(event.severity);

  // Opacidad según severidad — prescribed fires (sev=1) muy tenues
  const fillOpacity = isSelected
    ? 0.25
    : event.severity === 1 ? 0.04
    : event.severity === 2 ? 0.08
    : event.severity === 3 ? 0.13
    : 0.18; // severity 4

  const strokeOpacity = isSelected ? 0.8 : event.severity === 1 ? 0.2 : 0.4;
  const weight = isSelected ? 2 : 1;

  return (
    <Circle
      center={[event.location.lat, event.location.lng]}
      radius={event.radiusKm * 1000} // km → metros
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity,
        weight,
        opacity: strokeOpacity,
        dashArray: event.severity <= 1 ? '4, 6' : undefined,
      }}
      interactive={false} // No captura clicks — el marker lo hace
    />
  );
}

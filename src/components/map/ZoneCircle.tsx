'use client';

import dynamic from 'next/dynamic';
import { UserZone } from '@/lib/types';

// Importar componentes de react-leaflet dinámicamente
const Circle = dynamic(
  () => import('react-leaflet').then(mod => mod.Circle),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

interface ZoneCircleProps {
  zone: UserZone;
  onClick?: (zone: UserZone) => void;
  isSelected?: boolean;
}

export function ZoneCircle({ zone, onClick, isSelected = false }: ZoneCircleProps) {
  const circleOptions = {
    color: isSelected ? '#ef4444' : zone.isActive ? '#3b82f6' : '#94a3b8',
    fillColor: isSelected ? '#ef4444' : zone.isActive ? '#3b82f6' : '#94a3b8',
    fillOpacity: isSelected ? 0.2 : 0.1,
    weight: isSelected ? 3 : 2,
    dashArray: zone.isActive ? undefined : '5, 5', // Línea punteada si está inactiva
  };

  return (
    <Circle
      center={[zone.location.lat, zone.location.lng]}
      radius={zone.radiusKm * 1000} // Convertir km a metros
      pathOptions={circleOptions}
      eventHandlers={{
        click: () => onClick?.(zone),
      }}
    >
      <Popup>
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📍</span>
            <h3 className="font-semibold text-sm">{zone.name}</h3>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div>📏 Radio: {zone.radiusKm}km</div>
            <div>📍 Centro: {zone.location.lat.toFixed(4)}, {zone.location.lng.toFixed(4)}</div>
            <div>📅 Creada: {zone.createdAt.toLocaleDateString('es-ES')}</div>
          </div>

          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${zone.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <span className="text-xs">
                {zone.isActive ? 'Zona activa' : 'Zona inactiva'}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Circle>
  );
}

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';

// Importar componentes de control dinámicamente
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);

interface MapControlsProps {
  onMyLocation?: () => void;
  onToggleZones?: () => void;
  showZones?: boolean;
  onFilterChange?: (filters: any) => void;
  className?: string;
}

export function MapControls({
  onMyLocation,
  onToggleZones,
  showZones = true,
  onFilterChange,
  className = ''
}: MapControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onMyLocation?.();
        },
        (error) => {
          console.error('Error getting location:', error);
          // Mostrar mensaje de error al usuario
        }
      );
    } else {
      console.error('Geolocation not supported');
    }
  };

  return (
    <div className={`absolute top-4 right-4 z-[1000] space-y-2 ${className}`}>
      {/* Botón de ubicación actual */}
      <Button
        size="sm"
        variant="subtle"
        className="bg-surface border border-border shadow-lg hover:bg-accent"
        onClick={handleMyLocation}
        title="Mi ubicación"
      >
        📍
      </Button>

      {/* Botón de mostrar/ocultar zonas */}
      {onToggleZones && (
        <Button
          size="sm"
          variant={showZones ? "solid" : "subtle"}
          className="bg-surface border border-border shadow-lg"
          onClick={onToggleZones}
          title={showZones ? "Ocultar zonas" : "Mostrar zonas"}
        >
          🏠
        </Button>
      )}

      {/* Botón de filtros */}
      <Button
        size="sm"
        variant="subtle"
        className="bg-surface border border-border shadow-lg"
        onClick={() => setShowFilters(!showFilters)}
        title="Filtros"
      >
        🔍
      </Button>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
          <h4 className="font-medium text-sm mb-3">Filtros</h4>

          <div className="space-y-2">
            {/* Filtro por severidad */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Severidad mínima
              </label>
              <select
                className="w-full text-sm border border-border rounded px-2 py-1 bg-background"
                onChange={(e) => onFilterChange?.({ minSeverity: parseInt(e.target.value) })}
                defaultValue="1"
              >
                <option value="1">Todas las severidades</option>
                <option value="2">Severidad 2+</option>
                <option value="3">Severidad 3+</option>
                <option value="4">Solo severidad 4</option>
              </select>
            </div>

            {/* Filtro por tipo de desastre */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Tipo de desastre
              </label>
              <div className="space-y-1">
                {[
                  { value: 'earthquake', label: 'Sismos', icon: '🌍' },
                  { value: 'tsunami', label: 'Tsunamis', icon: '🌊' },
                  { value: 'wildfire', label: 'Incendios', icon: '🔥' },
                  { value: 'flood', label: 'Inundaciones', icon: '💧' },
                  { value: 'storm', label: 'Tormentas', icon: '🌀' },
                  { value: 'volcano', label: 'Volcanes', icon: '🌋' },
                  { value: 'landslide', label: 'Deslizamientos', icon: '⛰️' },
                ].map((type) => (
                  <label key={type.value} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      defaultChecked
                      onChange={(e) => {
                        // Implementar lógica de filtro por tipo
                        console.log(`${type.value}: ${e.target.checked}`);
                      }}
                      className="rounded border-border"
                    />
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full mt-3"
            onClick={() => setShowFilters(false)}
          >
            Aplicar Filtros
          </Button>
        </div>
      )}

      {/* Leyenda */}
      <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
        <h4 className="font-medium text-sm mb-2">Leyenda</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-severity-4 rounded"></div>
            <span>Severidad 4</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-severity-3 rounded"></div>
            <span>Severidad 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-severity-2 rounded"></div>
            <span>Severidad 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-severity-1 rounded"></div>
            <span>Severidad 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

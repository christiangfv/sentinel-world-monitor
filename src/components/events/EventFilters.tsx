'use client';

import { useState } from 'react';
import { EventFilters, DisasterType } from '@/lib/types';
import { DISASTER_TYPES, DISASTER_CONFIGS } from '@/lib/constants/disasters';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  className?: string;
}

export function EventFilters({
  filters,
  onFiltersChange,
  className = ''
}: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSeverityChange = (severity: number) => {
    onFiltersChange({
      ...filters,
      minSeverity: severity
    });
  };

  const handleDisasterTypeToggle = (disasterType: DisasterType) => {
    const currentTypes = filters.disasterTypes || [];
    const newTypes = currentTypes.includes(disasterType)
      ? currentTypes.filter(type => type !== disasterType)
      : [...currentTypes, disasterType];

    onFiltersChange({
      ...filters,
      disasterTypes: newTypes.length > 0 ? newTypes : DISASTER_TYPES
    });
  };

  const handleSelectAllTypes = () => {
    onFiltersChange({
      ...filters,
      disasterTypes: DISASTER_TYPES
    });
  };

  const handleClearAllTypes = () => {
    onFiltersChange({
      ...filters,
      disasterTypes: []
    });
  };

  const activeTypesCount = (filters.disasterTypes || []).length;
  const totalTypesCount = DISASTER_TYPES.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'} filtros
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Filtro por severidad */}
          <div>
            <h4 className="font-medium mb-3">Severidad mínima</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((severity) => (
                <Button
                  key={severity}
                  variant={filters.minSeverity === severity ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSeverityChange(severity)}
                  className="flex items-center gap-1"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getSeverityColor(severity) }}
                  />
                  {severity}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Mostrar eventos de severidad {filters.minSeverity} o superior
            </p>
          </div>

          {/* Filtro por tipo de desastre */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">
                Tipos de desastre ({activeTypesCount}/{totalTypesCount})
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllTypes}
                  disabled={activeTypesCount === totalTypesCount}
                >
                  Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllTypes}
                  disabled={activeTypesCount === 0}
                >
                  Ninguno
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {DISASTER_TYPES.map((type) => {
                const config = DISASTER_CONFIGS[type];
                const isActive = (filters.disasterTypes || []).includes(type);

                return (
                  <Button
                    key={type}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDisasterTypeToggle(type)}
                    className="h-auto p-3 flex flex-col items-center gap-1 text-center"
                  >
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-xs">{config.nameEs}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtro por fecha (futuro) */}
          <div>
            <h4 className="font-medium mb-3">Rango de fechas</h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Próximamente</Badge>
              <span className="text-sm text-muted-foreground">
                Filtro por fechas personalizadas
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Función helper para obtener color de severidad
function getSeverityColor(severity: number): string {
  const colors = {
    1: '#22c55e',
    2: '#eab308',
    3: '#f97316',
    4: '#ef4444'
  };
  return colors[severity as keyof typeof colors] || colors[1];
}

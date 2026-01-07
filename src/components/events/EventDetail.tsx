'use client';

import { DisasterEvent } from '@/lib/types';
import { DISASTER_CONFIGS } from '@/lib/constants/disasters';
import { getSeverityColor, getSeverityLabel } from '@/lib/utils/severity';
import { formatEventDate, formatTimeAgo } from '@/lib/utils/date';
import { DisasterMap } from '@/components/map/DisasterMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Spinner';

interface EventDetailProps {
  event: DisasterEvent | null;
  loading?: boolean;
  error?: string | null;
  onShare?: () => void;
  onReportIssue?: () => void;
  className?: string;
}

export function EventDetail({
  event,
  loading = false,
  error = null,
  onShare,
  onReportIssue,
  className = ''
}: EventDetailProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner text="Cargando detalles del evento..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">⚠️ Error al cargar el evento</div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold mb-2">Evento no encontrado</h3>
        <p className="text-muted-foreground">
          El evento que buscas no existe o ha sido eliminado.
        </p>
      </div>
    );
  }

  const config = DISASTER_CONFIGS[event.disasterType];
  const severityColor = getSeverityColor(event.severity);
  const severityLabel = getSeverityLabel(event.disasterType, event.severity);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del evento */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{config.icon}</div>
              <div>
                <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                <CardDescription className="text-base">
                  {config.nameEs} • {event.locationName}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={`severity${event.severity}` as any}
              className="text-lg px-4 py-2"
            >
              {severityLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button variant="outline" onClick={onShare}>
              📤 Compartir
            </Button>
            <Button variant="outline" onClick={onReportIssue}>
              🚨 Reportar problema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información principal */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Detalles del evento */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Tipo</div>
                <div className="font-medium">{config.nameEs}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Severidad</div>
                <div className="font-medium">{severityLabel}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Fecha y hora</div>
                <div className="font-medium">{formatEventDate(event.eventTime)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Hace</div>
                <div className="font-medium">{formatTimeAgo(event.eventTime)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ubicación</div>
                <div className="font-medium">{event.locationName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Coordenadas</div>
                <div className="font-medium text-sm">
                  {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Información específica del tipo de desastre */}
            {(event.magnitude || event.depth) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Información Sísmica</h4>
                <div className="space-y-2">
                  {event.magnitude && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Magnitud</span>
                      <span className="font-medium">{event.magnitude.toFixed(1)}</span>
                    </div>
                  )}
                  {event.depth && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Profundidad</span>
                      <span className="font-medium">{event.depth} km</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Descripción */}
            {event.description && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mapa del evento */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
            <CardDescription>
              Mapa centrado en la ubicación del evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DisasterMap
              events={[event]}
              center={[event.location.lat, event.location.lng]}
              zoom={8}
              height="300px"
              showControls={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
            <CardDescription>
              Datos técnicos proporcionados por la fuente oficial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(event.metadata).map(([key, value]) => (
                <div key={key}>
                  <div className="text-sm text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                  <div className="font-medium">{String(value)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de la fuente */}
      <Card>
        <CardHeader>
          <CardTitle>Fuente de Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{getSourceName(event.source)}</div>
              <div className="text-sm text-muted-foreground">
                ID externo: {event.externalId}
              </div>
            </div>
            <Button variant="outline" size="sm">
              Ver fuente original
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Función helper para obtener nombre de fuente
function getSourceName(source: string): string {
  const sources = {
    usgs: 'USGS Earthquake Hazards Program',
    gdacs: 'Global Disaster Alert and Coordination System',
    senapred: 'SENAPRED Chile',
    noaa: 'National Oceanic and Atmospheric Administration'
  };
  return sources[source as keyof typeof sources] || source.toUpperCase();
}


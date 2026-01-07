import Link from 'next/link';
import { DisasterEvent } from '@/lib/types';
import { DISASTER_CONFIGS } from '@/lib/constants/disasters';
import { getSeverityColor, getSeverityLabel } from '@/lib/utils/severity';
import { formatTimeAgo, formatEventDate } from '@/lib/utils/date';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface EventCardProps {
  event: DisasterEvent;
  compact?: boolean;
  showMapLink?: boolean;
  onClick?: () => void;
  className?: string;
}

export function EventCard({
  event,
  compact = false,
  showMapLink = true,
  onClick,
  className = ''
}: EventCardProps) {
  const config = DISASTER_CONFIGS[event.disasterType];
  const severityColor = getSeverityColor(event.severity);
  const severityLabel = getSeverityLabel(event.disasterType, event.severity);

  if (compact) {
    return (
      <Card className={`hover:shadow-medium transition-all duration-300 cursor-pointer bg-white border-l-4 hover:scale-[1.02] animate-slide-up ${className}`} onClick={onClick} style={{ borderLeftColor: severityColor }}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                <Badge
                  variant={`severity${event.severity}` as any}
                  className="text-xs"
                >
                  {event.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {event.locationName}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatTimeAgo(event.eventTime)}</span>
                <span>{config.nameEs}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/event/${event.id}`} onClick={onClick}>
      <Card className={`hover:shadow-large transition-all duration-300 cursor-pointer border-l-4 bg-white hover:scale-[1.02] hover:-translate-y-1 ${className}`}
            style={{ borderLeftColor: severityColor }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{config.icon}</div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{config.nameEs}</p>
              </div>
            </div>
            <Badge
              variant={`severity${event.severity}` as any}
              className="text-sm px-3 py-1"
            >
              {severityLabel}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>📍</span>
              <span>{event.locationName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>🕐</span>
              <span>{formatEventDate(event.eventTime)}</span>
            </div>

            {event.magnitude && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>📊</span>
                <span>Magnitud: {event.magnitude.toFixed(1)}</span>
              </div>
            )}

            {event.depth && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>📏</span>
                <span>Profundidad: {event.depth}km</span>
              </div>
            )}

            {event.description && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {showMapLink && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Haz click para ver detalles y ubicación</span>
              <span>🗺️ Ver en mapa</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

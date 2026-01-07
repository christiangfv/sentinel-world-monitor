import { UserZone } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ZoneCardProps {
  zone: UserZone;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  className?: string;
}

export function ZoneCard({ zone, onEdit, onDelete, onToggle, className = '' }: ZoneCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className={`${zone.isActive ? 'border-primary-500 bg-primary-50/50' : ''} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{zone.name}</h3>
              <Badge variant={zone.isActive ? 'secondary' : 'outline'}>
                {zone.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">📏 Radio:</span> {zone.radiusKm} km
              </div>
              <div>
                <span className="font-medium">📅 Creada:</span> {formatDate(zone.createdAt)}
              </div>
              <div className="col-span-2">
                <span className="font-medium">📍 Ubicación:</span> {zone.location.lat.toFixed(4)}, {zone.location.lng.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant={zone.isActive ? "solid" : "outline"}
              onClick={onToggle}
              className="min-w-[80px]"
            >
              {zone.isActive ? 'Desactivar' : 'Activar'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
            >
              ✏️ Editar
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              🗑️ Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

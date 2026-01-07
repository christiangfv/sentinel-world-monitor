'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserZones } from '@/lib/hooks/useUserZones';
import { UserZone } from '@/lib/types';
import { ZoneForm } from './ZoneForm';
import { ZoneCard } from './ZoneCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface ZoneManagerProps {
  className?: string;
}

export function ZoneManager({ className = '' }: ZoneManagerProps) {
  const { user } = useAuth();
  const { zones, loading, error, createZone, updateZone, removeZone, toggleZone } = useUserZones();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<UserZone | null>(null);

  const handleCreateZone = async (zoneData: Omit<UserZone, 'id' | 'userId' | 'createdAt'>) => {
    try {
      await createZone(zoneData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating zone:', error);
      // Error ya manejado por el hook
    }
  };

  const handleUpdateZone = async (zoneData: Omit<UserZone, 'id' | 'userId' | 'createdAt'>) => {
    if (!editingZone) return;

    try {
      await updateZone(editingZone.id, zoneData);
      setEditingZone(null);
    } catch (error) {
      console.error('Error updating zone:', error);
      // Error ya manejado por el hook
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta zona?')) {
      try {
        await removeZone(zoneId);
      } catch (error) {
        console.error('Error deleting zone:', error);
        // Error ya manejado por el hook
      }
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">
            Debes iniciar sesión para gestionar tus zonas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Zonas de Monitoreo</CardTitle>
              <CardDescription>
                Configura las áreas geográficas donde quieres recibir alertas
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              ➕ Agregar Zona
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner text="Cargando zonas..." />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">⚠️ Error al cargar zonas</div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          ) : zones.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-lg font-semibold mb-2">No tienes zonas configuradas</h3>
              <p className="text-muted-foreground mb-6">
                Crea tu primera zona para empezar a recibir alertas personalizadas
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Crear Primera Zona
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onEdit={() => setEditingZone(zone)}
                  onDelete={() => handleDeleteZone(zone.id)}
                  onToggle={() => toggleZone(zone.id, !zone.isActive)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear zona */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ZoneForm
          onSubmit={handleCreateZone}
          onCancel={() => setIsCreateModalOpen(false)}
          title="Crear Nueva Zona"
        />
      </Modal>

      {/* Modal para editar zona */}
      <Modal
        isOpen={!!editingZone}
        onClose={() => setEditingZone(null)}
      >
        {editingZone && (
          <ZoneForm
            initialData={editingZone}
            onSubmit={handleUpdateZone}
            onCancel={() => setEditingZone(null)}
            title="Editar Zona"
          />
        )}
      </Modal>
    </div>
  );
}


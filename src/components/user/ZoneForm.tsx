'use client';

import { useState, useEffect } from 'react';
import { UserZone } from '@/lib/types';
import { DisasterMap } from '@/components/map/DisasterMap';
import { Button } from '@/components/ui/Button';
import { ModalHeader, ModalTitle, ModalCloseButton } from '@/components/ui/Modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Spinner';

interface ZoneFormData {
  name: string;
  radiusKm: number;
  location: {
    lat: number;
    lng: number;
  };
}

interface ZoneFormProps {
  initialData?: UserZone;
  onSubmit: (data: Omit<UserZone, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  title: string;
}

export function ZoneForm({ initialData, onSubmit, onCancel, title }: ZoneFormProps) {
  const [formData, setFormData] = useState<ZoneFormData>({
    name: initialData?.name || '',
    radiusKm: initialData?.radiusKm || 50,
    location: initialData?.location || { lat: -33.45, lng: -70.65 } // Santiago por defecto
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Función para manejar cambios en coordenadas manuales
  const handleCoordinatesChange = (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setFormData(prev => ({
        ...prev,
        location: { lat: latNum, lng: lngNum }
      }));
    }
  };

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está soportada por este navegador');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude }
        }));
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Error al obtener la ubicación';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }

        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Por favor ingresa un nombre para la zona');
      return;
    }

    if (formData.radiusKm < 1 || formData.radiusKm > 500) {
      alert('El radio debe estar entre 1 y 500 km');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        location: formData.location,
        geohash: '', // Se calculará en el servidor
        radiusKm: formData.radiusKm,
        isActive: initialData?.isActive ?? true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalCloseButton onClick={onCancel} />
      </ModalHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Básica</CardTitle>
            <CardDescription>
              Configura el nombre y radio de la zona
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de la zona *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Mi casa, Trabajo, Ciudad..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Radio de alerta (km) *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.radiusKm}
                onChange={(e) => setFormData(prev => ({ ...prev, radiusKm: parseInt(e.target.value) || 50 }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recibirás alertas cuando eventos ocurran dentro de este radio
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Selección de ubicación */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ubicación</CardTitle>
                <CardDescription>
                  Selecciona el centro de la zona en el mapa
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <LoadingSpinner />
                ) : (
                  '📍 Mi ubicación'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {locationError}
                </div>
              )}

              {/* Inputs para coordenadas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.location.lat}
                    onChange={(e) => handleCoordinatesChange(e.target.value, formData.location.lng.toString())}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="-33.456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.location.lng}
                    onChange={(e) => handleCoordinatesChange(formData.location.lat.toString(), e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="-70.678901"
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                📍 Ubicación actual: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </div>

              {/* Mapa de vista previa */}
              <div className="h-64 rounded-lg overflow-hidden border">
                <DisasterMap
                  events={[]}
                  center={[formData.location.lat, formData.location.lng]}
                  zoom={12}
                  onEventClick={() => {}} // No necesitamos manejar eventos aquí
                  onZoneClick={() => {}} // Tampoco zonas
                />
              </div>

              <div className="text-xs text-muted-foreground">
                💡 Puedes ajustar las coordenadas manualmente o usar "Mi ubicación" para centrar el mapa en tu posición actual
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? <LoadingSpinner /> : null}
            {initialData ? 'Actualizar Zona' : 'Crear Zona'}
          </Button>
        </div>
      </form>
    </div>
  );
}

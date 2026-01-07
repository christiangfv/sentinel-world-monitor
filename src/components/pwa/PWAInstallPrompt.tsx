'use client';

import { useState } from 'react';
import { usePWA } from '@/lib/hooks/usePWA';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function PWAInstallPrompt() {
  const { canInstall, installPWA, updatePWA, updateAvailable, isOffline } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Mostrar update disponible primero
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="bg-primary-500 text-white border-primary-600 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔄</div>
              <div className="flex-1">
                <h3 className="font-semibold">Actualización Disponible</h3>
                <p className="text-sm opacity-90 mt-1">
                  Hay una nueva versión de Sentinel disponible
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={updatePWA}
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Actualizar Ahora
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDismissed(true)}
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Después
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar prompt de instalación
  if (canInstall) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="bg-surface border-border shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📱</div>
              <div className="flex-1">
                <h3 className="font-semibold">Instalar Sentinel</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Instala la app para acceder más rápido y recibir notificaciones
                </p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={installPWA}
                className="flex-1"
              >
                Instalar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDismissed(true)}
                className="flex-1"
              >
                Después
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar indicador offline
  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="bg-yellow-500 text-yellow-900 border-yellow-600 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📡</div>
              <div className="flex-1">
                <h3 className="font-semibold">Modo Offline</h3>
                <p className="text-sm opacity-90">
                  Funcionando sin conexión
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

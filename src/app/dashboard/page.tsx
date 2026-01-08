'use client';

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUserZones } from "@/lib/hooks/useUserZones";
import { useRecentNotifications } from "@/lib/hooks/useNotifications";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { zones, loading: loadingZones } = useUserZones();
  const { notifications, loading: loadingNotifs } = useRecentNotifications(7 * 24); // 7 days
  const router = useRouter();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Control</h1>
            <p className="text-muted-foreground">
              Gestiona tus zonas de monitoreo y preferencias de alertas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Resumen de zonas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📍 Mis Zonas
                </CardTitle>
                <CardDescription>
                  Zonas configuradas para monitoreo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {loadingZones ? "..." : zones.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {zones.length === 0 ? "No tienes zonas configuradas" : `${zones.length} zonas activas`}
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => router.push('/settings')}
                >
                  Agregar Zona
                </Button>
              </CardContent>
            </Card>

            {/* Alertas recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔔 Alertas Recientes
                </CardTitle>
                <CardDescription>
                  Notificaciones de los últimos 7 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  {loadingNotifs ? "..." : notifications.length}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {notifications.length === 0 ? "Sin alertas recientes" : "Alertas recibidas"}
                </p>

                {notifications.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {notifications.slice(0, 3).map(n => (
                      <div key={n.id} className="flex flex-col text-sm border-b border-white/5 pb-2 last:border-0">
                        <span className="font-medium text-xs">{n.event?.title || 'Evento'}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(n.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estado del sistema */}
            <SystemHealth />
          </div>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Configura tu experiencia de monitoreo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/settings')}
                >
                  <span className="text-2xl">📍</span>
                  <span>Administrar Zonas</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/settings')}
                >
                  <span className="text-2xl">🔔</span>
                  <span>Preferencias de Alertas</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/')}
                >
                  <span className="text-2xl">📊</span>
                  <span>Ver Mapa en Vivo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/settings')}
                >
                  <span className="text-2xl">⚙️</span>
                  <span>Configuración General</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}

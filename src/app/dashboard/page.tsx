import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
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
                <div className="text-3xl font-bold mb-2">0</div>
                <p className="text-sm text-muted-foreground">
                  No tienes zonas configuradas
                </p>
                <Button className="mt-4" size="sm">
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
                <div className="text-3xl font-bold mb-2">0</div>
                <p className="text-sm text-muted-foreground">
                  Sin alertas recientes
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sismos</span>
                    <Badge variant="success">Activado</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Incendios</span>
                    <Badge variant="success">Activado</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Inundaciones</span>
                    <Badge variant="success">Activado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado del sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚙️ Estado del Sistema
                </CardTitle>
                <CardDescription>
                  Información del servicio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API USGS</span>
                    <Badge variant="secondary">Activo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificaciones</span>
                    <Badge variant="secondary">Activadas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última actualización</span>
                    <span className="text-xs text-muted-foreground">Ahora</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <span className="text-2xl">📍</span>
                  <span>Administrar Zonas</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  <span>Preferencias de Alertas</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <span>Historial de Eventos</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
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

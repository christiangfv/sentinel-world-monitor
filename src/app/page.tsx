import { Header } from "@/components/layout/Header";
import { DisasterMap } from "@/components/map/DisasterMap";
import { useEvents } from "@/lib/hooks/useEvents";
import { useUserZones } from "@/lib/hooks/useUserZones";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const { events, loading: eventsLoading } = useEvents();
  const { zones: userZones } = useUserZones();
  const router = useRouter();

  const handleEventClick = (event: any) => {
    router.push(`/event/${event.id}`);
  };

  const handleZoneClick = (zone: any) => {
    if (user) {
      router.push('/settings');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <div className="text-center py-8 px-4 bg-gradient-to-b from-primary-50 to-background">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sentinel
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Monitoreo de desastres naturales en tiempo real
          </p>
        </div>

        {/* Mapa principal */}
        <div className="container mx-auto px-4 pb-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="flex items-center gap-2">
                  🌍 Mapa de Eventos
                  {events.length > 0 && (
                    <Badge variant="secondary">{events.length} eventos</Badge>
                  )}
                </span>
              </CardTitle>
              <CardDescription>
                Eventos de desastres naturales reportados en las últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DisasterMap
                events={events}
                userZones={userZones}
                height="400px"
                onEventClick={handleEventClick}
                onZoneClick={handleZoneClick}
              />
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-severity-4 mb-1">
                  {events.filter(e => e.severity === 4).length}
                </div>
                <div className="text-xs text-muted-foreground">Severidad 4</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-severity-3 mb-1">
                  {events.filter(e => e.severity === 3).length}
                </div>
                <div className="text-xs text-muted-foreground">Severidad 3</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-severity-2 mb-1">
                  {events.filter(e => e.severity === 2).length}
                </div>
                <div className="text-xs text-muted-foreground">Severidad 2</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-severity-1 mb-1">
                  {events.filter(e => e.severity === 1).length}
                </div>
                <div className="text-xs text-muted-foreground">Severidad 1</div>
              </CardContent>
            </Card>
          </div>

          {/* Información del proyecto */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🔔</div>
                <CardTitle className="text-lg">Alertas en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-center">
                  Recibe notificaciones push cuando ocurra un desastre cerca de tus zonas configuradas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <CardTitle className="text-lg">Aplicación PWA</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-center">
                  Instálala en tu dispositivo y funciona sin conexión a internet.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <CardTitle className="text-lg">Zonas Personalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-center">
                  Configura zonas geográficas de interés y recibe alertas específicas.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

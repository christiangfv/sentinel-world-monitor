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

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Sentinel
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Monitoreo de desastres naturales en tiempo real
          </p>
        </div>

        {/* Mapa principal */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌍 Mapa de Eventos
                {events.length > 0 && (
                  <Badge variant="secondary">{events.length} eventos</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Eventos de desastres naturales reportados en las últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DisasterMap
                events={events}
                userZones={userZones}
                height="500px"
                onEventClick={handleEventClick}
                onZoneClick={handleZoneClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Información del proyecto */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="text-3xl mb-4">🔔</div>
              <CardTitle>Alertas en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Recibe notificaciones push cuando ocurra un desastre cerca de tus zonas configuradas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-3xl mb-4">📱</div>
              <CardTitle>Aplicación PWA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Instálala en tu dispositivo y funciona sin conexión a internet.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-3xl mb-4">🎯</div>
              <CardTitle>Zonas Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Configura zonas geográficas de interés y recibe alertas específicas.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-severity-4">{events.filter(e => e.severity === 4).length}</div>
              <div className="text-xs text-muted-foreground">Severidad 4</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-severity-3">{events.filter(e => e.severity === 3).length}</div>
              <div className="text-xs text-muted-foreground">Severidad 3</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-severity-2">{events.filter(e => e.severity === 2).length}</div>
              <div className="text-xs text-muted-foreground">Severidad 2</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-severity-1">{events.filter(e => e.severity === 1).length}</div>
              <div className="text-xs text-muted-foreground">Severidad 1</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

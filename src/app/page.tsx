'use client';

import { Header } from "@/components/layout/Header";
import { DisasterMap } from "@/components/map/DisasterMap";
import { useEvents } from "@/lib/hooks/useEvents";
import { useUserZones } from "@/lib/hooks/useUserZones";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  // Debug: verificar variables de entorno
  useEffect(() => {
    console.log('Environment check:', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }, []);
  const { user } = useAuth();
  const { events, loading: eventsLoading, error: eventsError } = useEvents();
  const { zones: userZones } = useUserZones();
  const router = useRouter();

  // Debug: mostrar errores en consola
  useEffect(() => {
    if (eventsError) {
      console.error('Events error:', eventsError);
    }
    console.log('Events loaded:', events.length, 'Loading:', eventsLoading);
  }, [events, eventsLoading, eventsError]);

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
    <div className="min-h-screen bg-gradient-to-br from-background to-primary-50/30">
      <Header />

      <main className="flex-1">
        {/* Hero Section Moderna */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto px-6 py-20 text-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                <span className="text-4xl">🛰️</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                Sentinel
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto font-light">
                Monitoreo global de desastres naturales en tiempo real.
                <span className="font-semibold text-white"> Protege lo que importa.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-primary-200">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{events.length} eventos activos</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-primary-400"></div>
                <div className="flex items-center gap-2 text-primary-200">
                  <span className="text-sm">Actualización cada 15-30 minutos</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        {/* Mapa principal */}
        <div className="container mx-auto px-6 pb-16 -mt-10 relative z-10">
          <Card className="shadow-large bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 text-2xl">
                <span className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    🌍
                  </div>
                  <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent font-display">
                    Mapa Global de Eventos
                  </span>
                  {events.length > 0 && (
                    <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                      {events.length} activos
                    </Badge>
                  )}
                </span>
              </CardTitle>
              <CardDescription className="text-base text-surface-600">
                Monitoreo continuo de desastres naturales en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DisasterMap
                events={events}
                userZones={userZones}
                height="500px"
                onEventClick={handleEventClick}
                onZoneClick={handleZoneClick}
              />
            </CardContent>
          </Card>

          {/* Estadísticas modernas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-gradient-to-br from-danger/10 to-danger/5 border-danger/20 hover:shadow-glow transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-danger text-xl">🚨</span>
                </div>
                <div className="text-3xl font-bold text-danger mb-1">
                  {events.filter(e => e.severity === 4).length}
                </div>
                <div className="text-sm font-medium text-danger/80">Críticos</div>
                <div className="text-xs text-surface-500 mt-1">Severidad Máxima</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 hover:shadow-medium transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-warning text-xl">⚠️</span>
                </div>
                <div className="text-3xl font-bold text-warning mb-1">
                  {events.filter(e => e.severity === 3).length}
                </div>
                <div className="text-sm font-medium text-warning/80">Altos</div>
                <div className="text-xs text-surface-500 mt-1">Severidad Alta</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary-100/50 to-primary-50/30 border-primary-200/50 hover:shadow-medium transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-primary-600 text-xl">📊</span>
                </div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {events.filter(e => e.severity === 2).length}
                </div>
                <div className="text-sm font-medium text-primary-700/80">Medios</div>
                <div className="text-xs text-surface-500 mt-1">Severidad Media</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 hover:shadow-medium transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-success text-xl">✅</span>
                </div>
                <div className="text-3xl font-bold text-success mb-1">
                  {events.filter(e => e.severity === 1).length}
                </div>
                <div className="text-sm font-medium text-success/80">Bajos</div>
                <div className="text-xs text-surface-500 mt-1">Severidad Baja</div>
              </CardContent>
            </Card>
          </div>

          {/* Características modernas */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-surface-800 mb-4">
              Tecnología Avanzada
            </h2>
            <p className="text-surface-600 max-w-2xl mx-auto">
              Sentinel combina las últimas tecnologías para brindarte información crítica cuando más importa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-large transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-primary-50/30 border-primary-100/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">🔔</span>
                </div>
                <CardTitle className="text-xl font-display text-primary-800">Alertas Instantáneas</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-surface-600 leading-relaxed">
                  Notificaciones push inteligentes que te alertan sobre desastres en tus zonas configuradas,
                  con información detallada y acciones recomendadas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-large transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-success/10 border-success/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-success/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">📱</span>
                </div>
                <CardTitle className="text-xl font-display text-success-800">PWA Nativa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-surface-600 leading-relaxed">
                  Aplicación web progresiva que se instala como una app nativa.
                  Funciona sin conexión y se sincroniza automáticamente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-large transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-warning/10 border-warning/20 sm:col-span-2 lg:col-span-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-warning to-warning/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl text-white">🎯</span>
                </div>
                <CardTitle className="text-xl font-display text-warning-800">Zonas Inteligentes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base text-surface-600 leading-relaxed">
                  Configura zonas geográficas personalizadas con radio inteligente.
                  Recibe alertas solo para las áreas que te importan.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Call to action */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-large">
              <CardContent className="p-8">
                <h3 className="text-2xl font-display font-bold mb-4">
                  ¿Listo para proteger lo que importa?
                </h3>
                <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                  Únete a miles de personas que confían en Sentinel para mantenerse informados
                  sobre desastres naturales en tiempo real.
                </p>
                {!user && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => router.push('/login')}
                      className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-105"
                    >
                      Comenzar Ahora
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      Ver Demo
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

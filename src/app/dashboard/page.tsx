'use client';

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUserZones } from "@/lib/hooks/useUserZones";
import { useRecentNotifications } from "@/lib/hooks/useNotifications";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const { zones, loading: loadingZones } = useUserZones();
  const { notifications, loading: loadingNotifs } = useRecentNotifications(7 * 24);
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Usuario';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section con saludo */}
          <div className="mb-10 animate-fade-in-up">
            <div className="glass-plasma rounded-3xl p-8 bg-mesh relative overflow-hidden">
              {/* Ambient glow orbs */}
              <div className="ambient-orb ambient-orb-plasma w-80 h-80 -top-20 -right-20 animate-ambient-glow" />
              <div className="ambient-orb ambient-orb-mist w-64 h-64 -bottom-16 -left-16 animate-ambient-glow" style={{ animationDelay: '2s' }} />
              <div className="ambient-orb ambient-orb-sakura w-48 h-48 top-1/2 left-1/2 animate-ambient-glow" style={{ animationDelay: '4s' }} />

              <div className="relative z-10">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-plasma text-sm font-semibold uppercase tracking-wider mb-2">{getGreeting()}</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                      Bienvenido, <span className="text-gradient-plasma">{firstName}</span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg">
                      Monitorea tus zonas de interés y mantente informado sobre eventos naturales en tiempo real.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => router.push('/')} size="lg">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Ver Mapa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Resumen de zonas */}
            <div className="glass-card p-6 animate-fade-in-up stagger-1 cursor-pointer hover:scale-[1.02]" onClick={() => router.push('/settings')}>
              <div className="flex items-start justify-between mb-4">
                <div className="icon-container w-12 h-12">
                  <svg className="w-6 h-6 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="badge-filled">Activas</span>
              </div>
              <div className="stat-number-plasma mb-1">
                {loadingZones ? (
                  <span className="inline-block w-12 h-10 bg-shadow rounded-lg shimmer" />
                ) : zones.length}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {zones.length === 0 ? "Sin zonas configuradas" : "Zonas de monitoreo"}
              </p>
              <div className="divider mb-4" />
              <div className="flex items-center text-sm text-plasma font-medium group">
                <span>Gestionar zonas</span>
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Alertas recientes */}
            <div className="glass-card p-6 animate-fade-in-up stagger-2">
              <div className="flex items-start justify-between mb-4">
                <div className="icon-container-mist w-12 h-12">
                  <svg className="w-6 h-6 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                {notifications.length > 0 && (
                  <span className="badge-success">Nuevas</span>
                )}
              </div>
              <div className="stat-number mb-1">
                {loadingNotifs ? (
                  <span className="inline-block w-12 h-10 bg-shadow rounded-lg shimmer" />
                ) : notifications.length}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Alertas en 7 días
              </p>

              {notifications.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {notifications.slice(0, 3).map((n, i) => (
                    <div
                      key={n.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-shadow/50 hover:bg-shadow transition-colors"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-mist flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted truncate">{n.event?.title || 'Evento'}</p>
                        <p className="text-[10px] text-smoke">
                          {new Date(n.sentAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-smoke text-sm">
                  Sin alertas recientes
                </div>
              )}
            </div>

            {/* Estado del sistema */}
            <div className="animate-fade-in-up stagger-3">
              <SystemHealth />
            </div>
          </div>

          {/* Acciones rápidas - Rediseñadas */}
          <Card className="animate-fade-in-up stagger-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="icon-container w-10 h-10">
                  <svg className="w-5 h-5 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Configura tu experiencia de monitoreo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    label: 'Administrar Zonas',
                    description: 'Añade o edita zonas',
                    href: '/settings',
                    color: 'plasma'
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    ),
                    label: 'Alertas',
                    description: 'Preferencias de notificaciones',
                    href: '/settings',
                    color: 'mist'
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    label: 'Mapa en Vivo',
                    description: 'Ver eventos globales',
                    href: '/',
                    color: 'sakura'
                  },
                  {
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    label: 'Configuración',
                    description: 'Ajustes generales',
                    href: '/settings',
                    color: 'smoke'
                  },
                ].map((action, i) => (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.href)}
                    className="group p-5 rounded-2xl glass-subtle hover:border-plasma/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(212,181,122,0.06)] transition-all duration-300 text-left hover:scale-[1.02]"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                      action.color === 'plasma' ? 'icon-container text-plasma' :
                      action.color === 'mist' ? 'icon-container-mist text-mist' :
                      action.color === 'sakura' ? 'icon-container-sakura text-sakura' :
                      'bg-smoke/10 text-smoke border border-smoke/10'
                    }`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-muted mb-1 group-hover:text-plasma transition-colors">{action.label}</h3>
                    <p className="text-xs text-smoke">{action.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}

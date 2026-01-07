import { Header } from "@/components/layout/Header";

export default function Home() {
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

        {/* Placeholder para el mapa principal */}
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-2xl font-semibold mb-4">Mapa Interactivo</h2>
          <p className="text-muted-foreground mb-6">
            Próximamente: Mapa con eventos de desastres naturales en tiempo real
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-severity-4/10 rounded-lg">
              <div className="text-2xl mb-2">🌋</div>
              <div className="text-sm font-medium">Severo</div>
            </div>
            <div className="p-4 bg-severity-3/10 rounded-lg">
              <div className="text-2xl mb-2">🔥</div>
              <div className="text-sm font-medium">Alto</div>
            </div>
            <div className="p-4 bg-severity-2/10 rounded-lg">
              <div className="text-2xl mb-2">🌊</div>
              <div className="text-sm font-medium">Moderado</div>
            </div>
            <div className="p-4 bg-severity-1/10 rounded-lg">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-sm font-medium">Bajo</div>
            </div>
          </div>
        </div>

        {/* Información del proyecto */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="text-3xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">Alertas en Tiempo Real</h3>
            <p className="text-muted-foreground text-sm">
              Recibe notificaciones push cuando ocurra un desastre cerca de tus zonas configuradas.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Aplicación PWA</h3>
            <p className="text-muted-foreground text-sm">
              Instálala en tu dispositivo y funciona sin conexión a internet.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Zonas Personalizadas</h3>
            <p className="text-muted-foreground text-sm">
              Configura zonas geográficas de interés y recibe alertas específicas.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

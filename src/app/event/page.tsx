'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEvent } from "@/lib/hooks/useEvents";
import { DISASTER_CONFIGS } from "@/lib/constants/disasters";
import { getSeverityColor, getSeverityLabel } from "@/lib/utils/severity";
import { Spinner } from "@/components/ui/Spinner";
import dynamic from 'next/dynamic';

// Importar el mapa dinámicamente para evitar SSR
const DisasterMap = dynamic(
  () => import('@/components/map/DisasterMap').then(mod => mod.DisasterMap),
  { ssr: false, loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" /> }
);

function EventContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id') || '';
  
  const { event, loading, error } = useEvent(eventId || null);

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ID de evento no proporcionado</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Cargando evento...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Evento no encontrado</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Información del evento */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="text-4xl">
            {DISASTER_CONFIGS[event.disasterType]?.icon || '⚠️'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">{event.locationName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: getSeverityColor(event.severity) }}
          >
            {getSeverityLabel(event.disasterType, event.severity)}
          </span>
          <span className="px-3 py-1 rounded-full bg-muted text-sm">
            {DISASTER_CONFIGS[event.disasterType]?.nameEs || event.disasterType}
          </span>
        </div>

        {event.description && (
          <p className="text-muted-foreground">{event.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <span className="text-sm text-muted-foreground">Fecha</span>
            <p className="font-medium">
              {event.eventTime?.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          {event.magnitude && (
            <div>
              <span className="text-sm text-muted-foreground">Magnitud</span>
              <p className="font-medium">{event.magnitude.toFixed(1)}</p>
            </div>
          )}
          {event.depth && (
            <div>
              <span className="text-sm text-muted-foreground">Profundidad</span>
              <p className="font-medium">{event.depth} km</p>
            </div>
          )}
          <div>
            <span className="text-sm text-muted-foreground">Fuente</span>
            <p className="font-medium uppercase">{event.source}</p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-card border rounded-lg overflow-hidden h-80 lg:h-auto">
        {event.location?.lat && event.location?.lng && (
          <DisasterMap
            events={[event]}
            center={[event.location.lat, event.location.lng]}
            zoom={8}
          />
        )}
      </div>
    </div>
  );
}

export default function EventPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Inicio
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Eventos
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Detalle del Evento</span>
        </nav>

        {/* Botón volver */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              ← Volver al mapa
            </Link>
          </Button>
        </div>

        {/* Contenido */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
            <span className="ml-2">Cargando...</span>
          </div>
        }>
          <EventContent />
        </Suspense>
      </main>
    </div>
  );
}


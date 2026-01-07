'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from "@/components/layout/Header";
import Link from "next/link";
import { useEvent } from "@/lib/hooks/useEvents";
import { DISASTER_CONFIGS } from "@/lib/constants/disasters";
import { getSeverityColor, getSeverityLabel } from "@/lib/utils/severity";
import { LoadingSpinner } from "@/components/ui/Spinner";
import dynamic from 'next/dynamic';

// Importar el mapa dinámicamente para evitar SSR
const DisasterMap = dynamic(
  () => import('@/components/map/DisasterMap').then(mod => mod.DisasterMap),
  { ssr: false, loading: () => <div className="h-64 bg-surface animate-pulse rounded-lg" /> }
);

function EventContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id') || '';
  
  const { event, loading, error } = useEvent(eventId || null);

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <p className="text-smoke">ID de evento no proporcionado</p>
        <Link 
          href="/" 
          className="mt-4 inline-block px-4 py-2 border border-slate rounded-lg text-muted hover:bg-surface transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner text="Cargando evento..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sakura">{error}</p>
        <Link 
          href="/" 
          className="mt-4 inline-block px-4 py-2 border border-slate rounded-lg text-muted hover:bg-surface transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-smoke">Evento no encontrado</p>
        <Link 
          href="/" 
          className="mt-4 inline-block px-4 py-2 border border-slate rounded-lg text-muted hover:bg-surface transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Información del evento */}
      <div className="bg-surface border border-slate rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="text-4xl">
            {DISASTER_CONFIGS[event.disasterType]?.icon || '⚠️'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-muted">{event.title}</h1>
            <p className="text-smoke">{event.locationName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: getSeverityColor(event.severity) }}
          >
            {getSeverityLabel(event.disasterType, event.severity)}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate text-smoke text-sm">
            {DISASTER_CONFIGS[event.disasterType]?.nameEs || event.disasterType}
          </span>
        </div>

        {event.description && (
          <p className="text-smoke">{event.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate">
          <div>
            <span className="text-sm text-smoke">Fecha</span>
            <p className="font-medium text-muted">
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
              <span className="text-sm text-smoke">Magnitud</span>
              <p className="font-medium text-muted">{event.magnitude.toFixed(1)}</p>
            </div>
          )}
          {event.depth && (
            <div>
              <span className="text-sm text-smoke">Profundidad</span>
              <p className="font-medium text-muted">{event.depth} km</p>
            </div>
          )}
          <div>
            <span className="text-sm text-smoke">Fuente</span>
            <p className="font-medium text-muted uppercase">{event.source}</p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-surface border border-slate rounded-lg overflow-hidden h-80 lg:h-auto">
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
          <Link href="/" className="text-smoke hover:text-muted transition-colors">
            Inicio
          </Link>
          <span className="mx-2 text-smoke">/</span>
          <Link href="/" className="text-smoke hover:text-muted transition-colors">
            Eventos
          </Link>
          <span className="mx-2 text-smoke">/</span>
          <span className="text-muted">Detalle del Evento</span>
        </nav>

        {/* Botón volver */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-slate rounded-lg text-muted hover:bg-surface transition-colors"
          >
            ← Volver al mapa
          </Link>
        </div>

        {/* Contenido */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner text="Cargando..." />
          </div>
        }>
          <EventContent />
        </Suspense>
      </main>
    </div>
  );
}

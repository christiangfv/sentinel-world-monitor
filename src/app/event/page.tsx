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
  { ssr: false, loading: () => <div className="h-64 bg-shadow rounded-2xl shimmer" /> }
);

function EventContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id') || '';

  const { event, loading, error } = useEvent(eventId || null);

  if (!eventId) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in-up">
        <div className="icon-container-sakura w-16 h-16 mx-auto mb-4">
          <svg className="w-8 h-8 text-sakura" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-smoke text-lg mb-4">ID de evento no proporcionado</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-plasma/10 text-plasma border border-plasma/20 rounded-xl hover:bg-plasma/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner text="Cargando evento..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in-up">
        <div className="icon-container-sakura w-16 h-16 mx-auto mb-4">
          <svg className="w-8 h-8 text-sakura" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sakura text-lg mb-4">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-plasma/10 text-plasma border border-plasma/20 rounded-xl hover:bg-plasma/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in-up">
        <div className="icon-container-mist w-16 h-16 mx-auto mb-4">
          <svg className="w-8 h-8 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-smoke text-lg mb-4">Evento no encontrado</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-plasma/10 text-plasma border border-plasma/20 rounded-xl hover:bg-plasma/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    );
  }

  const severityColor = getSeverityColor(event.severity);

  return (
    <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up">
      {/* Información del evento */}
      <div className="glass-card p-6 space-y-5">
        {/* Header con icono y título */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: `linear-gradient(135deg, ${severityColor}20, ${severityColor}05)`,
              border: `1px solid ${severityColor}30`
            }}
          >
            {DISASTER_CONFIGS[event.disasterType]?.icon || '⚠️'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">{event.title}</h1>
            <p className="text-smoke flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {event.locationName}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className="px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: `${severityColor}20`,
              color: severityColor,
              border: `1px solid ${severityColor}30`
            }}
          >
            {getSeverityLabel(event.disasterType, event.severity)}
          </span>
          <span className="badge-outline">
            {DISASTER_CONFIGS[event.disasterType]?.nameEs || event.disasterType}
          </span>
        </div>

        {/* Descripción */}
        {event.description && (
          <div className="p-4 rounded-xl glass-subtle">
            <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Detalles */}
        <div className="divider" />
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-shadow/30">
            <span className="text-xs text-smoke uppercase tracking-wider font-medium">Fecha</span>
            <p className="font-medium text-muted mt-1">
              {event.eventTime?.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <p className="text-sm text-smoke">
              {event.eventTime?.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          {event.magnitude && (
            <div className="p-3 rounded-xl bg-shadow/30">
              <span className="text-xs text-smoke uppercase tracking-wider font-medium">Magnitud</span>
              <p className="text-2xl font-bold text-gradient-plasma mt-1">{event.magnitude.toFixed(1)}</p>
            </div>
          )}
          {event.depth && (
            <div className="p-3 rounded-xl bg-shadow/30">
              <span className="text-xs text-smoke uppercase tracking-wider font-medium">Profundidad</span>
              <p className="font-medium text-muted mt-1">{event.depth} km</p>
            </div>
          )}
          <div className="p-3 rounded-xl bg-shadow/30">
            <span className="text-xs text-smoke uppercase tracking-wider font-medium">Fuente</span>
            <p className="font-medium text-muted mt-1 uppercase">{event.source}</p>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="glass-card overflow-hidden h-80 lg:h-auto min-h-[400px] p-1">
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
        {/* Breadcrumb mejorado */}
        <nav className="mb-6 animate-fade-in-down">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="flex items-center gap-1.5 text-smoke hover:text-plasma transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </Link>
            <svg className="w-4 h-4 text-smoke/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/" className="text-smoke hover:text-plasma transition-colors">
              Eventos
            </Link>
            <svg className="w-4 h-4 text-smoke/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-muted font-medium">Detalle</span>
          </div>
        </nav>

        {/* Botón volver */}
        <div className="mb-6 animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium glass-subtle hover:border-plasma/25 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-xl transition-all duration-300 group text-smoke hover:text-plasma"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al mapa
          </Link>
        </div>

        {/* Contenido */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text="Cargando..." />
          </div>
        }>
          <EventContent />
        </Suspense>
      </main>
    </div>
  );
}

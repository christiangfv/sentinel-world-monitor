'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

import Link from 'next/link'
import { EventFeed } from '@/components/events/EventFeed'
import { EventFiltersComponent } from '@/components/events/EventFiltersComponent'
import { useEvents } from '@/lib/hooks/useEvents'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoginButton } from '@/components/auth/LoginButton'
import { UserMenu } from '@/components/auth/UserMenu'
import { DISASTER_TYPES } from '@/lib/constants/disasters'
import { DisasterEvent, EventFilters } from '@/lib/types'
import { EventContextModal } from '@/components/events/EventContextModal'
import { OnboardingModal } from '@/components/auth/OnboardingModal'

const DisasterMap = dynamic(() => import('@/components/map/DisasterMap').then(m => ({ default: m.DisasterMap })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0D0E14]" />
})

const DisasterGlobe = dynamic(() => import('@/components/map/DisasterGlobe').then(m => ({ default: m.DisasterGlobe })), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0D0E14] flex items-center justify-center text-[#D4B57A]">Cargando Esfera...</div>
})

export default function HomePage() {
  const { user } = useAuth()
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null)
  const [contextEvent, setContextEvent] = useState<DisasterEvent | null>(null)
  const [isContextOpen, setIsContextOpen] = useState(false)
  const [eventFilters, setEventFilters] = useState<EventFilters>({
    disasterTypes: DISASTER_TYPES,
    minSeverity: 1
  })
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Auto-trigger insight card on selection
  useEffect(() => {
    if (selectedEvent) {
      setContextEvent(selectedEvent)
      setIsContextOpen(true)
    }
  }, [selectedEvent])

  // Aplicar tema al elemento html
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [theme])

  const { events, loading, error, newEventIds, markEventAsSeen } = useEvents(eventFilters)

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Mapa de fondo - ocupa toda la pantalla */}
      <div className="absolute inset-0 z-0 bg-[#0D0E14]">
        {viewMode === '2d' ? (
          <DisasterMap
            events={events}
            selectedEvent={selectedEvent}
            onEventClick={setSelectedEvent}
            showControls={false}
          />
        ) : (
          <DisasterGlobe
            events={events}
            selectedEvent={selectedEvent}
            onEventClick={setSelectedEvent}
          />
        )}
      </div>

      {/* Vignette overlays for map depth effect */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-40 vignette-top" />
        <div className="absolute inset-x-0 bottom-0 h-32 vignette-bottom" />
        <div className="absolute inset-y-0 left-0 w-24 vignette-left" />
        <div className="absolute inset-y-0 right-0 w-24 vignette-right" />
        {/* Corner vignettes */}
        <div className="absolute top-0 left-0 w-64 h-64 vignette-corner-tl" />
        <div className="absolute top-0 right-0 w-64 h-64 vignette-corner-tr" />
      </div>

      {/* Header flotante */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2.5 glass-plasma rounded-2xl px-4 py-2.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(212,181,122,0.12)] transition-all duration-300"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/logo.svg"
              alt="Sentinel Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-black text-plasma tracking-tighter text-lg uppercase font-display">Sentinel</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="glass-panel rounded-2xl">
          {user ? (
            <UserMenu />
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted hover:text-plasma transition-colors font-display">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Controles del mapa - esquina superior izquierda */}
      <div className="absolute top-20 left-4 z-20 space-y-2 animate-fade-in-down">
        {/* Switch flotante para vista 3D/2D */}
        <div className="glass-plasma rounded-2xl p-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === '2d'
                  ? 'bg-gradient-to-r from-plasma to-plasma-hover text-abyss shadow-sm'
                  : 'text-smoke hover:text-muted hover:bg-shadow/50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-plasma to-plasma-hover text-abyss shadow-sm'
                  : 'text-smoke hover:text-muted hover:bg-shadow/50'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              3D
            </button>
          </div>
        </div>

        {/* Switch flotante para tema Light/Dark */}
        <div className="glass-subtle rounded-2xl p-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-plasma to-plasma-hover text-abyss shadow-sm'
                  : 'text-smoke hover:text-muted hover:bg-shadow/50'
              }`}
              title="Modo Claro"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-plasma to-plasma-hover text-abyss shadow-sm'
                  : 'text-smoke hover:text-muted hover:bg-shadow/50'
              }`}
              title="Modo Oscuro"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Controles y Filtros Izquierda */}
      <div className="absolute bottom-6 left-6 z-40 flex flex-col gap-3 max-w-[280px] sm:max-w-xs animate-fade-in-up">
        {/* Leyenda mejorada */}
        <div className="glass-panel rounded-2xl px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-plasma to-plasma/30 rounded-full" />
              <span className="text-[10px] text-plasma uppercase font-bold tracking-[0.15em]">Nivel de Alerta</span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { color: '#E8E8F0', label: 'Crítico', short: 'C' },
                { color: '#A07888', label: 'Alto', short: 'A' },
                { color: '#D4B57A', label: 'Medio', short: 'M' },
                { color: '#7088A0', label: 'Bajo', short: 'B' },
              ].map((s) => (
                <div key={s.short} className="flex items-center gap-1.5 group cursor-help" title={s.label}>
                  <div
                    className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
                    style={{
                      background: s.color,
                      boxShadow: `0 0 10px ${s.color}60, 0 0 20px ${s.color}30`
                    }}
                  />
                  <span className="text-[10px] text-smoke font-semibold group-hover:text-muted transition-colors">{s.short}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <EventFiltersComponent
          filters={eventFilters}
          onFilterChange={setEventFilters}
        />
      </div>


      {/* Panel de eventos flotante - lado derecho */}
      <aside className="absolute top-20 bottom-24 right-6 z-30 w-[calc(100vw-3rem)] md:w-80 animate-slide-in-right">
        <div className="h-full glass-panel rounded-3xl overflow-hidden flex flex-col">
          {/* Header del panel mejorado */}
          <div className="p-5 border-b border-white/5 bg-gradient-to-r from-abyss/40 via-shadow/30 to-abyss/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)' }} />
                  <h2 className="text-card-foreground font-bold tracking-tight uppercase text-xs font-display">Protocolos Activos</h2>
                </div>
                <p className="text-plasma text-[11px] font-semibold mt-1.5 font-display flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-plasma animate-pulse" />
                  {events.length} eventos detectados
                </p>
              </div>
              <div className="icon-container w-10 h-10">
                <svg className="w-5 h-5 text-plasma" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {/* Scroll fade overlays */}
            <div className="absolute top-0 left-0 right-2 h-6 scroll-fade-top z-10 rounded-t-xl" />
            <div className="absolute bottom-0 left-0 right-2 h-6 scroll-fade-bottom z-10 rounded-b-xl" />
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-abyss/50 border border-border rounded-2xl h-24 overflow-hidden relative"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="absolute inset-0 shimmer" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-3/4 bg-shadow rounded-full" />
                      <div className="h-2 w-1/2 bg-shadow rounded-full" />
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-shadow rounded-full" />
                        <div className="h-5 w-12 bg-shadow rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EventFeed
                events={events}
                selectedEvent={selectedEvent}
                newEventIds={newEventIds}
                onEventSelect={setSelectedEvent}
                onMarkEventAsSeen={markEventAsSeen}
                onShowContext={(e) => {
                  setContextEvent(e)
                  setIsContextOpen(true)
                }}
              />
            )}
          </div>
        </div>
      </aside>

      <EventContextModal
        event={contextEvent}
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
      />

      <OnboardingModal
        user={user}
        onComplete={() => {
          console.log('Onboarding completed');
        }}
      />
    </div>
  )
}

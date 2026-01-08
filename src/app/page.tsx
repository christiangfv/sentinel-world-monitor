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
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')
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

      {/* Header flotante */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2.5 bg-shadow/95 backdrop-blur-xl border border-plasma/20 rounded-xl px-4 py-2.5 shadow-lg hover:border-plasma/40 transition-all ring-1 ring-white-5"
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
        <div className="bg-[#1A1B22]/95 backdrop-blur-xl border border-[#D4B57A]/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
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
      <div className="absolute top-20 left-4 z-20 space-y-2">
        {/* Switch flotante para vista 3D/2D */}
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-1 shadow-lg ring-1 ring-white-5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                viewMode === '2d'
                  ? 'bg-plasma text-abyss shadow-sm'
                  : 'text-muted-foreground hover:text-muted hover:bg-shadow/50'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                viewMode === '3d'
                  ? 'bg-plasma text-abyss shadow-sm'
                  : 'text-muted-foreground hover:text-muted hover:bg-shadow/50'
              }`}
            >
              3D
            </button>
          </div>
        </div>

        {/* Switch flotante para tema Light/Dark */}
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-1 shadow-lg ring-1 ring-white-5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-plasma text-abyss shadow-sm'
                  : 'text-muted-foreground hover:text-muted hover:bg-shadow/50'
              }`}
              title="Modo Claro"
            >
              ☀️
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-plasma text-abyss shadow-sm'
                  : 'text-muted-foreground hover:text-muted hover:bg-shadow/50'
              }`}
              title="Modo Oscuro"
            >
              🌙
            </button>
          </div>
        </div>

      </div>

      {/* Controles y Filtros Izquierda */}
      <div className="absolute bottom-6 left-6 z-40 flex flex-col gap-4 max-w-[280px] sm:max-w-xs">
        {/* Leyenda */}
        <div className="bg-[#1A1B22]/80 backdrop-blur-xl border border-[#D4B57A]/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/5 ring-inset">
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] text-[#D4B57A] uppercase font-black tracking-[0.2em] opacity-80">Nivel de Alerta</span>
            <div className="flex items-center gap-4">
              {[
                { color: '#E8E8F0', label: 'C' },
                { color: '#A07888', label: 'A' },
                { color: '#D4B57A', label: 'M' },
                { color: '#7088A0', label: 'B' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 group cursor-help" title={s.label}>
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: s.color, color: s.color }} />
                  <span className="text-[10px] text-[#8890A0] font-black group-hover:text-[#E8E8F0] transition-colors">{s.label}</span>
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
      <aside className="absolute top-20 bottom-24 right-6 z-30 w-[calc(100vw-3rem)] md:w-80">
        <div className="h-full bg-card/95 backdrop-blur-2xl border border-border rounded-3xl shadow-xl overflow-hidden flex flex-col ring-1 ring-white-5">
          <div className="p-5 border-b border-border">
            <div>
              <h2 className="text-card-foreground font-black tracking-tight uppercase text-xs opacity-90 font-display">Protocolos Activos</h2>
              <p className="text-plasma text-[10px] font-black uppercase tracking-widest mt-1 animate-pulse font-display">{events.length} Nodos detectados</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#0D0E14]/50 border border-[#4A5060]/10 rounded-2xl h-24 animate-pulse" />
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

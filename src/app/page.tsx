'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { EventFeed } from '@/components/events/EventFeed'
import { EventFiltersComponent } from '@/components/events/EventFiltersComponent'
import { useEvents } from '@/lib/hooks/useEvents'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoginButton } from '@/components/auth/LoginButton'
import { UserMenu } from '@/components/auth/UserMenu'
import { DISASTER_TYPES } from '@/lib/constants/disasters'
import { DisasterEvent, EventFilters } from '@/lib/types'

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
  const [eventFilters, setEventFilters] = useState<EventFilters>({
    disasterTypes: DISASTER_TYPES,
    minSeverity: 1
  })
  const [showEvents, setShowEvents] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')

  const { events, loading } = useEvents(eventFilters)

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Mapa de fondo - ocupa toda la pantalla */}
      <div className="absolute inset-0 z-0 bg-[#0D0E14]">
        {viewMode === '2d' ? (
          <DisasterMap
            events={events}
            onEventClick={setSelectedEvent}
            showControls={false}
          />
        ) : (
          <DisasterGlobe
            events={events}
            onEventClick={setSelectedEvent}
          />
        )}
      </div>

      {/* Header flotante */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2.5 bg-[#1A1B22]/95 backdrop-blur-xl border border-[#D4B57A]/20 rounded-xl px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#D4B57A]/40 transition-all"
        >
          <span className="text-xl">🛰️</span>
          <span className="font-semibold text-[#D4B57A] tracking-tight">Sentinel</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="bg-[#1A1B22]/95 backdrop-blur-xl border border-[#4A5060]/40 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {user ? <UserMenu /> : <LoginButton />}
        </div>
      </div>

      {/* Controles del mapa - esquina superior derecha */}
      <div className="absolute top-20 right-4 z-20 space-y-2">
        {/* Toggle 2D/3D */}
        <button
          onClick={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
          className="w-10 h-10 bg-[#D4B57A] text-[#0D0E14] font-bold rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all"
          title={viewMode === '2d' ? 'Ver en 3D' : 'Ver en 2D'}
        >
          {viewMode === '2d' ? '3D' : '2D'}
        </button>

        <button
          onClick={() => setShowEvents(!showEvents)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showEvents
            ? 'bg-[#1A1B22]/80 backdrop-blur-md border border-[#D4B57A]/50 text-[#D4B57A]'
            : 'bg-[#0D0E14]/80 backdrop-blur-md border border-[#4A5060]/30 text-[#E8E8F0]'
            }`}
          title={showEvents ? 'Ocultar panel' : 'Mostrar panel'}
        >
          📋
        </button>
        <button
          className="w-10 h-10 bg-[#0D0E14]/80 backdrop-blur-md border border-[#4A5060]/30 rounded-xl flex items-center justify-center text-[#E8E8F0] hover:border-[#7088A0] transition-colors"
          title="Mi ubicación"
        >
          📍
        </button>
      </div>

      {/* Filtros flotantes - esquina inferior izquierda */}
      <div className="absolute bottom-4 left-4 z-20 max-w-sm">
        <EventFiltersComponent
          filters={eventFilters}
          onFilterChange={setEventFilters}
        />
      </div>

      {/* Estadísticas flotantes - esquina inferior derecha (sobre el panel si está abierto) */}
      <div className={`absolute bottom-4 right-4 z-20 flex gap-2 transition-opacity duration-300 ${showEvents ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
        {[
          { icon: '🚨', count: events.filter(e => e.severity === 4).length, label: 'Crítico', color: '#E8E8F0' },
          { icon: '⚠️', count: events.filter(e => e.severity === 3).length, label: 'Alto', color: '#A07888' },
          { icon: '📊', count: events.filter(e => e.severity <= 2).length, label: 'Otros', color: '#7088A0' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#0D0E14]/80 backdrop-blur-md border border-[#4A5060]/30 rounded-xl px-3 py-2 text-center min-w-[60px] shadow-lg"
          >
            <div className="text-lg">{stat.icon}</div>
            <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.count}</div>
            <div className="text-[10px] text-[#8890A0] font-medium uppercase tracking-tighter">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Panel de eventos flotante - lado derecho */}
      <aside
        className={`absolute top-20 bottom-20 right-4 z-10 w-[calc(100vw-2rem)] md:w-80 transition-transform duration-300 ${showEvents ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'
          }`}
      >
        <div className="h-full bg-[#0D0E14]/95 backdrop-blur-xl border border-[#4A5060]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#4A5060]/30 flex items-center justify-between">
            <div>
              <h2 className="text-[#E8E8F0] font-semibold tracking-tight">Eventos Activos</h2>
              <p className="text-[#8890A0] text-xs">{events.length} monitoreados</p>
            </div>
            <button
              onClick={() => setShowEvents(false)}
              className="text-[#8890A0] hover:text-[#E8E8F0] p-2 hover:bg-[#4A5060]/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#1A1B22] rounded-lg h-20 animate-pulse" />
                ))}
              </div>
            ) : (
              <EventFeed
                events={events}
                selectedEvent={selectedEvent}
                onEventSelect={setSelectedEvent}
              />
            )}
          </div>
        </div>
      </aside>

      {/* Leyenda flotante - esquina inferior izquierda (arriba de filtros) */}
      <div className="absolute bottom-24 left-4 z-20">
        <div className="bg-[#0D0E14]/80 backdrop-blur-md border border-[#4A5060]/30 rounded-xl px-4 py-2 shadow-lg">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-[#8890A0] uppercase font-bold tracking-[0.1em]">Nivel de Severidad</span>
            <div className="flex items-center gap-3">
              {[
                { color: '#E8E8F0', label: 'Crítico' },
                { color: '#A07888', label: 'Alto' },
                { color: '#D4B57A', label: 'Medio' },
                { color: '#7088A0', label: 'Bajo' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 group cursor-help">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: s.color, color: s.color }} />
                  <span className="text-[10px] text-[#8890A0] group-hover:text-[#E8E8F0] transition-colors">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

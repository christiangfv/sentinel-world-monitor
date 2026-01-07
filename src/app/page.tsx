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

export default function HomePage() {
  const { user } = useAuth()
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null)
  const [eventFilters, setEventFilters] = useState<EventFilters>({
    disasterTypes: DISASTER_TYPES,
    minSeverity: 1
  })
  const [showEvents, setShowEvents] = useState(true)
  
  const { events, loading } = useEvents(eventFilters)

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Mapa de fondo - ocupa toda la pantalla */}
      <div className="absolute inset-0 z-0">
        <DisasterMap
          events={events}
          onEventClick={setSelectedEvent}
          showControls={false}
        />
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
        <button
          onClick={() => setShowEvents(!showEvents)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            showEvents 
              ? 'bg-[#D4B57A] text-[#0D0E14]' 
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
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        {[
          { icon: '🚨', count: events.filter(e => e.severity === 4).length, label: 'Críticos', color: '#E8E8F0' },
          { icon: '⚠️', count: events.filter(e => e.severity === 3).length, label: 'Altos', color: '#A07888' },
          { icon: '📊', count: events.filter(e => e.severity <= 2).length, label: 'Otros', color: '#7088A0' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#0D0E14]/80 backdrop-blur-md border border-[#4A5060]/30 rounded-xl px-3 py-2 text-center min-w-[60px]"
          >
            <div className="text-lg">{stat.icon}</div>
            <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.count}</div>
            <div className="text-[10px] text-[#8890A0]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Panel de eventos flotante - lado derecho */}
      <aside
        className={`absolute top-20 bottom-20 right-4 z-10 w-80 transition-transform duration-300 ${
          showEvents ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'
        }`}
      >
        <div className="h-full bg-[#0D0E14]/90 backdrop-blur-md border border-[#4A5060]/30 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#4A5060]/30 flex items-center justify-between">
            <div>
              <h2 className="text-[#E8E8F0] font-semibold">Eventos</h2>
              <p className="text-[#8890A0] text-xs">{events.length} activos</p>
            </div>
            <button
              onClick={() => setShowEvents(false)}
              className="text-[#8890A0] hover:text-[#E8E8F0] p-1"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#1A1B22] rounded-lg h-16 animate-pulse" />
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

      {/* Leyenda flotante - encima del header */}
      <div className="absolute bottom-4 left-[26rem] z-20 hidden lg:block">
        <div className="bg-[#0D0E14]/80 backdrop-blur-md border border-[#4A5060]/30 rounded-xl px-4 py-2">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[10px] text-[#8890A0] uppercase tracking-wider">Severidad</span>
            {[
              { color: '#E8E8F0', label: '4' },
              { color: '#A07888', label: '3' },
              { color: '#D4B57A', label: '2' },
              { color: '#7088A0', label: '1' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[#8890A0]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

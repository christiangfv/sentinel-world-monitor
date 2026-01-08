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
  const [showEvents, setShowEvents] = useState(true)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')

  // Auto-trigger insight card on selection
  useEffect(() => {
    if (selectedEvent) {
      setContextEvent(selectedEvent)
      setIsContextOpen(true)
    }
  }, [selectedEvent])

  const { events, loading } = useEvents(eventFilters)

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
          className="flex items-center gap-2.5 bg-[#1A1B22]/95 backdrop-blur-xl border border-[#D4B57A]/20 rounded-xl px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#D4B57A]/40 transition-all ring-1 ring-white/5"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/logo.svg"
              alt="Sentinel Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-black text-[#D4B57A] tracking-tighter text-lg uppercase">Sentinel</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <div className="bg-[#1A1B22]/95 backdrop-blur-xl border border-[#D4B57A]/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
          {user ? <UserMenu /> : <LoginButton />}
        </div>
      </div>

      {/* Controles del mapa - esquina superior derecha */}
      <div className="absolute top-20 right-4 z-20 space-y-2">
        <button
          onClick={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
          className="w-10 h-10 bg-[#D4B57A] text-[#0D0E14] font-black rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all"
        >
          {viewMode === '2d' ? '3D' : '2D'}
        </button>

        <button
          onClick={() => setShowEvents(!showEvents)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showEvents
            ? 'bg-[#D4B57A] text-[#0D0E14] shadow-[0_0_20px_rgba(212,181,122,0.3)]'
            : 'bg-[#1A1B22]/80 backdrop-blur-md border border-[#D4B57A]/20 text-[#E8E8F0]'
            }`}
        >
          📋
        </button>
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

      {/* Estadísticas flotantes */}
      <div className={`absolute bottom-6 right-6 z-40 flex gap-3 transition-all duration-500 ${showEvents ? 'translate-x-[-340px] opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto md:translate-x-[-340px]' : 'translate-x-0'}`}>
        {[
          { icon: '🚨', count: events.filter(e => e.severity === 4).length, label: 'Crítico', color: '#E8E8F0' },
          { icon: '⚠️', count: events.filter(e => e.severity === 3).length, label: 'Alto', color: '#A07888' },
          { icon: '📊', count: events.filter(e => e.severity <= 2).length, label: 'Otros', color: '#7088A0' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#1A1B22]/90 backdrop-blur-xl border border-[#D4B57A]/10 rounded-2xl px-4 py-3 text-center min-w-[75px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/5 ring-inset hover:border-[#D4B57A]/30 transition-all group"
          >
            <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="text-lg font-black tracking-tight" style={{ color: stat.color }}>{stat.count}</div>
            <div className="text-[9px] text-[#D4B57A]/60 font-black uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Panel de eventos flotante - lado derecho */}
      <aside
        className={`absolute top-20 bottom-24 right-6 z-30 w-[calc(100vw-3rem)] md:w-80 transition-transform duration-500 ${showEvents ? 'translate-x-0' : 'translate-x-[calc(100%+3rem)]'
          }`}
      >
        <div className="h-full bg-[#1A1B22]/95 backdrop-blur-2xl border border-[#D4B57A]/10 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col ring-1 ring-white/5">
          <div className="p-5 border-b border-[#D4B57A]/10 flex items-center justify-between">
            <div>
              <h2 className="text-[#E8E8F0] font-black tracking-tight uppercase text-xs opacity-90">Protocolos Activos</h2>
              <p className="text-[#D4B57A] text-[10px] font-black uppercase tracking-widest mt-1 animate-pulse">{events.length} Nodos detectados</p>
            </div>
            <button
              onClick={() => setShowEvents(false)}
              className="text-[#8890A0] hover:text-[#E8E8F0] p-2 hover:bg-[#4A5060]/20 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                onEventSelect={setSelectedEvent}
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

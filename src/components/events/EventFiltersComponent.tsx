'use client'

import { useState } from 'react'
import type { EventFilters } from '@/lib/types'
import { DisasterType } from '@/lib/types'
import { DISASTER_TYPES, DISASTER_CONFIGS } from '@/lib/constants/disasters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface EventFiltersComponentProps {
  filters: EventFilters
  onFilterChange: (filters: EventFilters) => void
}

const severities = [
  { value: 1, label: 'Bajo', color: '#7088A0', icon: '○' },
  { value: 2, label: 'Medio', color: '#D4B57A', icon: '◐' },
  { value: 3, label: 'Alto', color: '#A07888', icon: '◕' },
  { value: 4, label: 'Crítico', color: '#E8E8F0', icon: '●' },
]

export function EventFiltersComponent({ filters, onFilterChange }: EventFiltersComponentProps) {
  const [open, setOpen] = useState(false)

  const toggleType = (type: DisasterType) => {
    const current = filters.disasterTypes || DISASTER_TYPES
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    onFilterChange({ ...filters, disasterTypes: updated.length ? updated : DISASTER_TYPES })
  }

  const setSeverity = (s: 1 | 2 | 3 | 4) => {
    onFilterChange({ ...filters, minSeverity: s })
  }

  const activeCount = (filters.disasterTypes || DISASTER_TYPES).length

  // Helper for time ranges
  const timeRanges = [
    { label: '24h', days: 1 },
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
  ]

  const setTimeRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    onFilterChange({
      ...filters,
      dateRange: { start, end }
    })
  }

  // Determine active range label
  const getCurrentRangeLabel = () => {
    if (!filters.dateRange) return '24h' // Default
    const diffTime = Math.abs(filters.dateRange.end.getTime() - filters.dateRange.start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays}d`
  }

  return (
    <div className="bg-[#1A1B22]/85 backdrop-blur-xl border border-[#D4B57A]/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/5 ring-inset">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-sm hover:bg-[#D4B57A]/5 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#D4B57A]/10 flex items-center justify-center border border-[#D4B57A]/20">
            <svg className="w-5 h-5 text-[#D4B57A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[#E8E8F0] font-black uppercase tracking-widest text-[11px] opacity-90">Filtros Avanzados</span>
            <span className="text-[10px] text-[#D4B57A] font-black tracking-widest uppercase mt-0.5">
              Rango: {getCurrentRangeLabel()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4B57A]/10 border border-[#D4B57A]/20 text-[#D4B57A] text-[10px] font-black uppercase tracking-widest">
            <span>{activeCount}</span>
            <span className="opacity-40">/</span>
            <span>{DISASTER_TYPES.length}</span>
          </div>
        </div>
        <div className={`p-1.5 rounded-lg bg-[#4A5060]/10 text-[#8890A0] transition-all duration-500 ${open ? 'rotate-180 bg-[#D4B57A]/20 text-[#D4B57A]' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`transition-all duration-500 ease-in-out ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-2 space-y-6 border-t border-[#D4B57A]/10 custom-scrollbar overflow-y-auto max-h-[450px]">

          {/* Rango de tiempo */}
          <div>
            <label className="text-[10px] text-[#D4B57A] mb-4 block uppercase font-black tracking-[0.2em] opacity-80">
              Ventana de Tiempo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeRanges.map(range => {
                const isActive = getCurrentRangeLabel() === range.label || (getCurrentRangeLabel() === '1d' && range.label === '24h');
                return (
                  <button
                    key={range.label}
                    onClick={() => setTimeRange(range.days)}
                    className={`
                        px-3 py-3 text-[10px] rounded-xl font-black uppercase tracking-widest transition-all
                        ${isActive
                        ? 'bg-[#D4B57A] text-[#0D0E14] shadow-[0_4px_12px_rgba(212,181,122,0.3)] scale-105'
                        : 'bg-[#1A1B22] text-[#8890A0] border border-[#4A5060]/20 hover:border-[#D4B57A]/40 hover:text-[#E8E8F0]'
                      }
                        `}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Severidad */}
          <div>
            <label className="text-[10px] text-[#D4B57A] mb-4 block uppercase font-black tracking-[0.2em] opacity-80">
              Intensidad Mínima
            </label>
            <div className="grid grid-cols-4 gap-2">
              {severities.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value as 1 | 2 | 3 | 4)}
                  className={`
                    px-2 py-3 rounded-xl flex flex-col items-center gap-2
                    transition-all duration-300 border-2
                    ${filters.minSeverity === s.value
                      ? 'bg-[#1A1B22] shadow-[0_10px_25px_rgba(0,0,0,0.5)] scale-110'
                      : 'bg-[#1A1B22]/30 border-transparent hover:bg-[#1A1B22]/60'
                    }
                  `}
                  style={{
                    borderColor: filters.minSeverity === s.value ? s.color : 'transparent',
                  }}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${filters.minSeverity === s.value ? 'scale-125 shadow-[0_0_10px_currentColor]' : 'opacity-40'}`}
                    style={{ background: s.color, color: s.color }}
                  />
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${filters.minSeverity === s.value ? 'text-[#E8E8F0]' : 'text-[#8890A0]'}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipos */}
          <div>
            <label className="text-[10px] text-[#D4B57A] mb-4 block uppercase font-black tracking-[0.2em] opacity-80">
              Vectores de Datos
            </label>
            <div className="flex flex-wrap gap-2">
              {DISASTER_TYPES.map(type => {
                const active = (filters.disasterTypes || DISASTER_TYPES).includes(type)
                const cfg = DISASTER_CONFIGS[type]
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`
                      px-4 py-2.5 text-[10px] rounded-xl flex items-center gap-3
                      transition-all duration-300 font-black uppercase tracking-widest
                      ${active
                        ? 'bg-[#D4B57A]/10 text-[#E8E8F0] border border-[#D4B57A]/40 shadow-[0_4px_12px_rgba(212,181,122,0.1)]'
                        : 'bg-[#1A1B22]/50 text-[#8890A0] border border-transparent hover:border-[#D4B57A]/20'
                      }
                    `}
                  >
                    <span className={`text-base transition-transform ${active ? 'scale-110' : 'grayscale opacity-50'}`}>{cfg.icon}</span>
                    <span className={active ? 'text-[#E8E8F0]' : 'text-[#8890A0]'}>{cfg.nameEs}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

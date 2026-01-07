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

  return (
    <div className="glass-strong rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-[#4A5060]/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4B57A]/20 to-transparent flex items-center justify-center">
            <svg className="w-4 h-4 text-[#D4B57A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <span className="text-[#E8E8F0] font-medium">Filtros</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D4B57A]/10 text-[#D4B57A] text-xs font-medium">
            <span>{activeCount}</span>
            <span className="text-[#8890A0]">/</span>
            <span className="text-[#8890A0]">{DISASTER_TYPES.length}</span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-[#8890A0] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-2 space-y-5 border-t border-[#4A5060]/30">
          {/* Severidad */}
          <div>
            <label className="text-xs text-[#8890A0] mb-3 block uppercase tracking-wider font-medium">
              Severidad mínima
            </label>
            <div className="flex gap-2">
              {severities.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value as 1 | 2 | 3 | 4)}
                  className={`
                    flex-1 px-3 py-2.5 text-xs rounded-lg flex flex-col items-center gap-1.5
                    transition-all duration-200 ease-out
                    ${filters.minSeverity === s.value
                      ? 'bg-[#1A1B22] border-2 shadow-[0_0_12px_rgba(0,0,0,0.3)] scale-105'
                      : 'bg-[#1A1B22]/50 border-2 border-transparent hover:bg-[#1A1B22] hover:scale-102'
                    }
                  `}
                  style={{
                    borderColor: filters.minSeverity === s.value ? s.color : 'transparent',
                    boxShadow: filters.minSeverity === s.value ? `0 0 16px ${s.color}20` : undefined
                  }}
                >
                  <span
                    className={`w-3 h-3 rounded-full transition-transform ${filters.minSeverity === s.value ? 'scale-125' : ''}`}
                    style={{ background: s.color }}
                  />
                  <span className={filters.minSeverity === s.value ? 'text-[#E8E8F0] font-medium' : 'text-[#8890A0]'}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipos */}
          <div>
            <label className="text-xs text-[#8890A0] mb-3 block uppercase tracking-wider font-medium">
              Tipos de evento
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
                      px-3 py-2 text-xs rounded-lg flex items-center gap-2
                      transition-all duration-200 ease-out
                      ${active
                        ? 'bg-[#7088A0]/20 text-[#E8E8F0] border border-[#7088A0]/40 shadow-[0_2px_8px_rgba(112,136,160,0.15)]'
                        : 'bg-[#1A1B22]/50 text-[#8890A0] border border-transparent hover:bg-[#1A1B22] hover:text-[#E8E8F0]'
                      }
                    `}
                  >
                    <span className={`text-base transition-transform ${active ? 'scale-110' : ''}`}>{cfg.icon}</span>
                    <span className="font-medium">{cfg.nameEs}</span>
                    {active && (
                      <svg className="w-3 h-3 text-[#7088A0]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
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

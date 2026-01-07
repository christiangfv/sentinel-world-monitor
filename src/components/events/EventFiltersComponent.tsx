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
  { value: 1, label: 'Bajo', color: '#4ADE80' },
  { value: 2, label: 'Medio', color: '#FBBF24' },
  { value: 3, label: 'Alto', color: '#D4B57A' },
  { value: 4, label: 'Crítico', color: '#F87171' },
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
    <div className="bg-[#0D0E14]/95 backdrop-blur-sm border border-[#4A5060]/30 rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#D4B57A]">⚙️</span>
          <span className="text-[#E8E8F0]">Filtros</span>
          <Badge variant="secondary">{activeCount}/{DISASTER_TYPES.length}</Badge>
        </div>
        <svg
          className={`w-4 h-4 text-[#8890A0] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-4 pt-0 space-y-4 border-t border-[#4A5060]/30">
          {/* Severidad */}
          <div>
            <label className="text-xs text-[#8890A0] mb-2 block">Severidad mínima</label>
            <div className="flex gap-1">
              {severities.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value as 1 | 2 | 3 | 4)}
                  className={`px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-colors ${
                    filters.minSeverity === s.value
                      ? 'bg-[#D4B57A]/20 text-[#D4B57A] border border-[#D4B57A]/30'
                      : 'bg-[#1A1B22] text-[#8890A0] border border-transparent hover:border-[#4A5060]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipos */}
          <div>
            <label className="text-xs text-[#8890A0] mb-2 block">Tipos de evento</label>
            <div className="flex flex-wrap gap-1">
              {DISASTER_TYPES.map(type => {
                const active = (filters.disasterTypes || DISASTER_TYPES).includes(type)
                const cfg = DISASTER_CONFIGS[type]
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
                      active
                        ? 'bg-[#7088A0]/20 text-[#7088A0] border border-[#7088A0]/30'
                        : 'bg-[#1A1B22] text-[#8890A0] border border-transparent hover:border-[#4A5060]'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    {cfg.nameEs}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

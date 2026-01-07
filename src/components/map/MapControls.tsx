'use client'

import { useState } from 'react'

interface MapControlsProps {
  onMyLocation?: () => void
  onToggleZones?: () => void
  showZones?: boolean
  onFilterChange?: (filters: Record<string, unknown>) => void
}

export function MapControls({
  onMyLocation,
  onToggleZones,
  showZones = true,
  onFilterChange,
}: MapControlsProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => onMyLocation?.(),
        (error) => console.error('Error getting location:', error)
      )
    }
  }

  const buttonClass = "w-9 h-9 bg-[#1A1B22] border border-[#4A5060]/50 rounded-lg flex items-center justify-center text-sm hover:bg-[#4A5060]/30 hover:border-[#7088A0] transition-colors"

  return (
    <div className="absolute top-3 right-3 z-[1000] space-y-2">
      <button onClick={handleMyLocation} className={buttonClass} title="Mi ubicación">
        📍
      </button>

      {onToggleZones && (
        <button
          onClick={onToggleZones}
          className={`${buttonClass} ${showZones ? 'bg-[#D4B57A]/20 border-[#D4B57A]/50 text-[#D4B57A]' : ''}`}
          title={showZones ? "Ocultar zonas" : "Mostrar zonas"}
        >
          🏠
        </button>
      )}

      <button
        onClick={() => setShowFilters(!showFilters)}
        className={buttonClass}
        title="Leyenda"
      >
        ℹ️
      </button>

      {showFilters && (
        <div className="bg-[#1A1B22] border border-[#4A5060]/50 rounded-lg p-3 shadow-xl min-w-[140px]">
          <h4 className="font-medium text-xs text-[#E8E8F0] mb-2">Severidad</h4>
          <div className="space-y-1.5 text-xs text-[#8890A0]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
              <span>Crítica</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4B57A]" />
              <span>Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
              <span>Media</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
              <span>Baja</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

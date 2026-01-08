'use client'

import Link from 'next/link'
import { DisasterEvent } from '@/lib/types'
import { DISASTER_CONFIGS } from '@/lib/constants/disasters'
import { getSeverityColor, getSeverityLabel } from '@/lib/utils/severity'
import { formatTimeAgo, formatEventDate } from '@/lib/utils/date'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DisasterIconMap } from '@/components/icons/DisasterIcons'

interface EventCardProps {
  event: DisasterEvent
  compact?: boolean
  showMapLink?: boolean
  onClick?: () => void
  onShowContext?: (event: DisasterEvent) => void
  className?: string
}

const severityVariant = (s: number): 'success' | 'warning' | 'plasma' | 'danger' => {
  const map: Record<number, 'success' | 'warning' | 'plasma' | 'danger'> = { 1: 'success', 2: 'warning', 3: 'plasma', 4: 'danger' }
  return map[s] || 'secondary'
}

const getSeverityClass = (severity: number): string => {
  const classes: Record<number, string> = {
    1: 'severity-low',
    2: 'severity-medium',
    3: 'severity-high',
    4: 'severity-critical'
  }
  return classes[severity] || ''
}

export function EventCard({
  event,
  compact = false,
  showMapLink = true,
  onClick,
  onShowContext,
  className = ''
}: EventCardProps) {
  const config = DISASTER_CONFIGS[event.disasterType]
  const severityColor = getSeverityColor(event.severity)
  const severityLabel = getSeverityLabel(event.disasterType, event.severity)
  const isCritical = event.severity === 4

  const IconComponent = DisasterIconMap[event.disasterType]

  if (compact) {
    return (
      <Card
        className={`
          cursor-pointer border-l-4 relative
          transition-all duration-200 ease-out
          hover:bg-[#1A1B22] hover:translate-x-0.5
          ${className}
        `}
        onClick={onClick}
        style={{ borderLeftColor: severityColor }}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className={`
              shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
              bg-plasma/10 border border-plasma/20
              ${isCritical ? 'animate-pulse-dot shadow-glow-sm' : ''}
            `}>
              <IconComponent size={18} className="text-plasma" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-foreground tracking-tight leading-tight line-clamp-1 flex-1">
                  {event.title}
                </h3>
                <Badge variant={severityVariant(event.severity)} className="shrink-0 h-4 px-1.5 text-[9px] font-black tracking-widest uppercase">
                  S{event.severity}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mb-2 font-medium flex items-center gap-1">
                <span className="opacity-50">📍</span> {event.locationName}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-muted-foreground/70 font-bold uppercase tracking-widest">{formatTimeAgo(event.eventTime)}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-border" />
                  <span className="text-plasma font-bold uppercase tracking-widest">{config.nameEs}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowContext?.(event);
                  }}
                  className="p-1 bg-plasma/10 hover:bg-plasma/20 rounded-md transition-all active:scale-95"
                  title="Noticias y más info"
                >
                  <span className="text-[10px]">📰</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Link href={`/event?id=${event.id}`} onClick={onClick}>
      <Card
        className={`
          cursor-pointer border-l-4
          transition-all duration-300 ease-out
          hover:translate-y-[-2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]
          ${isCritical ? 'animate-pulse-glow' : ''}
          ${getSeverityClass(event.severity)}
          ${className}
        `}
        style={{ borderLeftColor: severityColor }}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                bg-gradient-to-br from-[#D4B57A]/20 to-transparent border border-[#D4B57A]/10
                ${isCritical ? 'animate-pulse-dot shadow-[0_0_20px_rgba(212,181,122,0.2)]' : ''}
              `}>
                <IconComponent size={32} className="text-[#D4B57A]" />
              </div>
              <div>
                <h3 className="font-bold text-[#E8E8F0] text-lg tracking-tight leading-tight">{event.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4B57A]">{config.nameEs}</span>
                  <span className="w-1 h-1 rounded-full bg-[#4A5060]/40" />
                  <span className="text-xs text-[#8890A0] font-medium">{formatTimeAgo(event.eventTime)}</span>
                </div>
              </div>
            </div>
            <Badge variant={severityVariant(event.severity)} className={`h-7 px-3 text-[10px] font-black tracking-widest uppercase ${isCritical ? 'shadow-[0_0_15px_rgba(248,113,113,0.3)]' : ''}`}>
              {severityLabel}
            </Badge>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-[#E8E8F0]">
              <div className="w-6 h-6 rounded-lg bg-[#D4B57A]/5 flex items-center justify-center text-[#D4B57A] border border-[#D4B57A]/10">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">{event.locationName}</span>
            </div>
            <div className="flex items-center gap-3 text-[#8890A0]">
              <div className="w-6 h-6 rounded-lg bg-[#4A5060]/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs">{formatEventDate(event.eventTime)}</span>
            </div>
            {event.magnitude && (
              <div className="flex items-center gap-3 text-[#D4B57A]">
                <div className="w-6 h-6 rounded-lg bg-[#D4B57A]/10 flex items-center justify-center border border-[#D4B57A]/20">
                  <span className="text-[10px] font-black">M</span>
                </div>
                <span className="text-sm font-bold tracking-tight">Magnitud: <span className="text-[#E8E8F0] text-base">{event.magnitude.toFixed(1)}</span></span>
              </div>
            )}
          </div>

          {showMapLink && (
            <div className="pt-5 border-t border-[#4A5060]/20 flex items-center justify-between gap-4">
              <button className="flex-1 px-4 py-2.5 bg-[#D4B57A] text-[#0D0E14] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E8C585] transition-all active:scale-[0.98] shadow-[0_4px_15px_rgba(212,181,122,0.2)]">
                Ver Detalles
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onShowContext?.(event);
                }}
                className="px-4 py-2.5 bg-[#1A1B22] border border-[#D4B57A]/30 text-[#D4B57A] rounded-xl text-xs font-bold hover:bg-[#D4B57A]/10 transition-all flex items-center gap-2"
              >
                📰 Noticias
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

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
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 ${isCritical ? 'animate-pulse-dot' : ''}`}>
              <IconComponent size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-medium text-sm text-[#E8E8F0] truncate flex-1">{event.title}</h3>
                <Badge variant={severityVariant(event.severity)} className="shrink-0">
                  {event.severity}
                </Badge>
              </div>
              <p className="text-xs text-[#8890A0] truncate">{event.locationName}</p>
              <div className="flex items-center justify-between text-xs text-[#8890A0] mt-1">
                <span>{formatTimeAgo(event.eventTime)}</span>
                <span className="px-1.5 py-0.5 bg-[#4A5060]/20 rounded text-[10px] uppercase tracking-wide">
                  {config.nameEs}
                </span>
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
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                bg-gradient-to-br from-[#4A5060]/20 to-transparent
                ${isCritical ? 'animate-pulse-dot' : ''}
              `}>
                <IconComponent size={40} />
              </div>
              <div>
                <h3 className="font-semibold text-[#E8E8F0] leading-tight">{event.title}</h3>
                <p className="text-sm text-[#8890A0] mt-0.5">{config.nameEs}</p>
              </div>
            </div>
            <Badge variant={severityVariant(event.severity)} className={isCritical ? 'shadow-[0_0_12px_rgba(248,113,113,0.3)]' : ''}>
              {severityLabel}
            </Badge>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 text-[#8890A0]">
              <div className="w-5 h-5 rounded bg-[#4A5060]/20 flex items-center justify-center text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{event.locationName}</span>
            </div>
            <div className="flex items-center gap-3 text-[#8890A0]">
              <div className="w-5 h-5 rounded bg-[#4A5060]/20 flex items-center justify-center text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{formatEventDate(event.eventTime)}</span>
            </div>
            {event.magnitude && (
              <div className="flex items-center gap-3 text-[#8890A0]">
                <div className="w-5 h-5 rounded bg-[#4A5060]/20 flex items-center justify-center text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <span>Magnitud: <strong className="text-[#E8E8F0]">{event.magnitude.toFixed(1)}</strong></span>
              </div>
            )}
            {event.description && (
              <p className="text-[#8890A0] line-clamp-2 mt-3 pl-8 border-l-2 border-[#4A5060]/30 italic">
                {event.description}
              </p>
            )}
          </div>

          {showMapLink && (
            <div className="mt-4 pt-3 border-t border-[#4A5060]/30 flex items-center justify-between">
              <span className="text-xs text-[#8890A0] flex items-center gap-2 group-hover:text-[#D4B57A] transition-colors">
                <span>Ver detalles</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="w-6 h-6 rounded bg-[#D4B57A]/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#D4B57A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

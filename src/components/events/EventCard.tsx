'use client'

import Link from 'next/link'
import { DisasterEvent } from '@/lib/types'
import { DISASTER_CONFIGS } from '@/lib/constants/disasters'
import { getSeverityColor, getSeverityLabel } from '@/lib/utils/severity'
import { formatTimeAgo, formatEventDate } from '@/lib/utils/date'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

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

  if (compact) {
    return (
      <Card 
        className={`cursor-pointer border-l-4 hover:bg-[#1A1B22]/70 transition-colors ${className}`} 
        onClick={onClick} 
        style={{ borderLeftColor: severityColor }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-xl shrink-0">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm text-[#E8E8F0] truncate">{event.title}</h3>
                <Badge variant={severityVariant(event.severity)}>{event.severity}</Badge>
              </div>
              <p className="text-xs text-[#8890A0] truncate">{event.locationName}</p>
              <div className="flex items-center justify-between text-xs text-[#8890A0] mt-1">
                <span>{formatTimeAgo(event.eventTime)}</span>
                <span>{config.nameEs}</span>
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
        className={`cursor-pointer border-l-4 hover:bg-[#1A1B22]/70 transition-colors ${className}`}
        style={{ borderLeftColor: severityColor }}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{config.icon}</div>
              <div>
                <h3 className="font-medium text-[#E8E8F0]">{event.title}</h3>
                <p className="text-sm text-[#8890A0]">{config.nameEs}</p>
              </div>
            </div>
            <Badge variant={severityVariant(event.severity)}>{severityLabel}</Badge>
          </div>

          <div className="space-y-2 text-sm text-[#8890A0]">
            <div className="flex items-center gap-2">
              <span className="text-xs">📍</span>
              <span>{event.locationName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">🕐</span>
              <span>{formatEventDate(event.eventTime)}</span>
            </div>
            {event.magnitude && (
              <div className="flex items-center gap-2">
                <span className="text-xs">📊</span>
                <span>Magnitud: {event.magnitude.toFixed(1)}</span>
              </div>
            )}
            {event.description && (
              <p className="text-[#8890A0] line-clamp-2 mt-2">{event.description}</p>
            )}
          </div>

          {showMapLink && (
            <div className="mt-4 pt-3 border-t border-[#4A5060]/30 flex items-center justify-between text-xs text-[#8890A0]">
              <span>Ver detalles</span>
              <span>🗺️</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

'use client'

import { DisasterEvent } from '@/lib/types'
import { EventCard } from './EventCard'

interface EventFeedProps {
  events: DisasterEvent[]
  selectedEvent?: DisasterEvent | null
  onEventSelect?: (event: DisasterEvent) => void
}

export function EventFeed({ events, selectedEvent, onEventSelect }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-3xl mb-3">🔍</div>
        <p className="text-[#8890A0] text-sm">Sin eventos</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          compact
          showMapLink={false}
          onClick={() => onEventSelect?.(event)}
          className={selectedEvent?.id === event.id ? 'ring-2 ring-[#D4B57A]/50 bg-[#D4B57A]/5' : ''}
        />
      ))}
    </div>
  )
}

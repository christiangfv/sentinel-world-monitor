'use client';

import { useEffect, useRef } from 'react'
import { DisasterEvent } from '@/lib/types'
import { EventCard } from './EventCard'

interface EventFeedProps {
  events: DisasterEvent[]
  selectedEvent?: DisasterEvent | null
  onEventSelect?: (event: DisasterEvent) => void
  onShowContext?: (event: DisasterEvent) => void
}

export function EventFeed({ events, selectedEvent, onEventSelect, onShowContext }: EventFeedProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logic
  useEffect(() => {
    if (selectedEvent && scrollContainerRef.current) {
      const element = document.getElementById(`event-card-${selectedEvent.id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [selectedEvent])

  if (events.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-3xl mb-3">🔍</div>
        <p className="text-[#8890A0] text-sm">Sin eventos</p>
      </div>
    )
  }

  return (
    <div ref={scrollContainerRef} className="p-4 space-y-3">
      {events.map((event) => (
        <div id={`event-card-${event.id}`} key={event.id}>
          <EventCard
            event={event}
            compact
            showMapLink={false}
            onClick={() => onEventSelect?.(event)}
            onShowContext={onShowContext}
            className={selectedEvent?.id === event.id ? 'ring-2 ring-[#D4B57A]/50 bg-[#D4B57A]/5 shadow-[0_0_15px_rgba(212,181,122,0.1)]' : ''}
          />
        </div>
      ))}
    </div>
  )
}

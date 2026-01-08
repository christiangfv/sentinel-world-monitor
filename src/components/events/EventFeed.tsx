'use client';

import { useEffect, useRef } from 'react'
import { DisasterEvent } from '@/lib/types'
import { EventCard } from './EventCard'

interface EventFeedProps {
  events: DisasterEvent[]
  selectedEvent?: DisasterEvent | null
  newEventIds?: Set<string>
  onEventSelect?: (event: DisasterEvent) => void
  onShowContext?: (event: DisasterEvent) => void
  onMarkEventAsSeen?: (eventId: string) => void
}

export function EventFeed({ events, selectedEvent, newEventIds, onEventSelect, onShowContext, onMarkEventAsSeen }: EventFeedProps) {
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

  const handleEventClick = (event: DisasterEvent) => {
    onEventSelect?.(event);
    onMarkEventAsSeen?.(event.id);
  };

  return (
    <div ref={scrollContainerRef} className="p-4 space-y-2">
      {events.map((event) => {
        const isNew = newEventIds?.has(event.id);
        const isSelected = selectedEvent?.id === event.id;

        let cardClass = '';
        if (isSelected) {
          cardClass = 'ring-2 ring-plasma/50 bg-plasma/5 shadow-glow-sm';
        } else if (isNew) {
          cardClass = 'ring-2 ring-success/50 bg-success/5 shadow-[0_0_10px_rgba(34,197,94,0.2)] animate-pulse';
        }

        return (
          <div id={`event-card-${event.id}`} key={event.id}>
            <EventCard
              event={event}
              compact
              showMapLink={false}
              onClick={() => handleEventClick(event)}
              onShowContext={onShowContext}
              className={cardClass}
            />
          </div>
        );
      })}
    </div>
  )
}

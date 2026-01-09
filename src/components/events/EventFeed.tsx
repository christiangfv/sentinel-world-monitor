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
      <div className="p-8 text-center animate-fade-in">
        <div className="icon-container-mist w-16 h-16 mx-auto mb-4">
          <svg className="w-8 h-8 text-mist" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-smoke text-sm font-medium">Sin eventos detectados</p>
        <p className="text-smoke/60 text-xs mt-1">Los eventos aparecerán aquí</p>
      </div>
    )
  }

  const handleEventClick = (event: DisasterEvent) => {
    onEventSelect?.(event);
    onMarkEventAsSeen?.(event.id);
  };

  return (
    <div ref={scrollContainerRef} className="p-3 space-y-2">
      {events.map((event, index) => {
        const isNew = newEventIds?.has(event.id);
        const isSelected = selectedEvent?.id === event.id;

        let cardClass = 'animate-fade-in-up';
        if (isSelected) {
          cardClass += ' ring-2 ring-plasma/50 bg-plasma/5 shadow-glow-sm';
        } else if (isNew) {
          cardClass += ' ring-2 ring-green-500/50 bg-green-500/5 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
        }

        return (
          <div
            id={`event-card-${event.id}`}
            key={event.id}
            style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
          >
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

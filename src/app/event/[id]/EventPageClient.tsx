'use client';

import { EventDetail } from "@/components/events/EventDetail";
import { useEvent } from "@/lib/hooks/useEvents";

interface EventPageClientProps {
  eventId: string;
}

export function EventPageClient({ eventId }: EventPageClientProps) {
  const { event, loading, error } = useEvent(eventId);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Evento de desastre',
        text: `Mira este evento: ${event?.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      // Mostrar toast de éxito
    }
  };

  const handleReportIssue = () => {
    // Abrir modal o navegar a página de reporte
    console.log('Reportar problema con evento:', eventId);
  };

  return (
    <EventDetail
      event={event}
      loading={loading}
      error={error}
      onShare={handleShare}
      onReportIssue={handleReportIssue}
    />
  );
}

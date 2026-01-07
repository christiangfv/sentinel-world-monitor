import { Header } from "@/components/layout/Header";
import { EventDetail } from "@/components/events/EventDetail";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { EventPageClient } from "./EventPageClient";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Inicio
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Eventos
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Detalle del Evento</span>
        </nav>

        {/* Botón volver */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              ← Volver al mapa
            </Link>
          </Button>
        </div>

        {/* Detalle del evento */}
        <EventPageClient eventId={params.id} />
      </main>
    </div>
  );
}

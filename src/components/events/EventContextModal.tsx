import { useState, useEffect } from 'react';
import { DisasterEvent } from '@/lib/types';
import { DISASTER_CONFIGS } from '@/lib/constants/disasters';
import { getSeverityColor, getSeverityLabel } from '@/lib/utils/severity';
import { DisasterIconMap } from '@/components/icons/DisasterIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface EventContextModalProps {
    event: DisasterEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EventContextModal({ event, isOpen, onClose }: EventContextModalProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        if (isOpen && event) {
            setIsAnalyzing(true);
            const timer = setTimeout(() => {
                setIsAnalyzing(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, event?.id]);

    if (!event) return null;

    const config = DISASTER_CONFIGS[event.disasterType];
    const Icon = DisasterIconMap[event.disasterType];
    const severityColor = getSeverityColor(event.severity);
    const severityLabel = getSeverityLabel(event.disasterType, event.severity);

    // URLs de búsqueda
    const searchQuery = encodeURIComponent(`${config.nameEs} ${event.locationName} ${new Date(event.eventTime).getFullYear()}`);
    const googleNewsUrl = `https://www.google.com/search?q=${searchQuery}&tbm=nws`;
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(event.locationName)}/@${event.location.lat},${event.location.lng},10z`;
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;

    // Formatear fecha
    const eventDate = new Date(event.eventTime);
    const formattedDate = eventDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] pointer-events-none flex items-end justify-center sm:items-end sm:justify-start p-4 sm:p-6 sm:pb-36">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="pointer-events-auto glass-card w-full max-w-sm shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        {/* Status bar */}
                        <div className="h-1 bg-[#4A5060]/20 w-full overflow-hidden">
                            <motion.div
                                className="h-full"
                                style={{ backgroundColor: severityColor }}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: isAnalyzing ? 1.5 : 0.3 }}
                            />
                        </div>

                        <div className="p-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-3">
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isAnalyzing ? 'animate-pulse' : ''}`}
                                        style={{
                                            backgroundColor: `${severityColor}15`,
                                            borderColor: `${severityColor}30`
                                        }}
                                    >
                                        <Icon size={26} style={{ color: severityColor }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-foreground font-bold text-base leading-tight line-clamp-2">{event.title}</h2>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: `${severityColor}20`,
                                                    color: severityColor
                                                }}
                                            >
                                                {severityLabel}
                                            </span>
                                            <span className="text-[10px] text-smoke font-medium">{config.nameEs}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-shadow/50 rounded-xl text-smoke hover:text-foreground transition-colors flex-shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {isAnalyzing ? (
                                    <motion.div
                                        key="analyzing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8 flex flex-col items-center justify-center gap-4"
                                    >
                                        <div className="relative w-12 h-12">
                                            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
                                                <circle className="text-shadow stroke-current" strokeWidth="6" fill="transparent" r="42" cx="50" cy="50" />
                                                <circle
                                                    className="stroke-current"
                                                    style={{ color: severityColor }}
                                                    strokeWidth="6"
                                                    strokeDasharray="264"
                                                    strokeDashoffset="200"
                                                    strokeLinecap="round"
                                                    fill="transparent"
                                                    r="42"
                                                    cx="50"
                                                    cy="50"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-smoke text-xs font-medium">Analizando evento...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        {/* Ubicación */}
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <svg className="w-4 h-4 text-smoke flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="line-clamp-1">{event.locationName}</span>
                                        </div>

                                        {/* Datos del evento */}
                                        <div className="glass-subtle rounded-xl p-4 space-y-3">
                                            {/* Magnitud y Profundidad */}
                                            {(event.magnitude || event.depth) && (
                                                <div className="flex items-center gap-4">
                                                    {event.magnitude && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-smoke text-xs">Magnitud</span>
                                                            <span
                                                                className="text-lg font-bold"
                                                                style={{ color: severityColor }}
                                                            >
                                                                {event.magnitude.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {event.depth && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-smoke text-xs">Profundidad</span>
                                                            <span className="text-muted font-semibold">{event.depth} km</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Descripción */}
                                            {event.description && (
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    {event.description}
                                                </p>
                                            )}

                                            {/* Fecha y Fuente */}
                                            <div className="flex items-center justify-between text-xs text-smoke pt-2 border-t border-border">
                                                <span>{formattedDate}</span>
                                                <span className="uppercase font-medium">{event.source}</span>
                                            </div>
                                        </div>

                                        {/* Coordenadas */}
                                        <div className="flex items-center gap-2 text-xs text-smoke">
                                            <span>📍</span>
                                            <span>{event.location.lat.toFixed(4)}°, {event.location.lng.toFixed(4)}°</span>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="space-y-2 pt-2">
                                            <a
                                                href={googleNewsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 p-3 bg-plasma/10 hover:bg-plasma/20 text-plasma border border-plasma/20 rounded-xl text-sm font-semibold transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Buscar noticias en Google
                                            </a>

                                            <div className="grid grid-cols-2 gap-2">
                                                <a
                                                    href={googleMapsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 p-2.5 glass-subtle hover:border-plasma/20 rounded-xl text-xs font-medium text-muted hover:text-foreground transition-all"
                                                >
                                                    <span>📍</span>
                                                    Ver en Maps
                                                </a>
                                                <a
                                                    href={googleSearchUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 p-2.5 glass-subtle hover:border-plasma/20 rounded-xl text-xs font-medium text-muted hover:text-foreground transition-all"
                                                >
                                                    <span>🔍</span>
                                                    Más info
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

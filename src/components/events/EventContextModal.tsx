'use client';

import { DisasterEvent } from '@/lib/types';
import { DISASTER_CONFIGS } from '@/lib/constants/disasters';
import { getSeverityColor } from '@/lib/utils/severity';
import { DisasterIconMap } from '@/components/icons/DisasterIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface EventContextModalProps {
    event: DisasterEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EventContextModal({ event, isOpen, onClose }: EventContextModalProps) {
    if (!event) return null;

    const config = DISASTER_CONFIGS[event.disasterType];
    const Icon = DisasterIconMap[event.disasterType];
    const severityColor = getSeverityColor(event.severity);

    // Google Search queries
    const searchQuery = encodeURIComponent(`${config.nameEs} ${event.locationName} ${new Date(event.eventTime).getFullYear()}`);
    const newsUrl = `https://www.google.com/search?q=${searchQuery}&tbm=nws`;
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D0E14]/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#1A1B22] border border-[#4A5060]/40 rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Header with Color strip */}
                        <div className="h-1.5 w-full" style={{ backgroundColor: severityColor }} />

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#0D0E14] flex items-center justify-center border border-[#4A5060]/20">
                                        <Icon size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-[#E8E8F0] font-bold text-xl leading-tight">{event.title}</h2>
                                        <p className="text-[#8890A0] text-sm mt-1">{event.locationName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#4A5060]/20 rounded-lg text-[#8890A0] hover:text-[#E8E8F0] transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-[#0D0E14]/50 border border-[#4A5060]/20 rounded-xl p-4">
                                    <h3 className="text-[#D4B57A] text-xs font-bold uppercase tracking-widest mb-2">Contexto del Evento</h3>
                                    <p className="text-[#E8E8F0] text-sm leading-relaxed">
                                        {event.description || `Se ha detectado un evento de tipo ${config.nameEs} en ${event.locationName}. El sistema Sentinel está monitoreando la situación.`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={newsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 bg-[#D4B57A]/5 border border-[#D4B57A]/20 rounded-xl hover:bg-[#D4B57A]/10 transition-all group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">📰</span>
                                        <span className="text-[#D4B57A] text-xs font-bold uppercase tracking-tight">Ver Noticias</span>
                                    </a>
                                    <a
                                        href={searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 bg-[#7088A0]/5 border border-[#7088A0]/20 rounded-xl hover:bg-[#7088A0]/10 transition-all group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                                        <span className="text-[#7088A0] text-xs font-bold uppercase tracking-tight">Buscar Info</span>
                                    </a>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-[#4A5060]/20 text-[#E8E8F0] text-sm font-semibold rounded-lg hover:bg-[#4A5060]/40 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

import { useState, useEffect } from 'react';
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
    const [isSearching, setIsSearching] = useState(true);

    useEffect(() => {
        if (isOpen && event) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                setIsSearching(false);
            }, 2500); // 2.5 seconds of "searching"
            return () => clearTimeout(timer);
        }
    }, [isOpen, event?.id]);

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
                <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center sm:items-start sm:justify-start p-4 sm:p-6 sm:pt-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -100, scale: 0.9 }}
                        className="pointer-events-auto bg-[#1A1B22]/95 backdrop-blur-xl border border-[#D4B57A]/30 rounded-2xl w-full max-w-sm shadow-[0_30px_70px_rgba(0,0,0,0.7)] overflow-hidden"
                    >
                        {/* Header with animated scan bar */}
                        <div className="relative h-1.5 w-full bg-[#4A5060]/20">
                            <motion.div
                                className="absolute top-0 left-0 h-full"
                                style={{ backgroundColor: severityColor }}
                                initial={{ width: "0%" }}
                                animate={{ width: isSearching ? "100%" : "100%" }}
                                transition={{ duration: isSearching ? 2.5 : 0.5 }}
                            />
                            {isSearching && (
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-[#0D0E14] flex items-center justify-center border border-[#4A5060]/20 ${isSearching ? 'animate-pulse' : ''}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-[#E8E8F0] font-bold text-base leading-tight line-clamp-1">{event.title}</h2>
                                        <p className="text-[#8890A0] text-xs mt-0.5">{event.locationName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-[#4A5060]/20 rounded-lg text-[#8890A0] hover:text-[#E8E8F0] transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {isSearching ? (
                                    <motion.div
                                        key="searching"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-8 flex flex-col items-center justify-center gap-4"
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 border-2 border-[#D4B57A]/20 border-t-[#D4B57A] rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center text-xs">🌐</div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[#D4B57A] text-xs font-bold uppercase tracking-widest animate-pulse">Buscando noticias...</p>
                                            <p className="text-[#8890A0] text-[10px] mt-1">Escaneando fuentes globales para {event.locationName}</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="bg-[#0D0E14]/50 border border-[#4A5060]/20 rounded-xl p-3">
                                            <h3 className="text-[#D4B57A] text-[10px] font-bold uppercase tracking-widest mb-1.5 opacity-80">Insights Sentinel</h3>
                                            <p className="text-[#E8E8F0] text-xs leading-relaxed">
                                                {event.description || `Monitoreo activo de ${config.nameEs} en curso. Fuentes locales reportan situación en desarrollo.`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <a
                                                href={newsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center gap-1.5 p-3 bg-[#D4B57A]/10 border border-[#D4B57A]/30 rounded-xl hover:bg-[#D4B57A]/20 transition-all group"
                                            >
                                                <span className="text-lg group-hover:scale-110 transition-transform">📰</span>
                                                <span className="text-[#D4B57A] text-[10px] font-bold uppercase tracking-tight">Noticias</span>
                                            </a>
                                            <a
                                                href={searchUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center gap-1.5 p-3 bg-[#7088A0]/10 border border-[#7088A0]/30 rounded-xl hover:bg-[#7088A0]/20 transition-all group"
                                            >
                                                <span className="text-lg group-hover:scale-110 transition-transform">🔍</span>
                                                <span className="text-[#7088A0] text-[10px] font-bold uppercase tracking-tight">Buscar</span>
                                            </a>
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


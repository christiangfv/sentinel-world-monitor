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
                <div className="fixed inset-0 z-[110] pointer-events-none flex items-end justify-center sm:items-end sm:justify-start p-4 sm:p-6 sm:pb-36">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="pointer-events-auto bg-[#1A1B22]/90 backdrop-blur-2xl border border-[#D4B57A]/20 rounded-3xl w-full max-w-sm shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10 ring-inset"
                    >
                        {/* Status bar */}
                        <div className="h-1 bg-[#4A5060]/20 w-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#D4B57A]"
                                initial={{ width: "0%" }}
                                animate={{ width: isSearching ? "100%" : "100%" }}
                                transition={{ duration: isSearching ? 2.5 : 0.5 }}
                            />
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-[#D4B57A]/10 flex items-center justify-center border border-[#D4B57A]/20 ${isSearching ? 'animate-pulse' : ''}`}>
                                        <Icon size={28} className="text-[#D4B57A]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[#E8E8F0] font-black text-lg leading-tight tracking-tight line-clamp-1">{event.title}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4B57A]">{config.nameEs}</span>
                                            <span className="w-1 h-1 rounded-full bg-[#4A5060]/40" />
                                            <span className="text-[10px] text-[#8890A0] font-bold uppercase tracking-widest">{event.locationName}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#4A5060]/20 rounded-xl text-[#8890A0] hover:text-[#E8E8F0] transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
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
                                        className="py-6 flex flex-col items-center justify-center gap-5"
                                    >
                                        <div className="relative w-16 h-16">
                                            <svg className="w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                                                <circle className="text-[#4A5060]/20 stroke-current" strokeWidth="4" fill="transparent" r="40" cx="50" cy="50" />
                                                <circle className="text-[#D4B57A] stroke-current" strokeWidth="4" strokeDasharray="251.2" strokeDashoffset="200" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[#D4B57A] text-[11px] font-black uppercase tracking-[0.3em] animate-pulse">Analizando Datos</p>
                                            <p className="text-[#8890A0] text-xs mt-2 font-medium">Buscando reportes globales...</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-5"
                                    >
                                        <div className="bg-[#0D0E14]/60 border border-[#D4B57A]/10 rounded-2xl p-4 ring-1 ring-white/5">
                                            <h3 className="text-[#D4B57A] text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-90 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4B57A] animate-pulse" />
                                                Inteligencia Central
                                            </h3>
                                            <p className="text-[#E8E8F0] text-sm leading-relaxed font-medium">
                                                {event.description || `Se ha detectado actividad de ${config.nameEs}. Sentinel está procesando los vectores de impacto regional.`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <a
                                                href={newsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center gap-2.5 p-4 bg-[#D4B57A] text-[#0D0E14] rounded-2xl hover:bg-[#E8C585] transition-all active:scale-[0.98] shadow-[0_4px_15px_rgba(212,181,122,0.2)] group"
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform">🗞️</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Noticias</span>
                                            </a>
                                            <a
                                                href={searchUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center gap-2.5 p-4 bg-[#1A1B22] border border-[#D4B57A]/30 text-[#D4B57A] rounded-2xl hover:bg-[#D4B57A]/10 transition-all active:scale-[0.98] group"
                                            >
                                                <span className="text-xl group-hover:scale-110 transition-transform">🔍</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Fuentes</span>
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


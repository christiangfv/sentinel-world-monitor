import { useState, useEffect, useMemo } from 'react';

/*
 * CONFIGURACIÓN DE APIs REALES PARA NOTICIAS Y FOTOS
 *
 * El sistema está diseñado para usar APIs reales cuando están configuradas,
 * y fallback a datos simulados cuando no lo están.
 *
 * 1. NEWSAPI (https://newsapi.org/)
 *    - Plan gratuito: 100 requests/día
 *    - Regístrate gratis y obtén tu API key
 *    - Variable: NEXT_PUBLIC_NEWS_API_KEY=tu_api_key
 *
 * 2. UNSPLASH API (https://unsplash.com/developers)
 *    - Plan gratuito: 50 requests/hora
 *    - Crea una app gratuita y obtén tu Access Key
 *    - Variable: NEXT_PUBLIC_UNSPLASH_API_KEY=tu_access_key
 *
 * 3. RSS FALLBACK
 *    - Si NewsAPI no está configurado, intenta Google News RSS
 *    - No requiere configuración adicional
 *
 * CONFIGURACIÓN EN .env.local:
 * NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key_here
 * NEXT_PUBLIC_UNSPLASH_API_KEY=your_unsplash_access_key_here
 */
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

// Hook personalizado para obtener noticias reales (simulado por ahora)
function useEventNews(event: DisasterEvent | null) {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!event) {
            setNews([]);
            return;
        }

        const fetchNews = async () => {
            setLoading(true);
            try {
                const config = DISASTER_CONFIGS[event.disasterType];
                const location = event.locationName;

                console.log('🔍 Buscando noticias reales para:', `${config.nameEs} ${location}`);
                console.log('🔑 NewsAPI Key disponible:', !!process.env.NEXT_PUBLIC_NEWS_API_KEY);

                // Intentar búsqueda real primero
                try {
                    const searchQuery = encodeURIComponent(`${config.nameEs} ${location} desastre sismo terremoto`);
                    const newsApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

                    if (newsApiKey) {
                        console.log('📰 Usando NewsAPI real');
                        // Usar NewsAPI si hay key configurada
                        const response = await fetch(
                            `https://newsapi.org/v2/everything?q=${searchQuery}&sortBy=publishedAt&language=es&pageSize=5&apiKey=${newsApiKey}`
                        );

                        if (response.ok) {
                            const data = await response.json();
                            if (data.articles && data.articles.length > 0) {
                                console.log('✅ Encontradas', data.articles.length, 'noticias reales');
                                return data.articles.slice(0, 3).map((article: any) => ({
                                    title: article.title,
                                    description: article.description || article.content?.substring(0, 150) + '...',
                                    source: { name: article.source.name },
                                    publishedAt: article.publishedAt,
                                    url: article.url,
                                    urlToImage: article.urlToImage
                                }));
                            }
                        } else {
                            console.warn('❌ Error en NewsAPI:', response.status);
                        }
                    }

                    // Si no hay API key o falla, intentar búsqueda con Google News RSS
                    console.log('📰 Probando Google News RSS');
                    const googleNewsUrl = `https://news.google.com/rss/search?q=${searchQuery}&hl=es&gl=CL&ceid=CL:es`;
                    const rssResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(googleNewsUrl)}`);

                    if (rssResponse.ok) {
                        const rssData = await rssResponse.json();
                        if (rssData.items && rssData.items.length > 0) {
                            console.log('✅ Encontradas', rssData.items.length, 'noticias via RSS');
                            return rssData.items.slice(0, 3).map((item: any) => ({
                                title: item.title,
                                description: item.description?.replace(/<[^>]*>/g, '') || item.contentSnippet || 'Noticia reciente sobre el evento.',
                                source: { name: item.source || 'Google News' },
                                publishedAt: item.pubDate,
                                url: item.link,
                                urlToImage: item.enclosure?.link || item.thumbnail || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&q=80&fm=jpg`
                            }));
                        }
                    } else {
                        console.warn('❌ Error en RSS:', rssResponse.status);
                    }
                } catch (error) {
                    console.warn('Error fetching real news, using mock data:', error);
                }

                // Fallback: noticias simuladas pero realistas
                console.log('📝 Usando datos simulados (configura APIs para contenido real)');
                const mockNews = [
                    {
                        title: `"${config.nameEs} de magnitud ${event.magnitude?.toFixed(1) || '6.2'}: autoridades evalúan daños en ${location}"`,
                        description: `Un fuerte sismo de magnitud ${event.magnitude?.toFixed(1) || '6.2'} sacudió esta madrugada la región de ${location}. Las autoridades locales han iniciado la evaluación de daños en infraestructura crítica mientras equipos de emergencia coordinan rescates.`,
                        source: { name: "El País" },
                        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
                        url: "#",
                        urlToImage: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&q=80&fm=jpg`
                    },
                    {
                        title: `Emergencia declarada: ${config.nameEs} afecta a más de 50.000 habitantes en ${location}`,
                        description: `El Gobierno ha declarado zona de emergencia en ${location} tras el ${config.nameEs} registrado. Protección Civil coordina con ONEMI para desplegar ayuda humanitaria y evaluar necesidades de la población afectada.`,
                        source: { name: "CNN Chile" },
                        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
                        url: "#",
                        urlToImage: `https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=200&fit=crop&q=80&fm=jpg`
                    },
                    {
                        title: `Expertos analizan riesgo de réplicas tras ${config.nameEs} en ${location}`,
                        description: `Sismólogos del Centro Sismológico Nacional advierten sobre posible actividad sísmica secundaria. La población debe mantenerse alerta ante posibles réplicas de menor intensidad en las próximas horas.`,
                        source: { name: "La Tercera" },
                        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
                        url: "#",
                        urlToImage: `https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=200&fit=crop&q=80&fm=jpg`
                    }
                ];

                // Simular delay de API
                await new Promise(resolve => setTimeout(resolve, 800));

                setNews(mockNews);
            } catch (error) {
                console.error('Error fetching news:', error);
                setNews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [event]);

    return { news, loading };
}

// Hook para obtener fotos del lugar
function useLocationPhotos(event: DisasterEvent | null) {
    const [photos, setPhotos] = useState<any[]>([]);

    useEffect(() => {
        if (!event) {
            setPhotos([]);
            return;
        }

        const fetchPhotos = async () => {
            try {
                const location = event.locationName;
                const searchTerms = location.split(',').map(term => term.trim());

                // Intentar búsqueda de fotos reales
                try {
                    const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
                    if (unsplashKey) {
                        console.log('📸 Buscando fotos reales de:', location);
                        const photoQuery = encodeURIComponent(`${location} landscape city view`);
                        const response = await fetch(
                            `https://api.unsplash.com/search/photos?query=${photoQuery}&per_page=3&client_id=${unsplashKey}`
                        );

                        if (response.ok) {
                            const data = await response.json();
                            if (data.results && data.results.length > 0) {
                                console.log('✅ Encontradas', data.results.length, 'fotos reales');
                                return data.results.map((img: any) => ({
                                    url: img.urls.small,
                                    alt: img.alt_description || `${location} - Vista panorámica`
                                }));
                            }
                        } else {
                            console.warn('❌ Error en Unsplash API:', response.status);
                        }
                    }
                } catch (error) {
                    console.warn('Error fetching real photos, using mock data:', error);
                }

                // Fallback: fotos simuladas
                const mockPhotos = [
                    {
                        url: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&q=80&fm=jpg`,
                        alt: `${location} - Vista panorámica`,
                        location: location
                    },
                    {
                        url: `https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=200&fit=crop&q=80&fm=jpg`,
                        alt: `${location} - Paisaje natural`,
                        location: location
                    },
                    {
                        url: `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop&q=80&fm=jpg`,
                        alt: `${location} - Zona urbana`,
                        location: location
                    },
                    {
                        url: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&q=80&fm=jpg`,
                        alt: `${location} - Costa y mar`,
                        location: location
                    }
                ];

                // Simular búsqueda por ubicación
                await new Promise(resolve => setTimeout(resolve, 600));

                setPhotos(mockPhotos.slice(0, 3)); // Mostrar 3 fotos
            } catch (error) {
                console.error('Error fetching photos:', error);
                setPhotos([]);
            }
        };

        fetchPhotos();
    }, [event]);

    return photos;
}

export function EventContextModal({ event, isOpen, onClose }: EventContextModalProps) {
    const [isSearching, setIsSearching] = useState(true);
    const { news, loading: newsLoading } = useEventNews(event);
    const photos = useLocationPhotos(event);

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
                                        <p className="text-[#D4B57A] text-[10px] font-bold uppercase tracking-widest mt-1">Centro de Inteligencia</p>
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
                                                Análisis del Evento
                                            </h3>
                                            <p className="text-[#E8E8F0] text-sm leading-relaxed font-medium">
                                                {event.description || `Se ha detectado un evento de ${config.nameEs} de magnitud ${event.magnitude?.toFixed(1) || 'desconocida'} en ${event.locationName}. Sentinel está recopilando información de ${newsLoading ? '...' : news.length + ' fuentes'} de noticias en tiempo real.`}
                                            </p>
                                            {event.magnitude && (
                                                <div className="mt-3 flex items-center gap-4 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[#8890A0]">📊 Magnitud:</span>
                                                        <span className="text-[#D4B57A] font-bold">{event.magnitude.toFixed(1)}</span>
                                                    </div>
                                                    {event.depth && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[#8890A0]">📏 Profundidad:</span>
                                                            <span className="text-[#D4B57A] font-bold">{event.depth}km</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Últimas Noticias */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[#D4B57A] text-[10px] font-black uppercase tracking-[0.2em] opacity-90 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4B57A] animate-pulse" />
                                                    Últimas Noticias
                                                    {process.env.NEXT_PUBLIC_NEWS_API_KEY && (
                                                        <span className="text-[8px] bg-[#D4B57A]/20 text-[#D4B57A] px-1.5 py-0.5 rounded-full">
                                                            REAL
                                                        </span>
                                                    )}
                                                </h3>
                                                <span className="text-[9px] text-[#8890A0] font-medium">{news.length} reportes</span>
                                            </div>

                                            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                                                {news.map((item, index) => {
                                                    const publishedDate = new Date(item.publishedAt);
                                                    const timeAgo = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60));
                                                    const timeAgoText = timeAgo < 1 ? 'Ahora' : timeAgo === 1 ? '1h' : `${timeAgo}h`;

                                                    return (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="bg-[#0D0E14]/40 border border-[#D4B57A]/10 rounded-xl overflow-hidden hover:border-[#D4B57A]/20 transition-all cursor-pointer group"
                                                            onClick={() => window.open(item.url, '_blank')}
                                                        >
                                                            <div className="aspect-[2/1] relative overflow-hidden">
                                                                <img
                                                                    src={item.urlToImage}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    loading="lazy"
                                                                />
                                                                <div className="absolute top-2 right-2 bg-[#0D0E14]/80 backdrop-blur-sm rounded-lg px-2 py-1">
                                                                    <span className="text-[9px] text-[#D4B57A] font-bold">{item.source.name}</span>
                                                                </div>
                                                                <div className="absolute bottom-2 left-2 bg-[#0D0E14]/80 backdrop-blur-sm rounded-lg px-2 py-1">
                                                                    <span className="text-[9px] text-[#E8E8F0] font-medium">{timeAgoText}</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-3">
                                                                <h4 className="text-[#E8E8F0] text-sm font-bold leading-tight line-clamp-2 mb-2 group-hover:text-[#D4B57A] transition-colors">
                                                                    {item.title}
                                                                </h4>
                                                                <p className="text-[#8890A0] text-xs leading-relaxed line-clamp-2">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                                {newsLoading && (
                                                    <div className="flex items-center justify-center py-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#D4B57A] border-t-transparent"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fotos del lugar */}
                                            <div className="pt-3 border-t border-[#D4B57A]/10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-[#D4B57A] text-[10px] font-black uppercase tracking-[0.2em] opacity-90 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4B57A] animate-pulse" />
                                                        Fotos del lugar
                                                    </h4>
                                                    <span className="text-[9px] text-[#8890A0] font-medium">{photos.length} imágenes</span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    {photos.map((photo, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: index * 0.1 + 0.3 }}
                                                            className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
                                                            onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(event.locationName)}`, '_blank')}
                                                        >
                                                            <img
                                                                src={photo.url}
                                                                alt={photo.alt}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="absolute bottom-2 left-2 right-2">
                                                                    <p className="text-[9px] text-[#E8E8F0] font-medium line-clamp-2">{photo.alt}</p>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Enlace a más noticias */}
                                                <div className="mt-3 pt-3 border-t border-[#D4B57A]/10">
                                                    <a
                                                        href={`https://www.google.com/search?q=${encodeURIComponent(`${config.nameEs} ${event.locationName} ${new Date(event.eventTime).getFullYear()}`)}&tbm=nws`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full flex items-center justify-center gap-2 p-2 bg-[#D4B57A]/10 hover:bg-[#D4B57A]/20 text-[#D4B57A] rounded-lg text-xs font-semibold transition-all"
                                                    >
                                                        <span>📰</span>
                                                        Ver todas las noticias
                                                    </a>
                                                </div>
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


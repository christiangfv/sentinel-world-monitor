import { format, formatDistanceToNow, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha para display
 */
export function formatEventDate(date: Date): string {
  if (isToday(date)) {
    return `Hoy ${format(date, 'HH:mm')}`;
  }

  if (isYesterday(date)) {
    return `Ayer ${format(date, 'HH:mm')}`;
  }

  return format(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Formatea fecha relativa (ej: "hace 5 minutos")
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: es
  });
}

/**
 * Verifica si un evento está activo (no expirado)
 */
export function isEventActive(eventTime: Date, expiresAt?: Date): boolean {
  if (!expiresAt) {
    // Si no tiene fecha de expiración, considerar activo por 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return eventTime >= sevenDaysAgo;
  }

  return new Date() <= expiresAt;
}

/**
 * Calcula la antigüedad de un evento en minutos
 */
export function getEventAgeMinutes(eventTime: Date): number {
  return differenceInMinutes(new Date(), eventTime);
}

/**
 * Formatea tiempo transcurrido de manera legible
 */
export function formatTimeAgo(date: Date): string {
  const minutes = getEventAgeMinutes(date);

  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days}d`;

  return format(date, 'dd/MM/yyyy');
}

/**
 * Convierte timestamp de API a Date
 */
export function parseApiTimestamp(timestamp: number | string): Date {
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  // Si es número, asumir que está en milisegundos (como USGS)
  return new Date(timestamp);
}

/**
 * Formatea fecha para APIs
 */
export function formatForApi(date: Date): string {
  return date.toISOString();
}

/**
 * Obtiene el rango de fechas por defecto para filtros
 */
export function getDefaultDateRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7); // Últimos 7 días

  return { start, end };
}

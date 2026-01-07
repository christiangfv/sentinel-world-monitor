import { SeverityLevel, DisasterType } from '@/lib/types';
import { DISASTER_CONFIGS } from '@/lib/constants/disasters';

/**
 * Convierte magnitud de sismo a nivel de severidad
 */
export function magnitudeToSeverity(magnitude: number): SeverityLevel {
  if (magnitude < 4.0) return 1;
  if (magnitude < 5.0) return 2;
  if (magnitude < 6.0) return 3;
  return 4;
}

/**
 * Obtiene el color correspondiente a una severidad
 * Brand Book: mist (low) → plasma (medium) → sakura (high) → muted (critical)
 */
export function getSeverityColor(severity: SeverityLevel): string {
  const colors = {
    1: '#7088A0', // Mist - Severidad baja
    2: '#D4B57A', // Plasma - Severidad media
    3: '#A07888', // Sakura - Severidad alta
    4: '#E8E8F0', // Muted - Severidad crítica
  };

  return colors[severity];
}

/**
 * Obtiene la etiqueta de severidad para un tipo de desastre
 */
export function getSeverityLabel(disasterType: DisasterType, severity: SeverityLevel): string {
  const config = DISASTER_CONFIGS[disasterType];
  return config.severityLabels[severity];
}

/**
 * Obtiene el color de un tipo de desastre
 */
export function getDisasterColor(disasterType: DisasterType): string {
  return DISASTER_CONFIGS[disasterType].color;
}

/**
 * Obtiene el icono de un tipo de desastre
 */
export function getDisasterIcon(disasterType: DisasterType): string {
  return DISASTER_CONFIGS[disasterType].icon;
}

/**
 * Obtiene el nombre de un tipo de desastre
 */
export function getDisasterName(disasterType: DisasterType, language: 'es' | 'en' = 'es'): string {
  const config = DISASTER_CONFIGS[disasterType];
  return language === 'es' ? config.nameEs : config.name;
}

/**
 * Ordena eventos por severidad (más severos primero)
 */
export function sortBySeverity<T extends { severity: SeverityLevel }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.severity - a.severity);
}

/**
 * Filtra eventos por severidad mínima
 */
export function filterByMinSeverity<T extends { severity: SeverityLevel }>(
  items: T[],
  minSeverity: SeverityLevel
): T[] {
  return items.filter(item => item.severity >= minSeverity);
}

/**
 * Obtiene el nivel de severidad más alto de una lista de eventos
 */
export function getMaxSeverity(events: { severity: SeverityLevel }[]): SeverityLevel {
  if (events.length === 0) return 1;
  return Math.max(...events.map(event => event.severity)) as SeverityLevel;
}

/**
 * Verifica si una severidad cumple con las preferencias del usuario
 */
export function meetsSeverityPreference(
  eventSeverity: SeverityLevel,
  userMinSeverity: SeverityLevel
): boolean {
  return eventSeverity >= userMinSeverity;
}


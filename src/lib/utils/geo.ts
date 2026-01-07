import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

/**
 * Genera un geohash para una ubicación dada
 */
export function generateGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng]);
}

/**
 * Calcula la distancia entre dos puntos en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return distanceBetween([lat1, lng1], [lat2, lng2]);
}

/**
 * Verifica si un punto está dentro de un radio dado
 */
export function isPointInRadius(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng);
  return distance <= radiusKm;
}

/**
 * Genera bounds para queries geoespaciales en Firestore
 */
export function getGeohashQueryBounds(
  centerLat: number,
  centerLng: number,
  radiusKm: number
) {
  return geohashQueryBounds([centerLat, centerLng], radiusKm * 1000); // Convertir a metros
}

/**
 * Formatea coordenadas para display
 */
export function formatCoordinates(lat: number, lng: number, precision: number = 4): string {
  const formatCoord = (coord: number) => coord.toFixed(precision);
  return `${formatCoord(lat)}, ${formatCoord(lng)}`;
}

/**
 * Valida que las coordenadas sean válidas
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Calcula el radio estimado para un evento basado en su magnitud
 */
export function calculateEventRadius(magnitude?: number): number {
  if (!magnitude) return 50; // Radio por defecto

  // Fórmula aproximada: radio = magnitud * 20km (mínimo 50km)
  return Math.max(50, magnitude * 20);
}

/**
 * Obtiene el nombre de ubicación formateado
 */
export function formatLocationName(locationName: string): string {
  if (!locationName) return 'Ubicación desconocida';

  // Limpiar y capitalizar
  return locationName
    .replace(/\d+km\s+/i, '') // Remover distancias
    .replace(/\s+of\s+/i, ' de ') // Traducir "of" a "de"
    .replace(/\s+to\s+/i, ' a ') // Traducir "to" a "a"
    .trim();
}

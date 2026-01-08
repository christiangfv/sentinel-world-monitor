// Tipos de desastre soportados
export type DisasterType =
  | 'earthquake'
  | 'tsunami'
  | 'volcano'
  | 'wildfire'
  | 'flood'
  | 'storm'
  | 'landslide';

// Niveles de severidad
export type SeverityLevel = 1 | 2 | 3 | 4;

// Configuración de un tipo de desastre
export interface DisasterConfig {
  id: DisasterType;
  name: string;
  nameEs: string;
  icon: string;
  color: string;
  severityLabels: Record<SeverityLevel, string>;
}

// Evento de desastre
export interface DisasterEvent {
  id: string;
  disasterType: DisasterType;
  source: 'usgs' | 'gdacs' | 'senapred' | 'noaa';
  externalId: string;
  title: string;
  description?: string;
  severity: SeverityLevel;
  location: {
    lat: number;
    lng: number;
  };
  geohash: string;
  locationName: string;
  radiusKm?: number;
  magnitude?: number;
  depth?: number;
  metadata?: Record<string, any>;
  eventTime: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Usuario
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  fcmToken?: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Configuración general del usuario
export interface UserSettings {
  language: 'es' | 'en';
  darkMode: boolean;
  soundEnabled: boolean;
  country?: string;
  minMagnitude?: number;
  onboardingCompleted?: boolean;
  notificationsEnabled?: boolean;
}

// Zona de monitoreo del usuario
export interface UserZone {
  id: string;
  userId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  geohash: string;
  radiusKm: number;
  isActive: boolean;
  createdAt: Date;
}

// Preferencias de alerta por tipo de desastre
export interface AlertPreference {
  disasterType: DisasterType;
  minSeverity: SeverityLevel;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

// Notificación enviada
export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  event?: DisasterEvent;
  channel: 'push' | 'email';
  sentAt: Date;
  readAt?: Date;
}

// Filtros para eventos
export interface EventFilters {
  disasterTypes: DisasterType[];
  minSeverity: SeverityLevel;
  dateRange?: {
    start: Date;
    end: Date;
  };
  nearLocation?: {
    lat: number;
    lng: number;
    radiusKm: number;
  };
}

// Tipos para mapas
export interface MapMarker {
  id: string;
  position: [number, number];
  type: DisasterType;
  severity: SeverityLevel;
  title: string;
  event: DisasterEvent;
}

// Tipos para autenticación
export interface AuthUser extends User {
  // Extensión del usuario con métodos de auth
}

// Tipos para formularios
export interface ZoneFormData {
  name: string;
  radiusKm: number;
  location: {
    lat: number;
    lng: number;
  };
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para PWA
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extendemos el tipo Window para PWA
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}


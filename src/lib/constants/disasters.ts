import { DisasterType, DisasterConfig } from '@/lib/types';

// Brand Book Colors
export const BRAND_COLORS = {
  abyss: '#0D0E14',
  shadow: '#1A1B22',
  plasma: '#D4B57A',
  mist: '#7088A0',
  sakura: '#A07888',
  smoke: '#8890A0',
  muted: '#E8E8F0',
} as const;

export const DISASTER_CONFIGS: Record<DisasterType, DisasterConfig> = {
  earthquake: {
    id: 'earthquake',
    name: 'Earthquake',
    nameEs: 'Sismo',
    icon: '🌍',
    color: BRAND_COLORS.plasma,
    severityLabels: {
      1: 'Menor (< 4.0)',
      2: 'Leve (4.0 - 5.0)',
      3: 'Moderado (5.0 - 6.0)',
      4: 'Severo (> 6.0)'
    }
  },
  tsunami: {
    id: 'tsunami',
    name: 'Tsunami',
    nameEs: 'Tsunami',
    icon: '🌊',
    color: BRAND_COLORS.mist,
    severityLabels: {
      1: 'Vigilancia',
      2: 'Aviso',
      3: 'Alerta',
      4: 'Alerta Máxima'
    }
  },
  volcano: {
    id: 'volcano',
    name: 'Volcanic Eruption',
    nameEs: 'Erupción Volcánica',
    icon: '🌋',
    color: BRAND_COLORS.sakura,
    severityLabels: {
      1: 'Verde',
      2: 'Amarillo',
      3: 'Naranja',
      4: 'Rojo'
    }
  },
  wildfire: {
    id: 'wildfire',
    name: 'Wildfire',
    nameEs: 'Incendio Forestal',
    icon: '🔥',
    color: BRAND_COLORS.plasma,
    severityLabels: {
      1: 'Controlado',
      2: 'Activo',
      3: 'Fuera de Control',
      4: 'Catastrófico'
    }
  },
  flood: {
    id: 'flood',
    name: 'Flood',
    nameEs: 'Inundación',
    icon: '💧',
    color: BRAND_COLORS.mist,
    severityLabels: {
      1: 'Menor',
      2: 'Moderada',
      3: 'Severa',
      4: 'Catastrófica'
    }
  },
  storm: {
    id: 'storm',
    name: 'Storm/Hurricane',
    nameEs: 'Tormenta/Huracán',
    icon: '🌀',
    color: BRAND_COLORS.smoke,
    severityLabels: {
      1: 'Tormenta Tropical',
      2: 'Categoría 1-2',
      3: 'Categoría 3-4',
      4: 'Categoría 5'
    }
  },
  landslide: {
    id: 'landslide',
    name: 'Landslide',
    nameEs: 'Aluvión/Deslizamiento',
    icon: '⛰️',
    color: BRAND_COLORS.smoke,
    severityLabels: {
      1: 'Menor',
      2: 'Moderado',
      3: 'Severo',
      4: 'Catastrófico'
    }
  }
};

// Lista ordenada de tipos de desastre para filtros
export const DISASTER_TYPES: DisasterType[] = [
  'earthquake',
  'tsunami',
  'volcano',
  'wildfire',
  'flood',
  'storm',
  'landslide'
];

// Fuentes de datos disponibles
export const DATA_SOURCES = {
  usgs: {
    name: 'USGS Earthquake Hazards Program',
    url: 'https://earthquake.usgs.gov',
    types: ['earthquake']
  },
  gdacs: {
    name: 'Global Disaster Alert and Coordination System',
    url: 'https://www.gdacs.org',
    types: ['earthquake', 'tsunami', 'volcano', 'wildfire', 'flood', 'storm']
  }
} as const;

// Configuración de polling
export const POLLING_CONFIG = {
  usgs: {
    intervalMinutes: 5,
    endpoint: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson'
  },
  gdacs: {
    intervalMinutes: 15,
    endpoint: 'https://www.gdacs.org/xml/rss.xml'
  }
} as const;


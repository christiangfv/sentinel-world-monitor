# 🔥 Feature: Incendios Forestales con Polylines

> Fecha inicio: 2026-01-29
> Estado: En progreso

---

## Resumen

Implementar visualización avanzada de incendios forestales con:
- Hotspots desde NASA FIRMS (puntos de calor satelitales)
- Clustering inteligente de hotspots cercanos
- Polylines/polígonos para mostrar perímetros estimados
- Información detallada (área, intensidad, evolución)

---

## 📋 Tareas

### Fase 1: Backend - Fuentes de Datos
- [ ] **1.1** Investigar API de NASA FIRMS y obtener API key
- [ ] **1.2** Crear `functions/src/fetchFIRMS.ts` - fetcher de hotspots
- [ ] **1.3** Implementar algoritmo de clustering (DBSCAN o similar) para agrupar hotspots cercanos
- [ ] **1.4** Generar polígonos convex hull desde clusters de hotspots
- [ ] **1.5** Agregar FIRMS al `masterFetch.ts`
- [ ] **1.6** Tests unitarios para clustering y generación de polígonos

### Fase 2: Modelo de Datos
- [ ] **2.1** Actualizar `src/lib/types/index.ts` - agregar soporte para geometrías (Point, Polygon, LineString)
- [ ] **2.2** Crear tipo `FireEvent` extendido con campos específicos:
  - `geometry`: GeoJSON (Polygon o MultiPoint)
  - `hotspotCount`: número de puntos de calor
  - `estimatedAreaKm2`: área estimada
  - `frp`: Fire Radiative Power (intensidad)
  - `confidence`: nivel de confianza del satélite
- [ ] **2.3** Actualizar esquema de Firestore para eventos de incendio
- [ ] **2.4** Migración de eventos existentes (si hay)

### Fase 3: Frontend - Mapa
- [ ] **3.1** Investigar renderizado de polígonos en Leaflet/react-leaflet
- [ ] **3.2** Crear componente `FirePolygon.tsx` para renderizar perímetros
- [ ] **3.3** Implementar gradiente de color según intensidad (FRP)
- [ ] **3.4** Agregar animación de "pulso" para incendios activos
- [ ] **3.5** Popup/tooltip con info detallada del incendio
- [ ] **3.6** Toggle para ver hotspots individuales vs polígono agrupado

### Fase 4: Frontend - UI/UX
- [ ] **4.1** Card de detalle de incendio con:
  - Área estimada
  - Número de focos
  - Intensidad promedio
  - Primera/última detección
  - Satélite fuente (MODIS/VIIRS)
- [ ] **4.2** Filtros específicos para incendios (por intensidad, área, etc)
- [ ] **4.3** Timeline de evolución del incendio (si hay datos históricos)
- [ ] **4.4** Iconografía y colores consistentes con brand book

### Fase 5: Optimización
- [ ] **5.1** Cache de polígonos generados (no recalcular cada vez)
- [ ] **5.2** Simplificación de polígonos para mejor performance
- [ ] **5.3** Lazy loading de geometrías pesadas
- [ ] **5.4** Rate limiting para API de FIRMS

### Fase 6: Testing & Deploy
- [ ] **6.1** Tests de integración con datos reales de FIRMS
- [ ] **6.2** Test de renderizado de polígonos en diferentes zooms
- [ ] **6.3** Test de performance con muchos incendios simultáneos
- [ ] **6.4** Deploy a staging/testing
- [ ] **6.5** Deploy a producción

---

## 📊 Progreso

| Fase | Tareas | Completadas | Estado |
|------|--------|-------------|--------|
| 1. Backend | 6 | 0 | ⏳ Pendiente |
| 2. Modelo | 4 | 0 | ⏳ Pendiente |
| 3. Mapa | 6 | 0 | ⏳ Pendiente |
| 4. UI/UX | 4 | 0 | ⏳ Pendiente |
| 5. Optimización | 4 | 0 | ⏳ Pendiente |
| 6. Testing | 5 | 0 | ⏳ Pendiente |
| **Total** | **29** | **0** | **0%** |

---

## 🔗 Referencias

- NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/
- FIRMS API: https://firms.modaps.eosdis.nasa.gov/api/
- GeoJSON Spec: https://geojson.org/
- Leaflet Polygon: https://leafletjs.com/reference.html#polygon
- DBSCAN Clustering: https://en.wikipedia.org/wiki/DBSCAN

---

## 📝 Notas

- FIRMS tiene límite de 100k puntos por request
- Datos disponibles con ~3 horas de delay
- VIIRS tiene mejor resolución que MODIS
- Considerar agregar CONAF como fuente para Chile específicamente


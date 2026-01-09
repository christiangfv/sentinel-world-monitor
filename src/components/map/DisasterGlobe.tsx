'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { DisasterEvent } from '@/lib/types';

interface DisasterGlobeProps {
    events: DisasterEvent[];
    selectedEvent?: DisasterEvent | null;
    onEventClick?: (event: DisasterEvent) => void;
}

export function DisasterGlobe({ events, selectedEvent, onEventClick }: DisasterGlobeProps) {
    const globeEl = useRef<any>(undefined);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-rotate
    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
        }
    }, [mounted]);

    // Fly to selected event
    useEffect(() => {
        if (globeEl.current && selectedEvent) {
            // Stop auto-rotate when focusing on an event
            globeEl.current.controls().autoRotate = false;

            globeEl.current.pointOfView({
                lat: selectedEvent.location.lat,
                lng: selectedEvent.location.lng,
                altitude: 1.5
            }, 2000); // 2 seconds transition
        }
    }, [selectedEvent]);

    // Color logic using CSS variables for theme support
    const getEventColor = (severity: number) => {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);

        if (severity >= 4) return computedStyle.getPropertyValue('--severity-critical').trim() || '#E8E8F0'; // Critical
        if (severity === 3) return computedStyle.getPropertyValue('--severity-high').trim() || '#A07888'; // High
        if (severity === 2) return computedStyle.getPropertyValue('--severity-medium').trim() || '#D4B57A'; // Medium
        return computedStyle.getPropertyValue('--severity-low').trim() || '#7088A0'; // Low
    };

    const getEventAltitude = (severity: number) => {
        return severity * 0.06; // Higher severity = higher altitude (increased)
    };

    const getEventRadius = (severity: number) => {
        return 0.6 + (severity * 0.25); // Larger markers for better visibility
    };

    const ringsData = useMemo(() => events.filter(e => e.severity >= 3), [events]);

    if (!mounted) return null;

    return (
        <div className="w-full h-full cursor-move globe-container">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                // Enhanced Atmosphere
                atmosphereColor="#D4B57A"
                atmosphereAltitude={0.22}

                // Points (Events)
                pointsData={events}
                pointLat={d => (d as DisasterEvent).location.lat}
                pointLng={d => (d as DisasterEvent).location.lng}
                pointColor={d => getEventColor((d as DisasterEvent).severity)}
                pointAltitude={d => getEventAltitude((d as DisasterEvent).severity)}
                pointRadius={d => getEventRadius((d as DisasterEvent).severity)}
                pointsMerge={true}
                pointLabel={d => {
                    const event = d as DisasterEvent;
                    const severityColors: Record<number, string> = {
                        1: '#7088A0',
                        2: '#D4B57A',
                        3: '#A07888',
                        4: '#E8E8F0'
                    };
                    const color = severityColors[event.severity] || '#7088A0';

                    return `
          <div style="
            background: linear-gradient(135deg, rgba(26, 27, 34, 0.95) 0%, rgba(26, 27, 34, 0.85) 100%);
            backdrop-filter: blur(16px);
            color: #E8E8F0;
            padding: 10px 14px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${color}20;
            min-width: 160px;
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${color};
                box-shadow: 0 0 10px ${color}80;
              "></div>
              <div style="font-weight: 600; font-size: 13px;">${event.title}</div>
            </div>
            <div style="font-size: 11px; color: #8890A0; display: flex; justify-content: space-between;">
              <span>${event.disasterType}</span>
              <span style="color: ${color}; font-weight: 600;">S${event.severity}</span>
            </div>
          </div>
        `;
                }}
                onPointClick={(d) => onEventClick?.(d as DisasterEvent)}

                // Rings (Critical Events)
                ringsData={ringsData}
                ringLat={d => (d as DisasterEvent).location.lat}
                ringLng={d => (d as DisasterEvent).location.lng}
                ringColor={() => {
                    const root = document.documentElement;
                    const computedStyle = getComputedStyle(root);
                    return computedStyle.getPropertyValue('--severity-critical').trim() || '#F87171';
                }}
                ringMaxRadius={d => 5 * (d as DisasterEvent).severity}
                ringPropagationSpeed={2}
                ringRepeatPeriod={1000}
            />
        </div>
    );
}

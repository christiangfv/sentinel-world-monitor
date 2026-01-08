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

    // Color logic matching Leaflet map
    const getEventColor = (severity: number) => {
        if (severity >= 4) return '#E8E8F0'; // Critical
        if (severity === 3) return '#A07888'; // High
        if (severity === 2) return '#D4B57A'; // Medium
        return '#7088A0'; // Low
    };

    const getEventAltitude = (severity: number) => {
        return severity * 0.05; // Higher severity = higher altitude
    };

    const getEventRadius = (severity: number) => {
        return 0.5 + (severity * 0.2);
    };

    const ringsData = useMemo(() => events.filter(e => e.severity >= 3), [events]);

    if (!mounted) return null;

    return (
        <div className="w-full h-full cursor-move">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                // Atmosphere
                atmosphereColor="#D4B57A"
                atmosphereAltitude={0.15}

                // Points (Events)
                pointsData={events}
                pointLat={d => (d as DisasterEvent).location.lat}
                pointLng={d => (d as DisasterEvent).location.lng}
                pointColor={d => getEventColor((d as DisasterEvent).severity)}
                pointAltitude={d => getEventAltitude((d as DisasterEvent).severity)}
                pointRadius={d => getEventRadius((d as DisasterEvent).severity)}
                pointsMerge={true}
                pointLabel={d => `
          <div style="background: rgba(13, 14, 20, 0.9); color: #E8E8F0; padding: 4px 8px; border-radius: 4px; border: 1px solid #4A5060;">
            <div style="font-weight: bold;">${(d as DisasterEvent).title}</div>
            <div style="font-size: 10px; color: #8890A0;">${(d as DisasterEvent).disasterType}</div>
          </div>
        `}
                onPointClick={(d) => onEventClick?.(d as DisasterEvent)}

                // Rings (Critical Events)
                ringsData={ringsData}
                ringLat={d => (d as DisasterEvent).location.lat}
                ringLng={d => (d as DisasterEvent).location.lng}
                ringColor={() => '#F87171'}
                ringMaxRadius={d => 5 * (d as DisasterEvent).severity}
                ringPropagationSpeed={2}
                ringRepeatPeriod={1000}
            />
        </div>
    );
}

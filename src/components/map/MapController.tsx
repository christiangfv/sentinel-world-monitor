'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { DisasterEvent } from '@/lib/types';

interface MapControllerProps {
    selectedEvent?: DisasterEvent | null;
}

export function MapController({ selectedEvent }: MapControllerProps) {
    const map = useMap();

    useEffect(() => {
        if (selectedEvent) {
            map.flyTo(
                [selectedEvent.location.lat, selectedEvent.location.lng],
                8, // Zoom level para evento seleccionado
                { duration: 1.5 }
            );
        }
    }, [selectedEvent, map]);

    return null;
}

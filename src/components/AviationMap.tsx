import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Aircraft {
  id: string;
  model: string;
  registration: string;
  position: [number, number];
  status: 'idle' | 'in-flight' | 'maintenance' | 'grounded';
  airline: string;
  location: string;
  passengers: number;
  maxPassengers: number;
  fuelLevel: number;
  currentRoute?: {
    from: string;
    to: string;
    fromCoordinates: [number, number];
    toCoordinates: [number, number];
    progress?: number;
    arrivalTime?: string;
  };
}

interface AviationMapProps {
  aircraft: Aircraft[];
  onAircraftSelect?: (aircraft: Aircraft) => void;
}

const AviationMap: React.FC<AviationMapProps> = ({ aircraft, onAircraftSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Polyline[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([51.1657, 10.4515], 6); // Center on Germany

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers and routes
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    routeLinesRef.current.forEach(line => {
      mapInstanceRef.current?.removeLayer(line);
    });
    markersRef.current = [];
    routeLinesRef.current = [];

    // Add aircraft markers and routes
    aircraft.forEach(plane => {
      // Create custom icon based on status
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'idle': return '#22c55e'; // green
          case 'in-flight': return '#3b82f6'; // blue
          case 'maintenance': return '#f59e0b'; // yellow
          case 'grounded': return '#ef4444'; // red
          default: return '#6b7280'; // gray
        }
      };

      const getStatusIcon = (status: string) => {
        switch (status) {
          case 'idle': return '✈';
          case 'in-flight': return '🛫';
          case 'maintenance': return '🔧';
          case 'grounded': return '⚠';
          default: return '✈';
        }
      };

      // Create larger, more visible aircraft icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${getStatusColor(plane.status)};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transform: ${plane.status === 'in-flight' ? 'scale(1.2)' : 'scale(1)'};
            transition: transform 0.3s ease;
          ">
            ${getStatusIcon(plane.status)}
          </div>
        `,
        className: 'custom-aircraft-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(plane.position, { icon: customIcon })
        .bindPopup(`
          <div class="aircraft-popup" style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;"><strong>${plane.registration}</strong></h3>
            <div style="display: grid; gap: 4px; font-size: 13px;">
              <div><strong>Model:</strong> ${plane.model}</div>
              <div><strong>Status:</strong> 
                <span style="
                  background: ${getStatusColor(plane.status)};
                  color: white;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 11px;
                  margin-left: 4px;
                ">${plane.status}</span>
              </div>
              <div><strong>Location:</strong> ${plane.location}</div>
              <div><strong>Passengers:</strong> ${plane.passengers}/${plane.maxPassengers}</div>
              <div><strong>Fuel:</strong> 
                <span style="color: ${plane.fuelLevel > 30 ? '#22c55e' : '#ef4444'}">
                  ${plane.fuelLevel}%
                </span>
              </div>
              ${plane.currentRoute ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <div><strong>Route:</strong> ${plane.currentRoute.from} → ${plane.currentRoute.to}</div>
                  <div><strong>Progress:</strong> ${Math.round(plane.currentRoute.progress || 0)}%</div>
                  ${plane.currentRoute.arrivalTime ? `
                    <div><strong>Ankunft:</strong> ${new Date(plane.currentRoute.arrivalTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                  ` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `)
        .on('click', () => {
          onAircraftSelect?.(plane);
        });

      if (mapInstanceRef.current) {
        marker.addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
      }

      // Add flight route if aircraft is in flight
      if (plane.status === 'in-flight' && plane.currentRoute) {
        const route = plane.currentRoute;
        
        // Create dashed line for flight path
        const routeLine = L.polyline(
          [route.fromCoordinates, route.toCoordinates],
          {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10',
          }
        ).bindTooltip(`${route.from} → ${route.to}`, {
          permanent: false,
          direction: 'center'
        });

        // Add origin and destination markers
        const originIcon = L.divIcon({
          html: `
            <div style="
              background-color: #10b981;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          className: 'origin-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const destinationIcon = L.divIcon({
          html: `
            <div style="
              background-color: #dc2626;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          className: 'destination-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const originMarker = L.marker(route.fromCoordinates, { icon: originIcon })
          .bindTooltip(route.from, { permanent: false });
        const destinationMarker = L.marker(route.toCoordinates, { icon: destinationIcon })
          .bindTooltip(route.to, { permanent: false });

        if (mapInstanceRef.current) {
          routeLine.addTo(mapInstanceRef.current);
          originMarker.addTo(mapInstanceRef.current);
          destinationMarker.addTo(mapInstanceRef.current);
          routeLinesRef.current.push(routeLine);
          markersRef.current.push(originMarker, destinationMarker);
        }
      }
    });

    // Fit map to show all aircraft
    if (aircraft.length > 0 && mapInstanceRef.current) {
      const allMarkers = markersRef.current.filter(marker => marker.getLatLng);
      if (allMarkers.length > 0) {
        const group = new L.FeatureGroup(allMarkers);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [aircraft, onAircraftSelect]);

  return (
    <div className="w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg border"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default AviationMap;
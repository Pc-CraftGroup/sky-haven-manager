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
  status: 'operational' | 'maintenance' | 'grounded';
  airline: string;
  location: string;
  passengers: number;
  maxPassengers: number;
  fuelLevel: number;
}

interface AviationMapProps {
  aircraft: Aircraft[];
  onAircraftSelect?: (aircraft: Aircraft) => void;
}

const AviationMap: React.FC<AviationMapProps> = ({ aircraft, onAircraftSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for each aircraft
    aircraft.forEach(plane => {
      if (!mapInstanceRef.current) return;

      // Create custom icon based on status
      const iconColor = plane.status === 'operational' ? '#22c55e' : 
                       plane.status === 'maintenance' ? '#eab308' : '#ef4444';
      
      const customIcon = L.divIcon({
        className: 'aircraft-marker',
        html: `
          <div style="
            background-color: ${iconColor}; 
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: white;
            font-weight: bold;
          ">
            ✈
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(plane.position, { icon: customIcon })
        .addTo(mapInstanceRef.current);

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #0066cc; font-size: 16px; font-weight: bold;">
            ${plane.registration}
          </h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Modell:</strong> ${plane.model}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Standort:</strong> ${plane.location}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> 
            <span style="
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              color: white;
              background-color: ${iconColor};
            ">
              ${plane.status === 'operational' ? 'Operativ' : 
                plane.status === 'maintenance' ? 'Wartung' : 'Am Boden'}
            </span>
          </p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Passagiere:</strong> ${plane.passengers}/${plane.maxPassengers}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Treibstoff:</strong> ${plane.fuelLevel}%</p>
          <div style="margin-top: 8px;">
            <div style="
              background-color: #f0f0f0; 
              border-radius: 8px; 
              height: 6px; 
              overflow: hidden;
            ">
              <div style="
                height: 100%; 
                background-color: ${plane.fuelLevel > 50 ? '#22c55e' : plane.fuelLevel > 20 ? '#eab308' : '#ef4444'};
                width: ${plane.fuelLevel}%;
                transition: width 0.3s ease;
              "></div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click event
      marker.on('click', () => {
        if (onAircraftSelect) {
          onAircraftSelect(plane);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all aircraft if there are any
    if (aircraft.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [aircraft, onAircraftSelect]);

  return (
    <>
      <style>{`
        .aircraft-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div className="w-full h-full rounded-lg overflow-hidden shadow-elevation border border-border">
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>
    </>
  );
};

export default AviationMap;
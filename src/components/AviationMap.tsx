import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom aircraft icon
const aircraftIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2">
      <path d="M2 12h6l2-6h4l2 6h6"/>
      <path d="M12 2v4"/>
      <path d="M12 18v4"/>
      <path d="M6 12l-2 6"/>
      <path d="M18 12l2 6"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface Aircraft {
  id: string;
  model: string;
  registration: string;
  position: [number, number];
  status: 'operational' | 'maintenance' | 'grounded';
  airline: string;
}

interface AviationMapProps {
  aircraft: Aircraft[];
  onAircraftSelect?: (aircraft: Aircraft) => void;
}

const AviationMap: React.FC<AviationMapProps> = ({ aircraft, onAircraftSelect }) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-elevation border border-border">
      <MapContainer
        center={[50.0, 10.0]} // Center on Europe
        zoom={4}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {aircraft.map((plane) => (
          <Marker
            key={plane.id}
            position={plane.position}
            icon={aircraftIcon}
            eventHandlers={{
              click: () => onAircraftSelect?.(plane),
            }}
          >
            <Popup className="aviation-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-primary mb-2">{plane.registration}</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Model:</span> {plane.model}</p>
                  <p><span className="font-medium">Airline:</span> {plane.airline}</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      plane.status === 'operational' ? 'bg-operational text-white' :
                      plane.status === 'maintenance' ? 'bg-warning text-white' :
                      'bg-critical text-white'
                    }`}>
                      {plane.status}
                    </span>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AviationMap;
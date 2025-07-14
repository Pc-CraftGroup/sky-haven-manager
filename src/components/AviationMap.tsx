import React from 'react';

// Temporarily simplified component without Leaflet to isolate the error
// Will restore Leaflet functionality once the core app is stable

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
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-primary">Weltkarte</div>
          <div className="text-muted-foreground">
            {aircraft.length} Flugzeuge in der Flotte
          </div>
          <div className="grid grid-cols-1 gap-2 max-w-md">
            {aircraft.map((plane) => (
              <div 
                key={plane.id}
                className="p-2 bg-card border border-border rounded cursor-pointer hover:bg-accent"
                onClick={() => onAircraftSelect?.(plane)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{plane.registration}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    plane.status === 'operational' ? 'bg-operational text-white' :
                    plane.status === 'maintenance' ? 'bg-warning text-white' :
                    'bg-critical text-white'
                  }`}>
                    {plane.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{plane.model}</div>
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Karte wird geladen...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AviationMap;
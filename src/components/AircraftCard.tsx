import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Users, Fuel, MapPin, Settings, Eye } from 'lucide-react';

interface Aircraft {
  id: string;
  model: string;
  registration: string;
  airline: string;
  status: 'operational' | 'maintenance' | 'grounded';
  location: string;
  passengers: number;
  maxPassengers: number;
  fuelLevel: number;
  nextMaintenance: string;
  totalFlightHours: number;
  lastService: string;
}

interface AircraftCardProps {
  aircraft: Aircraft;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

const AircraftCard: React.FC<AircraftCardProps> = ({ aircraft, onEdit, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-operational text-white';
      case 'maintenance':
        return 'bg-warning text-white';
      case 'grounded':
        return 'bg-critical text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operativ';
      case 'maintenance':
        return 'Wartung';
      case 'grounded':
        return 'Am Boden';
      default:
        return status;
    }
  };

  return (
    <Card className="border-border hover:shadow-aircraft transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Plane className="h-5 w-5" />
              {aircraft.registration}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{aircraft.model}</p>
            <p className="text-xs text-muted-foreground">{aircraft.airline}</p>
          </div>
          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(aircraft.status)}`}>
            {getStatusText(aircraft.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Standort:</span>
          <span>{aircraft.location}</span>
        </div>

        {/* Passengers */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Passagiere:</span>
          <span>{aircraft.passengers}/{aircraft.maxPassengers}</span>
          <div className="flex-1 bg-muted rounded-full h-2 ml-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${(aircraft.passengers / aircraft.maxPassengers) * 100}%` }}
            />
          </div>
        </div>

        {/* Fuel Level */}
        <div className="flex items-center gap-2 text-sm">
          <Fuel className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Treibstoff:</span>
          <span>{aircraft.fuelLevel}%</span>
          <div className="flex-1 bg-muted rounded-full h-2 ml-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                aircraft.fuelLevel > 50 ? 'bg-operational' : 
                aircraft.fuelLevel > 20 ? 'bg-warning' : 'bg-critical'
              }`}
              style={{ width: `${aircraft.fuelLevel}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Flugstunden</p>
            <p className="text-sm font-semibold">{aircraft.totalFlightHours.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nächste Wartung</p>
            <p className="text-sm font-semibold">{aircraft.nextMaintenance}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView(aircraft.id)}
          >
            <Eye className="w-4 h-4" />
            Details
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(aircraft.id)}
          >
            <Settings className="w-4 h-4" />
            Bearbeiten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AircraftCard;
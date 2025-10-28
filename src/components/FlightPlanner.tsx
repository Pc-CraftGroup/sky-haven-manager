import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Clock, Euro, Fuel, AlertTriangle } from 'lucide-react';
import { Aircraft as AircraftType, FlightRoute } from '@/hooks/useGameLogic';

interface Airport {
  name: string;
  coordinates: [number, number];
}

interface FlightPlannerProps {
  aircraft: AircraftType[];
  airports: Airport[];
  onStartFlight: (aircraftId: string, route: FlightRoute) => void;
}

const FlightPlanner: React.FC<FlightPlannerProps> = ({ aircraft, airports, onStartFlight }) => {
  const [selectedAircraft, setSelectedAircraft] = useState<string>('');
  const [selectedFromAirport, setSelectedFromAirport] = useState<string>('');
  const [selectedToAirport, setSelectedToAirport] = useState<string>('');

  const availableAircraft = aircraft.filter(a => a.status === 'idle');

  const calculateDistance = (coord1: [number, number], coord2: [number, number]) => {
    const R = 6371; // Earth radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance);
  };

  const generateRoute = (): FlightRoute | null => {
    if (!selectedFromAirport || !selectedToAirport) return null;

    const fromAirport = airports.find(a => a.name === selectedFromAirport);
    const toAirport = airports.find(a => a.name === selectedToAirport);
    
    if (!fromAirport || !toAirport) return null;

    const distance = calculateDistance(fromAirport.coordinates, toAirport.coordinates);
    const duration = Math.max(30, Math.round(distance / 8)); // ~500km/h average speed
    const basePrice = Math.round(distance * 0.5 + Math.random() * 50);

    return {
      id: Date.now().toString(),
      from: selectedFromAirport,
      to: selectedToAirport,
      fromCoordinates: fromAirport.coordinates,
      toCoordinates: toAirport.coordinates,
      distance,
      duration,
      price: basePrice,
      status: 'scheduled',
    };
  };

  const route = generateRoute();
  const selectedPlane = aircraft.find(a => a.id === selectedAircraft);
  const canReachDestination = route && selectedPlane ? route.distance <= (selectedPlane.range || Infinity) : true;

  const handleStartFlight = () => {
    if (!selectedAircraft || !selectedFromAirport || !selectedToAirport || !canReachDestination) return;
    
    const route = generateRoute();
    if (route) {
      onStartFlight(selectedAircraft, route);
      // Reset form
      setSelectedAircraft('');
      setSelectedFromAirport('');
      setSelectedToAirport('');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Flugplanung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aircraft Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Flugzeug auswählen</label>
          <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
            <SelectTrigger>
              <SelectValue placeholder="Verfügbares Flugzeug wählen..." />
            </SelectTrigger>
            <SelectContent>
              {availableAircraft.map((plane) => (
                <SelectItem key={plane.id} value={plane.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{plane.registration} - {plane.model}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={plane.fuelLevel > 50 ? "default" : "destructive"}>
                        <Fuel className="h-3 w-3 mr-1" />
                        {plane.fuelLevel}%
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From Airport */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Von</label>
          <Select value={selectedFromAirport} onValueChange={setSelectedFromAirport}>
            <SelectTrigger>
              <SelectValue placeholder="Startflughafen wählen..." />
            </SelectTrigger>
            <SelectContent>
              {airports.map((airport) => (
                <SelectItem key={airport.name} value={airport.name}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {airport.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To Airport */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nach</label>
          <Select value={selectedToAirport} onValueChange={setSelectedToAirport}>
            <SelectTrigger>
              <SelectValue placeholder="Zielflughafen wählen..." />
            </SelectTrigger>
            <SelectContent>
              {airports.filter(a => a.name !== selectedFromAirport).map((airport) => (
                <SelectItem key={airport.name} value={airport.name}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {airport.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Route Information */}
        {route && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Fluginformationen</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{route.distance} km</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{route.duration} Min</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                <span>€{route.price} pro Passagier</span>
              </div>
              {selectedPlane && selectedPlane.range && (
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  <span>Reichweite: {selectedPlane.range} km</span>
                </div>
              )}
            </div>
            {!canReachDestination && selectedPlane && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Reichweite überschritten!</p>
                    <p className="text-sm text-muted-foreground">
                      Dieses Flugzeug kann nur {selectedPlane.range} km fliegen. Die Strecke beträgt {route.distance} km.
                      Bitte wähle einen Zwischenstopp oder ein anderes Flugzeug.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Start Flight Button */}
        <Button 
          onClick={handleStartFlight} 
          disabled={!selectedAircraft || !selectedFromAirport || !selectedToAirport || !canReachDestination}
          className="w-full"
        >
          <Plane className="h-4 w-4 mr-2" />
          Flug starten
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlightPlanner;
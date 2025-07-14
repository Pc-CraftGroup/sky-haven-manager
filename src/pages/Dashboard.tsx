import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FleetDashboard from '@/components/FleetDashboard';
import AviationMap from '@/components/AviationMap';
import AircraftCard from '@/components/AircraftCard';
import AircraftPurchase from '@/components/AircraftPurchase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plane, Map, ShoppingCart, BarChart3 } from 'lucide-react';

// Sample data - in a real app this would come from a backend/database
const sampleAircraft = [
  {
    id: '1',
    model: 'Airbus A320-200',
    registration: 'D-ABCD',
    airline: 'Meine Airline',
    status: 'operational' as const,
    location: 'Frankfurt am Main (FRA)',
    passengers: 165,
    maxPassengers: 180,
    fuelLevel: 85,
    nextMaintenance: '15.03.2024',
    totalFlightHours: 24580,
    lastService: '01.02.2024',
    position: [50.0379, 8.5622] as [number, number],
  },
  {
    id: '2',
    model: 'Boeing 737-800',
    registration: 'D-EFGH',
    airline: 'Meine Airline',
    status: 'maintenance' as const,
    location: 'München (MUC)',
    passengers: 0,
    maxPassengers: 189,
    fuelLevel: 20,
    nextMaintenance: '28.02.2024',
    totalFlightHours: 31250,
    lastService: '20.01.2024',
    position: [48.3537, 11.7751] as [number, number],
  },
  {
    id: '3',
    model: 'Embraer E190-E2',
    registration: 'D-IJKL',
    airline: 'Meine Airline',
    status: 'operational' as const,
    location: 'Berlin Brandenburg (BER)',
    passengers: 98,
    maxPassengers: 114,
    fuelLevel: 65,
    nextMaintenance: '10.04.2024',
    totalFlightHours: 15890,
    lastService: '12.02.2024',
    position: [52.3667, 13.5033] as [number, number],
  },
];

const Dashboard: React.FC = () => {
  const [aircraft, setAircraft] = useState(sampleAircraft);
  const [selectedAircraft, setSelectedAircraft] = useState<any>(null);
  const [budget] = useState(500000000); // 500 million budget
  const { toast } = useToast();

  const fleetStats = {
    totalAircraft: aircraft.length,
    operational: aircraft.filter(a => a.status === 'operational').length,
    maintenance: aircraft.filter(a => a.status === 'maintenance').length,
    grounded: 0, // Initially no grounded aircraft in our sample data
    totalRevenue: 2850000,
    totalRoutes: 45,
  };

  const handleAddAircraft = () => {
    // This would open a purchase dialog
    toast({
      title: "Flugzeugkauf",
      description: "Wechsle zum Kaufen-Tab um neue Flugzeuge zu erwerben.",
    });
  };

  const handleManageFleet = () => {
    toast({
      title: "Flotten-Verwaltung",
      description: "Erweiterte Verwaltungstools kommen bald.",
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "Analytics",
      description: "Detaillierte Analysen werden entwickelt.",
    });
  };

  const handleAircraftSelect = (selectedPlane: any) => {
    setSelectedAircraft(selectedPlane);
    toast({
      title: "Flugzeug ausgewählt",
      description: `${selectedPlane.registration} - ${selectedPlane.model}`,
    });
  };

  const handleAircraftEdit = (id: string) => {
    toast({
      title: "Flugzeug bearbeiten",
      description: "Bearbeitungs-Interface wird entwickelt.",
    });
  };

  const handleAircraftView = (id: string) => {
    const plane = aircraft.find(a => a.id === id);
    if (plane) {
      setSelectedAircraft(plane);
      toast({
        title: "Flugzeug Details",
        description: `Details für ${plane.registration} angezeigt.`,
      });
    }
  };

  const handlePurchaseAircraft = (aircraftModel: any) => {
    // Generate a new aircraft based on the model
    const newAircraft = {
      id: Date.now().toString(),
      model: `${aircraftModel.manufacturer} ${aircraftModel.model}`,
      registration: `D-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      airline: 'Meine Airline',
      status: 'operational' as const,
      location: 'Frankfurt am Main (FRA)',
      passengers: 0,
      maxPassengers: aircraftModel.maxPassengers,
      fuelLevel: 100,
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
      totalFlightHours: 0,
      lastService: new Date().toLocaleDateString('de-DE'),
      position: [50.0379 + (Math.random() - 0.5) * 0.1, 8.5622 + (Math.random() - 0.5) * 0.1] as [number, number],
    };

    setAircraft([...aircraft, newAircraft]);
    
    toast({
      title: "Flugzeug gekauft!",
      description: `${newAircraft.model} (${newAircraft.registration}) wurde erfolgreich gekauft.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="fleet" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Flotte
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Weltkarte
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Kaufen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FleetDashboard
              stats={fleetStats}
              onAddAircraft={handleAddAircraft}
              onManageFleet={handleManageFleet}
              onViewAnalytics={handleViewAnalytics}
            />
          </TabsContent>

          <TabsContent value="fleet" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Meine Flotte</h2>
              <Button variant="aviation" onClick={handleAddAircraft}>
                <Plane className="w-4 h-4" />
                Neues Flugzeug
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {aircraft.map((plane) => (
                <AircraftCard
                  key={plane.id}
                  aircraft={plane}
                  onEdit={handleAircraftEdit}
                  onView={handleAircraftView}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Globale Übersicht</h2>
              {selectedAircraft && (
                <Card className="bg-gradient-metal border-border">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">Ausgewählt: {selectedAircraft.registration}</p>
                    <p className="text-xs text-muted-foreground">{selectedAircraft.model}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="h-[600px]">
              <AviationMap
                aircraft={aircraft}
                onAircraftSelect={handleAircraftSelect}
              />
            </div>
          </TabsContent>

          <TabsContent value="purchase" className="space-y-6">
            <AircraftPurchase
              budget={budget}
              onPurchase={handlePurchaseAircraft}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
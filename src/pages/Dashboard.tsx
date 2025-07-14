import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FleetDashboard from '@/components/FleetDashboard';
import AviationMap from '@/components/AviationMap';
import AircraftCard from '@/components/AircraftCard';
import AircraftPurchase from '@/components/AircraftPurchase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Plane, Map, ShoppingCart, BarChart3, RotateCcw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [selectedAircraft, setSelectedAircraft] = useState<any>(null);
  const { toast } = useToast();
  const {
    aircraft,
    gameState,
    fleetStats,
    purchaseAircraft,
    refuelAircraft,
    performMaintenance,
    sellAircraft,
    resetGame,
  } = useGameLogic();

  const handleAddAircraft = () => {
    toast({
      title: "Flugzeugkauf",
      description: "Wechsle zum Kaufen-Tab um neue Flugzeuge zu erwerben.",
    });
  };

  const handleManageFleet = () => {
    toast({
      title: "Flotten-Verwaltung",
      description: "Erweiterte Verwaltungstools verfügbar.",
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "Analytics",
      description: `Budget: €${gameState.budget.toLocaleString('de-DE')} | Umsatz: €${gameState.totalRevenue.toLocaleString('de-DE')}`,
    });
  };

  const handleResetGame = () => {
    if (confirm('Möchtest du das Spiel wirklich zurücksetzen? Alle Fortschritte gehen verloren!')) {
      resetGame();
    }
  };

  const handleAircraftSelect = (selectedPlane: any) => {
    setSelectedAircraft(selectedPlane);
    toast({
      title: "Flugzeug ausgewählt",
      description: `${selectedPlane.registration} - ${selectedPlane.model}`,
    });
  };

  const handleAircraftEdit = (id: string) => {
    const plane = aircraft.find(a => a.id === id);
    if (!plane) return;

    const action = prompt(`Was möchtest du mit ${plane.registration} machen?\n1. Tanken\n2. Wartung\n3. Verkaufen\n\nGib 1, 2 oder 3 ein:`);
    
    switch (action) {
      case '1':
        refuelAircraft(id);
        break;
      case '2':
        performMaintenance(id);
        break;
      case '3':
        if (confirm(`Möchtest du ${plane.registration} wirklich verkaufen?`)) {
          sellAircraft(id);
        }
        break;
      default:
        toast({
          title: "Ungültige Auswahl",
          description: "Bitte wähle eine gültige Option (1, 2 oder 3).",
          variant: "destructive",
        });
    }
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
    purchaseAircraft(aircraftModel);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Aviation Management</h1>
            <p className="text-muted-foreground">
              Budget: <span className="font-semibold text-aviation-gold">€{gameState.budget.toLocaleString('de-DE')}</span>
            </p>
          </div>
          <Button onClick={handleResetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4" />
            Spiel zurücksetzen
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </div>
            </TabsTrigger>
            <TabsTrigger value="fleet">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Flotte
              </div>
            </TabsTrigger>
            <TabsTrigger value="map">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Weltkarte
              </div>
            </TabsTrigger>
            <TabsTrigger value="purchase">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Kaufen
              </div>
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
              {aircraft.length > 0 ? aircraft.map((plane) => {
                return (
                  <AircraftCard
                    key={plane.id}
                    aircraft={plane}
                    onEdit={handleAircraftEdit}
                    onView={handleAircraftView}
                  />
                );
              }) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Keine Flugzeuge in der Flotte</p>
                </div>
              )}
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
              budget={gameState.budget}
              onPurchase={handlePurchaseAircraft}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FleetDashboard from '@/components/FleetDashboard';
import AviationMap from '@/components/AviationMap';
import AircraftCard from '@/components/AircraftCard';
import AircraftDetails from '@/components/AircraftDetails';
import AircraftPurchase from '@/components/AircraftPurchase';
import FlightPlanner from '@/components/FlightPlanner';
import AnalyticsDrawer from '@/components/AnalyticsDrawer';
import FleetManagementDrawer from '@/components/FleetManagementDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGameLogic, Aircraft } from '@/hooks/useGameLogic';
import { Plane, Map, ShoppingCart, BarChart3, RotateCcw, Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Dashboard: React.FC = () => {
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [fleetManagementOpen, setFleetManagementOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [airlineSettings] = useLocalStorage<{
    name: string;
    logoText: string;
    primaryColor: string;
    secondaryColor: string;
  }>('airline-settings', {
    name: 'Skyline Airways',
    logoText: 'SKY',
    primaryColor: '#0EA5E9',
    secondaryColor: '#F59E0B',
  });
  const {
    aircraft,
    gameState,
    fleetStats,
    purchaseAircraft,
    refuelAircraft,
    performMaintenance,
    sellAircraft,
    resetGame,
    startFlight,
    worldAirports,
  } = useGameLogic();

  const handleAddAircraft = () => {
    // Switch to purchase tab (already handled in FleetDashboard button)
  };

  const handleManageFleet = () => {
    setFleetManagementOpen(true);
  };

  const handleViewAnalytics = () => {
    setAnalyticsOpen(true);
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
      setDetailsOpen(true);
    }
  };

  const handleEditAircraft = (id: string) => {
    toast({
      title: "Flugzeug bearbeiten",
      description: "Bearbeitungsmodus öffnet sich...",
    });
    // TODO: Implement edit functionality
  };

  const handlePurchaseAircraft = (aircraftModel: any) => {
    purchaseAircraft(aircraftModel);
  };

  return (
    <div className="min-h-screen bg-background">
      <AircraftDetails
        aircraft={selectedAircraft}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onRefuel={refuelAircraft}
        onMaintenance={performMaintenance}
        onSell={sellAircraft}
        onEdit={handleEditAircraft}
      />
      
      <AnalyticsDrawer
        open={analyticsOpen}
        onOpenChange={setAnalyticsOpen}
        gameState={gameState}
        aircraft={aircraft}
      />
      
      <FleetManagementDrawer
        open={fleetManagementOpen}
        onOpenChange={setFleetManagementOpen}
        aircraft={aircraft}
        onRefuel={refuelAircraft}
        onMaintenance={performMaintenance}
        onSell={sellAircraft}
      />
      <div className="container mx-auto p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl font-bold shadow-aircraft"
              style={{
                background: `linear-gradient(135deg, ${airlineSettings.primaryColor}, ${airlineSettings.secondaryColor})`,
                color: 'white',
              }}
            >
              {airlineSettings.logoText.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{airlineSettings.name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Budget: <span className="font-semibold text-aviation-gold">€{gameState.budget.toLocaleString('de-DE')}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={() => navigate('/settings')} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1">Einstellungen</span>
            </Button>
            <Button onClick={handleResetGame} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1">Zurücksetzen</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-6 md:mb-8 h-auto">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="fleet" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Plane className="w-4 h-4" />
                <span className="hidden sm:inline">Flotte</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="planning" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Planung</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Karte</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="purchase" className="text-xs sm:text-sm px-2 py-2 sm:py-2.5">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Kaufen</span>
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

          <TabsContent value="fleet" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Meine Flotte</h2>
              <Button variant="aviation" onClick={handleAddAircraft} className="w-full sm:w-auto">
                <Plane className="w-4 h-4" />
                Neues Flugzeug
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

          <TabsContent value="planning" className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Flugplanung</h2>
            </div>
            
            <div className="flex justify-center px-0 sm:px-4">
              <FlightPlanner
                aircraft={aircraft}
                airports={worldAirports.map(airport => ({
                  name: airport.name,
                  coordinates: airport.coordinates as [number, number]
                }))}
                onStartFlight={startFlight}
              />
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-primary">Globale Übersicht</h2>
              {selectedAircraft && (
                <Card className="bg-gradient-metal border-border w-full sm:w-auto">
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-medium">Ausgewählt: {selectedAircraft.registration}</p>
                    <p className="text-xs text-muted-foreground">{selectedAircraft.model}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="h-[400px] sm:h-[500px] md:h-[600px]">
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
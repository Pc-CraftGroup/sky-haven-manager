import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plane, 
  MapPin, 
  Users,
  Activity,
  Calendar
} from 'lucide-react';
import { GameState, Aircraft } from '@/hooks/useGameLogic';

interface AnalyticsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameState: GameState;
  aircraft: Aircraft[];
}

const AnalyticsDrawer: React.FC<AnalyticsDrawerProps> = ({
  open,
  onOpenChange,
  gameState,
  aircraft,
}) => {
  // Calculate analytics
  const totalAircraftValue = aircraft.reduce((sum, plane) => sum + plane.purchasePrice, 0);
  const totalDailyRevenue = aircraft.reduce((sum, plane) => sum + plane.dailyRevenue, 0);
  const averageCondition = aircraft.length > 0 
    ? aircraft.reduce((sum, plane) => sum + plane.condition, 0) / aircraft.length 
    : 0;
  const averageUtilization = aircraft.length > 0
    ? (aircraft.filter(a => a.status === 'in-flight' || a.status === 'idle').length / aircraft.length) * 100
    : 0;
  
  const flightsInProgress = aircraft.filter(a => a.status === 'in-flight').length;
  const totalFlightHours = aircraft.reduce((sum, plane) => sum + plane.totalFlightHours, 0);
  
  const startDate = new Date(gameState.gameStartDate);
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const profitMargin = totalAircraftValue > 0 
    ? ((gameState.totalRevenue / totalAircraftValue) * 100).toFixed(1)
    : 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-6xl overflow-y-auto p-4 sm:p-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-2xl sm:text-3xl">Analytics Dashboard</DrawerTitle>
            <DrawerDescription>
              Detaillierte Einblicke in deine Airline-Performance
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Financial Overview */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Finanzübersicht</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Aktuelles Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-aviation-gold">
                      €{gameState.budget.toLocaleString('de-DE')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Gesamtumsatz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-operational">
                      €{gameState.totalRevenue.toLocaleString('de-DE')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Tägliche Einnahmen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">
                      €{totalDailyRevenue.toLocaleString('de-DE')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Gewinnmarge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {profitMargin}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Fleet Overview */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Flottenübersicht</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Flottenwert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      €{totalAircraftValue.toLocaleString('de-DE')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Ø Zustand
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {averageCondition.toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Aktive Flüge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">
                      {flightsInProgress}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Auslastung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {averageUtilization.toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Betrieb</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tage im Betrieb
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {daysSinceStart}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Gesamte Flugstunden
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalFlightHours.toLocaleString('de-DE')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Aktive Routen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {gameState.totalRoutes}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">Performance-Indikatoren</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Flotten-Zustand</span>
                        <span className="font-semibold">{averageCondition.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-operational transition-all"
                          style={{ width: `${averageCondition}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Flotten-Auslastung</span>
                        <span className="font-semibold">{averageUtilization.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all"
                          style={{ width: `${averageUtilization}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Reputation</span>
                        <span className="font-semibold">{gameState.reputation}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-aviation-gold transition-all"
                          style={{ width: `${gameState.reputation}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AnalyticsDrawer;

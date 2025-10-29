import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plane, 
  Fuel, 
  Wrench, 
  MapPin, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import { Aircraft } from '@/hooks/useGameLogic';

interface FleetManagementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aircraft: Aircraft[];
  onRefuel: (id: string) => void;
  onMaintenance: (id: string) => void;
  onSell: (id: string) => void;
}

const FleetManagementDrawer: React.FC<FleetManagementDrawerProps> = ({
  open,
  onOpenChange,
  aircraft,
  onRefuel,
  onMaintenance,
  onSell,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'idle' | 'in-flight' | 'maintenance' | 'grounded'>('all');

  const filteredAircraft = selectedFilter === 'all' 
    ? aircraft 
    : aircraft.filter(a => a.status === selectedFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle':
        return <CheckCircle className="w-4 h-4 text-operational" />;
      case 'in-flight':
        return <Plane className="w-4 h-4 text-accent" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-warning" />;
      case 'grounded':
        return <XCircle className="w-4 h-4 text-critical" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-operational/10 text-operational border-operational/20';
      case 'in-flight':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'maintenance':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'grounded':
        return 'bg-critical/10 text-critical border-critical/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Bereit';
      case 'in-flight': return 'Im Flug';
      case 'maintenance': return 'Wartung';
      case 'grounded': return 'Am Boden';
      default: return status;
    }
  };

  const needsMaintenance = aircraft.filter(a => a.condition < 50);
  const needsFuel = aircraft.filter(a => a.fuelLevel < 30);
  const highPerformers = aircraft.filter(a => a.dailyRevenue > 5000);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-6xl overflow-y-auto p-4 sm:p-6">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-2xl sm:text-3xl">Flotten-Verwaltung</DrawerTitle>
            <DrawerDescription>
              Verwalte deine gesamte Flotte an einem Ort
            </DrawerDescription>
          </DrawerHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="aircraft">Flugzeuge</TabsTrigger>
              <TabsTrigger value="alerts">Warnungen</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Gesamtflotte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{aircraft.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Einsatzbereit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-operational">
                      {aircraft.filter(a => a.status === 'idle').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Im Flug</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-accent">
                      {aircraft.filter(a => a.status === 'in-flight').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Wartung nötig</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">
                      {needsMaintenance.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Top-Performer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {highPerformers.length > 0 ? (
                      <div className="space-y-2">
                        {highPerformers.slice(0, 3).map(plane => (
                          <div key={plane.id} className="text-sm">
                            <div className="font-medium">{plane.registration}</div>
                            <div className="text-muted-foreground">
                              €{plane.dailyRevenue.toLocaleString('de-DE')}/Tag
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Keine Daten verfügbar</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Wartung erforderlich
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {needsMaintenance.length > 0 ? (
                      <div className="space-y-2">
                        {needsMaintenance.slice(0, 3).map(plane => (
                          <div key={plane.id} className="text-sm">
                            <div className="font-medium">{plane.registration}</div>
                            <div className="text-warning">Zustand: {plane.condition}%</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-operational">Alle Flugzeuge in gutem Zustand</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Fuel className="w-4 h-4" />
                      Tanken erforderlich
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {needsFuel.length > 0 ? (
                      <div className="space-y-2">
                        {needsFuel.slice(0, 3).map(plane => (
                          <div key={plane.id} className="text-sm">
                            <div className="font-medium">{plane.registration}</div>
                            <div className="text-critical">Treibstoff: {plane.fuelLevel}%</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-operational">Alle Flugzeuge ausreichend betankt</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aircraft List Tab */}
            <TabsContent value="aircraft" className="space-y-4 mt-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  Alle ({aircraft.length})
                </Button>
                <Button
                  variant={selectedFilter === 'idle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('idle')}
                >
                  Bereit ({aircraft.filter(a => a.status === 'idle').length})
                </Button>
                <Button
                  variant={selectedFilter === 'in-flight' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('in-flight')}
                >
                  Im Flug ({aircraft.filter(a => a.status === 'in-flight').length})
                </Button>
                <Button
                  variant={selectedFilter === 'maintenance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('maintenance')}
                >
                  Wartung ({aircraft.filter(a => a.status === 'maintenance').length})
                </Button>
              </div>

              <div className="space-y-3">
                {filteredAircraft.map(plane => (
                  <Card key={plane.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(plane.status)}
                            <span className="font-semibold text-lg">{plane.registration}</span>
                            <Badge variant="outline" className={getStatusColor(plane.status)}>
                              {getStatusText(plane.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Modell:</span>
                              <div className="font-medium">{plane.model}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Standort:</span>
                              <div className="font-medium">{plane.location}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Treibstoff:</span>
                              <div className={`font-medium ${plane.fuelLevel < 30 ? 'text-critical' : ''}`}>
                                {plane.fuelLevel}%
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Zustand:</span>
                              <div className={`font-medium ${plane.condition < 50 ? 'text-warning' : ''}`}>
                                {plane.condition}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRefuel(plane.id)}
                            disabled={plane.status !== 'idle'}
                            className="flex-1 sm:flex-none"
                          >
                            <Fuel className="w-3 h-3 mr-1" />
                            Tanken
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMaintenance(plane.id)}
                            disabled={plane.status !== 'idle'}
                            className="flex-1 sm:flex-none"
                          >
                            <Wrench className="w-3 h-3 mr-1" />
                            Warten
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`${plane.registration} wirklich verkaufen?`)) {
                                onSell(plane.id);
                              }
                            }}
                            className="flex-1 sm:flex-none"
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Verkaufen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredAircraft.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Keine Flugzeuge mit diesem Status gefunden
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4 mt-4">
              <div className="space-y-4">
                {needsMaintenance.length > 0 && (
                  <Card className="border-warning">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-warning" />
                        Wartung erforderlich
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {needsMaintenance.map(plane => (
                          <div key={plane.id} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{plane.registration}</div>
                              <div className="text-sm text-muted-foreground">
                                Zustand: {plane.condition}% - Wartung dringend empfohlen
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMaintenance(plane.id)}
                              disabled={plane.status !== 'idle'}
                            >
                              Warten
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {needsFuel.length > 0 && (
                  <Card className="border-critical">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Fuel className="w-5 h-5 text-critical" />
                        Niedriger Treibstand
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {needsFuel.map(plane => (
                          <div key={plane.id} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{plane.registration}</div>
                              <div className="text-sm text-muted-foreground">
                                Treibstoff: {plane.fuelLevel}% - Tanken erforderlich
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRefuel(plane.id)}
                              disabled={plane.status !== 'idle'}
                            >
                              Tanken
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {needsMaintenance.length === 0 && needsFuel.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-operational mx-auto mb-4" />
                      <p className="text-lg font-semibold">Keine Warnungen</p>
                      <p className="text-muted-foreground">
                        Alle Flugzeuge sind in gutem Zustand
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FleetManagementDrawer;

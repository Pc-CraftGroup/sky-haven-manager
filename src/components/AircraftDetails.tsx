import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Plane,
  MapPin,
  Users,
  Fuel,
  Wrench,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Navigation,
  Armchair,
  Settings,
} from 'lucide-react';
import { Aircraft } from '@/hooks/useGameLogic';
import { CabinVisualizer } from './CabinVisualizer';

interface AircraftDetailsProps {
  aircraft: Aircraft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefuel?: (id: string) => void;
  onMaintenance?: (id: string) => void;
  onSell?: (id: string) => void;
  onEdit?: (id: string) => void;
  onEditCabin?: (id: string) => void;
}

const AircraftDetails: React.FC<AircraftDetailsProps> = ({
  aircraft,
  open,
  onOpenChange,
  onRefuel,
  onMaintenance,
  onSell,
  onEdit,
  onEditCabin,
}) => {
  if (!aircraft) return null;

  // Use aircraft's individual cabin config or fallback
  const cabinConfig = aircraft.cabinConfig || {
    firstClass: 5,
    business: 15,
    premiumEconomy: 20,
    economy: 60,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-operational';
      case 'in-flight':
        return 'bg-accent';
      case 'maintenance':
        return 'bg-warning';
      case 'grounded':
        return 'bg-critical';
      case 'delayed':
        return 'bg-orange-500';
      case 'crashed':
        return 'bg-red-900';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle':
        return 'Bereit';
      case 'in-flight':
        return 'Im Flug';
      case 'maintenance':
        return 'Wartung';
      case 'grounded':
        return 'Am Boden';
      case 'delayed':
        return 'Verspätet';
      case 'crashed':
        return 'Abgestürzt';
      default:
        return status;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Plane className="h-6 w-6" />
            {aircraft.registration}
          </SheetTitle>
          <SheetDescription>
            {aircraft.model} • {aircraft.airline}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Aircraft Image */}
          {aircraft.image && (
            <div className="relative rounded-lg overflow-hidden aspect-video bg-gradient-sky">
              <img
                src={aircraft.image}
                alt={aircraft.model}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(aircraft.status)} text-white`}>
              {getStatusText(aircraft.status)}
            </Badge>
            {aircraft.status === 'delayed' && aircraft.delayReason && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {aircraft.delayReason}
              </span>
            )}
            {aircraft.status === 'crashed' && aircraft.crashReason && (
              <span className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {aircraft.crashReason}
              </span>
            )}
          </div>

          <Separator />

          {/* Location & Position */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Standort & Position
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Aktueller Standort</p>
                <p className="font-medium">{aircraft.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Koordinaten</p>
                <p className="font-medium font-mono text-xs">
                  {aircraft.position[0].toFixed(4)}, {aircraft.position[1].toFixed(4)}
                </p>
              </div>
              {aircraft.range && (
                <>
                  <div>
                    <p className="text-muted-foreground">Maximale Reichweite</p>
                    <p className="font-medium">{aircraft.range.toLocaleString('de-DE')} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reichweite bei {aircraft.fuelLevel}% Treibstoff</p>
                    <p className="font-medium">
                      {Math.round(aircraft.range * (aircraft.fuelLevel / 100)).toLocaleString('de-DE')} km
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Current Flight Route */}
          {aircraft.currentRoute && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Aktuelle Route
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{aircraft.currentRoute.from}</span>
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{aircraft.currentRoute.to}</span>
                  </div>
                  {aircraft.currentRoute.progress !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Fortschritt</span>
                        <span>{aircraft.currentRoute.progress}%</span>
                      </div>
                      <Progress value={aircraft.currentRoute.progress} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Distanz</p>
                      <p className="font-medium">{aircraft.currentRoute.distance} km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dauer</p>
                      <p className="font-medium">{aircraft.currentRoute.duration} min</p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Capacity & Fuel */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Kapazität & Versorgung
            </h3>
            
            {/* Passengers */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Passagiere</span>
                <span className="font-medium">
                  {aircraft.passengers} / {aircraft.maxPassengers}
                </span>
              </div>
              <Progress value={(aircraft.passengers / aircraft.maxPassengers) * 100} />
            </div>

            {/* Fuel */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Fuel className="h-4 w-4" />
                  Treibstoff
                </span>
                <span className="font-medium">{aircraft.fuelLevel}%</span>
              </div>
              <Progress 
                value={aircraft.fuelLevel}
                className={
                  aircraft.fuelLevel > 50 ? '' : 
                  aircraft.fuelLevel > 20 ? '[&>div]:bg-warning' : '[&>div]:bg-critical'
                }
              />
            </div>

            {/* Condition */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Wrench className="h-4 w-4" />
                  Zustand
                </span>
                <span className="font-medium">{aircraft.condition}%</span>
              </div>
              <Progress 
                value={aircraft.condition}
                className={
                  aircraft.condition > 70 ? '[&>div]:bg-operational' : 
                  aircraft.condition > 40 ? '[&>div]:bg-warning' : '[&>div]:bg-critical'
                }
              />
            </div>
          </div>

          <Separator />

          {/* Cabin Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Armchair className="h-5 w-5 text-primary" />
                Kabinenkonfiguration
              </h3>
              {onEditCabin && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onEditCabin(aircraft.id)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
              )}
            </div>
            
            <CabinVisualizer 
              cabinConfig={cabinConfig} 
              maxPassengers={aircraft.maxPassengers}
            />
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statistiken
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Flugstunden
                </p>
                <p className="text-lg font-bold mt-1">
                  {aircraft.totalFlightHours.toLocaleString('de-DE')}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Tagesumsatz
                </p>
                <p className="text-lg font-bold mt-1">
                  €{aircraft.dailyRevenue.toLocaleString('de-DE')}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Kaufpreis
                </p>
                <p className="text-lg font-bold mt-1">
                  €{aircraft.purchasePrice.toLocaleString('de-DE')}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Letzte Wartung
                </p>
                <p className="text-sm font-medium mt-1">{aircraft.lastService}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Maintenance Info */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Wartungsinformationen
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nächste Wartung</span>
                <span className="font-medium">{aircraft.nextMaintenance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Zustand</span>
                <div className="flex items-center gap-2">
                  {aircraft.condition > 70 ? (
                    <CheckCircle2 className="h-4 w-4 text-operational" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className="font-medium">{aircraft.condition}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            {onEdit && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onEdit(aircraft.id)}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Flugzeug bearbeiten
              </Button>
            )}
            {onRefuel && aircraft.fuelLevel < 100 && (
              <Button
                variant="aviation"
                className="w-full"
                onClick={() => onRefuel(aircraft.id)}
              >
                <Fuel className="h-4 w-4" />
                Tanken (€5,000)
              </Button>
            )}
            {onMaintenance && aircraft.condition < 100 && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => onMaintenance(aircraft.id)}
              >
                <Wrench className="h-4 w-4" />
                Wartung durchführen (€15,000)
              </Button>
            )}
            {onSell && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (confirm(`Möchtest du ${aircraft.registration} wirklich verkaufen?`)) {
                    onSell(aircraft.id);
                    onOpenChange(false);
                  }
                }}
              >
                Flugzeug verkaufen (€{Math.floor(aircraft.purchasePrice * 0.6).toLocaleString('de-DE')})
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AircraftDetails;

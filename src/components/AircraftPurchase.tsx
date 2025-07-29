import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Users, Fuel, Wrench, Calendar } from 'lucide-react';
import { aircraftModels } from '@/data/aircraftModels';

interface AircraftPurchaseProps {
  budget: number;
  onPurchase: (aircraftModel: any) => void;
}

const AircraftPurchase: React.FC<AircraftPurchaseProps> = ({ budget, onPurchase }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aircraftModels.map((aircraft) => (
          <Card key={aircraft.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-4 right-4">
              <Badge 
                variant="secondary" 
                className="capitalize"
              >
                {aircraft.category.replace('-', ' ')}
              </Badge>
            </div>
            
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">
                  {aircraft.manufacturer} {aircraft.model}
                </CardTitle>
              </div>
              <CardDescription className="text-sm">
                {aircraft.variant}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{aircraft.maxPassengers} Passagiere</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span>{aircraft.range.toLocaleString()} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span>{aircraft.efficiency}% Effizienz</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{aircraft.yearIntroduced}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(aircraft.price)}
                  </span>
                </div>
                
                <Button 
                  onClick={() => onPurchase(aircraft)}
                  disabled={budget < aircraft.price}
                  className="w-full"
                  variant={budget < aircraft.price ? "outline" : "default"}
                >
                  {budget < aircraft.price ? "Nicht genug Budget" : "Kaufen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AircraftPurchase;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Users, Fuel, DollarSign, Clock, Award } from 'lucide-react';

interface AircraftModel {
  id: string;
  manufacturer: string;
  model: string;
  variant: string;
  price: number;
  maxPassengers: number;
  range: number; // in km
  fuelCapacity: number; // in liters
  cruiseSpeed: number; // in km/h
  category: 'narrow-body' | 'wide-body' | 'regional' | 'cargo';
  yearIntroduced: number;
  efficiency: number; // 1-5 rating
  maintenance: number; // 1-5 rating (lower is better)
  image?: string;
}

const aircraftModels: AircraftModel[] = [
  {
    id: '1',
    manufacturer: 'Airbus',
    model: 'A320',
    variant: 'A320-200',
    price: 101000000,
    maxPassengers: 180,
    range: 6150,
    fuelCapacity: 24210,
    cruiseSpeed: 828,
    category: 'narrow-body',
    yearIntroduced: 1988,
    efficiency: 4,
    maintenance: 3,
  },
  {
    id: '2',
    manufacturer: 'Boeing',
    model: '737',
    variant: '737-800',
    price: 106100000,
    maxPassengers: 189,
    range: 5765,
    fuelCapacity: 26020,
    cruiseSpeed: 842,
    category: 'narrow-body',
    yearIntroduced: 1998,
    efficiency: 4,
    maintenance: 3,
  },
  {
    id: '3',
    manufacturer: 'Airbus',
    model: 'A350',
    variant: 'A350-900',
    price: 317400000,
    maxPassengers: 315,
    range: 15000,
    fuelCapacity: 138000,
    cruiseSpeed: 903,
    category: 'wide-body',
    yearIntroduced: 2015,
    efficiency: 5,
    maintenance: 2,
  },
  {
    id: '4',
    manufacturer: 'Boeing',
    model: '787',
    variant: '787-9',
    price: 292500000,
    maxPassengers: 296,
    range: 14140,
    fuelCapacity: 126206,
    cruiseSpeed: 903,
    category: 'wide-body',
    yearIntroduced: 2014,
    efficiency: 5,
    maintenance: 2,
  },
  {
    id: '5',
    manufacturer: 'Embraer',
    model: 'E190',
    variant: 'E190-E2',
    price: 56300000,
    maxPassengers: 114,
    range: 5278,
    fuelCapacity: 13100,
    cruiseSpeed: 870,
    category: 'regional',
    yearIntroduced: 2018,
    efficiency: 4,
    maintenance: 4,
  },
];

interface AircraftPurchaseProps {
  onPurchase: (aircraftModel: AircraftModel) => void;
  budget: number;
}

const AircraftPurchase: React.FC<AircraftPurchaseProps> = ({ onPurchase, budget }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredAircraft = selectedCategory === 'all' 
    ? aircraftModels 
    : aircraftModels.filter(aircraft => aircraft.category === selectedCategory);

  const canAfford = (price: number) => budget >= price;

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'narrow-body': return 'Schmalrumpf';
      case 'wide-body': return 'Großraumflugzeug';
      case 'regional': return 'Regionaljet';
      case 'cargo': return 'Frachtflugzeug';
      default: return category;
    }
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Flugzeug kaufen</h2>
          <p className="text-muted-foreground">
            Verfügbares Budget: <span className="font-semibold text-aviation-gold">
              €{budget.toLocaleString('de-DE')}
            </span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="narrow-body">Schmalrumpf</TabsTrigger>
          <TabsTrigger value="wide-body">Großraum</TabsTrigger>
          <TabsTrigger value="cargo">Fracht</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {aircraftModels.map((aircraft) => (
              <AircraftModelCard 
                key={aircraft.id} 
                aircraft={aircraft} 
                canAfford={canAfford(aircraft.price)}
                onPurchase={() => onPurchase(aircraft)}
                getCategoryName={getCategoryName}
                getRatingStars={getRatingStars}
              />
            ))}
          </div>
        </TabsContent>

        {['regional', 'narrow-body', 'wide-body', 'cargo'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {aircraftModels
                .filter(aircraft => aircraft.category === category)
                .map((aircraft) => (
                  <AircraftModelCard 
                    key={aircraft.id} 
                    aircraft={aircraft} 
                    canAfford={canAfford(aircraft.price)}
                    onPurchase={() => onPurchase(aircraft)}
                    getCategoryName={getCategoryName}
                    getRatingStars={getRatingStars}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface AircraftModelCardProps {
  aircraft: AircraftModel;
  canAfford: boolean;
  onPurchase: () => void;
  getCategoryName: (category: string) => string;
  getRatingStars: (rating: number) => string;
}

const AircraftModelCard: React.FC<AircraftModelCardProps> = ({
  aircraft,
  canAfford,
  onPurchase,
  getCategoryName,
  getRatingStars,
}) => {
  return (
    <Card className={`border-border hover:shadow-aircraft transition-all duration-300 ${
      !canAfford ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Plane className="h-5 w-5" />
              {aircraft.manufacturer} {aircraft.model}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{aircraft.variant}</p>
          </div>
          <Badge variant="outline">
            {getCategoryName(aircraft.category)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-center gap-2 text-lg font-bold">
          <DollarSign className="h-5 w-5 text-aviation-gold" />
          <span className={canAfford ? 'text-aviation-gold' : 'text-critical'}>
            €{aircraft.price.toLocaleString('de-DE')}
          </span>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{aircraft.maxPassengers} Passagiere</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{aircraft.cruiseSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-muted-foreground" />
            <span>{aircraft.range.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            <span>{aircraft.fuelCapacity.toLocaleString()}L</span>
          </div>
        </div>

        {/* Ratings */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Effizienz:</span>
            <span className="text-aviation-gold">{getRatingStars(aircraft.efficiency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Wartung:</span>
            <span className="text-aviation-gold">{getRatingStars(6 - aircraft.maintenance)}</span>
          </div>
        </div>

        {/* Purchase Button */}
        <Button 
          onClick={onPurchase}
          disabled={!canAfford}
          className="w-full"
          variant={canAfford ? "aviation" : "outline"}
        >
          {canAfford ? 'Kaufen' : 'Zu teuer'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AircraftPurchase;
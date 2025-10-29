import React from 'react';
import { CabinConfiguration } from '@/pages/Settings';
import { Armchair } from 'lucide-react';

interface CabinVisualizerProps {
  cabinConfig: CabinConfiguration;
  maxPassengers: number;
}

// Platzgewichte: First Class braucht am meisten Platz, Economy am wenigsten
const SPACE_WEIGHTS = {
  firstClass: 4,    // First Class = 4x Platz
  business: 2,      // Business = 2x Platz
  premiumEconomy: 1.5, // Premium Economy = 1.5x Platz
  economy: 1        // Economy = 1x Platz (Basis)
};

export const CabinVisualizer: React.FC<CabinVisualizerProps> = ({ cabinConfig, maxPassengers }) => {
  // Berechne die Gesamtgewichtung
  const totalWeight = 
    (cabinConfig.firstClass * SPACE_WEIGHTS.firstClass) +
    (cabinConfig.business * SPACE_WEIGHTS.business) +
    (cabinConfig.premiumEconomy * SPACE_WEIGHTS.premiumEconomy) +
    (cabinConfig.economy * SPACE_WEIGHTS.economy);

  // Berechne tatsächliche Passagierzahlen basierend auf Platzgewichten
  const actualPassengers = {
    firstClass: Math.floor((cabinConfig.firstClass / totalWeight) * maxPassengers / SPACE_WEIGHTS.firstClass),
    business: Math.floor((cabinConfig.business / totalWeight) * maxPassengers / SPACE_WEIGHTS.business),
    premiumEconomy: Math.floor((cabinConfig.premiumEconomy / totalWeight) * maxPassengers / SPACE_WEIGHTS.premiumEconomy),
    economy: Math.floor((cabinConfig.economy / totalWeight) * maxPassengers / SPACE_WEIGHTS.economy),
  };

  const totalActualPassengers = actualPassengers.firstClass + actualPassengers.business + actualPassengers.premiumEconomy + actualPassengers.economy;

  // Generiere visuelle Sitzreihen
  const generateSeats = (count: number, className: string) => {
    const seats = [];
    const seatsPerRow = className === 'first' ? 4 : className === 'business' ? 6 : 8;
    const rows = Math.ceil(count / seatsPerRow);
    
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatIndex = row * seatsPerRow + seat;
        if (seatIndex < count) {
          rowSeats.push(
            <Armchair 
              key={`${className}-${seatIndex}`} 
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                className === 'first' ? 'text-purple-500' :
                className === 'business' ? 'text-blue-500' :
                className === 'premium' ? 'text-green-500' :
                'text-gray-500'
              }`}
            />
          );
        }
      }
      seats.push(
        <div key={`row-${className}-${row}`} className="flex gap-0.5 sm:gap-1 justify-center">
          {rowSeats}
        </div>
      );
    }
    return seats;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">
        Tatsächliche Kapazität: {totalActualPassengers} Passagiere
        <span className="text-muted-foreground ml-2">(von {maxPassengers} max)</span>
      </div>

      <div className="bg-gradient-to-b from-muted/50 to-background border rounded-lg p-4 space-y-3">
        {/* First Class */}
        {actualPassengers.firstClass > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>First Class</span>
              <span className="text-muted-foreground">({actualPassengers.firstClass} Sitze)</span>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-2 space-y-1">
              {generateSeats(actualPassengers.firstClass, 'first')}
            </div>
          </div>
        )}

        {/* Business */}
        {actualPassengers.business > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Business</span>
              <span className="text-muted-foreground">({actualPassengers.business} Sitze)</span>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2 space-y-1">
              {generateSeats(actualPassengers.business, 'business')}
            </div>
          </div>
        )}

        {/* Premium Economy */}
        {actualPassengers.premiumEconomy > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Premium Economy</span>
              <span className="text-muted-foreground">({actualPassengers.premiumEconomy} Sitze)</span>
            </div>
            <div className="bg-green-500/10 rounded-lg p-2 space-y-1">
              {generateSeats(actualPassengers.premiumEconomy, 'premium')}
            </div>
          </div>
        )}

        {/* Economy */}
        {actualPassengers.economy > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Economy</span>
              <span className="text-muted-foreground">({actualPassengers.economy} Sitze)</span>
            </div>
            <div className="bg-gray-500/10 rounded-lg p-2 space-y-1">
              {generateSeats(actualPassengers.economy, 'economy')}
            </div>
          </div>
        )}
      </div>

      {/* Legende */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="font-medium">Platzbedarf pro Klasse:</div>
        <div className="grid grid-cols-2 gap-1">
          <div>• First Class: 4x Platz</div>
          <div>• Business: 2x Platz</div>
          <div>• Premium Economy: 1.5x Platz</div>
          <div>• Economy: 1x Platz</div>
        </div>
      </div>
    </div>
  );
};

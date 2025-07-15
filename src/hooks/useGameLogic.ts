import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from './use-toast';

export interface FlightRoute {
  id: string;
  from: string;
  to: string;
  fromCoordinates: [number, number];
  toCoordinates: [number, number];
  distance: number;
  duration: number; // in minutes
  price: number;
  scheduledDeparture?: string;
  status: 'scheduled' | 'in-flight' | 'completed' | 'cancelled';
  startTime?: string;
  progress?: number; // 0-100
}

export interface Aircraft {
  id: string;
  model: string;
  registration: string;
  airline: string;
  status: 'idle' | 'in-flight' | 'maintenance' | 'grounded';
  location: string;
  passengers: number;
  maxPassengers: number;
  fuelLevel: number;
  nextMaintenance: string;
  totalFlightHours: number;
  lastService: string;
  position: [number, number];
  purchasePrice: number;
  dailyRevenue: number;
  condition: number; // 0-100
  currentRoute?: FlightRoute;
}

export interface GameState {
  budget: number;
  totalRevenue: number;
  totalRoutes: number;
  gameStartDate: string;
  lastUpdateDate: string;
  reputation: number;
}

export interface AircraftModel {
  id: string;
  manufacturer: string;
  model: string;
  variant: string;
  price: number;
  maxPassengers: number;
  range: number;
  fuelCapacity: number;
  cruiseSpeed: number;
  category: 'narrow-body' | 'wide-body' | 'regional' | 'cargo';
  yearIntroduced: number;
  efficiency: number;
  maintenance: number;
}

// German airports with coordinates
const germanAirports = [
  { name: 'Frankfurt am Main (FRA)', coordinates: [50.0379, 8.5622] },
  { name: 'München (MUC)', coordinates: [48.3537, 11.7751] },
  { name: 'Berlin Brandenburg (BER)', coordinates: [52.3667, 13.5033] },
  { name: 'Düsseldorf (DUS)', coordinates: [51.2895, 6.7668] },
  { name: 'Hamburg (HAM)', coordinates: [53.6304, 9.9880] },
  { name: 'Stuttgart (STR)', coordinates: [48.6898, 9.2218] },
  { name: 'Köln/Bonn (CGN)', coordinates: [50.8658, 7.1427] },
  { name: 'Hannover (HAJ)', coordinates: [52.4611, 9.6854] },
];

const initialGameState: GameState = {
  budget: 500000000, // 500 million
  totalRevenue: 0,
  totalRoutes: 0,
  gameStartDate: new Date().toISOString(),
  lastUpdateDate: new Date().toISOString(),
  reputation: 50, // Start with neutral reputation
};

export function useGameLogic() {
  const { toast } = useToast();
  const [aircraft, setAircraft] = useLocalStorage<Aircraft[]>('aviation-aircraft', []);
  const [gameState, setGameState] = useLocalStorage<GameState>('aviation-gamestate', initialGameState);

  // Game tick - runs every minute to simulate time passing
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const lastUpdate = new Date(gameState.lastUpdateDate);
      
      // Validate date - if invalid, reset to now
      if (isNaN(lastUpdate.getTime())) {
        setGameState(current => ({
          ...current,
          lastUpdateDate: now.toISOString(),
        }));
        return;
      }
      
      const timeDiff = now.getTime() - lastUpdate.getTime();
      const minutesPassed = Math.floor(timeDiff / (1000 * 60));

      if (minutesPassed >= 1) {
        updateGameTick(minutesPassed);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [gameState.lastUpdateDate, setGameState]);

  const updateGameTick = useCallback((minutesPassed: number) => {
    setAircraft(currentAircraft => {
      const updatedAircraft = currentAircraft.map(plane => {
        if (plane.status === 'in-flight' && plane.currentRoute) {
          // Update flight progress
          const progressIncrement = (minutesPassed / plane.currentRoute.duration) * 100;
          const newProgress = Math.min(100, (plane.currentRoute.progress || 0) + progressIncrement);
          
          // Calculate new position based on progress
          const fromCoords = plane.currentRoute.fromCoordinates;
          const toCoords = plane.currentRoute.toCoordinates;
          const progressRatio = newProgress / 100;
          
          const newPosition: [number, number] = [
            fromCoords[0] + (toCoords[0] - fromCoords[0]) * progressRatio,
            fromCoords[1] + (toCoords[1] - fromCoords[1]) * progressRatio
          ];

          const fuelConsumption = Math.max(1, plane.passengers / plane.maxPassengers * 2);
          
          // Check if flight is completed
          if (newProgress >= 100) {
            const revenue = plane.currentRoute.price * plane.passengers;
            setGameState(current => ({
              ...current,
              budget: current.budget + revenue,
              totalRevenue: current.totalRevenue + revenue,
            }));

            return {
              ...plane,
              status: 'idle' as const,
              position: toCoords,
              location: plane.currentRoute.to,
              fuelLevel: Math.max(0, plane.fuelLevel - (fuelConsumption * minutesPassed)),
              totalFlightHours: plane.totalFlightHours + (plane.currentRoute.duration / 60),
              condition: Math.max(0, plane.condition - (0.1 * minutesPassed)),
              currentRoute: undefined,
            };
          }
          
          return {
            ...plane,
            position: newPosition,
            fuelLevel: Math.max(0, plane.fuelLevel - (fuelConsumption * minutesPassed)),
            totalFlightHours: plane.totalFlightHours + (minutesPassed / 60),
            condition: Math.max(0, plane.condition - (0.1 * minutesPassed)),
            currentRoute: {
              ...plane.currentRoute,
              progress: newProgress,
            },
          };
        }
        return plane;
      });

      return updatedAircraft;
    });
  }, [setAircraft, setGameState]);

  const purchaseAircraft = useCallback((aircraftModel: AircraftModel) => {
    if (gameState.budget < aircraftModel.price) {
      toast({
        title: "Nicht genug Budget",
        description: "Du hast nicht genug Geld für dieses Flugzeug.",
        variant: "destructive",
      });
      return false;
    }

    const randomAirport = germanAirports[Math.floor(Math.random() * germanAirports.length)];
    
    const newAircraft: Aircraft = {
      id: Date.now().toString(),
      model: `${aircraftModel.manufacturer} ${aircraftModel.model}`,
      registration: `D-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      airline: 'Meine Airline',
      status: 'idle',
      location: randomAirport.name,
      passengers: Math.floor(Math.random() * aircraftModel.maxPassengers * 0.8),
      maxPassengers: aircraftModel.maxPassengers,
      fuelLevel: 100,
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
      totalFlightHours: 0,
      lastService: new Date().toLocaleDateString('de-DE'),
      position: randomAirport.coordinates as [number, number],
      purchasePrice: aircraftModel.price,
      dailyRevenue: aircraftModel.maxPassengers * 200, // Base revenue per passenger
      condition: 100,
    };

    setAircraft(current => [...current, newAircraft]);
    setGameState(current => ({
      ...current,
      budget: current.budget - aircraftModel.price,
      totalRoutes: current.totalRoutes + 1,
    }));

    toast({
      title: "Flugzeug gekauft!",
      description: `${newAircraft.model} (${newAircraft.registration}) wurde erfolgreich gekauft.`,
    });

    return true;
  }, [gameState.budget, setAircraft, setGameState, toast]);

  const refuelAircraft = useCallback((aircraftId: string) => {
    const plane = aircraft.find(a => a.id === aircraftId);
    if (!plane) return;

    const fuelNeeded = 100 - plane.fuelLevel;
    const fuelCost = fuelNeeded * 100; // 100€ per fuel unit

    if (gameState.budget < fuelCost) {
      toast({
        title: "Nicht genug Budget",
        description: "Du hast nicht genug Geld zum Tanken.",
        variant: "destructive",
      });
      return;
    }

    setAircraft(current => 
      current.map(a => 
        a.id === aircraftId 
          ? { ...a, fuelLevel: 100 }
          : a
      )
    );

    setGameState(current => ({
      ...current,
      budget: current.budget - fuelCost,
    }));

    toast({
      title: "Betankung abgeschlossen",
      description: `${plane.registration} wurde für €${fuelCost.toLocaleString('de-DE')} betankt.`,
    });
  }, [aircraft, gameState.budget, setAircraft, setGameState, toast]);

  const performMaintenance = useCallback((aircraftId: string) => {
    const plane = aircraft.find(a => a.id === aircraftId);
    if (!plane) return;

    const maintenanceCost = plane.purchasePrice * 0.02; // 2% of purchase price

    if (gameState.budget < maintenanceCost) {
      toast({
        title: "Nicht genug Budget",
        description: "Du hast nicht genug Geld für die Wartung.",
        variant: "destructive",
      });
      return;
    }

    setAircraft(current => 
      current.map(a => 
        a.id === aircraftId 
          ? { 
              ...a, 
              status: 'maintenance',
              condition: 100,
              lastService: new Date().toLocaleDateString('de-DE'),
              nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
            }
          : a
      )
    );

    setGameState(current => ({
      ...current,
      budget: current.budget - maintenanceCost,
    }));

    toast({
      title: "Wartung gestartet",
      description: `${plane.registration} ist jetzt in der Wartung für €${maintenanceCost.toLocaleString('de-DE')}.`,
    });

    // Auto-complete maintenance after 30 seconds for demo purposes
    setTimeout(() => {
      setAircraft(current => 
        current.map(a => 
          a.id === aircraftId 
            ? { ...a, status: 'idle' }
            : a
        )
      );
      
      toast({
        title: "Wartung abgeschlossen",
        description: `${plane.registration} ist wieder einsatzbereit.`,
      });
    }, 30000);
  }, [aircraft, gameState.budget, setAircraft, setGameState, toast]);

  const sellAircraft = useCallback((aircraftId: string) => {
    const plane = aircraft.find(a => a.id === aircraftId);
    if (!plane) return;

    // Sell for 60-80% of purchase price based on condition
    const sellPrice = Math.floor(plane.purchasePrice * (0.6 + (plane.condition / 100) * 0.2));

    setAircraft(current => current.filter(a => a.id !== aircraftId));
    setGameState(current => ({
      ...current,
      budget: current.budget + sellPrice,
      totalRoutes: Math.max(0, current.totalRoutes - 1),
    }));

    toast({
      title: "Flugzeug verkauft",
      description: `${plane.registration} wurde für €${sellPrice.toLocaleString('de-DE')} verkauft.`,
    });
  }, [aircraft, setAircraft, setGameState, toast]);

  const resetGame = useCallback(() => {
    setAircraft([]);
    setGameState(initialGameState);
    toast({
      title: "Spiel zurückgesetzt",
      description: "Das Spiel wurde auf den Anfangszustand zurückgesetzt.",
    });
  }, [setAircraft, setGameState, toast]);

  const startFlight = useCallback((aircraftId: string, route: FlightRoute) => {
    const plane = aircraft.find(a => a.id === aircraftId);
    if (!plane || plane.status !== 'idle') {
      toast({
        title: "Flug nicht möglich",
        description: "Das Flugzeug ist nicht verfügbar für einen Flug.",
        variant: "destructive",
      });
      return;
    }

    if (plane.fuelLevel < 20) {
      toast({
        title: "Nicht genug Treibstoff",
        description: "Das Flugzeug muss erst betankt werden.",
        variant: "destructive",
      });
      return;
    }

    setAircraft(current => 
      current.map(a => 
        a.id === aircraftId 
          ? { 
              ...a, 
              status: 'in-flight',
              currentRoute: {
                ...route,
                startTime: new Date().toISOString(),
                progress: 0,
              }
            }
          : a
      )
    );

    toast({
      title: "Flug gestartet",
      description: `${plane.registration} fliegt von ${route.from} nach ${route.to}.`,
    });
  }, [aircraft, setAircraft, toast]);

  // Calculate fleet statistics
  const fleetStats = {
    totalAircraft: aircraft.length,
    idle: aircraft.filter(a => a.status === 'idle').length,
    inFlight: aircraft.filter(a => a.status === 'in-flight').length,
    maintenance: aircraft.filter(a => a.status === 'maintenance').length,
    grounded: aircraft.filter(a => a.status === 'grounded').length,
    totalRevenue: gameState.totalRevenue,
    totalRoutes: gameState.totalRoutes,
  };

  return {
    aircraft,
    gameState,
    fleetStats,
    purchaseAircraft,
    refuelAircraft,
    performMaintenance,
    sellAircraft,
    resetGame,
    startFlight,
    germanAirports,
    setAircraft,
    setGameState,
  };
}
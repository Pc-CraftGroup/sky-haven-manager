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
  arrivalTime?: string;
  progress?: number; // 0-100
}

export interface CabinConfiguration {
  firstClass: number;
  business: number;
  premiumEconomy: number;
  economy: number;
}

export interface Aircraft {
  id: string;
  model: string;
  registration: string;
  airline: string;
  status: 'idle' | 'in-flight' | 'maintenance' | 'grounded' | 'delayed' | 'crashed';
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
  image?: string; // Aircraft image URL
  delayReason?: string;
  crashReason?: string;
  range?: number; // Maximum flight range in km
  cabinConfig?: CabinConfiguration; // Individual cabin configuration
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
  image: string;
}

// World airports with coordinates
const worldAirports = [
  // Europe
  { name: 'Frankfurt am Main (FRA)', coordinates: [50.0379, 8.5622] },
  { name: 'München (MUC)', coordinates: [48.3537, 11.7751] },
  { name: 'Berlin Brandenburg (BER)', coordinates: [52.3667, 13.5033] },
  { name: 'London Heathrow (LHR)', coordinates: [51.4700, -0.4543] },
  { name: 'Paris Charles de Gaulle (CDG)', coordinates: [49.0097, 2.5479] },
  { name: 'Amsterdam Schiphol (AMS)', coordinates: [52.3086, 4.7639] },
  { name: 'Madrid Barajas (MAD)', coordinates: [40.4719, -3.5626] },
  { name: 'Rome Fiumicino (FCO)', coordinates: [41.8003, 12.2389] },
  { name: 'Zürich (ZUR)', coordinates: [47.4647, 8.5492] },
  { name: 'Vienna (VIE)', coordinates: [48.1103, 16.5697] },
  
  // North America
  { name: 'New York JFK (JFK)', coordinates: [40.6413, -73.7781] },
  { name: 'Los Angeles (LAX)', coordinates: [33.9425, -118.4081] },
  { name: 'Chicago O\'Hare (ORD)', coordinates: [41.9742, -87.9073] },
  { name: 'Miami (MIA)', coordinates: [25.7617, -80.1918] },
  { name: 'Toronto Pearson (YYZ)', coordinates: [43.6777, -79.6248] },
  { name: 'Vancouver (YVR)', coordinates: [49.1967, -123.1815] },
  { name: 'San Francisco (SFO)', coordinates: [37.6213, -122.3790] },
  { name: 'Denver (DEN)', coordinates: [39.8561, -104.6737] },
  { name: 'Atlanta (ATL)', coordinates: [33.6407, -84.4277] },
  { name: 'Seattle (SEA)', coordinates: [47.4502, -122.3088] },
  
  // Asia
  { name: 'Tokyo Haneda (HND)', coordinates: [35.5494, 139.7798] },
  { name: 'Tokyo Narita (NRT)', coordinates: [35.7720, 140.3929] },
  { name: 'Beijing Capital (PEK)', coordinates: [40.0799, 116.6031] },
  { name: 'Shanghai Pudong (PVG)', coordinates: [31.1443, 121.8083] },
  { name: 'Hong Kong (HKG)', coordinates: [22.3080, 113.9185] },
  { name: 'Singapore Changi (SIN)', coordinates: [1.3644, 103.9915] },
  { name: 'Seoul Incheon (ICN)', coordinates: [37.4602, 126.4407] },
  { name: 'Bangkok Suvarnabhumi (BKK)', coordinates: [13.6900, 100.7501] },
  { name: 'Kuala Lumpur (KUL)', coordinates: [2.7456, 101.7072] },
  { name: 'Mumbai (BOM)', coordinates: [19.0896, 72.8656] },
  { name: 'Delhi (DEL)', coordinates: [28.5562, 77.1000] },
  { name: 'Dubai (DXB)', coordinates: [25.2532, 55.3657] },
  { name: 'Doha (DOH)', coordinates: [25.2731, 51.6080] },
  
  // Australia & Oceania
  { name: 'Sydney Kingsford Smith (SYD)', coordinates: [-33.9399, 151.1753] },
  { name: 'Melbourne (MEL)', coordinates: [-37.6690, 144.8410] },
  { name: 'Brisbane (BNE)', coordinates: [-27.3942, 153.1218] },
  { name: 'Perth (PER)', coordinates: [-31.9403, 115.9669] },
  { name: 'Auckland (AKL)', coordinates: [-37.0082, 174.7850] },
  
  // South America
  { name: 'São Paulo Guarulhos (GRU)', coordinates: [-23.4356, -46.4731] },
  { name: 'Rio de Janeiro Galeão (GIG)', coordinates: [-22.8070, -43.2435] },
  { name: 'Buenos Aires Ezeiza (EZE)', coordinates: [-34.8222, -58.5358] },
  { name: 'Lima Jorge Chávez (LIM)', coordinates: [-12.0219, -77.1143] },
  { name: 'Bogotá El Dorado (BOG)', coordinates: [4.7016, -74.1469] },
  { name: 'Santiago (SCL)', coordinates: [-33.3927, -70.7854] },
  
  // Africa
  { name: 'Johannesburg OR Tambo (JNB)', coordinates: [-26.1367, 28.2411] },
  { name: 'Cape Town (CPT)', coordinates: [-33.9648, 18.6017] },
  { name: 'Cairo (CAI)', coordinates: [30.1219, 31.4056] },
  { name: 'Lagos (LOS)', coordinates: [6.5774, 3.3210] },
  { name: 'Casablanca (CMN)', coordinates: [33.3675, -7.5398] },
  { name: 'Nairobi (NBO)', coordinates: [-1.3192, 36.9278] }
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
    const gameInterval = setInterval(() => {
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

    // Live movement for smooth aircraft animation
    const movementInterval = setInterval(() => {
      updateAircraftPositions();
    }, 5000); // Update positions every 5 seconds

    return () => {
      clearInterval(gameInterval);
      clearInterval(movementInterval);
    };
  }, [gameState.lastUpdateDate, setGameState]);

  const updateAircraftPositions = useCallback(() => {
    setAircraft(currentAircraft => {
      return currentAircraft.map(plane => {
        if (plane.status === 'in-flight' && plane.currentRoute) {
          const now = new Date();
          const startTime = new Date(plane.currentRoute.startTime || now);
          const timeElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60); // minutes
          const progress = Math.min(timeElapsed / plane.currentRoute.duration, 1) * 100;
          
          if (progress >= 100) {
            // Flight completed - will be handled by main game tick
            return plane;
          }
          
          // Calculate current position based on progress
          const fromCoords = plane.currentRoute.fromCoordinates;
          const toCoords = plane.currentRoute.toCoordinates;
          const progressRatio = progress / 100;
          
          const newPosition: [number, number] = [
            fromCoords[0] + (toCoords[0] - fromCoords[0]) * progressRatio,
            fromCoords[1] + (toCoords[1] - fromCoords[1]) * progressRatio
          ];
          
          return {
            ...plane,
            position: newPosition,
            currentRoute: {
              ...plane.currentRoute,
              progress
            }
          };
        }
        return plane;
      });
    });
  }, [setAircraft]);

  const updateGameTick = useCallback((minutesPassed: number) => {
    setAircraft(currentAircraft => {
      const updatedAircraft = currentAircraft.map(plane => {
        if ((plane.status === 'in-flight' || plane.status === 'delayed') && plane.currentRoute) {
          // Random events during flight (only for in-flight aircraft)
          if (plane.status === 'in-flight') {
            const randomEvent = Math.random();
            
            // 2% chance of delay per hour
            if (randomEvent < 0.02 * (minutesPassed / 60) && !plane.delayReason) {
              const delayReasons = [
                'Schlechtes Wetter',
                'Technische Probleme',
                'Luftverkehrskontrolle',
                'Verspäteter Anschlussflug',
                'Crew-Probleme'
              ];
              return {
                ...plane,
                status: 'delayed' as const,
                delayReason: delayReasons[Math.floor(Math.random() * delayReasons.length)]
              };
            }
            
            // 0.1% chance of crash per hour (very rare)
            if (randomEvent < 0.001 * (minutesPassed / 60) && plane.condition < 30) {
              const crashReasons = [
                'Schwerer Sturm',
                'Technisches Versagen',
                'Pilotenfehler',
                'Schlechte Wartung'
              ];
              
              setGameState(current => ({
                ...current,
                reputation: Math.max(0, current.reputation - 20),
                budget: current.budget - plane.purchasePrice * 0.8 // Insurance payout
              }));
              
              return {
                ...plane,
                status: 'crashed' as const,
                crashReason: crashReasons[Math.floor(Math.random() * crashReasons.length)],
                currentRoute: undefined
              };
            }
          }
          
          // Continue with delayed flights after some time
          if (plane.status === 'delayed' && Math.random() < 0.3) {
            return {
              ...plane,
              status: 'in-flight' as const,
              delayReason: undefined
            };
          }
          
          // Normal flight progression for in-flight aircraft
          if (plane.status === 'in-flight') {
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

    const randomAirport = worldAirports[Math.floor(Math.random() * worldAirports.length)];
    
    // Get default cabin config from localStorage or use fallback
    const savedCabinConfig = localStorage.getItem('cabinConfiguration');
    const defaultCabinConfig: CabinConfiguration = savedCabinConfig 
      ? JSON.parse(savedCabinConfig)
      : { firstClass: 5, business: 15, premiumEconomy: 20, economy: 60 };
    
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
      image: aircraftModel.image,
      range: aircraftModel.range,
      cabinConfig: defaultCabinConfig,
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

    const departureTime = new Date();
    const arrivalTime = new Date(departureTime.getTime() + route.duration * 60000);

    setAircraft(current => 
      current.map(a => 
        a.id === aircraftId 
          ? { 
              ...a, 
              status: 'in-flight',
              currentRoute: {
                ...route,
                startTime: departureTime.toISOString(),
                arrivalTime: arrivalTime.toISOString(),
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

  const updateCabinConfig = useCallback((aircraftId: string, config: CabinConfiguration) => {
    setAircraft(current => 
      current.map(a => 
        a.id === aircraftId 
          ? { ...a, cabinConfig: config }
          : a
      )
    );
  }, [setAircraft]);

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
    worldAirports,
    setAircraft,
    setGameState,
    updateCabinConfig,
  };
}
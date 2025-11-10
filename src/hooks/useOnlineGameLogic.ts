import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

// World airports with coordinates
export const worldAirports = [
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

export interface FlightRoute {
  id: string;
  from: string;
  to: string;
  fromCoordinates: [number, number];
  toCoordinates: [number, number];
  distance: number;
  duration: number;
  price: number;
  scheduledDeparture?: string;
  status: 'scheduled' | 'in-flight' | 'completed' | 'cancelled';
  startTime?: string;
  arrivalTime?: string;
  progress?: number;
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
  condition: number;
  currentRoute?: FlightRoute;
  image?: string;
  delayReason?: string;
  crashReason?: string;
  range?: number;
  cabinConfig?: CabinConfiguration;
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

export interface GameState {
  budget: number;
  totalRevenue: number;
  totalRoutes: number;
  gameStartDate: string;
  lastUpdateDate: string;
  reputation: number;
}

export const useOnlineGameLogic = () => {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    budget: 1000000,
    totalRevenue: 0,
    totalRoutes: 0,
    gameStartDate: new Date().toISOString(),
    lastUpdateDate: new Date().toISOString(),
    reputation: 50,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const { toast } = useToast();

  // Get user session
  useEffect(() => {
    let isMounted = true;

    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted) {
        setUserId(session.user.id);
        await fetchUserData(session.user.id);
      }
    };

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && isMounted) {
        setUserId(session.user.id);
        await fetchUserData(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data
  const fetchUserData = async (uid: string) => {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', uid)
        .maybeSingle();

      if (profile) {
        setUsername(profile.username);
      }

      // Get or create game state
      const { data: existingState, error } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (existingState) {
        setGameState({
          budget: Number(existingState.money),
          totalRevenue: Number(existingState.total_revenue),
          totalRoutes: existingState.total_flights,
          gameStartDate: new Date().toISOString(),
          lastUpdateDate: existingState.last_updated,
          reputation: existingState.reputation,
        });
        const fleetData = existingState.fleet as any;
        setAircraft(Array.isArray(fleetData) ? fleetData : []);
      } else if (!error) {
        // Create initial game state only if no error and no data
        const { error: insertError } = await supabase.from('game_states').insert({
          user_id: uid,
          money: 1000000,
          reputation: 50,
          fleet: [],
          total_flights: 0,
          total_revenue: 0,
        });
        
        if (!insertError) {
          // Set initial state after successful insert
          setGameState({
            budget: 1000000,
            totalRevenue: 0,
            totalRoutes: 0,
            gameStartDate: new Date().toISOString(),
            lastUpdateDate: new Date().toISOString(),
            reputation: 50,
          });
          setAircraft([]);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Save game state to database
  const saveGameState = useCallback(async (newAircraft: Aircraft[], newGameState: GameState) => {
    if (!userId) return;

    try {
      await supabase
        .from('game_states')
        .update({
          money: newGameState.budget,
          reputation: newGameState.reputation,
          fleet: JSON.parse(JSON.stringify(newAircraft)),
          total_flights: newGameState.totalRoutes,
          total_revenue: newGameState.totalRevenue,
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [userId]);

  // Sync active flights to database
  const syncActiveFlights = useCallback(async (plane: Aircraft) => {
    if (!userId || !username || !plane.currentRoute) return;

    try {
      if (plane.status === 'in-flight') {
        const { data: existing } = await supabase
          .from('active_flights')
          .select('id')
          .eq('user_id', userId)
          .eq('aircraft_model', plane.model)
          .eq('from_airport', plane.currentRoute.from)
          .eq('to_airport', plane.currentRoute.to)
          .maybeSingle();

        const flightData = {
          user_id: userId,
          username: username,
          aircraft_model: plane.model,
          from_airport: plane.currentRoute.from,
          to_airport: plane.currentRoute.to,
          progress: plane.currentRoute.progress || 0,
          status: plane.status,
          estimated_arrival: plane.currentRoute.arrivalTime,
        };

        if (existing) {
          await supabase
            .from('active_flights')
            .update(flightData)
            .eq('id', existing.id);
        } else {
          await supabase.from('active_flights').insert(flightData);
        }
      } else {
        // Remove from active flights if not in-flight
        await supabase
          .from('active_flights')
          .delete()
          .eq('user_id', userId)
          .eq('aircraft_model', plane.model);
      }
    } catch (error) {
      console.error('Error syncing active flights:', error);
    }
  }, [userId, username]);

  // Game logic - update every minute
  useEffect(() => {
    if (!userId || aircraft.length === 0) return;

    const updateGameTick = async (minutesPassed: number) => {
      setAircraft(currentAircraft => {
        const updatedAircraft = [...currentAircraft];
        let budgetChange = 0;
        let revenueChange = 0;
        let reputationChange = 0;

        // Get flight speed multiplier from settings
        const creativitySettings = JSON.parse(
          localStorage.getItem('creativity-settings') || '{"flightSpeedMultiplier":1}'
        );
        const speedMultiplier = creativitySettings.flightSpeedMultiplier || 1;

        updatedAircraft.forEach((plane) => {
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
                plane.status = 'delayed';
                plane.delayReason = delayReasons[Math.floor(Math.random() * delayReasons.length)];
              }
              
              // 0.1% chance of crash per hour (very rare) if condition is poor
              if (randomEvent < 0.001 * (minutesPassed / 60) && plane.condition < 30) {
                const crashReasons = [
                  'Schwerer Sturm',
                  'Technisches Versagen',
                  'Pilotenfehler',
                  'Schlechte Wartung'
                ];
                
                reputationChange -= 20;
                budgetChange += plane.purchasePrice * 0.8; // Insurance payout
                
                plane.status = 'crashed';
                plane.crashReason = crashReasons[Math.floor(Math.random() * crashReasons.length)];
                plane.currentRoute = undefined;
                
                toast({
                  title: 'Notfall!',
                  description: `${plane.registration} ist abgestürzt: ${plane.crashReason}`,
                  variant: 'destructive',
                });
                
                return;
              }
            }
            
            // Continue with delayed flights after some time
            if (plane.status === 'delayed' && Math.random() < 0.3) {
              plane.status = 'in-flight';
              plane.delayReason = undefined;
            }
            
            // Normal flight progression for in-flight aircraft
            if (plane.status === 'in-flight') {
              const effectiveDuration = plane.currentRoute.duration / speedMultiplier;
              const progressIncrement = (minutesPassed / effectiveDuration) * 100;
              const newProgress = Math.min(100, (plane.currentRoute.progress || 0) + progressIncrement);

              // Calculate new position based on progress
              const fromCoords = plane.currentRoute.fromCoordinates;
              const toCoords = plane.currentRoute.toCoordinates;
              const progressRatio = newProgress / 100;
              
              const newPosition: [number, number] = [
                fromCoords[0] + (toCoords[0] - fromCoords[0]) * progressRatio,
                fromCoords[1] + (toCoords[1] - fromCoords[1]) * progressRatio
              ];

              plane.currentRoute.progress = newProgress;
              plane.position = newPosition;

              const fuelConsumption = Math.max(1, plane.passengers / plane.maxPassengers * 2);
              plane.fuelLevel = Math.max(0, plane.fuelLevel - (fuelConsumption * minutesPassed));
              plane.totalFlightHours += (minutesPassed / 60);
              plane.condition = Math.max(0, plane.condition - (0.1 * minutesPassed));

              if (newProgress >= 100) {
                // Flight completed
                plane.status = 'idle';
                plane.location = plane.currentRoute.to;
                plane.position = toCoords;
                
                const revenue = plane.currentRoute.price * plane.passengers;
                budgetChange += revenue;
                revenueChange += revenue;
                
                toast({
                  title: 'Flug abgeschlossen!',
                  description: `${plane.registration} ist in ${plane.currentRoute.to} angekommen. Umsatz: €${revenue.toLocaleString('de-DE')}`,
                });

                plane.currentRoute = undefined;
              }

              // Sync to active_flights table
              syncActiveFlights(plane);
            }
          }

          // Daily operations cost
          const dailyCost = plane.purchasePrice * 0.001;
          budgetChange -= (dailyCost * minutesPassed) / (24 * 60);
        });

        setGameState(currentState => {
          const newState = {
            ...currentState,
            budget: currentState.budget + budgetChange,
            totalRevenue: currentState.totalRevenue + revenueChange,
            reputation: Math.max(0, Math.min(100, currentState.reputation + reputationChange)),
            lastUpdateDate: new Date().toISOString(),
          };
          
          saveGameState(updatedAircraft, newState);
          return newState;
        });

        return updatedAircraft;
      });
    };

    // Update every minute
    const interval = setInterval(() => {
      updateGameTick(1);
    }, 60000);

    // Live movement for smooth aircraft animation
    const movementInterval = setInterval(() => {
      setAircraft(currentAircraft => {
        return currentAircraft.map(plane => {
          if (plane.status === 'in-flight' && plane.currentRoute) {
            const now = new Date();
            const startTime = new Date(plane.currentRoute.startTime || now);
            const timeElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60);
            const progress = Math.min(timeElapsed / plane.currentRoute.duration, 1) * 100;
            
            if (progress >= 100) {
              return plane;
            }
            
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
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(movementInterval);
    };
  }, [userId, toast, saveGameState, syncActiveFlights]);

  const purchaseAircraft = useCallback(
    async (aircraftModel: AircraftModel) => {
      let canPurchase = false;
      let newAircraftObj: Aircraft | null = null;

      setGameState(currentState => {
        if (currentState.budget < aircraftModel.price) {
          toast({
            title: 'Nicht genug Budget',
            description: 'Du hast nicht genug Geld für dieses Flugzeug.',
            variant: 'destructive',
          });
          return currentState;
        }

        canPurchase = true;
        
        const randomAirport = worldAirports[Math.floor(Math.random() * worldAirports.length)];
        
        // Get default cabin config from localStorage or use fallback
        const savedCabinConfig = localStorage.getItem('cabinConfiguration');
        const defaultCabinConfig: CabinConfiguration = savedCabinConfig 
          ? JSON.parse(savedCabinConfig)
          : { firstClass: 5, business: 15, premiumEconomy: 20, economy: 60 };

        newAircraftObj = {
          id: `aircraft-${Date.now()}`,
          model: `${aircraftModel.manufacturer} ${aircraftModel.model}`,
          registration: `D-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
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
          dailyRevenue: aircraftModel.maxPassengers * 200,
          condition: 100,
          range: aircraftModel.range,
          image: aircraftModel.image,
          cabinConfig: defaultCabinConfig,
        };

        const newState = {
          ...currentState,
          budget: currentState.budget - aircraftModel.price,
          totalRoutes: currentState.totalRoutes + 1,
        };

        if (newAircraftObj) {
          setAircraft(currentAircraft => {
            const updatedAircraft = [...currentAircraft, newAircraftObj!];
            saveGameState(updatedAircraft, newState);
            return updatedAircraft;
          });

          toast({
            title: 'Flugzeug gekauft!',
            description: `${newAircraftObj.model} (${newAircraftObj.registration}) wurde erfolgreich gekauft.`,
          });
        }

        return newState;
      });

      return canPurchase;
    },
    [toast, saveGameState]
  );

  const startFlight = useCallback(
    async (
      aircraftId: string,
      route: {
        from: string;
        to: string;
        fromCoordinates: [number, number];
        toCoordinates: [number, number];
        distance: number;
        duration: number;
        price: number;
      }
    ) => {
      setAircraft(currentAircraft => {
        const updatedAircraft = currentAircraft.map((plane) => {
          if (plane.id === aircraftId) {
            return {
              ...plane,
              status: 'in-flight' as const,
              currentRoute: {
                id: `route-${Date.now()}`,
                ...route,
                status: 'in-flight' as const,
                startTime: new Date().toISOString(),
                arrivalTime: new Date(Date.now() + route.duration * 60000).toISOString(),
                progress: 0,
              },
            };
          }
          return plane;
        });

        setGameState(currentState => {
          const newState = {
            ...currentState,
            totalRoutes: currentState.totalRoutes + 1,
          };

          saveGameState(updatedAircraft, newState);
          return newState;
        });

        // Sync to active flights
        const plane = updatedAircraft.find((p) => p.id === aircraftId);
        if (plane) {
          syncActiveFlights(plane);
        }

        toast({
          title: 'Flug gestartet!',
          description: `Flug von ${route.from} nach ${route.to} hat begonnen.`,
        });

        return updatedAircraft;
      });
    },
    [toast, saveGameState, syncActiveFlights]
  );

  const refuelAircraft = useCallback(async (aircraftId: string) => {
    setAircraft(currentAircraft => {
      const plane = currentAircraft.find(a => a.id === aircraftId);
      if (!plane) return currentAircraft;

      const fuelNeeded = 100 - plane.fuelLevel;
      const fuelCost = fuelNeeded * 100;

      let canRefuel = false;

      setGameState(currentState => {
        if (currentState.budget < fuelCost) {
          toast({
            title: 'Nicht genug Budget',
            description: 'Du hast nicht genug Geld zum Tanken.',
            variant: 'destructive',
          });
          return currentState;
        }

        canRefuel = true;

        const newState = {
          ...currentState,
          budget: currentState.budget - fuelCost,
        };

        const updatedAircraft = currentAircraft.map(a =>
          a.id === aircraftId ? { ...a, fuelLevel: 100 } : a
        );

        saveGameState(updatedAircraft, newState);

        toast({
          title: 'Betankung abgeschlossen',
          description: `${plane.registration} wurde für €${fuelCost.toLocaleString('de-DE')} betankt.`,
        });

        return newState;
      });

      if (canRefuel) {
        return currentAircraft.map(a =>
          a.id === aircraftId ? { ...a, fuelLevel: 100 } : a
        );
      }

      return currentAircraft;
    });
  }, [toast, saveGameState]);

  const performMaintenance = useCallback(async (aircraftId: string) => {
    setAircraft(currentAircraft => {
      const plane = currentAircraft.find(a => a.id === aircraftId);
      if (!plane) return currentAircraft;

      const maintenanceCost = plane.purchasePrice * 0.02;
      let canMaintain = false;

      setGameState(currentState => {
        if (currentState.budget < maintenanceCost) {
          toast({
            title: 'Nicht genug Budget',
            description: 'Du hast nicht genug Geld für die Wartung.',
            variant: 'destructive',
          });
          return currentState;
        }

        canMaintain = true;

        const newState = {
          ...currentState,
          budget: currentState.budget - maintenanceCost,
        };

        const updatedAircraft = currentAircraft.map(a =>
          a.id === aircraftId
            ? {
                ...a,
                status: 'maintenance' as const,
                condition: 100,
                lastService: new Date().toLocaleDateString('de-DE'),
                nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
              }
            : a
        );

        saveGameState(updatedAircraft, newState);

        toast({
          title: 'Wartung gestartet',
          description: `${plane.registration} ist jetzt in der Wartung für €${maintenanceCost.toLocaleString('de-DE')}.`,
        });

        setTimeout(() => {
          setAircraft(current => {
            const completed = current.map(a =>
              a.id === aircraftId ? { ...a, status: 'idle' as const } : a
            );
            saveGameState(completed, newState);

            toast({
              title: 'Wartung abgeschlossen',
              description: `${plane.registration} ist wieder einsatzbereit.`,
            });

            return completed;
          });
        }, 30000);

        return newState;
      });

      if (canMaintain) {
        return currentAircraft.map(a =>
          a.id === aircraftId
            ? {
                ...a,
                status: 'maintenance' as const,
                condition: 100,
                lastService: new Date().toLocaleDateString('de-DE'),
                nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
              }
            : a
        );
      }

      return currentAircraft;
    });
  }, [toast, saveGameState]);

  const sellAircraft = useCallback(async (aircraftId: string) => {
    setAircraft(currentAircraft => {
      const plane = currentAircraft.find(a => a.id === aircraftId);
      if (!plane) return currentAircraft;

      const sellPrice = Math.floor(plane.purchasePrice * (0.6 + (plane.condition / 100) * 0.2));

      const updatedAircraft = currentAircraft.filter(a => a.id !== aircraftId);

      setGameState(currentState => {
        const newState = {
          ...currentState,
          budget: currentState.budget + sellPrice,
          totalRoutes: Math.max(0, currentState.totalRoutes - 1),
        };

        saveGameState(updatedAircraft, newState);

        toast({
          title: 'Flugzeug verkauft',
          description: `${plane.registration} wurde für €${sellPrice.toLocaleString('de-DE')} verkauft.`,
        });

        return newState;
      });

      return updatedAircraft;
    });
  }, [toast, saveGameState]);

  const resetGame = useCallback(async () => {
    if (!userId) return;

    const initialState = {
      budget: 1000000,
      totalRevenue: 0,
      totalRoutes: 0,
      gameStartDate: new Date().toISOString(),
      lastUpdateDate: new Date().toISOString(),
      reputation: 50,
    };

    setAircraft([]);
    setGameState(initialState);

    await supabase
      .from('game_states')
      .update({
        money: 1000000,
        reputation: 50,
        fleet: [],
        total_flights: 0,
        total_revenue: 0,
      })
      .eq('user_id', userId);

    toast({
      title: 'Spiel zurückgesetzt',
      description: 'Das Spiel wurde auf den Anfangszustand zurückgesetzt.',
    });
  }, [userId, toast]);

  const updateCabinConfig = useCallback(async (aircraftId: string, config: CabinConfiguration) => {
    setAircraft(currentAircraft => {
      const updatedAircraft = currentAircraft.map(a =>
        a.id === aircraftId ? { ...a, cabinConfig: config } : a
      );

      setGameState(currentState => {
        saveGameState(updatedAircraft, currentState);
        return currentState;
      });

      return updatedAircraft;
    });
  }, [saveGameState]);

  const updateBudget = useCallback(async (amount: number) => {
    setGameState(currentState => {
      const newState = {
        ...currentState,
        budget: currentState.budget + amount,
        totalRevenue: amount > 0 ? currentState.totalRevenue + amount : currentState.totalRevenue,
      };

      setAircraft(currentAircraft => {
        saveGameState(currentAircraft, newState);
        return currentAircraft;
      });

      return newState;
    });
  }, [saveGameState]);
  
  const fleetStats = {
    totalAircraft: aircraft.length,
    idle: aircraft.filter((a) => a.status === 'idle').length,
    inFlight: aircraft.filter((a) => a.status === 'in-flight').length,
    maintenance: aircraft.filter((a) => a.status === 'maintenance').length,
    grounded: aircraft.filter((a) => a.status === 'grounded').length,
    totalRevenue: gameState.totalRevenue,
    totalRoutes: gameState.totalRoutes,
  };

  return {
    aircraft,
    gameState,
    fleetStats,
    purchaseAircraft,
    startFlight,
    refuelAircraft,
    performMaintenance,
    sellAircraft,
    resetGame,
    updateCabinConfig,
    updateBudget,
    worldAirports,
    setAircraft,
    setGameState,
  };
};

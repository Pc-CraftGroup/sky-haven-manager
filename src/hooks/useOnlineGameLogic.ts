import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        fetchUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user data
  const fetchUserData = async (uid: string) => {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', uid)
        .single();

      if (profile) {
        setUsername(profile.username);
      }

      // Get or create game state
      const { data: existingState } = await supabase
        .from('game_states')
        .select('*')
        .eq('user_id', uid)
        .single();

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
      } else {
        // Create initial game state
        await supabase.from('game_states').insert({
          user_id: uid,
          money: 1000000,
          reputation: 50,
          fleet: [],
          total_flights: 0,
          total_revenue: 0,
        });
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
          .single();

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
    const updateGameTick = async (minutesPassed: number) => {
      const updatedAircraft = [...aircraft];
      let budgetChange = 0;
      let revenueChange = 0;

      // Get flight speed multiplier from settings
      const creativitySettings = JSON.parse(
        localStorage.getItem('creativity-settings') || '{"flightSpeedMultiplier":1}'
      );
      const speedMultiplier = creativitySettings.flightSpeedMultiplier || 1;

      updatedAircraft.forEach((plane) => {
        if (plane.status === 'in-flight' && plane.currentRoute) {
          const effectiveDuration = plane.currentRoute.duration / speedMultiplier;
          const progressIncrement = (minutesPassed / effectiveDuration) * 100;
          const newProgress = Math.min(100, (plane.currentRoute.progress || 0) + progressIncrement);

          plane.currentRoute.progress = newProgress;

          if (newProgress >= 100) {
            // Flight completed
            plane.status = 'idle';
            plane.location = plane.currentRoute.to;
            plane.position = plane.currentRoute.toCoordinates;
            
            const revenue = plane.currentRoute.price;
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

        // Daily operations cost
        const dailyCost = plane.purchasePrice * 0.001;
        budgetChange -= (dailyCost * minutesPassed) / (24 * 60);
      });

      const newGameState = {
        ...gameState,
        budget: gameState.budget + budgetChange,
        totalRevenue: gameState.totalRevenue + revenueChange,
        lastUpdateDate: new Date().toISOString(),
      };

      setAircraft(updatedAircraft);
      setGameState(newGameState);
      await saveGameState(updatedAircraft, newGameState);
    };

    // Check for offline progress on mount
    const lastUpdate = new Date(gameState.lastUpdateDate);
    const now = new Date();
    const minutesPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);

    if (minutesPassed >= 5) {
      updateGameTick(minutesPassed);
      toast({
        title: 'Offline-Fortschritt',
        description: `${minutesPassed} Minuten vergangen. Spiel wurde aktualisiert.`,
      });
    }

    // Update every minute
    const interval = setInterval(() => {
      updateGameTick(1);
    }, 60000);

    return () => clearInterval(interval);
  }, [aircraft, gameState, toast, saveGameState, syncActiveFlights]);

  const purchaseAircraft = useCallback(
    async (model: string, price: number, maxPassengers: number, range: number, image: string) => {
      if (gameState.budget < price) {
        toast({
          title: 'Nicht genug Budget',
          description: 'Du hast nicht genug Geld für diesen Kauf.',
          variant: 'destructive',
        });
        return;
      }

      const newAircraft: Aircraft = {
        id: `aircraft-${Date.now()}`,
        model,
        registration: `D-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        airline: 'My Airline',
        status: 'idle',
        location: 'Frankfurt am Main (FRA)',
        passengers: 0,
        maxPassengers,
        fuelLevel: 100,
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalFlightHours: 0,
        lastService: new Date().toISOString(),
        position: [50.0379, 8.5622],
        purchasePrice: price,
        dailyRevenue: 0,
        condition: 100,
        range,
        image,
        cabinConfig: {
          firstClass: Math.floor(maxPassengers * 0.05),
          business: Math.floor(maxPassengers * 0.15),
          premiumEconomy: Math.floor(maxPassengers * 0.20),
          economy: Math.floor(maxPassengers * 0.60),
        },
      };

      const updatedAircraft = [...aircraft, newAircraft];
      const newGameState = {
        ...gameState,
        budget: gameState.budget - price,
      };

      setAircraft(updatedAircraft);
      setGameState(newGameState);
      await saveGameState(updatedAircraft, newGameState);

      toast({
        title: 'Flugzeug gekauft!',
        description: `${model} (${newAircraft.registration}) wurde deiner Flotte hinzugefügt.`,
      });
    },
    [aircraft, gameState, toast, saveGameState]
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
      const updatedAircraft = aircraft.map((plane) => {
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

      const newGameState = {
        ...gameState,
        totalRoutes: gameState.totalRoutes + 1,
      };

      setAircraft(updatedAircraft);
      setGameState(newGameState);
      await saveGameState(updatedAircraft, newGameState);

      // Sync to active flights
      const plane = updatedAircraft.find((p) => p.id === aircraftId);
      if (plane) {
        await syncActiveFlights(plane);
      }

      toast({
        title: 'Flug gestartet!',
        description: `Flug von ${route.from} nach ${route.to} hat begonnen.`,
      });
    },
    [aircraft, gameState, toast, saveGameState, syncActiveFlights]
  );

  const fleetStats = {
    totalAircraft: aircraft.length,
    activeFlights: aircraft.filter((a) => a.status === 'in-flight').length,
    totalRevenue: gameState.totalRevenue,
    totalRoutes: gameState.totalRoutes,
  };

  return {
    aircraft,
    gameState,
    fleetStats,
    purchaseAircraft,
    startFlight,
  };
};

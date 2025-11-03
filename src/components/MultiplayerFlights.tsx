import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ActiveFlight {
  id: string;
  username: string;
  aircraft_model: string;
  from_airport: string;
  to_airport: string;
  progress: number;
  status: string;
  started_at: string;
  estimated_arrival: string | null;
}

const MultiplayerFlights = () => {
  const [flights, setFlights] = useState<ActiveFlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFlights();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('active-flights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_flights',
        },
        () => {
          fetchActiveFlights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveFlights = async () => {
    try {
      const { data, error } = await supabase
        .from('active_flights')
        .select('*')
        .eq('status', 'in-flight')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setFlights(data || []);
    } catch (error) {
      console.error('Error fetching active flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-flight':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Live Flüge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Lädt aktive Flüge...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5 animate-pulse" />
          Live Flüge
        </CardTitle>
        <CardDescription>
          Aktive Flüge aller Spieler in Echtzeit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {flights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine aktiven Flüge im Moment
            </div>
          ) : (
            flights.map((flight) => (
              <div
                key={flight.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {flight.username}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {flight.aircraft_model}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate">{flight.from_airport}</span>
                      <Plane className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="font-medium truncate">{flight.to_airport}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Fortschritt</span>
                        <span>{Math.round(flight.progress)}%</span>
                      </div>
                      <Progress value={flight.progress} className="h-2" />
                      
                      {flight.estimated_arrival && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Gestartet: {formatTime(flight.started_at)}</span>
                          <span>Ankunft: {formatTime(flight.estimated_arrival)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`w-2 h-2 rounded-full ${getStatusColor(flight.status)} flex-shrink-0 mt-2`} />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiplayerFlights;

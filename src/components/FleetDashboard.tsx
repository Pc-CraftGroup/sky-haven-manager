import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Plus, Settings, BarChart3, Globe } from 'lucide-react';

interface FleetStats {
  totalAircraft: number;
  idle: number;
  inFlight: number;
  maintenance: number;
  grounded: number;
  totalRevenue: number;
  totalRoutes: number;
}

interface FleetDashboardProps {
  stats: FleetStats;
  onAddAircraft: () => void;
  onManageFleet: () => void;
  onViewAnalytics: () => void;
}

const FleetDashboard: React.FC<FleetDashboardProps> = ({
  stats,
  onAddAircraft,
  onManageFleet,
  onViewAnalytics,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Aviation Management</h1>
          <p className="text-muted-foreground mt-1">
            Verwalte deine Flotte und überwache globale Operationen
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onViewAnalytics} variant="outline" size="lg">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
          <Button onClick={onManageFleet} variant="secondary" size="lg">
            <Settings className="w-4 h-4" />
            Flotten-Verwaltung
          </Button>
          <Button onClick={onAddAircraft} variant="aviation" size="lg">
            <Plus className="w-4 h-4" />
            Flugzeug kaufen
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-metal border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamte Flotte
            </CardTitle>
            <Plane className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalAircraft}</div>
            <p className="text-xs text-muted-foreground">
              Flugzeuge in deiner Flotte
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bereit/Im Flug
            </CardTitle>
            <div className="h-3 w-3 rounded-full bg-operational"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-operational">{stats.idle + stats.inFlight}</div>
            <p className="text-xs text-muted-foreground">
              Verfügbare Flugzeuge
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wartung
            </CardTitle>
            <div className="h-3 w-3 rounded-full bg-warning"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              In Wartung
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Am Boden
            </CardTitle>
            <div className="h-3 w-3 rounded-full bg-critical"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{stats.grounded}</div>
            <p className="text-xs text-muted-foreground">
              Nicht verfügbar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Routes Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-aviation-gold" />
              Monatlicher Umsatz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aviation-gold">
              €{stats.totalRevenue.toLocaleString('de-DE')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              +12% gegenüber letztem Monat
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              Aktive Routen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {stats.totalRoutes}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Weltweite Verbindungen
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetDashboard;
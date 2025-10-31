import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Flame,
  Zap,
  Cloud,
  DollarSign,
  Globe,
  Radio,
  Target,
  Shield,
  Plane
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorldCrisis {
  id: string;
  type: 'economic' | 'weather' | 'political' | 'pandemic' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    fuelPriceMultiplier: number;
    routeAvailability: number; // percentage
    passengerDemand: number; // percentage
    maintenanceCost: number; // percentage
  };
  duration: number; // minutes
  startTime: number;
  region?: string;
}

interface NewsItem {
  id: string;
  headline: string;
  timestamp: number;
  type: 'breaking' | 'update' | 'warning' | 'opportunity';
  icon: string;
}

interface MarketIndicator {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface WorldCrisisSystemProps {
  budget: number;
  onBudgetChange: (amount: number) => void;
  onCrisisImpact: (impact: any) => void;
}

const WorldCrisisSystem: React.FC<WorldCrisisSystemProps> = ({
  budget,
  onBudgetChange,
  onCrisisImpact,
}) => {
  const { toast } = useToast();
  const [activeCrises, setActiveCrises] = useState<WorldCrisis[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [marketIndicators, setMarketIndicators] = useState<MarketIndicator[]>([
    { name: 'Ölpreis', value: 85, change: 0, trend: 'stable' },
    { name: 'Passagier-Nachfrage', value: 100, change: 0, trend: 'stable' },
    { name: 'Wartungskosten', value: 100, change: 0, trend: 'stable' },
    { name: 'Konkurrenz-Index', value: 50, change: 0, trend: 'stable' },
  ]);

  const crisisTemplates: Omit<WorldCrisis, 'id' | 'startTime'>[] = [
    {
      type: 'economic',
      severity: 'high',
      title: '🛢️ Globale Ölkrise',
      description: 'OPEC kündigt drastische Produktionskürzungen an. Treibstoffpreise explodieren!',
      impact: {
        fuelPriceMultiplier: 2.5,
        routeAvailability: 100,
        passengerDemand: 85,
        maintenanceCost: 100,
      },
      duration: 15,
    },
    {
      type: 'weather',
      severity: 'critical',
      title: '🌋 Vulkanausbruch in Island',
      description: 'Massive Aschewolke legt europäischen Luftraum lahm!',
      impact: {
        fuelPriceMultiplier: 1.0,
        routeAvailability: 30,
        passengerDemand: 50,
        maintenanceCost: 150,
      },
      duration: 10,
      region: 'Europa',
    },
    {
      type: 'pandemic',
      severity: 'critical',
      title: '🦠 Neue Virus-Variante',
      description: 'WHO warnt vor neuer hochansteckender Variante. Reisebeschränkungen weltweit!',
      impact: {
        fuelPriceMultiplier: 0.7,
        routeAvailability: 40,
        passengerDemand: 25,
        maintenanceCost: 100,
      },
      duration: 20,
    },
    {
      type: 'political',
      severity: 'medium',
      title: '⚔️ Luftraum-Konflikt',
      description: 'Internationale Spannungen führen zu gesperrten Luftkorridoren.',
      impact: {
        fuelPriceMultiplier: 1.3,
        routeAvailability: 65,
        passengerDemand: 80,
        maintenanceCost: 100,
      },
      duration: 12,
      region: 'Naher Osten',
    },
    {
      type: 'weather',
      severity: 'high',
      title: '🌪️ Super-Hurrikan',
      description: 'Kategorie 5 Hurrikan bedroht Karibik und Südostküste der USA!',
      impact: {
        fuelPriceMultiplier: 1.0,
        routeAvailability: 50,
        passengerDemand: 60,
        maintenanceCost: 120,
      },
      duration: 8,
      region: 'Nordamerika',
    },
    {
      type: 'technical',
      severity: 'medium',
      title: '💻 Cyber-Attacke',
      description: 'Globale Flugsicherungssysteme unter Cyberangriff!',
      impact: {
        fuelPriceMultiplier: 1.0,
        routeAvailability: 70,
        passengerDemand: 90,
        maintenanceCost: 130,
      },
      duration: 6,
    },
    {
      type: 'economic',
      severity: 'low',
      title: '📈 Wirtschaftsboom',
      description: 'Starkes Wirtschaftswachstum steigert Reisenachfrage dramatisch!',
      impact: {
        fuelPriceMultiplier: 1.2,
        routeAvailability: 100,
        passengerDemand: 150,
        maintenanceCost: 100,
      },
      duration: 25,
    },
    {
      type: 'political',
      severity: 'low',
      title: '🤝 Neue Handelsabkommen',
      description: 'Internationale Abkommen erleichtern Flugverkehr und senken Kosten!',
      impact: {
        fuelPriceMultiplier: 0.85,
        routeAvailability: 100,
        passengerDemand: 120,
        maintenanceCost: 85,
      },
      duration: 30,
    },
  ];

  // Generate random crisis
  const generateCrisis = () => {
    if (activeCrises.length >= 3) return; // Max 3 concurrent crises

    const template = crisisTemplates[Math.floor(Math.random() * crisisTemplates.length)];
    const newCrisis: WorldCrisis = {
      ...template,
      id: `crisis-${Date.now()}`,
      startTime: Date.now(),
    };

    setActiveCrises(prev => [...prev, newCrisis]);
    addNewsItem({
      id: `news-${Date.now()}`,
      headline: newCrisis.title,
      timestamp: Date.now(),
      type: newCrisis.severity === 'critical' ? 'breaking' : 'warning',
      icon: getTypeIcon(newCrisis.type),
    });

    toast({
      title: '🚨 BREAKING NEWS!',
      description: newCrisis.title,
      variant: newCrisis.severity === 'critical' ? 'destructive' : 'default',
    });

    // Update market indicators
    updateMarketIndicators(newCrisis);

    // Auto-remove after duration
    setTimeout(() => {
      setActiveCrises(prev => prev.filter(c => c.id !== newCrisis.id));
      addNewsItem({
        id: `news-end-${Date.now()}`,
        headline: `✅ Krise beendet: ${newCrisis.title}`,
        timestamp: Date.now(),
        type: 'update',
        icon: '✅',
      });
      // Reset indicators gradually
      setTimeout(() => updateMarketIndicators(newCrisis, true), 1000);
    }, newCrisis.duration * 60000);
  };

  const updateMarketIndicators = (crisis: WorldCrisis, isEnding: boolean = false) => {
    setMarketIndicators(prev => {
      const multiplier = isEnding ? -1 : 1;
      return prev.map(indicator => {
        let change = 0;
        let newValue = indicator.value;

        if (indicator.name === 'Ölpreis') {
          change = (crisis.impact.fuelPriceMultiplier - 1) * 100 * multiplier;
          newValue = Math.max(20, Math.min(200, indicator.value + change));
        } else if (indicator.name === 'Passagier-Nachfrage') {
          change = (crisis.impact.passengerDemand - 100) * multiplier;
          newValue = Math.max(10, Math.min(200, indicator.value + change));
        } else if (indicator.name === 'Wartungskosten') {
          change = (crisis.impact.maintenanceCost - 100) * multiplier;
          newValue = Math.max(50, Math.min(200, indicator.value + change));
        }

        return {
          ...indicator,
          value: newValue,
          change: change,
          trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
        };
      });
    });
  };

  const addNewsItem = (news: NewsItem) => {
    setNewsItems(prev => [news, ...prev].slice(0, 10)); // Keep last 10 news items
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'economic': return '💰';
      case 'weather': return '🌪️';
      case 'political': return '⚔️';
      case 'pandemic': return '🦠';
      case 'technical': return '💻';
      default: return '📰';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-operational/10 border-operational text-operational';
      case 'medium': return 'bg-warning/10 border-warning text-warning';
      case 'high': return 'bg-critical/10 border-critical text-critical';
      case 'critical': return 'bg-destructive/20 border-destructive text-destructive animate-pulse';
      default: return 'bg-muted';
    }
  };

  const handleInvestInInsurance = () => {
    const cost = 100000;
    if (budget >= cost) {
      onBudgetChange(-cost);
      toast({
        title: '🛡️ Versicherung abgeschlossen',
        description: 'Deine Flotte ist nun gegen Krisen geschützt!',
      });
    } else {
      toast({
        title: '❌ Nicht genug Budget',
        description: 'Versicherung kostet €100,000',
        variant: 'destructive',
      });
    }
  };

  // Crisis generation interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance every 2 minutes
        generateCrisis();
      }
    }, 120000);

    // Generate initial crisis after 10 seconds
    const initialTimeout = setTimeout(() => {
      generateCrisis();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [activeCrises.length]);

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="border-accent/30 bg-gradient-metal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Globale Marktindikatoren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketIndicators.map((indicator, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{indicator.name}</span>
                  {indicator.trend === 'up' && <TrendingUp className="w-4 h-4 text-critical" />}
                  {indicator.trend === 'down' && <TrendingDown className="w-4 h-4 text-operational" />}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{Math.round(indicator.value)}</span>
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                {indicator.change !== 0 && (
                  <Badge variant="outline" className={indicator.change > 0 ? 'border-critical text-critical' : 'border-operational text-operational'}>
                    {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(1)}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Crises */}
      {activeCrises.length > 0 && (
        <Card className="border-destructive/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
              Aktive Weltkrisen
              <Badge variant="destructive" className="ml-auto">{activeCrises.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCrises.map((crisis) => {
              const elapsed = Date.now() - crisis.startTime;
              const remaining = crisis.duration * 60000 - elapsed;
              const progress = (elapsed / (crisis.duration * 60000)) * 100;

              return (
                <Card key={crisis.id} className={`border-2 ${getSeverityColor(crisis.severity)}`}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{crisis.type}</Badge>
                          {crisis.region && (
                            <Badge variant="secondary" className="text-xs">{crisis.region}</Badge>
                          )}
                        </div>
                        <h4 className="font-bold text-lg">{crisis.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{crisis.description}</p>
                      </div>
                      <Flame className={`w-6 h-6 ${crisis.severity === 'critical' ? 'text-destructive animate-pulse' : 'text-warning'}`} />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Treibstoff:</span>
                          <span className={`ml-2 font-semibold ${crisis.impact.fuelPriceMultiplier > 1 ? 'text-critical' : 'text-operational'}`}>
                            {(crisis.impact.fuelPriceMultiplier * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Routen:</span>
                          <span className={`ml-2 font-semibold ${crisis.impact.routeAvailability < 100 ? 'text-critical' : 'text-operational'}`}>
                            {crisis.impact.routeAvailability}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nachfrage:</span>
                          <span className={`ml-2 font-semibold ${crisis.impact.passengerDemand < 100 ? 'text-critical' : 'text-operational'}`}>
                            {crisis.impact.passengerDemand}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Wartung:</span>
                          <span className={`ml-2 font-semibold ${crisis.impact.maintenanceCost > 100 ? 'text-critical' : 'text-operational'}`}>
                            {crisis.impact.maintenanceCost}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Verbleibende Zeit</span>
                        <span>{Math.max(0, Math.ceil(remaining / 60000))} Min</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Breaking News Feed */}
      <Card className="border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent" />
            Live Nachrichten-Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {newsItems.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {newsItems.map((news) => (
                <div 
                  key={news.id}
                  className={`p-3 rounded-lg border ${
                    news.type === 'breaking' ? 'bg-destructive/10 border-destructive/30' :
                    news.type === 'warning' ? 'bg-warning/10 border-warning/30' :
                    news.type === 'opportunity' ? 'bg-operational/10 border-operational/30' :
                    'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{news.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{news.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(news.timestamp).toLocaleTimeString('de-DE')}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{news.headline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Keine aktuellen Nachrichten</p>
              <p className="text-xs mt-1">Krisen werden regelmäßig generiert...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crisis Management Actions */}
      <Card className="border-aviation-gold/30 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-aviation-gold" />
            Krisen-Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={handleInvestInInsurance}
            >
              <div className="flex items-center gap-2 w-full">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Krisen-Versicherung</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Schütze deine Flotte vor extremen Krisen
              </p>
              <Badge variant="secondary" className="mt-1">€100,000</Badge>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start gap-2"
              onClick={() => {
                toast({
                  title: '📊 Marktanalyse',
                  description: 'Detaillierte Analyse wird vorbereitet...',
                });
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Markt-Analyse</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Erhalte Vorhersagen über kommende Krisen
              </p>
              <Badge variant="secondary" className="mt-1">€50,000</Badge>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Globales Risiko-Level</span>
              <Badge variant={activeCrises.length >= 2 ? 'destructive' : activeCrises.length === 1 ? 'default' : 'secondary'}>
                {activeCrises.length >= 2 ? 'HOCH' : activeCrises.length === 1 ? 'MITTEL' : 'NIEDRIG'}
              </Badge>
            </div>
            <Progress 
              value={activeCrises.length * 33.33} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorldCrisisSystem;

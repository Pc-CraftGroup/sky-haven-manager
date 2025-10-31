import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Zap, 
  Target, 
  Clock, 
  Star, 
  TrendingUp,
  AlertTriangle,
  Gift,
  Flame,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface GameEvent {
  id: string;
  type: 'opportunity' | 'challenge' | 'disaster' | 'bonus';
  title: string;
  description: string;
  reward: number;
  penalty?: number;
  duration: number; // minutes
  startTime: number;
  choices?: {
    text: string;
    outcome: {
      success: boolean;
      reward?: number;
      penalty?: number;
      message: string;
    };
  }[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface EventSystemProps {
  budget: number;
  onBudgetChange: (amount: number) => void;
  totalFlights: number;
  totalAircraft: number;
  totalRevenue: number;
}

const EventSystem: React.FC<EventSystemProps> = ({
  budget,
  onBudgetChange,
  totalFlights,
  totalAircraft,
  totalRevenue,
}) => {
  const { toast } = useToast();
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXP, setPlayerXP] = useState(0);
  const [streak, setStreak] = useState(0);

  // Initialize achievements
  useEffect(() => {
    const initialAchievements: Achievement[] = [
      {
        id: 'first-aircraft',
        title: 'Erste Flügel',
        description: 'Kaufe dein erstes Flugzeug',
        icon: '✈️',
        reward: 10000,
        unlocked: totalAircraft >= 1,
        progress: totalAircraft,
        maxProgress: 1,
        rarity: 'common',
      },
      {
        id: 'fleet-master',
        title: 'Flottenmeister',
        description: 'Besitze 10 Flugzeuge',
        icon: '🛫',
        reward: 50000,
        unlocked: totalAircraft >= 10,
        progress: totalAircraft,
        maxProgress: 10,
        rarity: 'rare',
      },
      {
        id: 'sky-baron',
        title: 'Himmelsbaron',
        description: 'Besitze 25 Flugzeuge',
        icon: '👑',
        reward: 200000,
        unlocked: totalAircraft >= 25,
        progress: totalAircraft,
        maxProgress: 25,
        rarity: 'epic',
      },
      {
        id: 'millionaire',
        title: 'Millionär',
        description: 'Erreiche 1 Million Budget',
        icon: '💰',
        reward: 100000,
        unlocked: budget >= 1000000,
        progress: Math.min(budget, 1000000),
        maxProgress: 1000000,
        rarity: 'rare',
      },
      {
        id: 'aviation-mogul',
        title: 'Luftfahrt-Tycoon',
        description: 'Erreiche 10 Millionen Gesamtumsatz',
        icon: '🏆',
        reward: 500000,
        unlocked: totalRevenue >= 10000000,
        progress: Math.min(totalRevenue, 10000000),
        maxProgress: 10000000,
        rarity: 'legendary',
      },
    ];
    setAchievements(initialAchievements);
  }, [totalAircraft, budget, totalRevenue]);

  // Generate daily challenges
  useEffect(() => {
    const challenges: DailyChallenge[] = [
      {
        id: 'daily-flights',
        title: 'Tägliche Flüge',
        description: 'Führe heute 5 Flüge durch',
        target: 5,
        current: 0,
        reward: 25000,
        completed: false,
        icon: '🛫',
      },
      {
        id: 'perfect-maintenance',
        title: 'Perfekte Wartung',
        description: 'Halte alle Flugzeuge über 80% Zustand',
        target: 1,
        current: 0,
        reward: 15000,
        completed: false,
        icon: '🔧',
      },
      {
        id: 'fuel-efficiency',
        title: 'Treibstoff-Effizienz',
        description: 'Betanke 3 Flugzeuge heute',
        target: 3,
        current: 0,
        reward: 10000,
        completed: false,
        icon: '⛽',
      },
    ];
    setDailyChallenges(challenges);
  }, []);

  // Generate random events - now every 2-4 hours
  useEffect(() => {
    const eventInterval = setInterval(() => {
      if (Math.random() < 0.5) { // 50% chance every interval
        generateRandomEvent();
      }
    }, 2 * 60 * 60 * 1000); // Check every 2 hours

    return () => clearInterval(eventInterval);
  }, []);

  const generateRandomEvent = () => {
    const eventTypes: GameEvent[] = [
      {
        id: `event-${Date.now()}`,
        type: 'opportunity',
        title: '🎯 Charter-Anfrage',
        description: 'Ein Unternehmen benötigt einen Charter-Flug. Schnelle Entscheidung erforderlich!',
        reward: 50000,
        duration: 5,
        startTime: Date.now(),
        choices: [
          {
            text: 'Anfrage annehmen',
            outcome: {
              success: true,
              reward: 50000,
              message: 'Charter-Flug erfolgreich! +€50,000',
            },
          },
          {
            text: 'Ablehnen',
            outcome: {
              success: false,
              message: 'Gelegenheit verpasst.',
            },
          },
        ],
      },
      {
        id: `event-${Date.now()}`,
        type: 'challenge',
        title: '⚡ Turbulenzen gemeldet',
        description: 'Starke Turbulenzen auf beliebten Routen. Anpassungen könnten nötig sein.',
        reward: 30000,
        penalty: 20000,
        duration: 3,
        startTime: Date.now(),
        choices: [
          {
            text: 'Alternative Route',
            outcome: {
              success: true,
              reward: 30000,
              message: 'Clever umgeleitet! +€30,000',
            },
          },
          {
            text: 'Durchfliegen',
            outcome: {
              success: Math.random() > 0.5,
              penalty: 20000,
              message: Math.random() > 0.5 ? 'Geschafft! +€10,000' : 'Passagiere unzufrieden. -€20,000',
            },
          },
        ],
      },
      {
        id: `event-${Date.now()}`,
        type: 'bonus',
        title: '🎁 VIP-Kunde',
        description: 'Ein VIP-Kunde möchte First Class fliegen und bietet einen Premium-Preis!',
        reward: 75000,
        duration: 4,
        startTime: Date.now(),
        choices: [
          {
            text: 'VIP akzeptieren',
            outcome: {
              success: true,
              reward: 75000,
              message: 'VIP begeistert! +€75,000 & +Reputation',
            },
          },
        ],
      },
      {
        id: `event-${Date.now()}`,
        type: 'disaster',
        title: '⚠️ Notfall-Wartung',
        description: 'Ein Flugzeug benötigt ungeplante Wartung. Sofortiges Handeln erforderlich!',
        reward: 0,
        penalty: 40000,
        duration: 2,
        startTime: Date.now(),
        choices: [
          {
            text: 'Sofort warten',
            outcome: {
              success: true,
              penalty: 25000,
              message: 'Rechtzeitig repariert. -€25,000',
            },
          },
          {
            text: 'Später',
            outcome: {
              success: false,
              penalty: 40000,
              message: 'Schaden verschlimmert. -€40,000',
            },
          },
        ],
      },
    ];

    const newEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    setActiveEvents(prev => [...prev, newEvent]);

    toast({
      title: '🔔 Neues Ereignis!',
      description: newEvent.title,
      duration: 5000,
    });

    // Remove event after duration
    setTimeout(() => {
      setActiveEvents(prev => prev.filter(e => e.id !== newEvent.id));
    }, newEvent.duration * 60000);
  };

  const handleEventChoice = (eventId: string, choiceIndex: number) => {
    const event = activeEvents.find(e => e.id === eventId);
    if (!event || !event.choices) return;

    const choice = event.choices[choiceIndex];
    const { outcome } = choice;

    if (outcome.reward) {
      onBudgetChange(outcome.reward);
      addXP(50);
    }
    if (outcome.penalty) {
      onBudgetChange(-outcome.penalty);
    }

    toast({
      title: outcome.success ? '✅ Erfolg!' : '❌ Misserfolg',
      description: outcome.message,
      variant: outcome.success ? 'default' : 'destructive',
    });

    setActiveEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const addXP = (amount: number) => {
    const newXP = playerXP + amount;
    const xpNeeded = playerLevel * 100;

    if (newXP >= xpNeeded) {
      setPlayerLevel(prev => prev + 1);
      setPlayerXP(newXP - xpNeeded);
      toast({
        title: '🎉 Level Up!',
        description: `Du bist jetzt Level ${playerLevel + 1}!`,
        duration: 5000,
      });
      onBudgetChange(playerLevel * 10000); // Level up reward
    } else {
      setPlayerXP(newXP);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-operational/10 border-operational text-operational';
      case 'challenge': return 'bg-warning/10 border-warning text-warning';
      case 'disaster': return 'bg-critical/10 border-critical text-critical';
      case 'bonus': return 'bg-aviation-gold/10 border-aviation-gold text-aviation-gold';
      default: return 'bg-muted';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Stats */}
      <Card className="border-aviation-gold/20 bg-gradient-metal">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-aviation-gold" />
              Pilot Level {playerLevel}
            </span>
            <Badge variant="outline" className="bg-aviation-gold/10 border-aviation-gold">
              <Flame className="w-3 h-3 mr-1" />
              {streak} Tage Streak
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {playerXP} / {playerLevel * 100}</span>
              <span className="text-aviation-gold">{Math.round((playerXP / (playerLevel * 100)) * 100)}%</span>
            </div>
            <Progress value={(playerXP / (playerLevel * 100)) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <Card className="border-accent/30 animate-pulse">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Aktive Ereignisse
              <Badge variant="secondary">{activeEvents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeEvents.map((event) => (
              <Card key={event.id} className={`border-2 ${getEventTypeColor(event.type)}`}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-lg">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.duration}m
                      </Badge>
                    </div>
                    
                    {event.reward > 0 && (
                      <div className="text-sm font-semibold text-operational">
                        💰 Belohnung: €{event.reward.toLocaleString('de-DE')}
                      </div>
                    )}
                    
                    <div className="flex gap-2 flex-wrap">
                      {event.choices?.map((choice, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant={idx === 0 ? 'aviation' : 'outline'}
                          onClick={() => handleEventChoice(event.id, idx)}
                        >
                          {choice.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Tägliche Herausforderungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyChallenges.map((challenge) => (
            <div key={challenge.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                {challenge.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-operational" />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {challenge.current}/{challenge.target}
                  </span>
                )}
              </div>
              <Progress value={(challenge.current / challenge.target) * 100} />
              {!challenge.completed && (
                <p className="text-xs text-aviation-gold">
                  Belohnung: €{challenge.reward.toLocaleString('de-DE')}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-aviation-gold" />
            Erfolge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="space-y-2 opacity-${achievement.unlocked ? '100' : '60'}">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {achievement.title}
                      <Star className={`w-4 h-4 ${getRarityColor(achievement.rarity)}`} />
                    </h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                {achievement.unlocked && (
                  <Badge className="bg-aviation-gold text-white">
                    <Gift className="w-3 h-3 mr-1" />
                    +€{achievement.reward.toLocaleString('de-DE')}
                  </Badge>
                )}
              </div>
              {!achievement.unlocked && (
                <>
                  <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {achievement.progress} / {achievement.maxProgress}
                  </p>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventSystem;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plane, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const airlineSchema = z.object({
  name: z.string().min(1, 'Fluggesellschaftsname ist erforderlich').max(50, 'Name zu lang'),
  logoText: z.string().min(1, 'Logo-Text ist erforderlich').max(5, 'Maximal 5 Zeichen'),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  slogan: z.string().max(100, 'Slogan zu lang').optional(),
  description: z.string().max(500, 'Beschreibung zu lang').optional(),
});

type AirlineSettings = z.infer<typeof airlineSchema>;

export interface CabinConfiguration {
  firstClass: number; // Percentage 0-100
  business: number; // Percentage 0-100
  premiumEconomy: number; // Percentage 0-100
  economy: number; // Percentage 0-100
}

const defaultCabinConfig: CabinConfiguration = {
  firstClass: 5,
  business: 15,
  premiumEconomy: 20,
  economy: 60,
};

const defaultSettings: AirlineSettings = {
  name: 'Skyline Airways',
  logoText: 'SKY',
  primaryColor: '#0EA5E9',
  secondaryColor: '#F59E0B',
  slogan: 'Der Himmel ist nur der Anfang',
  description: 'Ihre erstklassige Wahl für komfortables und sicheres Reisen weltweit.',
};

export interface CreativitySettings {
  randomEvents: boolean;
  eventFrequency: number; // 0-100
  delayProbability: number; // 0-100
  crashProbability: number; // 0-100
  weatherEffects: boolean;
  maintenanceVariability: number; // 0-100
  fuelConsumptionVariability: number; // 0-100
  passengerDemandVariability: number; // 0-100
  difficulty: 'easy' | 'normal' | 'hard' | 'realistic';
}

const defaultCreativitySettings: CreativitySettings = {
  randomEvents: true,
  eventFrequency: 50,
  delayProbability: 10,
  crashProbability: 2,
  weatherEffects: true,
  maintenanceVariability: 30,
  fuelConsumptionVariability: 20,
  passengerDemandVariability: 40,
  difficulty: 'normal',
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [airlineSettings, setAirlineSettings] = useLocalStorage<AirlineSettings>(
    'airline-settings',
    defaultSettings
  );
  const [creativitySettings, setCreativitySettings] = useLocalStorage<CreativitySettings>(
    'creativity-settings',
    defaultCreativitySettings
  );
  const [cabinConfig, setCabinConfig] = useLocalStorage<CabinConfiguration>(
    'cabin-configuration',
    defaultCabinConfig
  );

  const form = useForm<AirlineSettings>({
    resolver: zodResolver(airlineSchema),
    defaultValues: airlineSettings,
  });

  const onSubmit = (data: AirlineSettings) => {
    setAirlineSettings(data);
    toast({
      title: 'Einstellungen gespeichert',
      description: 'Deine Fluggesellschaft wurde aktualisiert.',
    });
  };

  const logoText = form.watch('logoText');
  const primaryColor = form.watch('primaryColor');
  const secondaryColor = form.watch('secondaryColor');

  const handleCreativityChange = <K extends keyof CreativitySettings>(
    key: K,
    value: CreativitySettings[K]
  ) => {
    setCreativitySettings({ ...creativitySettings, [key]: value });
  };

  const saveCreativitySettings = () => {
    toast({
      title: 'Kreativitätseinstellungen gespeichert',
      description: 'Die Spiel-Dynamik wurde angepasst.',
    });
  };

  const handleCabinConfigChange = (cabin: keyof CabinConfiguration, value: number) => {
    const newConfig = { ...cabinConfig, [cabin]: value };
    const total = Object.values(newConfig).reduce((sum, val) => sum + val, 0);
    
    if (total <= 100) {
      setCabinConfig(newConfig);
    }
  };

  const totalCabinPercentage = Object.values(cabinConfig).reduce((sum, val) => sum + val, 0);

  const saveCabinConfig = () => {
    if (totalCabinPercentage === 100) {
      toast({
        title: 'Kabinenkonfiguration gespeichert',
        description: 'Die Sitzverteilung wurde aktualisiert.',
      });
    } else {
      toast({
        title: 'Fehler',
        description: 'Die Sitzverteilung muss genau 100% ergeben.',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Weniger Zufallsereignisse, höhere Einnahmen';
      case 'normal':
        return 'Ausgewogenes Spielerlebnis';
      case 'hard':
        return 'Mehr Herausforderungen, geringere Margen';
      case 'realistic':
        return 'Realistische Wirtschaftlichkeit und Ereignisse';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary">Einstellungen</h1>
          <p className="text-muted-foreground">Verwalte deine Fluggesellschaft und Spiel-Dynamik</p>
        </div>

        <Tabs defaultValue="airline" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="airline" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Fluggesellschaft
            </TabsTrigger>
            <TabsTrigger value="cabin" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Kabinenkonfiguration
            </TabsTrigger>
            <TabsTrigger value="creativity" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Kreativität & Dynamik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="airline" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluggesellschaft</CardTitle>
              <CardDescription>Passe den Namen und das Logo deiner Airline an</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name der Fluggesellschaft</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Skyline Airways" {...field} />
                        </FormControl>
                        <FormDescription>
                          Der offizielle Name deiner Airline
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo-Text</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. SKY" maxLength={5} {...field} />
                        </FormControl>
                        <FormDescription>
                          Bis zu 5 Zeichen für dein Logo (z.B. Initialen)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slogan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slogan (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Der Himmel ist nur der Anfang" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ein einprägsamer Slogan für deine Airline
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschreibung (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Ihre erstklassige Wahl für..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Eine kurze Beschreibung deiner Airline
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primärfarbe</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input type="color" {...field} className="w-20 h-10 p-1" />
                              <Input type="text" {...field} placeholder="#0EA5E9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sekundärfarbe</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input type="color" {...field} className="w-20 h-10 p-1" />
                              <Input type="text" {...field} placeholder="#F59E0B" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="aviation">
                    Einstellungen speichern
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo-Vorschau</CardTitle>
                <CardDescription>So sieht dein Logo aus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-aircraft transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      color: 'white',
                    }}
                  >
                    {logoText.toUpperCase() || 'SKY'}
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {form.watch('name') || 'Skyline Airways'}
                    </p>
                    <p className="text-sm text-muted-foreground">Deine Fluggesellschaft</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo auf Flugzeug</CardTitle>
                <CardDescription>Vorschau auf einem Flugzeug</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gradient-sky rounded-lg p-6 flex items-center justify-center">
                  <div className="relative">
                    <Plane className="w-32 h-32 text-white opacity-20" />
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shadow-aircraft"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        color: 'white',
                      }}
                    >
                      {logoText.toUpperCase() || 'SKY'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
            </div>
          </TabsContent>

          <TabsContent value="cabin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kabinenkonfiguration</CardTitle>
                <CardDescription>
                  Lege die Sitzverteilung für deine Flugzeuge fest (Gesamt: {totalCabinPercentage}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <span className="text-xl">✈️</span>
                      First Class
                    </Label>
                    <span className="text-sm text-muted-foreground font-semibold">
                      {cabinConfig.firstClass}%
                    </span>
                  </div>
                  <Slider
                    value={[cabinConfig.firstClass]}
                    onValueChange={([value]) => handleCabinConfigChange('firstClass', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Höchster Komfort und Preis, begrenzte Sitzanzahl
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <span className="text-xl">💼</span>
                      Business Class
                    </Label>
                    <span className="text-sm text-muted-foreground font-semibold">
                      {cabinConfig.business}%
                    </span>
                  </div>
                  <Slider
                    value={[cabinConfig.business]}
                    onValueChange={([value]) => handleCabinConfigChange('business', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Premium-Komfort für Geschäftsreisende
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      Premium Economy
                    </Label>
                    <span className="text-sm text-muted-foreground font-semibold">
                      {cabinConfig.premiumEconomy}%
                    </span>
                  </div>
                  <Slider
                    value={[cabinConfig.premiumEconomy]}
                    onValueChange={([value]) => handleCabinConfigChange('premiumEconomy', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mehr Beinfreiheit als Economy zu moderatem Aufpreis
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-2">
                      <span className="text-xl">🪑</span>
                      Economy Class
                    </Label>
                    <span className="text-sm text-muted-foreground font-semibold">
                      {cabinConfig.economy}%
                    </span>
                  </div>
                  <Slider
                    value={[cabinConfig.economy]}
                    onValueChange={([value]) => handleCabinConfigChange('economy', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Standard-Sitzplätze, günstigste Option
                  </p>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="font-semibold">Gesamtverteilung:</span>
                    <span className={`text-lg font-bold ${totalCabinPercentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                      {totalCabinPercentage}%
                    </span>
                  </div>
                  {totalCabinPercentage !== 100 && (
                    <p className="text-sm text-orange-600 mt-2">
                      Die Gesamtverteilung muss genau 100% ergeben
                    </p>
                  )}
                </div>

                <Button 
                  onClick={saveCabinConfig} 
                  className="w-full" 
                  variant="aviation"
                  disabled={totalCabinPercentage !== 100}
                >
                  Kabinenkonfiguration speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creativity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Random Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Zufallsereignisse
                  </CardTitle>
                  <CardDescription>
                    Steuere die Häufigkeit und Art von zufälligen Events
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="random-events" className="flex flex-col gap-1">
                      <span>Zufallsereignisse aktivieren</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Verspätungen, Defekte, Wetter, etc.
                      </span>
                    </Label>
                    <Switch
                      id="random-events"
                      checked={creativitySettings.randomEvents}
                      onCheckedChange={(checked) =>
                        handleCreativityChange('randomEvents', checked)
                      }
                    />
                  </div>

                  {creativitySettings.randomEvents && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Event-Häufigkeit</Label>
                          <span className="text-sm text-muted-foreground">
                            {creativitySettings.eventFrequency}%
                          </span>
                        </div>
                        <Slider
                          value={[creativitySettings.eventFrequency]}
                          onValueChange={([value]) =>
                            handleCreativityChange('eventFrequency', value)
                          }
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Verspätungswahrscheinlichkeit
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            {creativitySettings.delayProbability}%
                          </span>
                        </div>
                        <Slider
                          value={[creativitySettings.delayProbability]}
                          onValueChange={([value]) =>
                            handleCreativityChange('delayProbability', value)
                          }
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            Absturz-Wahrscheinlichkeit
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            {creativitySettings.crashProbability}%
                          </span>
                        </div>
                        <Slider
                          value={[creativitySettings.crashProbability]}
                          onValueChange={([value]) =>
                            handleCreativityChange('crashProbability', value)
                          }
                          max={20}
                          step={0.5}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Hinweis: Sehr niedrige Werte empfohlen (0-5%)
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="weather-effects" className="flex flex-col gap-1">
                      <span>Wettereffekte</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Wetter beeinflusst Flüge
                      </span>
                    </Label>
                    <Switch
                      id="weather-effects"
                      checked={creativitySettings.weatherEffects}
                      onCheckedChange={(checked) =>
                        handleCreativityChange('weatherEffects', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Variability Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Variabilität & Realismus
                  </CardTitle>
                  <CardDescription>
                    Steuere wie dynamisch sich verschiedene Faktoren ändern
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Wartungskosten-Variabilität</Label>
                      <span className="text-sm text-muted-foreground">
                        {creativitySettings.maintenanceVariability}%
                      </span>
                    </div>
                    <Slider
                      value={[creativitySettings.maintenanceVariability]}
                      onValueChange={([value]) =>
                        handleCreativityChange('maintenanceVariability', value)
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Wie stark schwanken die Wartungskosten
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Treibstoffverbrauch-Variabilität</Label>
                      <span className="text-sm text-muted-foreground">
                        {creativitySettings.fuelConsumptionVariability}%
                      </span>
                    </div>
                    <Slider
                      value={[creativitySettings.fuelConsumptionVariability]}
                      onValueChange={([value]) =>
                        handleCreativityChange('fuelConsumptionVariability', value)
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Verbrauch je nach Bedingungen (Wetter, Route, etc.)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Passagiernachfrage-Variabilität</Label>
                      <span className="text-sm text-muted-foreground">
                        {creativitySettings.passengerDemandVariability}%
                      </span>
                    </div>
                    <Slider
                      value={[creativitySettings.passengerDemandVariability]}
                      onValueChange={([value]) =>
                        handleCreativityChange('passengerDemandVariability', value)
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Schwankungen der Ticketnachfrage
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Label>Schwierigkeitsgrad</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['easy', 'normal', 'hard', 'realistic'] as const).map((diff) => (
                        <Button
                          key={diff}
                          variant={creativitySettings.difficulty === diff ? 'aviation' : 'outline'}
                          size="sm"
                          onClick={() => handleCreativityChange('difficulty', diff)}
                          className="flex flex-col h-auto py-3"
                        >
                          <span className="font-semibold capitalize">
                            {diff === 'easy' ? 'Einfach' : 
                             diff === 'normal' ? 'Normal' : 
                             diff === 'hard' ? 'Schwer' : 'Realistisch'}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getDifficultyDescription(creativitySettings.difficulty)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={saveCreativitySettings} variant="aviation" size="lg">
                <Sparkles className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plane } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
});

type AirlineSettings = z.infer<typeof airlineSchema>;

const defaultSettings: AirlineSettings = {
  name: 'Skyline Airways',
  logoText: 'SKY',
  primaryColor: '#0EA5E9',
  secondaryColor: '#F59E0B',
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [airlineSettings, setAirlineSettings] = useLocalStorage<AirlineSettings>(
    'airline-settings',
    defaultSettings
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary">Einstellungen</h1>
          <p className="text-muted-foreground">Verwalte deine Fluggesellschaft</p>
        </div>

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
      </div>
    </div>
  );
};

export default Settings;

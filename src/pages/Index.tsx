import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Globe, Users, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import aviationHero from '@/assets/aviation-hero.jpg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${aviationHero})` }}
        >
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-aviation-silver bg-clip-text text-transparent">
            Aviation Management Simulator
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto">
            Verwalte deine eigene Fluggesellschaft. Kaufe Flugzeuge, verwalte Routen und 
            erobere den Himmel in diesem realistischen Aviation-Simulator.
          </p>
          <Button 
            size="lg" 
            variant="aviation"
            onClick={() => navigate('/dashboard')}
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto"
          >
            <Plane className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Simulator starten
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Realistische Flugzeug-Verwaltung
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Erlebe alle Aspekte des Airline-Managements mit authentischen Daten und realistischen Abläufen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border hover:shadow-aircraft transition-all duration-300">
              <CardHeader className="text-center">
                <Plane className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Flotten-Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Kaufe, konfiguriere und verwalte verschiedene Flugzeugtypen mit realistischen Spezifikationen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-aircraft transition-all duration-300">
              <CardHeader className="text-center">
                <Globe className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle>Globale Karte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Verfolge deine Flugzeuge in Echtzeit auf einer detaillierten Weltkarte mit OpenStreetMap.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-aircraft transition-all duration-300">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-operational mx-auto mb-4" />
                <CardTitle>Multiplayer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Sieh die Flugzeuge anderer Spieler und konkurriere um die besten Routen weltweit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-aircraft transition-all duration-300">
              <CardHeader className="text-center">
                <BarChart3 className="w-12 h-12 text-aviation-gold mx-auto mb-4" />
                <CardTitle>Realistische Daten</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Authentische Flugzeugdaten, Wartungszyklen und betriebswirtschaftliche Aspekte.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-sky">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Bereit zum Abheben?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Starte jetzt deine Karriere als Airline-Manager und baue das erfolgreichste 
            Luftfahrtunternehmen der Welt auf.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-white text-primary hover:bg-white/90"
          >
            <Plane className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Jetzt spielen
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

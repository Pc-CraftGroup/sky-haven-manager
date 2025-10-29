import React, { useState } from 'react';
import { CabinConfiguration } from '@/pages/Settings';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { CabinVisualizer } from './CabinVisualizer';
import { useToast } from '@/hooks/use-toast';

interface CabinConfigEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aircraftId: string;
  aircraftModel: string;
  maxPassengers: number;
  currentConfig: CabinConfiguration;
  onSave: (aircraftId: string, config: CabinConfiguration) => void;
}

export const CabinConfigEditor: React.FC<CabinConfigEditorProps> = ({
  open,
  onOpenChange,
  aircraftId,
  aircraftModel,
  maxPassengers,
  currentConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<CabinConfiguration>(currentConfig);
  const { toast } = useToast();

  const handleConfigChange = (key: keyof CabinConfiguration, value: number) => {
    const newConfig = { ...config, [key]: value };
    const total = newConfig.firstClass + newConfig.business + newConfig.premiumEconomy + newConfig.economy;
    
    if (total <= 100) {
      setConfig(newConfig);
    }
  };

  const handleSave = () => {
    const total = config.firstClass + config.business + config.premiumEconomy + config.economy;
    
    if (total !== 100) {
      toast({
        title: "Fehler",
        description: `Die Gesamtverteilung muss 100% betragen. Aktuell: ${total}%`,
        variant: "destructive",
      });
      return;
    }

    onSave(aircraftId, config);
    toast({
      title: "Kabinenkonfiguration gespeichert",
      description: `Die Konfiguration für ${aircraftModel} wurde aktualisiert.`,
    });
    onOpenChange(false);
  };

  const total = config.firstClass + config.business + config.premiumEconomy + config.economy;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Kabinenkonfiguration bearbeiten</SheetTitle>
          <SheetDescription>
            {aircraftModel} - Passen Sie die Sitzverteilung an
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Configuration Sliders */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="firstClass">First Class</Label>
                <span className="text-sm font-medium">{config.firstClass}%</span>
              </div>
              <Slider
                id="firstClass"
                min={0}
                max={100}
                step={1}
                value={[config.firstClass]}
                onValueChange={(value) => handleConfigChange('firstClass', value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="business">Business Class</Label>
                <span className="text-sm font-medium">{config.business}%</span>
              </div>
              <Slider
                id="business"
                min={0}
                max={100}
                step={1}
                value={[config.business]}
                onValueChange={(value) => handleConfigChange('business', value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="premiumEconomy">Premium Economy</Label>
                <span className="text-sm font-medium">{config.premiumEconomy}%</span>
              </div>
              <Slider
                id="premiumEconomy"
                min={0}
                max={100}
                step={1}
                value={[config.premiumEconomy]}
                onValueChange={(value) => handleConfigChange('premiumEconomy', value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="economy">Economy Class</Label>
                <span className="text-sm font-medium">{config.economy}%</span>
              </div>
              <Slider
                id="economy"
                min={0}
                max={100}
                step={1}
                value={[config.economy]}
                onValueChange={(value) => handleConfigChange('economy', value[0])}
                className="w-full"
              />
            </div>

            {/* Total Display */}
            <div className={`p-3 rounded-lg ${total === 100 ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
              <div className="text-sm font-medium">
                Gesamt: {total}% {total === 100 ? '✓' : `(${100 - total}% verbleibend)`}
              </div>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Vorschau der Sitzverteilung</h3>
            <CabinVisualizer cabinConfig={config} maxPassengers={maxPassengers} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1" disabled={total !== 100}>
              Speichern
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Abbrechen
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

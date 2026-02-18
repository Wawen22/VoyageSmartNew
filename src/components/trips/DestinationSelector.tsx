import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationInput } from "@/components/ui/LocationInput";

export interface DestinationItem {
  id: string;
  name: string;
  isPrimary: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface DestinationSelectorProps {
  destinations: DestinationItem[];
  onChange: (destinations: DestinationItem[]) => void;
  disabled?: boolean;
}

export function DestinationSelector({ destinations, onChange, disabled }: DestinationSelectorProps) {
  const createDestinationId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `dest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const handleAdd = () => {
    const newId = createDestinationId();
    const isFirst = destinations.length === 0;
    onChange([
      ...destinations, 
      { id: newId, name: "", isPrimary: isFirst }
    ]);
  };

  const handleRemove = (id: string) => {
    const newDestinations = destinations.filter(d => d.id !== id);
    if (newDestinations.length > 0 && !newDestinations.some(d => d.isPrimary)) {
      newDestinations[0].isPrimary = true;
    }
    onChange(newDestinations);
  };

  const handleChange = (id: string, name: string, coords?: { lat: number; lng: number }) => {
    const newDestinations = destinations.map(d => 
      d.id === id ? { 
        ...d, 
        name,
        latitude: coords?.lat ?? d.latitude, // Keep old if not provided (manual edit) or update
        longitude: coords?.lng ?? d.longitude
      } : d
    );
    onChange(newDestinations);
  };

  const handleSetPrimary = (id: string) => {
    const newDestinations = destinations.map(d => 
      d.id === id ? { ...d, isPrimary: true } : { ...d, isPrimary: false }
    );
    onChange(newDestinations);
  };

  useEffect(() => {
    if (destinations.length === 0) {
      handleAdd();
    }
  }, []);

  return (
    <div className="space-y-3">
      <Label className="block text-sm font-medium text-foreground mb-2">
        Destinazioni *
      </Label>
      
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.id || `dest-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3"
            >
              <div 
                className={`flex-1 relative flex items-center bg-card/85 border rounded-2xl transition-all ${
                  dest.isPrimary ? "border-primary ring-1 ring-primary/20" : "border-border/60"
                }`}
              >
                <div className="pl-3 pr-2 flex items-center justify-center">
                   <button
                     type="button"
                     onClick={() => handleSetPrimary(dest.id)}
                     className={`p-1.5 rounded-full transition-colors ${
                        dest.isPrimary 
                          ? "text-primary bg-primary/10" 
                          : "text-muted-foreground hover:bg-muted"
                     }`}
                     title="Imposta come destinazione principale"
                   >
                     <Star className={`w-4 h-4 ${dest.isPrimary ? "fill-current" : ""}`} />
                   </button>
                </div>
                
                <div className="flex-1 py-1 pr-1">
                  <LocationInput
                    value={dest.name}
                    onChange={(name, coords) => handleChange(dest.id, name, coords)}
                    placeholder={index === 0 ? "Es. Parigi, Francia" : "Altra tappa..."}
                    className="border-0 bg-transparent shadow-none focus:ring-0 h-10 px-2"
                    disabled={disabled}
                  />
                </div>

                {destinations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(dest.id)}
                    className="p-3 text-muted-foreground hover:text-destructive transition-colors"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        disabled={disabled}
        className="text-primary hover:text-primary hover:bg-primary/10 pl-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Aggiungi tappa
      </Button>
      
      <p className="text-xs text-muted-foreground mt-1 ml-1">
        Seleziona dai suggerimenti per garantire la posizione corretta sulla mappa.
      </p>
    </div>
  );
}

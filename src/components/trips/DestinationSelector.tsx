import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X, MapPin, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DestinationItem {
  id: string;
  name: string;
  isPrimary: boolean;
}

interface DestinationSelectorProps {
  destinations: DestinationItem[];
  onChange: (destinations: DestinationItem[]) => void;
  disabled?: boolean;
}

export function DestinationSelector({ destinations, onChange, disabled }: DestinationSelectorProps) {
  const handleAdd = () => {
    const newId = Math.random().toString(36).substring(7);
    const isFirst = destinations.length === 0;
    onChange([
      ...destinations, 
      { id: newId, name: "", isPrimary: isFirst }
    ]);
  };

  const handleRemove = (id: string) => {
    const newDestinations = destinations.filter(d => d.id !== id);
    // If we removed the primary, make the first one primary
    if (newDestinations.length > 0 && !newDestinations.some(d => d.isPrimary)) {
      newDestinations[0].isPrimary = true;
    }
    onChange(newDestinations);
  };

  const handleChange = (id: string, name: string) => {
    const newDestinations = destinations.map(d => 
      d.id === id ? { ...d, name } : d
    );
    onChange(newDestinations);
  };

  const handleSetPrimary = (id: string) => {
    const newDestinations = destinations.map(d => 
      d.id === id ? { ...d, isPrimary: true } : { ...d, isPrimary: false }
    );
    onChange(newDestinations);
  };

  // Ensure at least one input exists
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
              key={dest.id}
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
                
                <input
                  type="text"
                  value={dest.name}
                  onChange={(e) => handleChange(dest.id, e.target.value)}
                  placeholder={index === 0 ? "Es. Parigi, Francia" : "Altra tappa..."}
                  className="flex-1 h-12 bg-transparent border-0 focus:ring-0 px-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  disabled={disabled}
                  required={index === 0} // Only first is strictly required for HTML validation
                />

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
        La destinazione con la stella ⭐ sarà quella principale mostrata nella mappa.
      </p>
    </div>
  );
}

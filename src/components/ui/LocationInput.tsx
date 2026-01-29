import * as React from "react"
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getMapboxToken } from "@/lib/mapbox"
import { useDebounce } from "@/hooks/use-mobile" // Assuming a debounce hook exists or I'll implement simple debounce

// Simple debounce implementation inside if hook missing
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface LocationSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface LocationInputProps {
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function LocationInput({ value, onChange, placeholder = "Cerca un luogo...", className, disabled }: LocationInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  
  // Update internal input when external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const debouncedSearch = useDebounceValue(inputValue, 300)

  React.useEffect(() => {
    async function searchPlaces() {
      if (!debouncedSearch || debouncedSearch.length < 3 || debouncedSearch === value) {
        // Don't search if too short or if it matches the selected value exactly (avoid re-search on selection)
        return;
      }

      setLoading(true);
      try {
        const token = getMapboxToken();
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedSearch)}.json?access_token=${token}&types=place,address,poi&limit=5&language=it`
        );
        const data = await response.json();
        if (data.features) {
          setSuggestions(data.features);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setLoading(false);
      }
    }

    if (open) {
      searchPlaces();
    }
  }, [debouncedSearch, open, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between bg-card/85 border-border/60", !value && "text-muted-foreground", className)}
        >
          <span className="truncate flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 opacity-50" />
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}> {/* Disable internal filtering, we use API results */}
          <CommandInput 
            placeholder="Digita per cercare..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && suggestions.length === 0 && (
              <CommandEmpty>Nessun luogo trovato.</CommandEmpty>
            )}
            {!loading && suggestions.map((suggestion) => (
              <CommandItem
                key={suggestion.id}
                value={suggestion.place_name} // Unique value for selection
                onSelect={() => {
                  onChange(suggestion.place_name, {
                    lat: suggestion.center[1],
                    lng: suggestion.center[0]
                  });
                  setInputValue(suggestion.place_name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === suggestion.place_name ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{suggestion.place_name}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

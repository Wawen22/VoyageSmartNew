import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripIdea } from "@/hooks/useTripIdeas";
import { useItinerary } from "@/hooks/useItinerary";
import { useTripDetails } from "@/hooks/useTripDetails";
import { Loader2, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, differenceInDays, parseISO, isValid } from "date-fns";
import { it } from "date-fns/locale";

interface PromoteIdeaDialogProps {
  tripId: string;
  idea: TripIdea;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { value: "activity", label: "Attività" },
  { value: "food", label: "Ristorante/Cibo" },
  { value: "sightseeing", label: "Visita" },
  { value: "entertainment", label: "Intrattenimento" },
  { value: "shopping", label: "Shopping" },
  { value: "relaxation", label: "Relax" },
  { value: "other", label: "Altro" },
];

export function PromoteIdeaDialog({ tripId, idea, open, onOpenChange }: PromoteIdeaDialogProps) {
  const { createActivity } = useItinerary(tripId);
  const { data: trip } = useTripDetails(tripId);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [category, setCategory] = useState("activity");

  // Calculate trip days for the dropdown
  const tripDays = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return [];
    
    const start = parseISO(trip.start_date);
    const end = parseISO(trip.end_date);
    
    if (!isValid(start) || !isValid(end)) return [];

    const daysCount = differenceInDays(end, start) + 1;
    
    return Array.from({ length: daysCount }, (_, i) => {
      const currentDate = addDays(start, i);
      return {
        date: format(currentDate, "yyyy-MM-dd"),
        label: `Giorno ${i + 1}`,
        formattedDate: format(currentDate, "d MMM yyyy", { locale: it })
      };
    });
  }, [trip]);

  // Pre-fill form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(idea.title || "");
      setLocation(idea.location || "");
      
      // Construct description from content, url and media_url
      const parts = [];
      if (idea.content) {
        // Simple HTML strip if content is rich text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = idea.content;
        parts.push(tempDiv.textContent || tempDiv.innerText || "");
      }
      if (idea.url) parts.push(`Link: ${idea.url}`);
      
      setDescription(parts.join("\n\n"));

      // Calculate date if day_number is present
      if (trip?.start_date && idea.day_number && idea.day_number > 0) {
        const start = parseISO(trip.start_date);
        if (isValid(start)) {
          const calculatedDate = addDays(start, idea.day_number - 1);
          setDate(format(calculatedDate, "yyyy-MM-dd"));
        }
      } else if (trip?.start_date) {
        // Default to first day if no day number
        setDate(trip.start_date);
      }
    }
  }, [open, idea, trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setLoading(true);
    
    // Check if there's an image to link in notes (since description is used for content)
    let notes = undefined;
    if (idea.media_url) {
      notes = `Immagine originale: ${idea.media_url}`;
    }

    const success = await createActivity({
      trip_id: tripId,
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      activity_date: date,
      start_time: startTime || undefined,
      category,
      notes
    });

    setLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Promuovi in Itinerario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Giorno del Viaggio *</Label>
            <Select value={date} onValueChange={setDate} required>
              <SelectTrigger id="date" className="w-full">
                <SelectValue placeholder="Seleziona un giorno" />
              </SelectTrigger>
              <SelectContent>
                {tripDays.length > 0 ? (
                  tripDays.map((day) => (
                    <SelectItem key={day.date} value={day.date}>
                      <span className="font-medium">{day.label}</span>
                      <span className="text-muted-foreground ml-2">({day.formattedDate})</span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Definisci le date del viaggio per selezionare i giorni
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Luogo</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
                placeholder="Es. Museo del Louvre"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Ora inizio</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Dettagli, note e link..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !date}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Conferma e Aggiungi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { searchPlace } from "@/lib/mapbox";
import { LocationInput } from "@/components/ui/LocationInput";

interface AddActivityDialogProps {
  tripId: string;
  selectedDate: string;
  onAdd: (data: {
    trip_id: string;
    title: string;
    description?: string;
    location?: string;
    latitude?: number | null;
    longitude?: number | null;
    activity_date: string;
    start_time?: string;
    end_time?: string;
    category?: string;
    notes?: string;
  }) => Promise<boolean>;
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

export function AddActivityDialog({ tripId, selectedDate, onAdd }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("activity");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setLocationCoords(null);
    setStartTime("");
    setEndTime("");
    setCategory("activity");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    let coords = locationCoords;
    const trimmedLocation = location.trim();

    if (trimmedLocation && !coords) {
      const result = await searchPlace(trimmedLocation);
      if (result) {
        coords = { lat: result.lat, lng: result.lng };
      }
    }

    const success = await onAdd({
      trip_id: tripId,
      title: title.trim(),
      description: description.trim() || undefined,
      location: trimmedLocation || undefined,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      activity_date: selectedDate,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      category,
      notes: notes.trim() || undefined,
    });

    setLoading(false);
    if (success) {
      resetForm();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Aggiungi attività
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova attività</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Visita al Colosseo"
              required
            />
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
              <Label htmlFor="endTime">Ora fine</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Luogo</Label>
            <div className="space-y-2">
              <LocationInput
                value={location}
                onChange={(value, coords) => {
                  setLocation(value);
                  setLocationCoords(coords ?? null);
                }}
                placeholder="Cerca e seleziona un luogo"
              />
              {location && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {locationCoords ? "Coordinate salvate" : "Senza coordinate"}
                  </span>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => {
                      setLocation("");
                      setLocationCoords(null);
                    }}
                  >
                    Pulisci
                  </button>
                </div>
              )}
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dettagli sull'attività..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Salvataggio..." : "Aggiungi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripIdea } from "@/hooks/useTripIdeas";
import { useItinerary } from "@/hooks/useItinerary";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState(idea.title || "");
  const [description, setDescription] = useState(
    idea.type === 'NOTE' ? idea.content || "" : 
    idea.type === 'LINK' ? idea.media_url || "" : ""
  );
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [category, setCategory] = useState("activity");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setLoading(true);
    const success = await createActivity({
      trip_id: tripId,
      title: title.trim(),
      description: description.trim() || undefined,
      activity_date: date,
      start_time: startTime || undefined,
      category,
      notes: idea.type === 'LINK' ? `Link originale: ${idea.media_url}` : undefined
    });

    setLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !date}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Aggiungi all'Itinerario
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

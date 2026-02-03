import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarIcon, Loader2, Save, Trash2, Plane, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DestinationSelector, DestinationItem } from "@/components/trips/DestinationSelector";
import { CoverImageUpload } from "@/components/trips/CoverImageUpload";
import { searchPlace } from "@/lib/mapbox";
import { useNavigate } from "react-router-dom";

type Trip = {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
};

interface EditTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusOptions = [
  { value: "planning", label: "In Pianificazione", icon: Clock, color: "text-amber-500" },
  { value: "upcoming", label: "In Arrivo", icon: Plane, color: "text-blue-500" },
  { value: "completed", label: "Completato", icon: CheckCircle2, color: "text-emerald-500" },
];

export function EditTripDialog({ trip, open, onOpenChange, onUpdate }: EditTripDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState(trip.title);
  const [description, setDescription] = useState(trip.description || "");
  const [startDate, setStartDate] = useState<Date | undefined>(parseISO(trip.start_date));
  const [endDate, setEndDate] = useState<Date | undefined>(parseISO(trip.end_date));
  const [status, setStatus] = useState(trip.status);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [localCoverImage, setLocalCoverImage] = useState(trip.cover_image);

  // Load destinations when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(trip.title);
      setDescription(trip.description || "");
      setStartDate(parseISO(trip.start_date));
      setEndDate(parseISO(trip.end_date));
      setStatus(trip.status);
      setLocalCoverImage(trip.cover_image);
      loadDestinations();
    }
  }, [open, trip]);

  const loadDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_destinations')
        .select('*')
        .eq('trip_id', trip.id)
        .order('order_index');

      if (data && data.length > 0) {
        setDestinations(data.map(d => ({
          id: d.id,
          name: d.name,
          isPrimary: d.is_primary,
          latitude: d.latitude,
          longitude: d.longitude
        })));
      } else {
        // Fallback to legacy single destination
        setDestinations([{ 
          id: 'primary', 
          name: trip.destination, 
          isPrimary: true,
          latitude: trip.latitude,
          longitude: trip.longitude
        }]);
      }
    } catch (error) {
      console.error("Error loading destinations:", error);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || destinations.length === 0 || !startDate || !endDate) {
      toast({
        title: "Campi mancanti",
        description: "Assicurati di compilare titolo, date e almeno una destinazione.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const primaryDest = destinations.find(d => d.isPrimary) || destinations[0];
      
      let primaryCoords = { lat: primaryDest.latitude, lng: primaryDest.longitude };
      
      // If coords missing, fetch them
      if ((!primaryCoords.lat || !primaryCoords.lng) && primaryDest.name) {
        const coords = await searchPlace(primaryDest.name);
        if (coords) primaryCoords = coords;
      }

      // Update main trip record
      const { error } = await supabase
        .from("trips")
        .update({
          title: title.trim(),
          destination: primaryDest.name,
          latitude: primaryCoords.lat,
          longitude: primaryCoords.lng,
          description: description.trim() || null,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          status: status,
          cover_image: localCoverImage
        })
        .eq("id", trip.id);

      if (error) throw error;

      // Update destinations table
      // First delete old ones
      await supabase.from("trip_destinations").delete().eq("trip_id", trip.id);

      // Prepare new ones
      const destinationsPayload = await Promise.all(destinations.map(async (d, index) => {
        let lat = d.latitude;
        let lng = d.longitude;

        if ((!lat || !lng) && d.name.trim()) {
          const coords = await searchPlace(d.name);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
          }
        }

        return {
          trip_id: trip.id,
          name: d.name,
          is_primary: d.isPrimary,
          order_index: index,
          latitude: lat,
          longitude: lng
        };
      }));

      const { error: insertError } = await supabase
        .from("trip_destinations")
        .insert(destinationsPayload);

      if (insertError) throw insertError;

      toast({ title: "Viaggio aggiornato!" });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating trip:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from("trips").delete().eq("id", trip.id);
      if (error) throw error;
      
      toast({ title: "Viaggio eliminato" });
      navigate("/trips");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il viaggio.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Modifica Viaggio</DialogTitle>
          <DialogDescription>
            Modifica i dettagli principali, la destinazione o l'immagine di copertina.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cover Image */}
          <div className="space-y-3">
            <Label>Immagine di Copertina</Label>
            <CoverImageUpload
              tripId={trip.id}
              userId={trip.user_id}
              currentImage={localCoverImage}
              onImageUpdate={(url) => setLocalCoverImage(url)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Estate in Grecia"
              />
            </div>

            <div className="space-y-2">
              <Label>Stato</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className={cn("w-4 h-4", opt.color)} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Destinazioni</Label>
            <DestinationSelector 
              destinations={destinations} 
              onChange={setDestinations}
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Dal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: it }) : "Seleziona"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Al</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: it }) : "Seleziona"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => (startDate ? date < startDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione (Opzionale)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Note, obiettivi o idee generali..."
              rows={3}
            />
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Elimina Viaggio
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non può essere annullata. Tutti i dati del viaggio verranno persi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Elimina Definitivamente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salva Modifiche
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

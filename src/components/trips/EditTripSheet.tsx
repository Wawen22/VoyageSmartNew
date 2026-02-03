import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
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
import { Calendar as CalendarIcon, Loader2, Save, Trash2, Clock, Plane, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DestinationSelector, DestinationItem } from "@/components/trips/DestinationSelector";
import { CoverImageUpload } from "@/components/trips/CoverImageUpload";
import { searchPlace } from "@/lib/mapbox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface EditTripSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: any;
  onUpdate: () => void;
}

const statusOptions = [
  { value: "planning", label: "In Pianificazione", icon: Clock, color: "text-amber-500" },
  { value: "upcoming", label: "In Arrivo", icon: Plane, color: "text-blue-500" },
  { value: "completed", label: "Completato", icon: CheckCircle2, color: "text-emerald-500" },
];

export function EditTripSheet({ open, onOpenChange, trip, onUpdate }: EditTripSheetProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState("planning");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => {
    if (trip && open) {
      setTitle(trip.title);
      setDescription(trip.description || "");
      setStartDate(parseISO(trip.start_date));
      setEndDate(parseISO(trip.end_date));
      setStatus(trip.status);
      setCoverImage(trip.cover_image);
      fetchDestinations();
    }
  }, [trip, open]);

  const fetchDestinations = async () => {
    const { data: dests } = await supabase
      .from('trip_destinations')
      .select('*')
      .eq('trip_id', trip.id)
      .order('order_index');

    if (dests && dests.length > 0) {
      setDestinations(dests.map(d => ({
        id: d.id,
        name: d.name,
        isPrimary: d.is_primary,
        latitude: d.latitude,
        longitude: d.longitude
      })));
    } else {
      setDestinations([{ 
        id: 'primary', 
        name: trip.destination, 
        isPrimary: true,
        latitude: trip.latitude,
        longitude: trip.longitude
      }]);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || destinations.length === 0 || !startDate || !endDate) {
      toast({
        title: "Campi mancanti",
        description: "Assicurati di compilare titolo, date e destinazione.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // 1. Determine primary destination coordinates
      const primaryDest = destinations.find(d => d.isPrimary) || destinations[0];
      let primaryCoords = { lat: primaryDest.latitude, lng: primaryDest.longitude };
      
      if ((!primaryCoords.lat || !primaryCoords.lng) && primaryDest.name) {
        const coords = await searchPlace(primaryDest.name);
        if (coords) primaryCoords = coords;
      }

      // 2. Update Trip
      const { error } = await supabase
        .from("trips")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          status: status,
          destination: primaryDest.name,
          latitude: primaryCoords.lat,
          longitude: primaryCoords.lng,
          cover_image: coverImage
        })
        .eq("id", trip.id);

      if (error) throw error;

      // 3. Update Destinations (Delete all & Insert new)
      await supabase.from("trip_destinations").delete().eq("trip_id", trip.id);
      
      const destinationsPayload = await Promise.all(destinations.map(async (d, index) => {
        let lat = d.latitude;
        let lng = d.longitude;
        if ((!lat || !lng) && d.name) {
           const coords = await searchPlace(d.name);
           if (coords) { lat = coords.lat; lng = coords.lng; }
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

      await supabase.from("trip_destinations").insert(destinationsPayload);

      toast({ title: "Viaggio aggiornato!" });
      onUpdate(); // Refresh parent
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Errore durante il salvataggio", variant: "destructive" });
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
      toast({ title: "Errore durante l'eliminazione", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[100%] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Modifica Viaggio</SheetTitle>
          <SheetDescription>Aggiorna le informazioni del tuo viaggio.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-20">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Immagine di Copertina</Label>
            <CoverImageUpload
              tripId={trip.id}
              userId={user?.id || ""}
              currentImage={coverImage}
              onImageUpdate={setCoverImage}
            />
          </div>

          <div className="space-y-2">
            <Label>Titolo</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Estate in Grecia" />
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

          <div className="space-y-2">
             <DestinationSelector destinations={destinations} onChange={setDestinations} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Inizio</Label>
                <Popover>
                   <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                         <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                         {startDate ? format(startDate, "d MMM yyyy", {locale: it}) : "Seleziona"}
                      </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                   </PopoverContent>
                </Popover>
             </div>
             <div className="space-y-2">
                <Label>Fine</Label>
                <Popover>
                   <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                         <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                         {endDate ? format(endDate, "d MMM yyyy", {locale: it}) : "Seleziona"}
                      </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate ? date < startDate : false} />
                   </PopoverContent>
                </Popover>
             </div>
          </div>

          <div className="space-y-2">
             <Label>Descrizione</Label>
             <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          <div className="pt-6 border-t mt-6">
             <h3 className="text-red-500 font-medium mb-2 text-sm">Zona Pericolo</h3>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="destructive" variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" /> Elimina Viaggio per sempre
                   </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                   <AlertDialogHeader>
                      <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                      <AlertDialogDescription>Questa azione è irreversibile.</AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600">Elimina</AlertDialogAction>
                   </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 w-full bg-background p-4 border-t flex-row gap-2 justify-end sm:justify-end">
           <SheetClose asChild>
              <Button variant="outline">Annulla</Button>
           </SheetClose>
           <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salva Modifiche
           </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

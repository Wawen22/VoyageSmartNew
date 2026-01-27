import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CoverImageUpload } from "@/components/trips/CoverImageUpload";
import { TripMembersList } from "@/components/trips/TripMembersList";
import { ExportPDFButton } from "@/components/trips/ExportPDFButton";
import { ShareTripDialog } from "@/components/trips/ShareTripDialog";
import { TripDashboard } from "@/components/dashboard/TripDashboard";
import {
  MapPin,
  Calendar as CalendarIcon,
  Edit3,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Clock,
  Plane,
  CheckCircle2,
  Loader2,
} from "lucide-react";

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
  created_at: string;
  updated_at: string;
  is_public_shared: boolean;
  public_share_token: string | null;
};

const statusOptions = [
  { value: "planning", label: "In Pianificazione", icon: Clock, color: "text-amber-500" },
  { value: "upcoming", label: "In Arrivo", icon: Plane, color: "text-primary" },
  { value: "completed", label: "Completato", icon: CheckCircle2, color: "text-forest" },
];

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState<Date | undefined>();
  const [editEndDate, setEditEndDate] = useState<Date | undefined>();
  const [editStatus, setEditStatus] = useState("planning");

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const fetchTrip = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Viaggio non trovato",
          description: "Il viaggio richiesto non esiste",
          variant: "destructive",
        });
        navigate("/trips");
        return;
      }

      setTrip(data);
      // Initialize edit form
      setEditTitle(data.title);
      setEditDestination(data.destination);
      setEditDescription(data.description || "");
      setEditStartDate(parseISO(data.start_date));
      setEditEndDate(parseISO(data.end_date));
      setEditStatus(data.status);
    } catch (error: any) {
      console.error("Error fetching trip:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli del viaggio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editDestination.trim() || !editStartDate || !editEndDate) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi richiesti",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          title: editTitle.trim(),
          destination: editDestination.trim(),
          description: editDescription.trim() || null,
          start_date: format(editStartDate, "yyyy-MM-dd"),
          end_date: format(editEndDate, "yyyy-MM-dd"),
          status: editStatus,
        })
        .eq("id", id);

      if (error) throw error;

      // Refresh trip data
      await fetchTrip();
      setIsEditing(false);

      toast({
        title: "Salvato!",
        description: "Il viaggio è stato aggiornato con successo",
      });
    } catch (error: any) {
      console.error("Error updating trip:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il viaggio",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("trips")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Eliminato",
        description: "Il viaggio è stato eliminato",
      });
      navigate("/trips");
    } catch (error: any) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il viaggio",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const cancelEdit = () => {
    if (trip) {
      setEditTitle(trip.title);
      setEditDestination(trip.destination);
      setEditDescription(trip.description || "");
      setEditStartDate(parseISO(trip.start_date));
      setEditEndDate(parseISO(trip.end_date));
      setEditStatus(trip.status);
    }
    setIsEditing(false);
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <AppLayout>
        <main className="pt-24 pb-16 relative z-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </AppLayout>
    );
  }

  if (!trip) {
    return null;
  }

  const tripDuration = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  const statusInfo = getStatusInfo(trip.status);
  const StatusIcon = statusInfo.icon;

  return (
    <AppLayout>
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/trips" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Torna ai viaggi
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <ShareTripDialog
                tripId={trip.id}
                tripTitle={trip.title}
                isPublicShared={trip.is_public_shared}
                publicShareToken={trip.public_share_token}
                onUpdate={fetchTrip}
              />
              <ExportPDFButton tripId={trip.id} tripTitle={trip.title} />
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4" />
                Modifica
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminare questo viaggio?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Questa azione non può essere annullata. Il viaggio "{trip.title}" 
                      e tutti i dati associati verranno eliminati permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="app-surface-strong overflow-hidden"
          >
            <div className="relative h-64 md:h-72 overflow-hidden">
              {trip.cover_image ? (
                <img 
                  src={trip.cover_image} 
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-hero" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="app-pill bg-white/20 text-white backdrop-blur-sm">
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusInfo.label}
                  </div>
                  <div className="app-pill bg-white/10 text-white/90 backdrop-blur-sm">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {format(parseISO(trip.start_date), "d MMM", { locale: it })} -{" "}
                    {format(parseISO(trip.end_date), "d MMM yyyy", { locale: it })}
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-white">
                    {trip.title}
                  </h1>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm md:text-base">{trip.destination}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="app-section p-5 space-y-2">
                      <Label>Immagine di Copertina</Label>
                      <CoverImageUpload
                        tripId={trip.id}
                        userId={user?.id || ""}
                        currentImage={trip.cover_image}
                        onImageUpdate={(url) => setTrip({ ...trip, cover_image: url })}
                      />
                    </div>

                    <div className="app-section p-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="title">Titolo</Label>
                          <Input
                            id="title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Nome del viaggio"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="destination">Destinazione</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="destination"
                              value={editDestination}
                              onChange={(e) => setEditDestination(e.target.value)}
                              placeholder="Dove vuoi andare?"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Data Partenza</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !editStartDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editStartDate
                                  ? format(editStartDate, "PPP", { locale: it })
                                  : "Seleziona data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={editStartDate}
                                onSelect={setEditStartDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Data Ritorno</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !editEndDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editEndDate
                                  ? format(editEndDate, "PPP", { locale: it })
                                  : "Seleziona data"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={editEndDate}
                                onSelect={setEditEndDate}
                                disabled={(date) => editStartDate ? date < editStartDate : false}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label>Stato</Label>
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona stato" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <option.icon className={cn("w-4 h-4", option.color)} />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="app-section p-5 space-y-2">
                      <Label htmlFor="description">Descrizione</Label>
                      <Textarea
                        id="description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Aggiungi una descrizione al tuo viaggio..."
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 justify-end">
                      <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                        <X className="w-4 h-4 mr-2" />
                        Annulla
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salva Modifiche
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="viewing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-8 lg:grid-cols-[1.4fr,0.9fr]"
                  >
                    <div className="space-y-6">
                      {trip.description && (
                        <div className="app-section p-5">
                          <h3 className="font-semibold text-foreground mb-2">Descrizione</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {trip.description}
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <span className="text-xl">📊</span>
                          Dashboard
                        </h3>
                        <TripDashboard tripId={trip.id} />
                      </div>

                      <div className="app-section p-5">
                        <h3 className="font-semibold text-foreground mb-4">Azioni Rapide</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Link to={`/expenses?trip=${trip.id}`} className="app-section p-4 hover:bg-card/70 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-secondary/40 flex items-center justify-center">
                                <span className="text-xl">💰</span>
                              </div>
                              <div>
                                <p className="font-medium">Gestisci Spese</p>
                                <p className="text-xs text-muted-foreground">Traccia e dividi i costi</p>
                              </div>
                            </div>
                          </Link>
                          <Link to={`/accommodations?trip=${trip.id}`} className="app-section p-4 hover:bg-card/70 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="text-xl">🏨</span>
                              </div>
                              <div>
                                <p className="font-medium">Alloggi</p>
                                <p className="text-xs text-muted-foreground">Gestisci prenotazioni</p>
                              </div>
                            </div>
                          </Link>
                          <Link to={`/transports?trip=${trip.id}`} className="app-section p-4 hover:bg-card/70 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-xl">✈️</span>
                              </div>
                              <div>
                                <p className="font-medium">Trasporti</p>
                                <p className="text-xs text-muted-foreground">Voli, treni e altro</p>
                              </div>
                            </div>
                          </Link>
                          <Link to={`/itinerary?trip=${trip.id}`} className="app-section p-4 hover:bg-card/70 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                                <span className="text-xl">🗓️</span>
                              </div>
                              <div>
                                <p className="font-medium">Itinerario</p>
                                <p className="text-xs text-muted-foreground">Timeline completa del viaggio</p>
                              </div>
                            </div>
                          </Link>
                          <Link to={`/checklist?trip=${trip.id}`} className="app-section p-4 hover:bg-card/70 transition-all sm:col-span-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <span className="text-xl">✅</span>
                              </div>
                              <div>
                                <p className="font-medium">Checklist</p>
                                <p className="text-xs text-muted-foreground">Cosa portare</p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="app-section p-5">
                        <h3 className="font-semibold text-foreground mb-4">Dettagli viaggio</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarIcon className="w-4 h-4" />
                              Partenza
                            </div>
                            <span className="font-medium text-foreground">
                              {format(parseISO(trip.start_date), "d MMMM yyyy", { locale: it })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarIcon className="w-4 h-4" />
                              Ritorno
                            </div>
                            <span className="font-medium text-foreground">
                              {format(parseISO(trip.end_date), "d MMMM yyyy", { locale: it })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              Durata
                            </div>
                            <span className="font-medium text-foreground">
                              {tripDuration} {tripDuration === 1 ? "giorno" : "giorni"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <TripMembersList tripId={trip.id} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
    </AppLayout>
  );
}

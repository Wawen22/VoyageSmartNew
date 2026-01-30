import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useTripStats } from "@/hooks/useTripStats";
import { DestinationSelector, DestinationItem } from "@/components/trips/DestinationSelector";
import { searchPlace } from "@/lib/mapbox";
import { TripHeroWeather } from "@/components/trips/TripHeroWeather";
import {
  MapPin,
  Calendar as CalendarIcon,
  Trash2,
  ArrowLeft,
  Save,
  Clock,
  Plane,
  CheckCircle2,
  Loader2,
  Share2,
  Users,
  Wallet,
  Building2,
  ClipboardList,
  Lightbulb,
  MessageCircle,
  LayoutDashboard,
  Settings,
  ChevronRight
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
  latitude?: number | null;
  longitude?: number | null;
};

const statusOptions = [
  { value: "planning", label: "In Pianificazione", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-200" },
  { value: "upcoming", label: "In Arrivo", icon: Plane, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200" },
  { value: "completed", label: "Completato", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-200" },
];

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const stats = useTripStats(id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDestinations, setEditDestinations] = useState<DestinationItem[]>([]);
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
      setEditDescription(data.description || "");
      setEditStartDate(parseISO(data.start_date));
      setEditEndDate(parseISO(data.end_date));
      setEditStatus(data.status);

      // Fetch destinations
      const { data: dests, error: destsError } = await supabase
        .from('trip_destinations')
        .select('*')
        .eq('trip_id', id)
        .order('order_index');

      if (dests && dests.length > 0) {
        const mappedDests = dests.map(d => ({
          id: d.id,
          name: d.name,
          isPrimary: d.is_primary,
          latitude: d.latitude,
          longitude: d.longitude
        }));
        setDestinations(mappedDests);
        setEditDestinations(mappedDests);
      } else {
        const fallback = [{ 
          id: 'primary', 
          name: data.destination, 
          isPrimary: true,
          latitude: data.latitude,
          longitude: data.longitude
        }];
        setDestinations(fallback);
        setEditDestinations(fallback);
      }

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
    if (!editTitle.trim() || editDestinations.length === 0 || !editStartDate || !editEndDate) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi richiesti e inserisci almeno una destinazione",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const primaryDest = editDestinations.find(d => d.isPrimary) || editDestinations[0];
      
      let primaryCoords = { lat: primaryDest.latitude, lng: primaryDest.longitude };
      
      if ((!primaryCoords.lat || !primaryCoords.lng) && primaryDest.name) {
        const coords = await searchPlace(primaryDest.name);
        if (coords) primaryCoords = coords;
      }

      const { error } = await supabase
        .from("trips")
        .update({
          title: editTitle.trim(),
          destination: primaryDest.name,
          latitude: primaryCoords.lat,
          longitude: primaryCoords.lng,
          description: editDescription.trim() || null,
          start_date: format(editStartDate, "yyyy-MM-dd"),
          end_date: format(editEndDate, "yyyy-MM-dd"),
          status: editStatus,
        })
        .eq("id", id);

      if (error) throw error;

      const { error: deleteError } = await supabase
        .from("trip_destinations")
        .delete()
        .eq("trip_id", id);
      
      if (deleteError) throw deleteError;

      const destinationsPayload = await Promise.all(editDestinations.map(async (d, index) => {
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
          trip_id: id,
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

      await fetchTrip();
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
        duration: 3000
      });
      setTimeout(() => navigate("/trips"), 100);
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

  if (!trip) return null;

  const tripDuration = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
  const statusInfo = getStatusInfo(trip.status);
  const StatusIcon = statusInfo.icon;

  const navItems = [
    { to: `/itinerary?trip=${trip.id}`, label: "Itinerario", icon: CalendarIcon, color: "text-emerald-500", count: stats.activitiesCount },
    { to: `/expenses?trip=${trip.id}`, label: "Spese", icon: Wallet, color: "text-amber-500", count: stats.expensesCount },
    { to: `/accommodations?trip=${trip.id}`, label: "Alloggi", icon: Building2, color: "text-blue-500", count: stats.accommodationsCount },
    { to: `/transports?trip=${trip.id}`, label: "Trasporti", icon: Plane, color: "text-sky-500", count: stats.transportsCount },
    { to: `/checklist?trip=${trip.id}`, label: "Checklist", icon: ClipboardList, color: "text-indigo-500", count: stats.checklistTotal },
    { to: `/ideas?trip=${trip.id}`, label: "Idee", icon: Lightbulb, color: "text-purple-500", count: stats.ideasCount },
    { to: `/chat?trip=${trip.id}`, label: "Chat", icon: MessageCircle, color: "text-pink-500", count: 0 },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-12 pt-16 lg:pt-20">
        {/* HERO SECTION */}
        <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
          {trip.cover_image ? (
            <img 
              src={trip.cover_image} 
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Back Button */}
          <div className="absolute top-6 left-6 z-20">
            <Button variant="secondary" size="sm" className="bg-black/20 text-white hover:bg-black/40 backdrop-blur-md border-0" asChild>
              <Link to="/trips" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Torna ai viaggi
              </Link>
            </Button>
          </div>

          {/* Weather Widget (Moved back to top right) */}
          <div className="absolute top-6 right-6 z-20">
            <TripHeroWeather lat={trip.latitude} lon={trip.longitude} />
          </div>

          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent">
             <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                  <div className="text-white">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className={cn("px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md bg-white/20 border border-white/10")}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md bg-white/10 border border-white/10 text-white/90">
                         <Clock className="w-3.5 h-3.5" />
                         {tripDuration} {tripDuration === 1 ? 'giorno' : 'giorni'}
                      </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-tight">{trip.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/80 text-sm md:text-lg font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-white/60" />
                        {format(parseISO(trip.start_date), "d MMM", { locale: it })} - {format(parseISO(trip.end_date), "d MMM yyyy", { locale: it })}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-white/60" />
                        {trip.destination}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pb-2">
                     <ShareTripDialog
                        tripId={trip.id}
                        tripTitle={trip.title}
                        isPublicShared={trip.is_public_shared}
                        publicShareToken={trip.public_share_token}
                        onUpdate={fetchTrip}
                      />
                      <ExportPDFButton tripId={trip.id} tripTitle={trip.title} />
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 mt-8 relative z-10">
          {/* QUICK NAV */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-10">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <div className="bg-card hover:bg-accent/50 transition-all border shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 h-28 group hover:-translate-y-1">
                  <div className={cn("p-2.5 rounded-2xl transition-colors shadow-sm", item.color.replace('text-', 'bg-').replace('500', '100'))}>
                    <item.icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  <span className="text-xs font-semibold tracking-wide uppercase">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8 bg-muted/50 p-1 rounded-xl w-full md:w-auto h-12">
              <TabsTrigger value="overview" className="gap-2 px-6 h-10 rounded-lg data-[state=active]:shadow-md">
                <LayoutDashboard className="w-4 h-4" /> Panoramica
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 px-6 h-10 rounded-lg data-[state=active]:shadow-md">
                <Settings className="w-4 h-4" /> Impostazioni
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description Card */}
                  {trip.description && (
                    <div className="bg-card rounded-2xl border p-8 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" /> 
                        Diario di Viaggio
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-lg italic">
                        "{trip.description}"
                      </p>
                    </div>
                  )}

                  {/* Map Section */}
                  <div className="bg-card rounded-2xl border p-1 shadow-sm overflow-hidden">
                    <TripDashboard 
                      tripId={trip.id}
                      latitude={trip.latitude}
                      longitude={trip.longitude}
                      destinationName={trip.destination}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-8">
                  {/* Info Sidebar instead of Weather (Weather is now in Hero) */}
                  <div className="bg-card rounded-2xl border p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-4">
                      <Users className="w-5 h-5 text-primary" />
                      Compagni di Viaggio
                    </h3>
                    <TripMembersList tripId={trip.id} />
                  </div>

                  {/* Trip Summary Card */}
                  <div className="bg-card rounded-2xl border p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg mb-2">Info Veloci</h3>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center py-2.5 border-b border-dashed">
                          <span className="text-sm text-muted-foreground">Stato</span>
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", statusInfo.bg, statusInfo.color)}>
                            {statusInfo.label}
                          </span>
                       </div>
                       <div className="flex justify-between items-center py-2.5 border-b border-dashed">
                          <span className="text-sm text-muted-foreground">Destinazione</span>
                          <span className="text-sm font-bold text-right">{trip.destination}</span>
                       </div>
                       <div className="flex justify-between items-center py-2.5">
                          <span className="text-sm text-muted-foreground">Privacy</span>
                          <div className="flex items-center gap-2">
                             <div className={cn("w-2 h-2 rounded-full", trip.is_public_shared ? "bg-emerald-500" : "bg-amber-500")} />
                             <span className="text-sm font-bold">{trip.is_public_shared ? "Pubblico" : "Privato"}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/30">
                  <h3 className="text-lg font-semibold">Modifica Viaggio</h3>
                  <p className="text-muted-foreground text-sm">Aggiorna le informazioni principali del tuo viaggio.</p>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Cover Image */}
                    <div className="space-y-3">
                      <Label>Immagine di Copertina</Label>
                      <CoverImageUpload
                        tripId={trip.id}
                        userId={user?.id || ""}
                        currentImage={trip.cover_image}
                        onImageUpdate={(url) => setTrip({ ...trip, cover_image: url })}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
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

                        <div className="space-y-2 md:col-span-2">
                          <DestinationSelector 
                            destinations={editDestinations} 
                            onChange={setEditDestinations}
                            disabled={saving}
                          />
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrizione</Label>
                      <Textarea
                        id="description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Aggiungi una descrizione al tuo viaggio..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={handleSave} disabled={saving} size="lg">
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salva Modifiche
                      </Button>
                    </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 border border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900 rounded-xl p-6">
                 <h3 className="text-red-600 font-semibold mb-2">Zona Pericolo</h3>
                 <p className="text-sm text-muted-foreground mb-4">
                   L'eliminazione del viaggio è irreversibile e cancellerà tutti i dati associati (spese, itinerario, ecc.).
                 </p>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Elimina Viaggio
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

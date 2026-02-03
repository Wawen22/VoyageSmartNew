import { useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CoverImageUpload } from "@/components/trips/CoverImageUpload";
import { DestinationSelector, DestinationItem } from "@/components/trips/DestinationSelector";
import {
  Save,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  Plane,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  Settings,
  Sparkles,
  ArrowRight,
  Pencil,
  FileText,
  Compass,
  ImageIcon,
  Flag
} from "lucide-react";

interface TripType {
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
}

interface TripSettingsProps {
  trip: TripType;
  destinations: DestinationItem[];
  onUpdate: (updates: Partial<TripType>) => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onDestinationsChange: (destinations: DestinationItem[]) => void;
  saving: boolean;
  deleting: boolean;
}

const statusOptions = [
  {
    value: "planning",
    label: "In Pianificazione",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    description: "Fase di organizzazione",
  },
  {
    value: "upcoming",
    label: "In Arrivo",
    icon: Plane,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    description: "Pronto per partire",
  },
  {
    value: "completed",
    label: "Completato",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    description: "Viaggio terminato",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
} as const;

export function TripSettings({
  trip,
  destinations,
  onUpdate,
  onSave,
  onDelete,
  onDestinationsChange,
  saving,
  deleting,
}: TripSettingsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const editStartDate = trip.start_date ? parseISO(trip.start_date) : undefined;
  const editEndDate = trip.end_date ? parseISO(trip.end_date) : undefined;

  const handleStartDateChange = (date: Date | undefined) => {
    onUpdate({ start_date: date ? format(date, "yyyy-MM-dd") : trip.start_date });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onUpdate({ end_date: date ? format(date, "yyyy-MM-dd") : trip.end_date });
  };

  const currentStatus = statusOptions.find(s => s.value === trip.status) || statusOptions[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header with Save Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Impostazioni Viaggio</h2>
          <p className="text-muted-foreground mt-1">
            Gestisci le preferenze e i dettagli del tuo viaggio.
          </p>
        </div>
        <Button 
          onClick={onSave} 
          disabled={saving} 
          size="lg"
          className="shadow-md hover:shadow-lg transition-all"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salva Modifiche
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-primary" />
                  Informazioni Generali
                </CardTitle>
                <CardDescription>
                  I dettagli principali che identificano il tuo viaggio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">Titolo</Label>
                  <Input
                    id="title"
                    value={trip.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Es: Vacanze estive 2024"
                    className="h-11 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Destinazione</Label>
                  <DestinationSelector
                    destinations={destinations}
                    onChange={onDestinationsChange}
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={trip.description || ""}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Scrivi due righe sul programma..."
                    className="min-h-[120px] resize-y text-base"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Date e Durata
                </CardTitle>
                <CardDescription>
                  Imposta il periodo del viaggio per calcolare l'itinerario.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label>Dal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !editStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {editStartDate ? format(editStartDate, "d MMMM yyyy", { locale: it }) : "Seleziona data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editStartDate}
                          onSelect={handleStartDateChange}
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
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !editEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {editEndDate ? format(editEndDate, "d MMMM yyyy", { locale: it }) : "Seleziona data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editEndDate}
                          onSelect={handleEndDateChange}
                          disabled={(date) => editStartDate ? date < editStartDate : false}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                 </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Status & Extra */}
        <div className="space-y-8">
           <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-border/60 overflow-hidden">
               <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flag className="w-4 h-4 text-primary" /> Stato del Viaggio
                  </CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-4">
                  <Select value={trip.status} onValueChange={(val) => onUpdate({ status: val })}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                           <div className="flex items-center gap-2">
                              <opt.icon className={cn("w-4 h-4", opt.color)} />
                              <span>{opt.label}</span>
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className={cn("p-4 rounded-lg flex gap-3 text-sm", currentStatus.bg)}>
                     <currentStatus.icon className={cn("w-5 h-5 shrink-0", currentStatus.color)} />
                     <p className="text-foreground/80">{currentStatus.description}</p>
                  </div>
               </CardContent>
            </Card>
           </motion.div>

           <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-border/60 overflow-hidden">
               <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" /> Immagine Copertina
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <CoverImageUpload
                    tripId={trip.id}
                    userId={trip.user_id}
                    currentImage={trip.cover_image}
                    onImageUpdate={(url) => onUpdate({ cover_image: url })}
                  />
               </CardContent>
               <CardFooter className="p-4 text-xs text-muted-foreground bg-muted/10 border-t">
                  Consigliato: Immagine orizzontale (16:9).
               </CardFooter>
            </Card>
           </motion.div>

           <motion.div variants={itemVariants}>
             <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 shadow-sm">
                <CardHeader className="pb-3">
                   <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2 text-base">
                      <AlertTriangle className="w-4 h-4" /> Zona Pericolo
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground mb-4">
                      L'eliminazione è irreversibile e cancellerà tutti i dati.
                   </p>
                   <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" className="w-full">
                            <Trash2 className="w-4 h-4 mr-2" /> Elimina Viaggio
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                         <AlertDialogHeader>
                            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                            <AlertDialogDescription>
                               Il viaggio "{trip.title}" verrà eliminato permanentemente.
                            </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} disabled={deleting} className="bg-destructive">
                               {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                               Elimina Definitivamente
                            </AlertDialogAction>
                         </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                </CardContent>
             </Card>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

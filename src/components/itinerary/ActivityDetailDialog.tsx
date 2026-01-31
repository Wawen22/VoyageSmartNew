import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  Loader2,
  Trash2,
  Utensils,
  Camera,
  Ticket,
  ShoppingBag,
  Mountain,
  Building2,
  MoreHorizontal,
  X
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { searchPlace } from "@/lib/mapbox";
import { LocationInput } from "@/components/ui/LocationInput";
import { ItineraryActivity } from "@/hooks/useItinerary";

interface ActivityDetailDialogProps {
  activity: ItineraryActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: any) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  readOnly?: boolean;
}

const CATEGORIES = [
  { value: "activity", label: "Attività", icon: Ticket },
  { value: "food", label: "Ristorante/Cibo", icon: Utensils },
  { value: "sightseeing", label: "Visita", icon: Camera },
  { value: "entertainment", label: "Intrattenimento", icon: Ticket },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "relaxation", label: "Relax", icon: Mountain },
  { value: "museum", label: "Museo", icon: Building2 },
  { value: "other", label: "Altro", icon: MoreHorizontal },
];

const categoryConfig: Record<string, { color: string; label: string }> = {
  food: { color: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/30", label: "Cibo" },
  sightseeing: { color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/30", label: "Visita" },
  activity: { color: "text-primary bg-primary/5 border-primary/20", label: "Attività" },
  entertainment: { color: "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/20 dark:border-pink-800/30", label: "Intrattenimento" },
  shopping: { color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/30", label: "Shopping" },
  relaxation: { color: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-800/30", label: "Relax" },
  museum: { color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30", label: "Museo" },
  other: { color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800/30", label: "Altro" },
};

// Helper function to format time without seconds (HH:MM)
const formatTime = (time: string | null): string => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

// Helper function to format date in Italian
const formatDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, "EEEE d MMMM yyyy", { locale: it });
  } catch {
    return dateStr;
  }
};

export function ActivityDetailDialog({ 
  activity, 
  open, 
  onOpenChange, 
  onUpdate,
  onDelete,
  readOnly = false 
}: ActivityDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activityDate, setActivityDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("activity");
  const [notes, setNotes] = useState("");

  // Reset form when activity changes
  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description || "");
      setLocation(activity.location || "");
      setLocationCoords(
        activity.latitude && activity.longitude 
          ? { lat: activity.latitude, lng: activity.longitude } 
          : null
      );
      setActivityDate(activity.activity_date);
      setStartTime(formatTime(activity.start_time));
      setEndTime(formatTime(activity.end_time));
      setCategory(activity.category || "activity");
      setNotes(activity.notes || "");
      setIsEditing(false);
    }
  }, [activity]);

  const handleClose = () => {
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleCancelEdit = () => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description || "");
      setLocation(activity.location || "");
      setLocationCoords(
        activity.latitude && activity.longitude 
          ? { lat: activity.latitude, lng: activity.longitude } 
          : null
      );
      setActivityDate(activity.activity_date);
      setStartTime(formatTime(activity.start_time));
      setEndTime(formatTime(activity.end_time));
      setCategory(activity.category || "activity");
      setNotes(activity.notes || "");
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!activity || !onUpdate || !title.trim()) return;

    setLoading(true);
    let coords = locationCoords;
    const trimmedLocation = location.trim();

    // Geocode location if changed and no coords
    if (trimmedLocation && !coords && trimmedLocation !== activity.location) {
      const result = await searchPlace(trimmedLocation);
      if (result) {
        coords = { lat: result.lat, lng: result.lng };
      }
    }

    const success = await onUpdate({
      title: title.trim(),
      description: description.trim() || null,
      location: trimmedLocation || null,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      activity_date: activityDate,
      start_time: startTime || null,
      end_time: endTime || null,
      category,
      notes: notes.trim() || null,
    });

    setLoading(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!activity || !onDelete) return;
    setDeleting(true);
    const success = await onDelete(activity.id);
    setDeleting(false);
    if (success) {
      handleClose();
    }
  };

  if (!activity) return null;

  const config = categoryConfig[activity.category] || categoryConfig.activity;
  const CategoryIcon = CATEGORIES.find(c => c.value === category)?.icon || Ticket;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col [&>button]:hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">
                {isEditing ? "Modifica attività" : activity.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={`text-xs ${config.color}`}>
                  {config.label}
                </Badge>
                {!isEditing && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {formatDate(activity.activity_date)}
                  </span>
                )}
              </div>
            </div>
            {!readOnly && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="shrink-0"
              >
                <Edit3 className="h-4 w-4 mr-1.5" />
                Modifica
              </Button>
            )}
            {!readOnly && isEditing && (
              <Button
                onClick={handleSave}
                disabled={loading || !title.trim()}
                size="sm"
                className="shrink-0"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                <Save className="h-4 w-4 mr-1.5" />
                Salva modifiche
              </Button>
            )}
          </div>
        </DialogHeader>

        <Separator className="shrink-0" />

        {/* Content */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {isEditing ? (
            // Edit mode
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo attività"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
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
                      {locationCoords ? "📍 Coordinate salvate" : "⚠️ Senza coordinate"}
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

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </span>
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
                  rows={3}
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
            </>
          ) : (
            // View mode
            <>
              {/* Date and Time */}
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-muted/40 rounded-lg border">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm capitalize">
                    {formatDate(activity.activity_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  {activity.start_time ? (
                    <span className="text-sm">
                      {formatTime(activity.start_time)}
                      {activity.end_time && (
                        <span className="text-muted-foreground"> → {formatTime(activity.end_time)}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Orario non definito</span>
                  )}
                </div>
              </div>

              {/* Location */}
              {activity.location && (
                <div className="flex items-start gap-2 p-3 bg-muted/20 rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Luogo</p>
                    <p className="text-sm text-muted-foreground break-words">{activity.location}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {activity.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Descrizione</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {activity.notes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                  <Label className="text-sm font-medium text-amber-800 dark:text-amber-200">Note</Label>
                  <p className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-wrap mt-1">
                    {activity.notes}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!readOnly && (
          <>
            <Separator className="shrink-0" />
            <div className="flex items-center justify-between gap-2 shrink-0">
              {!isEditing ? (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Elimina
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Chiudi
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Elimina
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Annulla
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { MapPin, Clock, Trash2, Utensils, Camera, ShoppingBag, Sparkles, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { ItineraryActivity } from "@/hooks/useItinerary";

interface ItineraryItemProps {
  activity: ItineraryActivity;
  onDelete: (id: string) => Promise<boolean>;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof MapPin; color: string; bgColor: string }> = {
  activity: { icon: Sparkles, color: "text-primary", bgColor: "bg-primary/10" },
  food: { icon: Utensils, color: "text-amber-600", bgColor: "bg-amber-100" },
  sightseeing: { icon: Camera, color: "text-sky-600", bgColor: "bg-sky-100" },
  entertainment: { icon: Sparkles, color: "text-rose-600", bgColor: "bg-rose-100" },
  shopping: { icon: ShoppingBag, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  relaxation: { icon: Coffee, color: "text-teal-600", bgColor: "bg-teal-100" },
  other: { icon: MapPin, color: "text-muted-foreground", bgColor: "bg-muted/70" },
};

export function ItineraryItem({ activity, onDelete }: ItineraryItemProps) {
  const { user } = useAuth();
  const isCreator = user?.id === activity.created_by;

  const config = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;

  const formatTime = (time: string | null) => {
    if (!time) return null;
    return time.slice(0, 5);
  };

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questa attività?")) {
      await onDelete(activity.id);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-card/80 rounded-2xl border border-border/60 hover:bg-card transition-all group">
      <div className={`p-2 rounded-xl ${config.bgColor} h-fit`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm">{activity.title}</h4>
          {isCreator && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {(activity.start_time || activity.end_time) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatTime(activity.start_time)}
              {activity.end_time && ` - ${formatTime(activity.end_time)}`}
            </span>
          </div>
        )}

        {activity.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{activity.location}</span>
          </div>
        )}

        {activity.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
}

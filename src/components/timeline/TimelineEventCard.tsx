import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Train,
  Bus,
  Car,
  Ship,
  MapPin,
  Clock,
  LogIn,
  LogOut,
  Utensils,
  Camera,
  Ticket,
  ShoppingBag,
  Mountain,
  Building2,
  MoreHorizontal,
  Trash2,
  Loader2,
  Eye,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import type { TimelineEvent } from "@/hooks/useTimelineEvents";
import type { ItineraryActivity } from "@/hooks/useItinerary";

interface TimelineEventCardProps {
  event: TimelineEvent;
  isFirst?: boolean;
  isLast?: boolean;
  eventIndex?: number;
  onDelete?: (id: string) => Promise<boolean>;
  onViewActivity?: (activity: ItineraryActivity) => void;
}

const transportIcons: Record<string, React.ElementType> = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
  ferry: Ship,
  other: MoreHorizontal,
};

const activityIcons: Record<string, React.ElementType> = {
  food: Utensils,
  restaurant: Utensils,
  sightseeing: Camera,
  tour: Ticket,
  shopping: ShoppingBag,
  nature: Mountain,
  museum: Building2,
  activity: Ticket,
  entertainment: Ticket,
  relaxation: Mountain,
  other: MapPin,
};

const getEventStyles = (type: TimelineEvent["type"], category?: string) => {
  switch (type) {
    case "transport":
      return {
        gradient: "from-sky-500/10 via-sky-500/5 to-transparent",
        iconBg: "bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-900/40 dark:to-sky-800/20",
        iconColor: "text-sky-600 dark:text-sky-400",
        accent: "bg-sky-500",
        border: "border-sky-200/60 dark:border-sky-800/40",
        pill: "bg-sky-100/80 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
      };
    case "accommodation-checkin":
      return {
        gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
        iconBg: "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20",
        iconColor: "text-amber-600 dark:text-amber-400",
        accent: "bg-amber-500",
        border: "border-amber-200/60 dark:border-amber-800/40",
        pill: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      };
    case "accommodation-checkout":
      return {
        gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
        iconBg: "bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20",
        iconColor: "text-orange-600 dark:text-orange-400",
        accent: "bg-orange-500",
        border: "border-orange-200/60 dark:border-orange-800/40",
        pill: "bg-orange-100/80 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
      };
    case "activity":
    default:
      return {
        gradient: "from-primary/10 via-primary/5 to-transparent",
        iconBg: "bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10",
        iconColor: "text-primary",
        accent: "bg-primary",
        border: "border-primary/20 dark:border-primary/30",
        pill: "bg-primary/10 text-primary dark:bg-primary/20",
      };
  }
};

const getIcon = (type: TimelineEvent["type"], category?: string) => {
  switch (type) {
    case "transport":
      return transportIcons[category || "other"] || transportIcons.other;
    case "accommodation-checkin":
      return LogIn;
    case "accommodation-checkout":
      return LogOut;
    case "activity":
      return activityIcons[category || "activity"] || activityIcons.activity;
    default:
      return MapPin;
  }
};

export function TimelineEventCard({ event, isFirst, isLast, eventIndex = 0, onDelete, onViewActivity }: TimelineEventCardProps) {
  const [deleting, setDeleting] = useState(false);
  const styles = getEventStyles(event.type, event.category);
  const Icon = getIcon(event.type, event.category);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    const originalId = event.id.replace("activity-", "");
    await onDelete(originalId);
    setDeleting(false);
  };

  const handleViewActivity = () => {
    if (event.type === "activity" && event.originalData && onViewActivity) {
      onViewActivity(event.originalData as ItineraryActivity);
    }
  };

  const isActivity = event.type === "activity";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: eventIndex * 0.05, duration: 0.3, ease: "easeOut" }}
      className="relative pl-6 md:pl-8"
    >
      {/* Timeline Node */}
      <div className="absolute left-0 top-5 md:top-6">
        <div className={cn(
          "relative w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center",
          styles.iconBg,
          "ring-[3px] ring-background shadow-sm"
        )}>
          <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", styles.accent)} />
        </div>
      </div>

      {/* Event Card */}
      <motion.div 
        whileHover={{ scale: 1.005, y: -1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card/95 backdrop-blur-sm",
          "shadow-sm hover:shadow-md transition-all duration-300",
          styles.border,
          "group cursor-pointer"
        )}
        onClick={isActivity && onViewActivity ? handleViewActivity : undefined}
      >
        {/* Subtle Gradient Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-60",
          styles.gradient
        )} />
        
        {/* Card Content */}
        <div className="relative p-3.5 md:p-4">
          {/* Top Row: Time & Actions */}
          <div className="flex items-center justify-between mb-2.5">
            {event.time ? (
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold",
                styles.pill
              )}>
                <Clock className="w-3 h-3" />
                <span>
                  {event.time}
                  {event.endTime && (
                    <>
                      <ArrowRight className="w-3 h-3 inline mx-1" />
                      {event.endTime}
                    </>
                  )}
                </span>
              </div>
            ) : (
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                "bg-muted/60 text-muted-foreground"
              )}>
                <Clock className="w-3 h-3" />
                <span>Orario flessibile</span>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isActivity && onViewActivity && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handleViewActivity(); }}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Visualizza dettagli"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminare questa attività?</AlertDialogTitle>
                      <AlertDialogDescription>
                        L'attività "{event.title}" verrà eliminata permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleting}
                      >
                        {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Elimina
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Main Content Row */}
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "shrink-0 p-2.5 rounded-xl shadow-sm",
              styles.iconBg
            )}>
              <Icon className={cn("w-4 h-4 md:w-5 md:h-5", styles.iconColor)} />
            </div>
            
            {/* Text Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="font-semibold text-foreground text-sm md:text-base leading-tight truncate pr-2">
                {event.title}
              </h4>
              {event.subtitle && (
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">
                  {event.subtitle}
                </p>
              )}
              
              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0 text-muted-foreground/70" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
            
            {/* Arrow indicator for clickable cards */}
            {isActivity && onViewActivity && (
              <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details Section */}
          {event.details && (event.details.transportType || event.details.carrier || event.details.bookingReference || event.details.price || event.details.notes) && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <div className="flex flex-wrap gap-1.5">
                {event.details.transportType && (
                  <span className={cn("text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-md capitalize", styles.pill)}>
                    {event.details.transportType}
                  </span>
                )}
                {event.details.carrier && (
                  <span className="text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                    {event.details.carrier}
                  </span>
                )}
                {event.details.bookingReference && (
                  <span className="text-[10px] md:text-xs font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                    #{event.details.bookingReference}
                  </span>
                )}
                {event.details.price && (
                  <span className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {event.details.price.toFixed(2)} {event.details.currency || "EUR"}
                  </span>
                )}
              </div>
              {event.details.notes && (
                <p className="mt-2 text-[11px] md:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {event.details.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

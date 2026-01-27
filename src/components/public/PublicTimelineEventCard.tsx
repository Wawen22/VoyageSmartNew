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
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PublicEventType = "activity" | "transport" | "accommodation-checkin" | "accommodation-checkout" | "accommodation-stay";

export interface PublicTimelineEvent {
  id: string;
  type: PublicEventType;
  title: string;
  subtitle?: string;
  time?: string;
  endTime?: string;
  location?: string;
  category?: string;
  details?: {
    transportType?: string;
    carrier?: string;
  };
}

interface PublicTimelineEventCardProps {
  event: PublicTimelineEvent;
  isFirst?: boolean;
  isLast?: boolean;
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

const getEventStyles = (type: PublicEventType) => {
  switch (type) {
    case "transport":
      return {
        bg: "bg-card/90",
        border: "border-border/60",
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        accent: "bg-sky-500",
      };
    case "accommodation-checkin":
      return {
        bg: "bg-card/90",
        border: "border-border/60",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        accent: "bg-amber-500",
      };
    case "accommodation-checkout":
      return {
        bg: "bg-card/90",
        border: "border-border/60",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        accent: "bg-orange-500",
      };
    case "accommodation-stay":
      return {
        bg: "bg-card/90",
        border: "border-border/60",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        accent: "bg-amber-400",
      };
    case "activity":
    default:
      return {
        bg: "bg-card/90",
        border: "border-border/60",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        accent: "bg-primary",
      };
  }
};

const getIcon = (type: PublicEventType, category?: string) => {
  switch (type) {
    case "transport":
      return transportIcons[category || "other"] || transportIcons.other;
    case "accommodation-checkin":
      return LogIn;
    case "accommodation-checkout":
      return LogOut;
    case "accommodation-stay":
      return Home;
    case "activity":
      return activityIcons[category || "activity"] || activityIcons.activity;
    default:
      return MapPin;
  }
};

export function PublicTimelineEventCard({ event, isFirst, isLast }: PublicTimelineEventCardProps) {
  const styles = getEventStyles(event.type);
  const Icon = getIcon(event.type, event.category || event.details?.transportType);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative pl-8"
    >
      {/* Timeline line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border">
        {isFirst && <div className="absolute -top-4 left-0 w-full h-4 bg-gradient-to-b from-transparent to-border" />}
        {isLast && <div className="absolute -bottom-4 left-0 w-full h-4 bg-gradient-to-t from-transparent to-border" />}
      </div>

      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-4 w-6 h-6 rounded-full flex items-center justify-center z-10",
        styles.iconBg,
        "ring-4 ring-background"
      )}>
        <div className={cn("w-2 h-2 rounded-full", styles.accent)} />
      </div>

      {/* Event card */}
      <div className={cn(
        "rounded-2xl border p-4 transition-all hover:shadow-card",
        styles.bg,
        styles.border
      )}>
        {/* Time badge */}
        {event.time && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Clock className="w-3 h-3" />
            <span className="font-medium">
              {event.time}
              {event.endTime && ` - ${event.endTime}`}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg shrink-0", styles.iconBg)}>
            <Icon className={cn("w-4 h-4", styles.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
            {event.subtitle && (
              <p className="text-sm text-muted-foreground truncate">{event.subtitle}</p>
            )}
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Transport details */}
        {event.details && (event.details.transportType || event.details.carrier) && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex flex-wrap gap-2 text-xs">
              {event.details.transportType && (
                <span className="app-pill bg-sky-100 text-sky-700 capitalize">
                  {event.details.transportType}
                </span>
              )}
              {event.details.carrier && (
                <span className="app-pill bg-muted/70 text-muted-foreground">
                  {event.details.carrier}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

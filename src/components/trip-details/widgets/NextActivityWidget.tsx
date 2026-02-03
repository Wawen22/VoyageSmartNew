import { motion } from "framer-motion";
import { format, differenceInDays, differenceInMinutes, parseISO, isToday, isTomorrow } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Ship, 
  BedDouble, 
  Ticket,
  MoveRight,
  MoreHorizontal,
  Timer,
  Moon,
  ArrowRight,
  Map as MapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNextActivity, NextEvent } from "@/hooks/useNextActivity";
import { cn } from "@/lib/utils";

interface NextActivityWidgetProps {
  tripId: string;
}

// --- Theme Logic (Duplicated from TransportCard for consistency) ---
const TRANSPORT_THEMES: Record<string, {
  icon: any;
  label: string;
  bgGradient: string;
  borderColor: string;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  accentBarColor: string;
}> = {
  flight: {
    icon: Plane,
    label: 'Volo',
    bgGradient: "from-cyan-50 to-sky-50/50 dark:from-cyan-950/30 dark:to-sky-950/10",
    borderColor: "hover:border-cyan-200 dark:hover:border-cyan-800",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-100/50 dark:bg-cyan-900/20",
    accentColor: "text-cyan-700 dark:text-cyan-300",
    accentBarColor: "bg-cyan-500/50",
  },
  train: {
    icon: Train,
    label: 'Treno',
    bgGradient: "from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/10",
    borderColor: "hover:border-emerald-200 dark:hover:border-emerald-800",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100/50 dark:bg-emerald-900/20",
    accentColor: "text-emerald-700 dark:text-emerald-300",
    accentBarColor: "bg-emerald-500/50",
  },
  bus: {
    icon: Bus,
    label: 'Bus',
    bgGradient: "from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/10",
    borderColor: "hover:border-amber-200 dark:hover:border-amber-800",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100/50 dark:bg-amber-900/20",
    accentColor: "text-amber-700 dark:text-amber-300",
    accentBarColor: "bg-amber-500/50",
  },
  car: {
    icon: Car,
    label: 'Auto',
    bgGradient: "from-violet-50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/10",
    borderColor: "hover:border-violet-200 dark:hover:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100/50 dark:bg-violet-900/20",
    accentColor: "text-violet-700 dark:text-violet-300",
    accentBarColor: "bg-violet-500/50",
  },
  ferry: {
    icon: Ship,
    label: 'Traghetto',
    bgGradient: "from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/10",
    borderColor: "hover:border-blue-200 dark:hover:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100/50 dark:bg-blue-900/20",
    accentColor: "text-blue-700 dark:text-blue-300",
    accentBarColor: "bg-blue-500/50",
  },
  other: {
    icon: MoreHorizontal,
    label: 'Altro',
    bgGradient: "from-slate-50 to-gray-50/50 dark:from-slate-950/30 dark:to-gray-950/10",
    borderColor: "hover:border-slate-200 dark:hover:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    iconBg: "bg-slate-100/50 dark:bg-slate-900/20",
    accentColor: "text-slate-700 dark:text-slate-300",
    accentBarColor: "bg-slate-500/50",
  },
};

export function NextActivityWidget({ tripId }: NextActivityWidgetProps) {
  const { nextActivity, isLoading } = useNextActivity(tripId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="col-span-1 md:col-span-2 lg:col-span-2 rounded-3xl h-[220px] bg-muted/50 animate-pulse" />
    );
  }

  if (!nextActivity) return null;

  const handleNavigateToSection = () => {
    switch (nextActivity.type) {
      case 'transport':
        navigate(`/transports?trip=${tripId}`);
        break;
      case 'accommodation':
        navigate(`/accommodations?trip=${tripId}`);
        break;
      case 'activity':
      default:
        navigate(`/itinerary?trip=${tripId}`);
        break;
    }
  };

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nextActivity.location) return;
    const query = encodeURIComponent(nextActivity.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-1 md:col-span-2 lg:col-span-2 relative group cursor-pointer"
      onClick={handleNavigateToSection}
    >
      {/* Dynamic Render based on type */}
      {nextActivity.type === 'transport' && <TransportContent event={nextActivity} onMapClick={handleOpenMaps} />}
      {nextActivity.type === 'accommodation' && <AccommodationContent event={nextActivity} onMapClick={handleOpenMaps} />}
      {nextActivity.type === 'activity' && <ActivityContent event={nextActivity} onMapClick={handleOpenMaps} />}
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS FOR SPECIFIC TYPES
// ----------------------------------------------------------------------

function HeaderPill({ label, colorClass }: { label: string, colorClass: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="relative flex h-2.5 w-2.5">
         <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", colorClass.replace('text-', 'bg-'))}></span>
         <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", colorClass.replace('text-', 'bg-'))}></span>
      </span>
      <span className={cn("text-xs font-bold uppercase tracking-widest", colorClass)}>
        Prossima Tappa
      </span>
      <span className="text-muted-foreground">|</span>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

function TransportContent({ event, onMapClick }: { event: NextEvent, onMapClick: (e: React.MouseEvent) => void }) {
  const details = event.details;
  const tType = (details?.transport_type || 'other') as string;
  const theme = TRANSPORT_THEMES[tType] || TRANSPORT_THEMES.other;
  const Icon = theme.icon;
  
  const depDate = new Date(details.departure_datetime);
  const arrDate = details.arrival_datetime ? new Date(details.arrival_datetime) : null;
  
  // Duration calculation
  let durationStr = "";
  if (arrDate) {
    const diff = differenceInMinutes(arrDate, depDate);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    durationStr = `${h}h ${m > 0 ? `${m}m` : ''}`;
  }

  return (
    <div className={cn(
      "relative h-full overflow-hidden rounded-3xl border border-white/20 bg-background/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between",
      "bg-gradient-to-br", theme.bgGradient, theme.borderColor
    )}>
       {/* Background Watermark */}
       <div className="absolute -right-6 -bottom-8 opacity-[0.07] pointer-events-none select-none transform -rotate-12">
          <Icon strokeWidth={1} className={cn("w-48 h-48", theme.iconColor)} />
       </div>

       <div>
         <HeaderPill label={theme.label} colorClass={theme.iconColor} />

         <div className="flex items-center gap-3 mb-4">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm ring-1 ring-inset ring-black/5", theme.iconBg, theme.iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
               <h3 className="font-bold text-lg leading-tight">{details.carrier || theme.label}</h3>
               {details.booking_reference && (
                 <div className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                   <Ticket className="w-3 h-3" /> {details.booking_reference}
                 </div>
               )}
            </div>
         </div>
       </div>

       {/* Journey Grid */}
       <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden">
             <div className={cn("absolute top-0 left-0 w-1 h-full", theme.accentBarColor)}></div>
             <div className="pl-1.5">
               <span className="text-[10px] font-bold uppercase opacity-60">Partenza</span>
               <div className="text-xl font-bold tabular-nums my-0.5">{format(depDate, "HH:mm")}</div>
               <div className="text-xs text-muted-foreground truncate leading-tight">{details.departure_location}</div>
             </div>
          </div>

          <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden">
             <div className={cn("absolute top-0 left-0 w-1 h-full opacity-60", theme.accentBarColor)}></div>
             <div className="pl-1.5">
               <span className="text-[10px] font-bold uppercase opacity-60">Arrivo</span>
               <div className="text-xl font-bold tabular-nums my-0.5">
                 {arrDate ? format(arrDate, "HH:mm") : "--:--"}
               </div>
               <div className="text-xs text-muted-foreground truncate leading-tight">{details.arrival_location}</div>
             </div>
          </div>
       </div>

       {/* Footer */}
       <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
             {durationStr && (
               <Badge variant="secondary" className="bg-white/50 dark:bg-white/10 text-xs font-normal gap-1">
                  <Timer className="w-3 h-3" /> {durationStr}
               </Badge>
             )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50" onClick={onMapClick}>
               <MapIcon className="w-4 h-4 text-muted-foreground" />
            </Button>
            <div className="bg-white/50 dark:bg-white/10 rounded-full p-1.5">
               <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
       </div>
    </div>
  );
}


function AccommodationContent({ event, onMapClick }: { event: NextEvent, onMapClick: (e: React.MouseEvent) => void }) {
  const details = event.details;
  const checkIn = new Date(details.check_in);
  const checkOut = new Date(details.check_out);
  const nights = differenceInDays(checkOut, checkIn);
  
  // Theme for accommodation (Rose/Indigo mix)
  const theme = {
     bgGradient: "from-rose-50 to-indigo-50/50 dark:from-rose-950/20 dark:to-indigo-950/10",
     borderColor: "hover:border-rose-200 dark:hover:border-rose-800",
     iconColor: "text-rose-600 dark:text-rose-400",
  };

  return (
    <div className={cn(
      "relative h-full overflow-hidden rounded-3xl border border-white/20 bg-background/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between",
      "bg-gradient-to-br", theme.bgGradient, theme.borderColor
    )}>
       <div className="absolute -right-6 -bottom-8 opacity-[0.07] pointer-events-none select-none transform -rotate-12">
          <BedDouble strokeWidth={1} className="w-48 h-48 text-rose-600 dark:text-rose-400" />
       </div>

       <div>
         <HeaderPill label="Alloggio" colorClass="text-rose-600 dark:text-rose-400" />

         <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm ring-1 ring-inset ring-black/5 bg-rose-100/50 dark:bg-rose-900/20 text-rose-600">
              <BedDouble className="h-5 w-5" />
            </div>
            <div className="min-w-0">
               <h3 className="font-bold text-lg leading-tight truncate">{details.name}</h3>
               <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                 <MapPin className="w-3 h-3 shrink-0" /> 
                 <span className="truncate">{details.address || "Indirizzo non disponibile"}</span>
               </div>
            </div>
         </div>
       </div>

       {/* Dates Grid */}
       <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50"></div>
             <div className="pl-1.5">
               <span className="text-[10px] font-bold uppercase opacity-60 text-rose-600">Check-in</span>
               <div className="text-base font-bold my-0.5">{format(checkIn, "d MMM", { locale: it })}</div>
               <div className="text-xs text-muted-foreground">{details.check_in_time || "14:00"}</div>
             </div>
          </div>

          <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-white/20 dark:border-white/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
             <div className="pl-1.5">
               <span className="text-[10px] font-bold uppercase opacity-60 text-indigo-600">Check-out</span>
               <div className="text-base font-bold my-0.5">{format(checkOut, "d MMM", { locale: it })}</div>
               <div className="text-xs text-muted-foreground">{details.check_out_time || "10:00"}</div>
             </div>
          </div>
       </div>

       <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5">
          <Badge variant="secondary" className="bg-white/50 dark:bg-white/10 text-xs font-normal gap-1">
             <Moon className="w-3 h-3" /> {nights} {nights === 1 ? "notte" : "notti"}
          </Badge>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50" onClick={onMapClick}>
               <MapIcon className="w-4 h-4 text-muted-foreground" />
            </Button>
            <div className="bg-white/50 dark:bg-white/10 rounded-full p-1.5">
               <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
       </div>
    </div>
  );
}


function ActivityContent({ event, onMapClick }: { event: NextEvent, onMapClick: (e: React.MouseEvent) => void }) {
  const details = event.details;
  const date = new Date(event.datetime);
  
  const theme = {
    bgGradient: "from-violet-50 to-fuchsia-50/50 dark:from-violet-950/20 dark:to-fuchsia-950/10",
    borderColor: "hover:border-violet-200 dark:hover:border-violet-800",
    iconColor: "text-violet-600 dark:text-violet-400",
  };

  const getDayLabel = () => {
    if (isToday(date)) return "Oggi";
    if (isTomorrow(date)) return "Domani";
    return format(date, "EEEE d", { locale: it });
  };

  return (
    <div className={cn(
      "relative h-full overflow-hidden rounded-3xl border border-white/20 bg-background/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between",
      "bg-gradient-to-br", theme.bgGradient, theme.borderColor
    )}>
       <div className="absolute -right-6 -bottom-8 opacity-[0.07] pointer-events-none select-none transform -rotate-12">
          <Ticket strokeWidth={1} className="w-48 h-48 text-violet-600 dark:text-violet-400" />
       </div>

       <div>
         <HeaderPill label="Attività" colorClass="text-violet-600 dark:text-violet-400" />

         <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm ring-1 ring-inset ring-black/5 bg-violet-100/50 dark:bg-violet-900/20 text-violet-600">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="min-w-0">
               <h3 className="font-bold text-lg leading-tight line-clamp-2">{details.title}</h3>
               {details.category && (
                 <p className="text-xs text-muted-foreground mt-0.5 capitalize">{details.category}</p>
               )}
            </div>
         </div>
       </div>

       {/* Time & Location */}
       <div className="space-y-2 relative z-10 bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-white/20 dark:border-white/5">
          <div className="flex items-center gap-2">
             <CalendarIcon className="w-4 h-4 text-violet-500" />
             <span className="text-sm font-medium capitalize">{getDayLabel()}</span>
             {details.start_time && (
               <>
                 <span className="text-muted-foreground">•</span>
                 <span className="text-sm font-bold">{details.start_time.slice(0, 5)}</span>
               </>
             )}
          </div>
          {details.location && (
            <div className="flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground line-clamp-1">{details.location}</span>
            </div>
          )}
       </div>

       <div className="flex items-center justify-end mt-4 pt-3 border-t border-black/5 dark:border-white/5 gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50" onClick={onMapClick}>
               <MapIcon className="w-4 h-4 text-muted-foreground" />
          </Button>
          <div className="bg-white/50 dark:bg-white/10 rounded-full p-1.5">
             <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
       </div>
    </div>
  );
}
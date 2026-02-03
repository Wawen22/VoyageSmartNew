import { motion } from "framer-motion";
import { format, differenceInDays, parseISO, isBefore, isAfter, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  PlaneTakeoff, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Route,
  Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTripDestinations } from "@/hooks/useTripDestinations";
import { cn } from "@/lib/utils";

interface TripStatusWidgetProps {
  trip: any; // Ideally typed as Trip
}

export function TripStatusWidget({ trip }: TripStatusWidgetProps) {
  const { data: destinations = [] } = useTripDestinations(trip.id);
  
  const startDate = parseISO(trip.start_date);
  const endDate = parseISO(trip.end_date);
  const now = new Date();
  
  // Logic Status
  const isUpcomingDate = isBefore(now, startDate);
  const isEndedDate = isAfter(now, addDays(endDate, 1)); 
  const isOngoingDate = !isUpcomingDate && !isEndedDate;

  // Determine status: prioritize explicit 'trip.status' if available and valid
  const status = trip.status || (isUpcomingDate ? 'upcoming' : isEndedDate ? 'completed' : 'ongoing');

  // Calcs
  const daysUntilStart = differenceInDays(startDate, now);
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const daysElapsed = differenceInDays(now, startDate) + 1;
  
  // Progress is only relevant for 'ongoing' or 'completed'
  let progress = 0;
  if (status === 'completed') progress = 100;
  else if (status === 'ongoing' || isOngoingDate) progress = Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);

  // Theme Logic
  const getTheme = () => {
    switch (status) {
      case 'planning':
        return {
          gradient: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
          border: "hover:border-amber-500/30",
          icon: Clock,
          iconColor: "text-amber-500",
          textColor: "text-amber-600 dark:text-amber-400",
          label: "In Pianificazione",
          barColor: "bg-amber-500"
        };
      case 'upcoming':
        return {
          gradient: "from-lime-500/10 via-emerald-500/5 to-green-500/10",
          border: "hover:border-lime-500/30",
          icon: PlaneTakeoff,
          iconColor: "text-lime-600 dark:text-lime-400",
          textColor: "text-lime-700 dark:text-lime-400",
          label: "In Arrivo",
          barColor: "bg-lime-500"
        };
      case 'ongoing':
        return {
          gradient: "from-emerald-500/10 via-green-500/5 to-teal-500/10",
          border: "hover:border-emerald-500/30",
          icon: Globe,
          iconColor: "text-emerald-500",
          textColor: "text-emerald-600 dark:text-emerald-400",
          label: "In Corso",
          barColor: "bg-emerald-500"
        };
      case 'completed':
      default:
        return {
          gradient: "from-slate-500/10 via-gray-500/5 to-zinc-500/10",
          border: "hover:border-slate-500/30",
          icon: CheckCircle2,
          iconColor: "text-slate-500",
          textColor: "text-slate-600 dark:text-slate-400",
          label: "Completato",
          barColor: "bg-slate-500"
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  // Fallback if no destinations in table, use trip.destination string
  const displayDestinations = destinations.length > 0 
    ? destinations 
    : (trip.destination ? trip.destination.split(',').map((d: string) => ({ name: d.trim(), id: d })) : []);

  // Content Renderer
  const renderMainContent = () => {
    if (status === 'planning') {
      return (
        <div>
           <div className="flex items-baseline gap-1.5">
               <span className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                   {daysUntilStart > 0 ? daysUntilStart : "?"}
               </span>
               <span className="text-lg font-medium text-muted-foreground">
                   giorni stimati
               </span>
           </div>
           <p className="text-sm text-muted-foreground font-medium mt-1 pl-1">
              Organizza al meglio il tuo viaggio! ✏️
           </p>
        </div>
      );
    }
    
    if (status === 'upcoming') {
      return (
        <div>
           <div className="flex items-baseline gap-1.5">
               <span className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground tabular-nums">
                   {Math.max(0, daysUntilStart)}
               </span>
               <span className="text-lg font-medium text-muted-foreground">
                   giorni
               </span>
           </div>
           <p className="text-sm text-muted-foreground font-medium mt-1 pl-1">
              {daysUntilStart <= 0 ? "Si parte oggi! 🚀" : "alla partenza"}
           </p>
        </div>
      );
    }

    if (status === 'ongoing') {
      return (
        <div className="space-y-4">
             <div className="flex justify-between items-end">
                <div>
                    <span className="text-4xl font-bold text-foreground block mb-0.5">Giorno {Math.max(1, daysElapsed)}</span>
                    <span className="text-sm text-muted-foreground font-medium">di {totalDays} giorni totali</span>
                </div>
                <span className={cn("text-xl font-bold", theme.textColor)}>{Math.round(progress)}%</span>
             </div>
             <Progress value={progress} className="h-3 bg-black/5 dark:bg-white/10" indicatorClassName={theme.barColor} />
         </div>
      );
    }

    return (
       <div>
           <span className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Viaggio Concluso</span>
           <p className="text-muted-foreground mt-2 font-medium">Speriamo sia stato indimenticabile!</p>
       </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "col-span-1 md:col-span-2 relative overflow-hidden rounded-3xl border border-white/20 bg-background/60 backdrop-blur-xl shadow-sm transition-all p-6 flex flex-col justify-between group h-full min-h-[240px]",
        "bg-gradient-to-br", theme.gradient, theme.border
      )}
    >
      {/* Background Decorative */}
      <div className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none", theme.textColor.replace("text-", "bg-"))} />

      {/* HEADER */}
      <div className="flex justify-between items-start relative z-10 mb-6">
        <div className="flex items-center gap-2.5">
            <div className={cn("p-2.5 rounded-xl bg-white/50 dark:bg-white/10 backdrop-blur-md shadow-sm ring-1 ring-inset ring-black/5", theme.iconColor)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest leading-tight", theme.textColor)}>
                  {theme.label}
              </span>
              <span className="text-xs text-muted-foreground font-medium">Stato Viaggio</span>
            </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 dark:bg-black/10 border border-white/20 dark:border-white/5 text-xs font-medium text-foreground/80 backdrop-blur-sm shadow-sm">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{format(startDate, "d MMM", { locale: it })}</span>
            <ArrowRight className="w-3 h-3 opacity-30" />
            <span>{format(endDate, "d MMM", { locale: it })}</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-grow flex flex-col justify-center mb-6">
         {renderMainContent()}
      </div>

      {/* FOOTER: Itinerary / Destinations */}
      <div className="relative z-10 pt-4 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3">
            <Route className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Itinerario</span>
        </div>
        
        {/* Timeline Visualization */}
        <div className="flex flex-wrap items-center gap-y-2">
            {displayDestinations.map((dest: any, index: number) => (
                <div key={dest.id || index} className="flex items-center group/dest">
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors",
                      "bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/5",
                      "group-hover/dest:bg-white/60 dark:group-hover/dest:bg-white/10"
                    )}>
                        <MapPin className="w-3 h-3 text-muted-foreground group-hover/dest:text-foreground transition-colors" />
                        <span className="text-sm font-semibold text-foreground/90 leading-none pb-0.5">
                            {dest.name}
                        </span>
                    </div>
                    
                    {/* Connector Arrow */}
                    {index < displayDestinations.length - 1 && (
                         <div className="px-2 text-muted-foreground/30 flex items-center">
                            <ArrowRight className="w-3.5 h-3.5" />
                         </div>
                    )}
                </div>
            ))}
            
            {displayDestinations.length === 0 && (
              <span className="text-xs text-muted-foreground italic">Nessuna tappa specificata</span>
            )}
        </div>
      </div>
    </motion.div>
  );
}
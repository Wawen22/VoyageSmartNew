import { motion } from "framer-motion";
import { format, differenceInDays, parseISO, isPast, isFuture, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { MapPin, Calendar, Plane, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripStatusWidgetProps {
  trip: any; // Using trip object
  stats: any; // Using stats from hook
}

export function TripStatusWidget({ trip, stats }: TripStatusWidgetProps) {
  // Logic for progress bar
  const totalDays = stats.tripDuration || 1;
  const daysPassed = stats.tripStatus === 'completed' ? totalDays : 
                     stats.tripStatus === 'upcoming' ? 0 : 
                     (totalDays - stats.daysUntilEnd); 
  
  // Ensure we don't divide by zero and clamp
  const progressPercent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

  const currentDay = Math.min(daysPassed + 1, totalDays);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-6 shadow-xl h-full flex flex-col justify-between group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div className="space-y-1">
           <h3 className="text-sm font-medium text-background/70 uppercase tracking-widest flex items-center gap-2">
              <Plane className="w-3.5 h-3.5" />
              Viaggio {stats.tripStatus === 'ongoing' ? 'in corso' : stats.tripStatus === 'completed' ? 'completato' : 'in arrivo'}
           </h3>
           <div className="text-3xl font-bold tracking-tight">
             {stats.tripStatus === 'ongoing' ? (
                <>Giorno {currentDay} <span className="text-background/40">/ {totalDays}</span></>
             ) : stats.tripStatus === 'upcoming' ? (
                <>- {stats.daysUntilStart} <span className="text-lg font-medium text-background/60">giorni</span></>
             ) : (
                <>Concluso</>
             )}
           </div>
        </div>
        
        {/* Country Code Pill (Fake for now or derived) */}
        <div className="px-3 py-1 rounded-full bg-background/10 backdrop-blur-md border border-background/10 text-xs font-bold">
           {trip.destination.split(',').pop()?.trim().slice(0, 3).toUpperCase() || "INT"}
        </div>
      </div>

      {/* Progress Bar (Visual) */}
      <div className="relative h-1.5 w-full bg-background/10 rounded-full overflow-hidden my-6">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${progressPercent}%` }}
           transition={{ duration: 1, delay: 0.5 }}
           className="absolute top-0 left-0 h-full bg-primary"
         />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm font-medium z-10">
         <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{format(parseISO(trip.start_date), "d MMM", { locale: it })}</span>
         </div>
         <div className="h-1 w-1 rounded-full bg-background/30" />
         <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-primary" />
            <span>{format(parseISO(trip.end_date), "d MMM", { locale: it })}</span>
         </div>
      </div>
    </div>
  );
}

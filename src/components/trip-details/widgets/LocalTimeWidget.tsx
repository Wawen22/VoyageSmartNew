import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Clock, Moon, Sun, Globe2 } from "lucide-react";
import { useDestinationTime } from "@/hooks/useDestinationTime";
import { cn } from "@/lib/utils";

interface LocalTimeWidgetProps {
  latitude?: number | null;
  longitude?: number | null;
  destinationName?: string;
}

export function LocalTimeWidget({ latitude, longitude, destinationName }: LocalTimeWidgetProps) {
  const { time, offset, isLoading } = useDestinationTime(latitude, longitude);

  if (!latitude || !longitude) return null;

  // Determine Day/Night theme based on hour (simple logic)
  const hour = time ? time.getHours() : 12;
  const isNight = hour < 6 || hour > 20;

  const theme = isNight 
    ? {
        gradient: "from-slate-900/80 via-indigo-950/60 to-slate-900/80",
        border: "border-indigo-500/30",
        text: "text-indigo-100",
        icon: Moon,
        iconColor: "text-indigo-300",
        label: "Notte"
      }
    : {
        gradient: "from-orange-100/50 via-sky-100/30 to-blue-100/20 dark:from-sky-900/20 dark:via-blue-900/10 dark:to-slate-900/20",
        border: "border-orange-500/20 dark:border-sky-500/20",
        text: "text-foreground",
        icon: Sun,
        iconColor: "text-orange-500",
        label: "Giorno"
      };

  const Icon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "col-span-1 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[180px]",
        "bg-gradient-to-br backdrop-blur-md shadow-sm border",
        theme.gradient, theme.border
      )}
    >
       {/* Decorative Elements */}
       {isNight ? (
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-indigo-100/10 blur-xl"></div>
       ) : (
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-orange-400/20 blur-2xl"></div>
       )}

       {/* Header */}
       <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-xl bg-white/10 backdrop-blur-md", theme.iconColor)}>
               <Clock className="w-4 h-4" />
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-80", theme.text)}>
                Ora Locale
            </span>
        </div>
        {offset && (
           <div className="text-[10px] font-medium px-2 py-1 rounded-full border bg-white/10 backdrop-blur-md border-white/10">
              {offset}
           </div>
        )}
      </div>

      {/* Main Clock */}
      <div className="relative z-10 mt-2 text-center">
         {isLoading || !time ? (
             <div className="animate-pulse h-10 w-24 bg-white/10 rounded mx-auto my-2" />
         ) : (
             <div className="space-y-0.5">
                 <div className={cn("text-4xl md:text-5xl font-bold tracking-tighter tabular-nums", theme.text)}>
                    {format(time, "HH:mm")}
                 </div>
                 <div className={cn("text-sm font-medium opacity-70", theme.text)}>
                    {format(time, "EEEE, d MMM", { locale: it })}
                 </div>
             </div>
         )}
      </div>

      {/* Footer / Location */}
      <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
          <Globe2 className={cn("w-3.5 h-3.5 opacity-60", theme.text)} />
          <span className={cn("text-xs font-medium truncate max-w-[120px]", theme.text)}>
             {destinationName || "Destinazione"}
          </span>
      </div>
    </motion.div>
  );
}

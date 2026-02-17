import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Clock, Globe, MapPin, Moon, Sun } from "lucide-react";
import { useDestinationTime } from "@/hooks/useDestinationTime";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface WorldClocksWidgetProps {
  latitude?: number | null;
  longitude?: number | null;
  destinationName?: string;
}

export function WorldClocksWidget({ latitude, longitude, destinationName }: WorldClocksWidgetProps) {
  const { time: destTime, offset, isLoading } = useDestinationTime(latitude, longitude);
  const [homeTime, setHomeTime] = useState(new Date());

  // Ticker for Home Time
  useEffect(() => {
    const timer = setInterval(() => setHomeTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!latitude || !longitude) return null;

  // Determine themes
  const getTheme = (date: Date) => {
    const h = date.getHours();
    const isNight = h < 6 || h > 20;
    return isNight ? 'night' : 'day';
  };

  const destTheme = destTime ? getTheme(destTime) : 'day';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-1 md:col-span-2 rounded-3xl p-5 border border-border/50 bg-card/50 backdrop-blur-xl shadow-sm min-h-[200px] flex flex-col justify-between"
    >
      {/* Widget Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Clock className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Fuso Orario
        </span>
      </div>

      {/* Clocks Container */}
      <div className="flex flex-col sm:flex-row gap-4 h-full">
         
         {/* Clock 1: HOME (Current Location) */}
         <div className="flex-1 rounded-2xl bg-gradient-to-br from-background to-muted/50 border border-border/50 p-4 relative overflow-hidden group">
            <div className="absolute top-3 right-3">
               <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background/80 px-2 py-1 rounded-full border">
                 Tua Posizione
               </span>
            </div>
            
            <div className="mt-6">
                <div className="text-4xl font-bold tracking-tighter text-foreground tabular-nums">
                    {format(homeTime, "HH:mm")}
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Ora Attuale</span>
                </div>
            </div>
         </div>

         {/* Clock 2: DESTINATION */}
         <div className={cn(
             "flex-1 rounded-2xl p-4 relative overflow-hidden transition-colors border",
             destTheme === 'night' 
               ? "bg-slate-950 border-slate-800 text-slate-100" 
               : "bg-orange-50 border-orange-100 text-orange-950 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
         )}>
            {/* Theme Background Decor */}
            {destTheme === 'night' ? (
               <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl" />
            ) : (
               <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl" />
            )}

            <div className="absolute top-3 right-3 flex items-center gap-2">
               {offset && (
                  <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-md",
                      destTheme === 'night' 
                        ? "bg-white/10 border-white/10 text-white/70" 
                        : "bg-white/20 border-black/5 dark:bg-white/10 dark:border-white/10 text-black/60 dark:text-white/70"
                  )}>
                    {offset}
                  </span>
               )}
            </div>

            <div className="mt-6 relative z-10">
                {isLoading || !destTime ? (
                    <div className="h-9 w-24 bg-current opacity-10 rounded animate-pulse" />
                ) : (
                    <div className="text-4xl font-bold tracking-tighter tabular-nums">
                        {format(destTime, "HH:mm")}
                    </div>
                )}
                
                <div className={cn(
                    "text-xs font-medium mt-1 flex items-center gap-1 opacity-70",
                )}>
                    <Globe className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{destinationName || "Destinazione"}</span>
                    {destTime && (
                       destTheme === 'night' ? <Moon className="w-3 h-3 ml-1" /> : <Sun className="w-3 h-3 ml-1" />
                    )}
                </div>
            </div>
         </div>

      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays, Sparkles, Plus, Cloud, CloudRain, Sun, Thermometer } from "lucide-react";
import { TimelineEventCard } from "./TimelineEventCard";
import { AddActivityDialog } from "@/components/itinerary/AddActivityDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TimelineDay } from "@/hooks/useTimelineEvents";
import type { ItineraryActivity } from "@/hooks/useItinerary";

const getWeatherIcon = (iconCode: string) => {
  if (iconCode.startsWith('01')) return <Sun className="w-4 h-4 text-amber-500" />;
  if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) return <Cloud className="w-4 h-4 text-slate-400" />;
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return <CloudRain className="w-4 h-4 text-blue-400" />;
  return <Cloud className="w-4 h-4 text-slate-400" />;
};

interface TimelineDaySectionProps {
  day: TimelineDay;
  dayNumber: number;
  isToday?: boolean;
  tripId: string;
  onAddActivity?: (data: any) => Promise<boolean>;
  onDeleteActivity?: (id: string) => Promise<boolean>;
  onViewActivity?: (activity: ItineraryActivity) => void;
}

export function TimelineDaySection({
  day,
  dayNumber,
  isToday,
  tripId,
  onAddActivity,
  onDeleteActivity,
  onViewActivity
}: TimelineDaySectionProps) {
  const isEmpty = day.events.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayNumber * 0.03, duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      {/* Day Section Container */}
      <div className="relative">
        {/* Date Header - Modern Card Style */}
        <div className={`
          relative overflow-hidden rounded-2xl mb-4
          ${isToday 
            ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-2 border-primary/20" 
            : "bg-gradient-to-r from-muted/80 via-muted/40 to-transparent border border-border/40"
          }
        `}>
          {/* Decorative Elements */}
          {isToday && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          )}
          
          <div className="relative p-4 md:p-5">
            <div className="flex items-center gap-4">
              {/* Day Number Badge */}
              <div className={`
                relative flex flex-col items-center justify-center min-w-[4rem] md:min-w-[4.5rem] py-2.5 px-3 rounded-xl
                ${isToday 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "bg-card border border-border/60 shadow-sm"
                }
              `}>
                <span className="text-[10px] uppercase tracking-wider font-medium opacity-80">
                  Giorno
                </span>
                <span className="text-2xl md:text-3xl font-bold leading-none">{dayNumber}</span>
              </div>
              
              {/* Date Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-lg md:text-xl font-bold capitalize tracking-tight ${isToday ? "text-primary" : "text-foreground"}`}>
                    {format(day.date, "EEEE", { locale: it })}
                  </h3>
                  {isToday && (
                    <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Oggi
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {format(day.date, "d MMMM yyyy", { locale: it })}
                </p>
              </div>
              
              {/* Weather Widget */}
              {day.weather && (
                <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl bg-background/50 border border-white/20 backdrop-blur-sm shadow-sm transition-all hover:bg-background/80">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          <div className="p-1.5 rounded-lg bg-muted/50">
                            {getWeatherIcon(day.weather.icon)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none">{day.weather.temp}°C</span>
                            <span className="text-[9px] text-muted-foreground capitalize leading-none mt-1 line-clamp-1 max-w-[60px]">
                              {day.weather.description}
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <p className="font-bold capitalize">{day.weather.description}</p>
                          <p className="text-muted-foreground">Min: {day.weather.temp_min}°C | Max: {day.weather.temp_max}°C</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
              {/* Right Section - Counter & Add Button */}
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div className={`
                  hidden sm:flex flex-col items-end px-3 py-1.5 rounded-lg
                  ${isEmpty ? "bg-muted/50" : "bg-primary/5"}
                `}>
                  <span className={`text-lg font-bold leading-none ${isEmpty ? "text-muted-foreground" : "text-primary"}`}>
                    {day.events.length}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {day.events.length === 1 ? "evento" : "eventi"}
                  </span>
                </div>
                {onAddActivity && (
                  <AddActivityDialog
                    tripId={tripId}
                    selectedDate={day.dateStr}
                    onAdd={onAddActivity}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Events Container */}
        <div className="relative pl-2 md:pl-4">
          {/* Vertical Timeline Line */}
          {!isEmpty && (
            <div className="absolute left-5 md:left-7 top-0 bottom-4 w-px bg-gradient-to-b from-border via-border/60 to-transparent" />
          )}
          
          {isEmpty ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 md:py-12 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/40">
                  <CalendarDays className="h-7 w-7 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-4">
                Nessun evento pianificato
              </p>
              {onAddActivity && (
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                  Clicca sul pulsante + per aggiungere la tua prima attività
                </p>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3 pb-6">
              {day.events.map((event, index) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  isFirst={index === 0}
                  isLast={index === day.events.length - 1}
                  eventIndex={index}
                  onDelete={event.type === "activity" && onDeleteActivity ? onDeleteActivity : undefined}
                  onViewActivity={event.type === "activity" && onViewActivity ? onViewActivity : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Day Separator */}
      <div className="relative h-px my-6 md:my-8">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { PublicTimelineEventCard, type PublicTimelineEvent } from "./PublicTimelineEventCard";

interface PublicDaySectionProps {
  date: Date;
  dayNumber: number;
  isToday?: boolean;
  events: PublicTimelineEvent[];
}

export function PublicDaySection({ date, dayNumber, isToday, events }: PublicDaySectionProps) {
  const isEmpty = events.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayNumber * 0.05 }}
      className="relative"
    >
      {/* Day header */}
      <div className="sticky top-20 z-20 bg-card/85 backdrop-blur-md py-3 -mx-4 px-4 mb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${
            isToday 
              ? "bg-primary text-primary-foreground shadow-[0_18px_40px_-26px_rgba(15,23,42,0.45)]" 
              : "bg-muted/70"
          }`}>
            <span className="text-xl font-bold">{dayNumber}</span>
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-lg capitalize ${isToday ? "text-primary" : "text-foreground"}`}>
              {format(date, "EEEE", { locale: it })}
              {isToday && (
                <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  Oggi
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {format(date, "d MMMM yyyy", { locale: it })}
            </p>
          </div>
          <span className={`text-sm font-medium ${
            isEmpty ? "text-muted-foreground" : "text-foreground"
          }`}>
            {events.length} {events.length === 1 ? "evento" : "eventi"}
          </span>
        </div>
      </div>

      {/* Events */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 text-center app-section">
          <div className="p-3 rounded-full bg-muted/70 mb-3">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nessun evento pianificato
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {events.map((event, index) => (
            <PublicTimelineEventCard
              key={event.id}
              event={event}
              isFirst={index === 0}
              isLast={index === events.length - 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

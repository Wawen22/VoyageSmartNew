import { useRef, useState, useEffect } from "react";
import { format, isToday as isDateToday } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineDay } from "@/hooks/useTimelineEvents";

interface TimelineDayNavProps {
  days: TimelineDay[];
  selectedDayIndex: number | null;
  onDaySelect: (index: number) => void;
}

export function TimelineDayNav({ days, selectedDayIndex, onDaySelect }: TimelineDayNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Check scroll on mount and on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [days]);

  return (
    <div className="relative w-full mb-6">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2 pt-3 px-1"
      >
        {/* All Days Button */}
        <button
          onClick={() => onDaySelect(-1)}
          className={cn(
            "group relative flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-2xl border transition-all duration-300 min-w-[80px] sm:min-w-[88px] shrink-0 overflow-visible",
            "hover:scale-[1.02] active:scale-[0.98]",
            selectedDayIndex === null
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/25"
              : "bg-card/60 hover:bg-card/80 border-border/50 hover:border-border"
          )}
        >
          <CalendarDays className={cn(
            "h-5 w-5 transition-all duration-300",
            selectedDayIndex === null ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )} />
          <span className={cn(
            "text-xs font-semibold transition-all duration-300",
            selectedDayIndex === null ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}>
            Tutti
          </span>
          {selectedDayIndex === null && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          )}
        </button>
        
        {/* Day Buttons */}
        {days.map((day, index) => {
          const isSelected = selectedDayIndex === index;
          const isToday = isDateToday(day.date);
          const hasEvents = day.events.length > 0;

          return (
            <button
              key={day.dateStr}
              onClick={() => onDaySelect(index)}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-0.5 px-3 py-3 rounded-2xl border transition-all duration-300 min-w-[80px] sm:min-w-[88px] shrink-0 overflow-visible",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : isToday
                    ? "bg-primary/5 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                    : "bg-card/60 hover:bg-card/80 border-border/50 hover:border-border"
              )}
            >
              {/* Today Indicator */}
              {isToday && !isSelected && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
                </div>
              )}

              {/* Event Count Badge - 3D Effect in Top-Right */}
              {hasEvents && (
                <div className={cn(
                  "absolute -top-1.5 -right-1.5 z-20 flex items-center justify-center",
                  "h-6 w-6 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300",
                  "shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
                  "border-2",
                  isSelected 
                    ? "bg-gradient-to-br from-white to-white/80 text-primary border-white/90" 
                    : isToday
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/90"
                      : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary/90"
                )}>
                  {day.events.length}
                </div>
              )}

              {/* Day of Week */}
              <span className={cn(
                "text-[10px] sm:text-xs font-medium uppercase tracking-wide transition-all duration-300",
                isSelected 
                  ? "text-primary-foreground/80" 
                  : isToday 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground group-hover:text-foreground"
              )}>
                {format(day.date, "EEE", { locale: it })}
              </span>

              {/* Day Number */}
              <span className={cn(
                "text-xl sm:text-2xl font-bold leading-none transition-all duration-300",
                isSelected 
                  ? "text-primary-foreground" 
                  : isToday 
                    ? "text-primary" 
                    : "text-foreground"
              )}>
                {format(day.date, "d")}
              </span>

              {/* Month */}
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-all duration-300",
                isSelected 
                  ? "text-primary-foreground/80" 
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {format(day.date, "MMM", { locale: it })}
              </span>

              {/* Gradient Overlay for Selected State */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Glassy Scroll Arrows */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-30",
            "flex items-center justify-center",
            "w-10 h-10 rounded-full",
            "bg-white/80 backdrop-blur-md border border-white/40",
            "shadow-lg shadow-black/10",
            "hover:bg-white/90 hover:scale-110",
            "active:scale-95",
            "transition-all duration-200",
            "text-foreground"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-30",
            "flex items-center justify-center",
            "w-10 h-10 rounded-full",
            "bg-white/80 backdrop-blur-md border border-white/40",
            "shadow-lg shadow-black/10",
            "hover:bg-white/90 hover:scale-110",
            "active:scale-95",
            "transition-all duration-200",
            "text-foreground"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

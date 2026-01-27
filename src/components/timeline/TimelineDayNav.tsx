import { format, isToday as isDateToday } from "date-fns";
import { it } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TimelineDay } from "@/hooks/useTimelineEvents";

interface TimelineDayNavProps {
  days: TimelineDay[];
  selectedDayIndex: number | null;
  onDaySelect: (index: number) => void;
}

export function TimelineDayNav({ days, selectedDayIndex, onDaySelect }: TimelineDayNavProps) {
  return (
    <ScrollArea className="w-full mb-6">
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => onDaySelect(-1)}
          className={cn(
            "flex flex-col items-center px-4 py-2 rounded-lg border transition-all min-w-[80px]",
            selectedDayIndex === null
              ? "bg-primary text-primary-foreground border-primary shadow-md"
              : "bg-card hover:bg-muted border-border"
          )}
        >
          <span className="text-xs font-medium uppercase">Tutti</span>
          <span className="text-lg font-bold">📅</span>
          <span className="text-xs">i giorni</span>
        </button>
        
        {days.map((day, index) => {
          const isSelected = selectedDayIndex === index;
          const isToday = isDateToday(day.date);
          const hasEvents = day.events.length > 0;

          return (
            <button
              key={day.dateStr}
              onClick={() => onDaySelect(index)}
              className={cn(
                "flex flex-col items-center px-4 py-2 rounded-lg border transition-all min-w-[80px] relative",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : isToday
                    ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                    : "bg-card hover:bg-muted border-border"
              )}
            >
              {isToday && !isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
              <span className="text-xs font-medium uppercase">
                {format(day.date, "EEE", { locale: it })}
              </span>
              <span className="text-lg font-bold">
                {format(day.date, "d")}
              </span>
              <span className="text-xs">
                {format(day.date, "MMM", { locale: it })}
              </span>
              {hasEvents && (
                <div className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] px-1.5 rounded-full",
                  isSelected 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-primary/10 text-primary"
                )}>
                  {day.events.length}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

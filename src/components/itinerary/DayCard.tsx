import { format, isSameDay, parseISO, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ItineraryItem } from "./ItineraryItem";
import { TransportItem } from "./TransportItem";
import { AccommodationItem } from "./AccommodationItem";
import { AddActivityDialog } from "./AddActivityDialog";
import type { ItineraryActivity } from "@/hooks/useItinerary";
import type { Transport } from "@/hooks/useTransports";
import type { Accommodation } from "@/hooks/useAccommodations";

interface DayCardProps {
  date: Date;
  dayNumber: number;
  activities: ItineraryActivity[];
  transports: Transport[];
  accommodations: Accommodation[];
  tripId: string;
  onAddActivity: (data: any) => Promise<boolean>;
  onDeleteActivity: (id: string) => Promise<boolean>;
}

export function DayCard({
  date,
  dayNumber,
  activities,
  transports,
  accommodations,
  tripId,
  onAddActivity,
  onDeleteActivity,
}: DayCardProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  
  // Filter activities for this day
  const dayActivities = activities.filter(a => a.activity_date === dateStr);
  
  // Filter transports for this day (by departure date)
  const dayTransports = transports.filter(t => {
    const depDate = new Date(t.departure_datetime);
    return isSameDay(depDate, date);
  });
  
  // Filter accommodations that are relevant to this day
  // Show if: check-in day, check-out day, or staying during this day
  const dayAccommodations = accommodations.filter(a => {
    const checkIn = parseISO(a.check_in);
    const checkOut = parseISO(a.check_out);
    
    // Check-in or check-out day
    if (isSameDay(date, checkIn) || isSameDay(date, checkOut)) {
      return true;
    }
    
    // Staying during this day (between check-in and check-out)
    if (isWithinInterval(date, { start: checkIn, end: checkOut })) {
      return true;
    }
    
    return false;
  });

  const totalItems = dayActivities.length + dayTransports.length + dayAccommodations.length;
  const isEmpty = totalItems === 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <span className="text-lg font-bold text-primary">{dayNumber}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {format(date, "EEEE", { locale: it })}
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(date, "d MMMM yyyy", { locale: it })}
              </p>
            </div>
          </div>
          <AddActivityDialog
            tripId={tripId}
            selectedDate={dateStr}
            onAdd={onAddActivity}
          />
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nessuna attività pianificata
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Aggiungi un'attività per questo giorno
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Transports first (usually early morning) */}
            {dayTransports.map((transport) => (
              <TransportItem key={transport.id} transport={transport} />
            ))}

            {/* Accommodations (check-in/check-out) */}
            {dayAccommodations.map((accommodation) => (
              <AccommodationItem
                key={accommodation.id}
                accommodation={accommodation}
                currentDate={date}
              />
            ))}

            {/* Activities */}
            {dayActivities.map((activity) => (
              <ItineraryItem
                key={activity.id}
                activity={activity}
                onDelete={onDeleteActivity}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

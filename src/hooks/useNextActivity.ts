import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseISO, isAfter, set, parse, isValid } from "date-fns";

export type EventType = 'activity' | 'transport' | 'accommodation';

export interface NextEvent {
  id: string;
  type: EventType;
  title: string;
  subtitle: string | null;
  location: string | null;
  datetime: Date;
  details?: any;
}

export function useNextActivity(tripId?: string) {
  const { data: nextEvent, isLoading } = useQuery({
    queryKey: ['next-event', tripId],
    queryFn: async () => {
      if (!tripId) return null;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Parallel Fetching
      const [activitiesRes, transportsRes, accommodationsRes] = await Promise.all([
        supabase
          .from("itinerary_activities")
          .select("*")
          .eq("trip_id", tripId)
          .gte("activity_date", todayStr),
        supabase
          .from("transports")
          .select("*")
          .eq("trip_id", tripId)
          .gte("departure_datetime", todayStr), // Assumes ISO string comparison works for datetime too
        supabase
          .from("accommodations")
          .select("*")
          .eq("trip_id", tripId)
          .gte("check_in", todayStr)
      ]);

      if (activitiesRes.error) throw activitiesRes.error;
      if (transportsRes.error) throw transportsRes.error;
      if (accommodationsRes.error) throw accommodationsRes.error;

      const candidates: NextEvent[] = [];

      // 1. Process Activities
      activitiesRes.data?.forEach(act => {
        const datePart = parseISO(act.activity_date);
        let dateTime = set(datePart, { hours: 23, minutes: 59 }); // Default to end of day if no time, so it's not missed "today"

        if (act.start_time) {
          const timePart = parse(act.start_time, 'HH:mm:ss', new Date());
          dateTime = set(datePart, {
            hours: timePart.getHours(),
            minutes: timePart.getMinutes(),
            seconds: timePart.getSeconds()
          });
        } else {
             // If no time is specified, we might want to treat it as "all day" or "start of day" depending on logic.
             // For "Next Up", usually we want specific times. If it's just a date, maybe default to 09:00?
             // Let's stick to start of day for sorting, but filtering needs care.
             // If no time, let's assume 09:00 for sorting purposes if it is today.
             dateTime = set(datePart, { hours: 9, minutes: 0 });
        }
        
        candidates.push({
          id: act.id,
          type: 'activity',
          title: act.title,
          subtitle: act.category,
          location: act.location,
          datetime: dateTime,
          details: act
        });
      });

      // 2. Process Transports
      transportsRes.data?.forEach(tr => {
        const dateTime = parseISO(tr.departure_datetime);
        // Transport types translation
        const typeMap: Record<string, string> = {
            flight: "Volo",
            train: "Treno",
            bus: "Bus",
            car: "Auto",
            ferry: "Traghetto",
            other: "Trasporto"
        };
        const typeLabel = typeMap[tr.transport_type] || "Trasporto";

        candidates.push({
          id: tr.id,
          type: 'transport',
          title: `${typeLabel} per ${tr.arrival_location}`,
          subtitle: tr.carrier ? `${tr.carrier} ${tr.booking_reference || ''}` : tr.booking_reference,
          location: tr.departure_location,
          datetime: dateTime,
          details: tr
        });
      });

      // 3. Process Accommodations (Check-in)
      accommodationsRes.data?.forEach(acc => {
        const datePart = parseISO(acc.check_in);
        let dateTime = set(datePart, { hours: 14, minutes: 0 }); // Default check-in 14:00

        if (acc.check_in_time) {
            const timePart = parse(acc.check_in_time, 'HH:mm:ss', new Date());
            dateTime = set(datePart, {
              hours: timePart.getHours(),
              minutes: timePart.getMinutes(),
              seconds: timePart.getSeconds()
            });
        }

        candidates.push({
          id: acc.id,
          type: 'accommodation',
          title: acc.name,
          subtitle: "Check-in",
          location: acc.address || acc.name, // Fallback to name if address missing
          datetime: dateTime,
          details: acc
        });
      });

      // Filter Future & Sort
      const upcoming = candidates
        .filter(event => isAfter(event.datetime, now))
        .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

      return upcoming[0] || null;
    },
    enabled: !!tripId,
    refetchInterval: 60000,
  });

  return { nextActivity: nextEvent, isLoading };
}

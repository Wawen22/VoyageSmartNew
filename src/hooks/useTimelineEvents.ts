import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isWithinInterval, isSameDay, eachDayOfInterval } from "date-fns";

export type TimelineEventType = "activity" | "transport" | "accommodation-checkin" | "accommodation-checkout" | "accommodation-stay";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string; // HH:mm
  title: string;
  subtitle?: string;
  location?: string;
  category?: string;
  details?: {
    price?: number;
    currency?: string;
    carrier?: string;
    bookingReference?: string;
    notes?: string;
    transportType?: string;
  };
  originalData: any;
}

export interface TimelineDay {
  date: Date;
  dateStr: string;
  events: TimelineEvent[];
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

export function useTimelineEvents(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef<any>(null);

  const fetchAllData = useCallback(async () => {
    if (!tripId) {
      setTrip(null);
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [tripResult, activitiesResult, transportsResult, accommodationsResult] = await Promise.all([
        supabase.from("trips").select("id, title, destination, start_date, end_date").eq("id", tripId).maybeSingle(),
        supabase.from("itinerary_activities").select("*").eq("trip_id", tripId).order("activity_date", { ascending: true }),
        supabase.from("transports").select("*").eq("trip_id", tripId).order("departure_datetime", { ascending: true }),
        supabase.from("accommodations").select("*").eq("trip_id", tripId).order("check_in", { ascending: true }),
      ]);

      if (tripResult.error) throw tripResult.error;
      setTrip(tripResult.data);

      const allEvents: TimelineEvent[] = [];

      // Process activities
      const activities = activitiesResult.data || [];
      activities.forEach((activity) => {
        allEvents.push({
          id: `activity-${activity.id}`,
          type: "activity",
          date: activity.activity_date,
          time: activity.start_time || undefined,
          endTime: activity.end_time || undefined,
          title: activity.title,
          subtitle: activity.description || undefined,
          location: activity.location || undefined,
          category: activity.category || "activity",
          details: {
            notes: activity.notes || undefined,
          },
          originalData: activity,
        });
      });

      // Process transports
      const transports = transportsResult.data || [];
      transports.forEach((transport) => {
        const depDate = new Date(transport.departure_datetime);
        allEvents.push({
          id: `transport-${transport.id}`,
          type: "transport",
          date: format(depDate, "yyyy-MM-dd"),
          time: format(depDate, "HH:mm"),
          endTime: transport.arrival_datetime ? format(new Date(transport.arrival_datetime), "HH:mm") : undefined,
          title: `${transport.departure_location} → ${transport.arrival_location}`,
          subtitle: transport.carrier || undefined,
          location: transport.departure_location,
          category: transport.transport_type,
          details: {
            price: transport.price || undefined,
            currency: transport.currency,
            carrier: transport.carrier || undefined,
            bookingReference: transport.booking_reference || undefined,
            notes: transport.notes || undefined,
            transportType: transport.transport_type,
          },
          originalData: transport,
        });
      });

      // Process accommodations (generate check-in and check-out events)
      const accommodations = accommodationsResult.data || [];
      accommodations.forEach((acc) => {
        // Check-in event
        allEvents.push({
          id: `checkin-${acc.id}`,
          type: "accommodation-checkin",
          date: acc.check_in,
          time: acc.check_in_time || "15:00",
          title: acc.name,
          subtitle: "Check-in",
          location: acc.address || undefined,
          category: "accommodation",
          details: {
            price: acc.price || undefined,
            currency: acc.currency,
            bookingReference: acc.booking_reference || undefined,
            notes: acc.notes || undefined,
          },
          originalData: acc,
        });

        // Check-out event
        allEvents.push({
          id: `checkout-${acc.id}`,
          type: "accommodation-checkout",
          date: acc.check_out,
          time: acc.check_out_time || "11:00",
          title: acc.name,
          subtitle: "Check-out",
          location: acc.address || undefined,
          category: "accommodation",
          details: {
            price: acc.price || undefined,
            currency: acc.currency,
            bookingReference: acc.booking_reference || undefined,
            notes: acc.notes || undefined,
          },
          originalData: acc,
        });
      });

      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching timeline data:", error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchAllData();

    // Set up real-time subscriptions with debounce
    let debounceTimer: NodeJS.Timeout;
    const debouncedFetch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchAllData, 300);
    };

    const activitiesChannel = supabase
      .channel(`timeline-activities-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "itinerary_activities", filter: `trip_id=eq.${tripId}` }, debouncedFetch)
      .subscribe();

    const transportsChannel = supabase
      .channel(`timeline-transports-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "transports", filter: `trip_id=eq.${tripId}` }, debouncedFetch)
      .subscribe();

    const accommodationsChannel = supabase
      .channel(`timeline-accommodations-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "accommodations", filter: `trip_id=eq.${tripId}` }, debouncedFetch)
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(transportsChannel);
      supabase.removeChannel(accommodationsChannel);
    };
  }, [fetchAllData, tripId]);

  // Organize events by day
  const timelineDays = useMemo<TimelineDay[]>(() => {
    if (!trip) return [];

    const start = parseISO(trip.start_date);
    const end = parseISO(trip.end_date);
    const days = eachDayOfInterval({ start, end });

    return days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayEvents = events
        .filter((e) => e.date === dateStr)
        .sort((a, b) => {
          // Sort by time, events without time go last
          if (!a.time && !b.time) return 0;
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        });

      return {
        date,
        dateStr,
        events: dayEvents,
      };
    });
  }, [trip, events]);

  // Stats for the timeline
  const stats = useMemo(() => {
    const activitiesCount = events.filter((e) => e.type === "activity").length;
    const transportsCount = events.filter((e) => e.type === "transport").length;
    const accommodationsCount = events.filter((e) => e.type === "accommodation-checkin").length;

    return {
      total: events.length,
      activities: activitiesCount,
      transports: transportsCount,
      accommodations: accommodationsCount,
    };
  }, [events]);

  return {
    trip,
    events,
    timelineDays,
    stats,
    loading,
    refetch: fetchAllData,
  };
}

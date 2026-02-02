import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format, parseISO, differenceInDays, eachDayOfInterval, isToday as isDateToday } from "date-fns";
import { it } from "date-fns/locale";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Loader2,
  CalendarDays
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { TimelineStats } from "@/components/timeline/TimelineStats";
import { TimelineFilters, type TimelineFilterType } from "@/components/timeline/TimelineFilters";
import { TimelineDayNav } from "@/components/timeline/TimelineDayNav";
import { TimelineDaySection } from "@/components/timeline/TimelineDaySection";
import type { TimelineDay, TimelineEvent } from "@/hooks/useTimelineEvents";

interface PublicTrip {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: string;
}

interface Activity {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  activity_date: string;
  start_time: string | null;
  end_time: string | null;
  category: string | null;
}

interface Transport {
  id: string;
  transport_type: string;
  departure_location: string;
  arrival_location: string;
  departure_datetime: string;
  arrival_datetime: string | null;
  carrier: string | null;
}

interface Accommodation {
  id: string;
  name: string;
  address: string | null;
  check_in: string;
  check_out: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

export default function PublicTripView() {
  const { token } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<PublicTrip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimelineFilterType>("all");
  const hasLoadedOnceRef = useRef(false);
  const tripRef = useRef<PublicTrip | null>(null);

  const fetchPublicTrip = useCallback(async (showLoader = false) => {
    if (!token) return;

    try {
      if (showLoader) {
        setLoading(true);
      }
      if (showLoader || !hasLoadedOnceRef.current) {
        setError(null);
      }

      const { data: tripData, error: tripError } = await supabase
        .rpc("get_public_trip_by_token", { _token: token });

      if (tripError) throw tripError;
      if (!tripData || tripData.length === 0) {
        if (showLoader || !hasLoadedOnceRef.current) {
          setTrip(null);
          tripRef.current = null;
          setError("Viaggio non trovato o link non valido");
        }
        return;
      }

      const tripInfo = tripData[0] as PublicTrip;
      setTrip(tripInfo);
      tripRef.current = tripInfo;

      const [activitiesRes, transportsRes, accommodationsRes] = await Promise.all([
        supabase.rpc("get_public_trip_activities", { _trip_id: tripInfo.id, _token: token }),
        supabase.rpc("get_public_trip_transports", { _trip_id: tripInfo.id, _token: token }),
        supabase.rpc("get_public_trip_accommodations", { _trip_id: tripInfo.id, _token: token }),
      ]);

      if (activitiesRes.data) setActivities(activitiesRes.data as Activity[]);
      if (transportsRes.data) setTransports(transportsRes.data as Transport[]);
      if (accommodationsRes.data) setAccommodations(accommodationsRes.data as Accommodation[]);
    } catch (err: any) {
      console.error("Error fetching public trip:", err);
      if (showLoader || !hasLoadedOnceRef.current || !tripRef.current) {
        setError("Errore nel caricamento del viaggio");
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      hasLoadedOnceRef.current = true;
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchPublicTrip(true);
  }, [token, fetchPublicTrip]);

  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(() => {
      if (hasLoadedOnceRef.current) {
        fetchPublicTrip(false);
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasLoadedOnceRef.current) {
        fetchPublicTrip(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token, fetchPublicTrip]);

  // Generate timeline days with events
  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    if (!trip) return [];

    const allEvents: TimelineEvent[] = [];

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
        originalData: activity,
      });
    });

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
          carrier: transport.carrier || undefined,
          transportType: transport.transport_type,
        },
        originalData: transport,
      });
    });

    accommodations.forEach((acc) => {
      allEvents.push({
        id: `checkin-${acc.id}`,
        type: "accommodation-checkin",
        date: acc.check_in,
        time: acc.check_in_time || "15:00",
        title: acc.name,
        subtitle: "Check-in",
        location: acc.address || undefined,
        category: "accommodation",
        details: {},
        originalData: acc,
      });

      allEvents.push({
        id: `checkout-${acc.id}`,
        type: "accommodation-checkout",
        date: acc.check_out,
        time: acc.check_out_time || "11:00",
        title: acc.name,
        subtitle: "Check-out",
        location: acc.address || undefined,
        category: "accommodation",
        details: {},
        originalData: acc,
      });
    });

    return allEvents;
  }, [trip, activities, transports, accommodations]);

  const timelineDays = useMemo<TimelineDay[]>(() => {
    if (!trip) return [];

    const start = parseISO(trip.start_date);
    const end = parseISO(trip.end_date);
    const days = eachDayOfInterval({ start, end });

    return days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayEvents = timelineEvents
        .filter((event) => event.date === dateStr)
        .sort((a, b) => {
          if (!a.time && !b.time) return 0;
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        });

      return { date, dateStr, events: dayEvents };
    });
  }, [trip, timelineEvents]);

  useEffect(() => {
    if (selectedDayIndex === null) return;
    if (selectedDayIndex >= timelineDays.length) {
      setSelectedDayIndex(null);
    }
  }, [selectedDayIndex, timelineDays.length]);

  // Calculate stats
  const stats = useMemo(() => {
    const activitiesCount = timelineEvents.filter((e) => e.type === "activity").length;
    const transportsCount = timelineEvents.filter((e) => e.type === "transport").length;
    const accommodationsCount = timelineEvents.filter((e) => e.type === "accommodation-checkin").length;

    return {
      total: timelineEvents.length,
      activities: activitiesCount,
      transports: transportsCount,
      accommodations: accommodationsCount,
    };
  }, [timelineEvents]);

  // Filter events based on active filter
  const filteredDays = useMemo(() => {
    if (activeFilter === "all") return timelineDays;

    return timelineDays.map((day) => ({
      ...day,
      events: day.events.filter((event) => {
        switch (activeFilter) {
          case "activities":
            return event.type === "activity";
          case "transports":
            return event.type === "transport";
          case "accommodations":
            return event.type === "accommodation-checkin" || 
                   event.type === "accommodation-checkout";
          default:
            return true;
        }
      }),
    }));
  }, [timelineDays, activeFilter]);

  // Get days to display based on selection
  const displayDays = useMemo(() => {
    if (selectedDayIndex === null) return filteredDays;
    return filteredDays.slice(selectedDayIndex, selectedDayIndex + 1);
  }, [filteredDays, selectedDayIndex]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16 relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !trip) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 pt-24 text-center relative z-10">
          <div className="max-w-md mx-auto app-surface-strong p-8">
            <div className="p-4 rounded-full bg-muted inline-block mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">{error || "Viaggio non trovato"}</h1>
            <p className="text-muted-foreground mb-6">
              Il link potrebbe essere scaduto o non valido.
            </p>
            <Button asChild>
              <Link to="/">Torna alla home</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const tripDuration = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;

  return (
    <AppLayout>
      <main className="pt-24 pb-16 min-h-screen bg-background relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="relative h-44 md:h-56 overflow-hidden rounded-t-xl">
              {trip.cover_image ? (
                <img
                  src={trip.cover_image}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-hero" />
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold w-fit">
                    🔗 Vista pubblica
                  </div>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                      {trip.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm md:text-base">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {format(parseISO(trip.start_date), "d MMM", { locale: it })} - {format(parseISO(trip.end_date), "d MMM yyyy", { locale: it })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {tripDuration} giorni
                      </span>
                    </div>
                  </div>
                  {trip.description && (
                    <p className="text-muted-foreground max-w-2xl">
                      {trip.description}
                    </p>
                  )}
                </div>

                {timelineDays.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <TimelineStats stats={stats} daysCount={timelineDays.length} />

                    <TimelineDayNav
                      days={timelineDays}
                      selectedDayIndex={selectedDayIndex}
                      onDaySelect={(index) => setSelectedDayIndex(index === -1 ? null : index)}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                      <TimelineFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                      />
                    </div>

                    <div className="space-y-2">
                      {displayDays.map((day, index) => (
                        <TimelineDaySection
                          key={day.dateStr}
                          day={day}
                          dayNumber={selectedDayIndex !== null ? selectedDayIndex + 1 : index + 1}
                          isToday={isDateToday(day.date)}
                          tripId={trip.id}
                        />
                      ))}
                    </div>

                    {displayDays.every((d) => d.events.length === 0) && activeFilter !== "all" && (
                      <div className="text-center py-12">
                        <div className="p-4 rounded-full bg-muted inline-block mb-4">
                          <CalendarDays className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Nessun evento trovato
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Non ci sono eventi di tipo "{activeFilter}" per i giorni selezionati
                        </p>
                        <Button variant="outline" onClick={() => setActiveFilter("all")}>
                          Mostra tutti gli eventi
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted inline-block mb-4">
                      <CalendarDays className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Itinerario vuoto
                    </h3>
                    <p className="text-muted-foreground">
                      Non ci sono eventi pianificati per questo viaggio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Pianificato con ❤️ su <Link to="/" className="text-primary hover:underline">VoyageSmart</Link></p>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

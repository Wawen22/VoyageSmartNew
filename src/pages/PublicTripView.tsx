import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { format, parseISO, differenceInDays, eachDayOfInterval, isToday as isDateToday, isSameDay, isWithinInterval } from "date-fns";
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
import { PublicDayNav } from "@/components/public/PublicDayNav";
import { PublicDaySection } from "@/components/public/PublicDaySection";
import type { PublicTimelineEvent, PublicEventType } from "@/components/public/PublicTimelineEventCard";

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

interface TimelineDay {
  date: Date;
  dateStr: string;
  events: PublicTimelineEvent[];
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

  useEffect(() => {
    if (!token) return;

    const fetchPublicTrip = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: tripData, error: tripError } = await supabase
          .rpc("get_public_trip_by_token", { _token: token });

        if (tripError) throw tripError;
        if (!tripData || tripData.length === 0) {
          setError("Viaggio non trovato o link non valido");
          return;
        }

        const tripInfo = tripData[0] as PublicTrip;
        setTrip(tripInfo);

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
        setError("Errore nel caricamento del viaggio");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicTrip();
  }, [token]);

  // Generate timeline days with events
  const timelineDays: TimelineDay[] = useMemo(() => {
    if (!trip) return [];
    
    const start = parseISO(trip.start_date);
    const end = parseISO(trip.end_date);
    const days = eachDayOfInterval({ start, end });

    return days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const events: PublicTimelineEvent[] = [];

      // Add transports
      transports.forEach((t) => {
        const depDate = new Date(t.departure_datetime);
        if (isSameDay(depDate, date)) {
          events.push({
            id: `transport-${t.id}`,
            type: "transport",
            title: `${t.departure_location} → ${t.arrival_location}`,
            time: format(depDate, "HH:mm"),
            endTime: t.arrival_datetime ? format(new Date(t.arrival_datetime), "HH:mm") : undefined,
            category: t.transport_type,
            details: {
              transportType: t.transport_type,
              carrier: t.carrier || undefined,
            },
          });
        }
      });

      // Add accommodations
      accommodations.forEach((acc) => {
        const checkIn = parseISO(acc.check_in);
        const checkOut = parseISO(acc.check_out);
        
        if (isSameDay(date, checkIn)) {
          events.push({
            id: `acc-checkin-${acc.id}`,
            type: "accommodation-checkin",
            title: acc.name,
            subtitle: "Check-in",
            time: acc.check_in_time || "15:00",
            location: acc.address || undefined,
          });
        } else if (isSameDay(date, checkOut)) {
          events.push({
            id: `acc-checkout-${acc.id}`,
            type: "accommodation-checkout",
            title: acc.name,
            subtitle: "Check-out",
            time: acc.check_out_time || "11:00",
            location: acc.address || undefined,
          });
        } else if (isWithinInterval(date, { start: checkIn, end: checkOut })) {
          events.push({
            id: `acc-stay-${acc.id}-${dateStr}`,
            type: "accommodation-stay",
            title: acc.name,
            subtitle: "Soggiorno",
            location: acc.address || undefined,
          });
        }
      });

      // Add activities
      activities.forEach((a) => {
        if (a.activity_date === dateStr) {
          events.push({
            id: `activity-${a.id}`,
            type: "activity",
            title: a.title,
            subtitle: a.description || undefined,
            time: a.start_time || undefined,
            endTime: a.end_time || undefined,
            location: a.location || undefined,
            category: a.category || undefined,
          });
        }
      });

      // Sort events by time
      events.sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });

      return { date, dateStr, events };
    });
  }, [trip, activities, transports, accommodations]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: activities.length + transports.length + accommodations.length,
    activities: activities.length,
    transports: transports.length,
    accommodations: accommodations.length,
  }), [activities, transports, accommodations]);

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
                   event.type === "accommodation-checkout" || 
                   event.type === "accommodation-stay";
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
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {trip.cover_image ? (
            <img 
              src={trip.cover_image} 
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-hero" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm mb-3">
                🔗 Vista pubblica
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white mb-2">
                {trip.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
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
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {trip.description && (
            <div className="app-section p-5 mb-6 max-w-2xl">
              <p className="text-muted-foreground">{trip.description}</p>
            </div>
          )}

          {timelineDays.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Stats */}
              <TimelineStats stats={stats} daysCount={timelineDays.length} />

              {/* Day Navigation */}
              <PublicDayNav
                days={timelineDays}
                selectedDayIndex={selectedDayIndex}
                onDaySelect={(index) => setSelectedDayIndex(index === -1 ? null : index)}
              />

              {/* Filters */}
              <TimelineFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Timeline content */}
              <div className="space-y-2">
                {displayDays.map((day, index) => (
                  <PublicDaySection
                    key={day.dateStr}
                    date={day.date}
                    dayNumber={selectedDayIndex !== null ? selectedDayIndex + 1 : index + 1}
                    isToday={isDateToday(day.date)}
                    events={day.events}
                  />
                ))}
              </div>

              {/* Empty state for filtered results */}
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
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Pianificato con ❤️ su <Link to="/" className="text-primary hover:underline">VoyageSmart</Link></p>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

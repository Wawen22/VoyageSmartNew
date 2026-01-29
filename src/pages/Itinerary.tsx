import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { isToday as isDateToday } from "date-fns";
import { ChevronLeft, Loader2, Clock, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTimelineEvents } from "@/hooks/useTimelineEvents";
import { useItinerary } from "@/hooks/useItinerary";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { TimelineDayNav } from "@/components/timeline/TimelineDayNav";
import { TimelineDaySection } from "@/components/timeline/TimelineDaySection";
import { TimelineStats } from "@/components/timeline/TimelineStats";
import { TimelineFilters, type TimelineFilterType } from "@/components/timeline/TimelineFilters";

export default function Itinerary() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get("trip");
  const { user, loading: authLoading } = useAuth();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimelineFilterType>("all");

  const { trip, timelineDays, stats, loading } = useTimelineEvents(tripId || undefined);
  const { createActivity, deleteActivity } = useItinerary(tripId || undefined);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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
            return event.type === "accommodation-checkin" || event.type === "accommodation-checkout";
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

  // Loading states
  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] pt-16 relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!loading && !trip) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 pt-24 text-center relative z-10">
          <h1 className="text-2xl font-semibold mb-4">Viaggio non trovato</h1>
          <Button asChild>
            <Link to="/trips">Torna ai viaggi</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={trip?.id ? `/trips/${trip.id}` : tripId ? `/trips/${tripId}` : "/trips"}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-5 w-5" />
                Dettagli viaggio
              </Link>
            </Button>
            <h1 className="text-3xl font-semibold flex items-center gap-2">
              <CalendarDays className="h-8 w-8" />
              Itinerario
            </h1>
            {trip && (
              <p className="text-muted-foreground mt-1">
                {trip.title} • {trip.destination}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : trip && timelineDays.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Stats */}
            <TimelineStats stats={stats} daysCount={timelineDays.length} />

            {/* Day Navigation */}
            <TimelineDayNav
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
                <TimelineDaySection
                  key={day.dateStr}
                  day={day}
                  dayNumber={selectedDayIndex !== null ? selectedDayIndex + 1 : index + 1}
                  isToday={isDateToday(day.date)}
                  tripId={trip.id}
                  onAddActivity={createActivity}
                  onDeleteActivity={deleteActivity}
                />
              ))}
            </div>

            {/* Empty state for filtered results */}
            {displayDays.every((d) => d.events.length === 0) && activeFilter !== "all" && (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-muted inline-block mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
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
        ) : null}
      </main>
    </AppLayout>
  );
}

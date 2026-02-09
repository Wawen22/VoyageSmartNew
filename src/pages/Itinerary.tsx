import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { isToday as isDateToday } from "date-fns";
import { ArrowLeft, Loader2, Clock, CalendarDays, Map, List, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTimelineEvents } from "@/hooks/useTimelineEvents";
import { useItinerary, type ItineraryActivity, type UpdateActivityData } from "@/hooks/useItinerary";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { TimelineDayNav } from "@/components/timeline/TimelineDayNav";
import { TimelineDaySection } from "@/components/timeline/TimelineDaySection";
import { TimelineStats } from "@/components/timeline/TimelineStats";
import { TimelineFilters, type TimelineFilterType } from "@/components/timeline/TimelineFilters";
import { ItineraryMap } from "@/components/itinerary/ItineraryMap";
import { ActivityDetailDialog } from "@/components/itinerary/ActivityDetailDialog";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TripNavBar } from "@/components/trip-details/navigation/TripNavBar";

export default function Itinerary() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get("trip");
  const { user, loading: authLoading } = useAuth();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<TimelineFilterType>("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [mapScope, setMapScope] = useState<"trip" | "day">("trip");
  const [selectedActivity, setSelectedActivity] = useState<ItineraryActivity | null>(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  const { trip, timelineDays, stats, loading, refetch: refetchTimeline } = useTimelineEvents(tripId || undefined);
  const { activities, loading: activitiesLoading, createActivity, deleteActivity, updateActivity } = useItinerary(tripId || undefined);

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

  const selectedDateStr = useMemo(() => {
    if (selectedDayIndex === null) return null;
    return timelineDays[selectedDayIndex]?.dateStr ?? null;
  }, [selectedDayIndex, timelineDays]);

  const mapActivities = useMemo(() => {
    if (mapScope === "day") {
      if (!selectedDateStr) return [];
      return activities.filter((activity) => activity.activity_date === selectedDateStr);
    }
    return activities;
  }, [activities, mapScope, selectedDateStr]);

  const handleAddActivity = async (data: Parameters<typeof createActivity>[0]) => {
    const success = await createActivity(data);
    if (success) {
      await refetchTimeline();
    }
    return success;
  };

  const handleDeleteActivity = async (id: string) => {
    const success = await deleteActivity(id);
    if (success) {
      await refetchTimeline();
    }
    return success;
  };

  const handleViewActivity = (activity: ItineraryActivity) => {
    setSelectedActivity(activity);
    setActivityDialogOpen(true);
  };

  const handleUpdateActivity = async (data: UpdateActivityData) => {
    if (!selectedActivity) return false;
    const success = await updateActivity(selectedActivity.id, data);
    if (success) {
      await refetchTimeline();
      setActivityDialogOpen(false);
    }
    return success;
  };

  const handleDeleteActivityFromDialog = async (id: string) => {
    const success = await handleDeleteActivity(id);
    if (success) {
      setActivityDialogOpen(false);
    }
    return success;
  };

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
      {tripId && <TripNavBar tripId={tripId} />}
      <main className="pt-24 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={trip?.id ? `/trips/${trip.id}` : "/trips"}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna al viaggio
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{trip?.title || "Itinerario"}</span>
          </div>

          {/* Main Card */}
          <div className="bg-card rounded-xl border shadow-sm p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : timelineDays.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Tabs
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as "list" | "map")}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" />
                        Itinerario
                      </h2>
                      {trip && (
                        <p className="text-muted-foreground">
                          {trip.destination} • Pianifica le attività giorno per giorno
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <TabsList>
                        <TabsTrigger value="list" className="gap-2">
                          <List className="h-4 w-4" />
                          Lista
                        </TabsTrigger>
                        <TabsTrigger value="map" className="gap-2">
                          <Map className="h-4 w-4" />
                          Mappa
                        </TabsTrigger>
                      </TabsList>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hidden sm:flex"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-trip-ai', { detail: { message: "Analizza il mio itinerario e suggeriscimi attività interessanti da aggiungere per i giorni liberi." } }))}
                      >
                        <Sparkles className="w-4 h-4" />
                        Suggerimenti AI
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <TimelineStats stats={stats} daysCount={timelineDays.length} />

                  {/* Day Navigation */}
                  <TimelineDayNav
                    days={timelineDays}
                    selectedDayIndex={selectedDayIndex}
                    onDaySelect={(index) => setSelectedDayIndex(index === -1 ? null : index)}
                  />

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <TimelineFilters
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                    />
                    {viewMode === "map" && (
                      <ToggleGroup
                        type="single"
                        value={mapScope}
                        onValueChange={(value) => value && setMapScope(value as "trip" | "day")}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        <ToggleGroupItem value="trip" className="text-xs">Tutto il viaggio</ToggleGroupItem>
                        <ToggleGroupItem value="day" disabled={!selectedDateStr} className="text-xs">
                          Giorno selezionato
                        </ToggleGroupItem>
                      </ToggleGroup>
                    )}
                  </div>

                  <TabsContent value="list" className="mt-0">
                    {/* Timeline content */}
                    <div className="space-y-0">
                      {displayDays.map((day, index) => (
                        <TimelineDaySection
                          key={day.dateStr}
                          day={day}
                          dayNumber={selectedDayIndex !== null ? selectedDayIndex + 1 : index + 1}
                          isToday={isDateToday(day.date)}
                          tripId={trip!.id}
                          onAddActivity={handleAddActivity}
                          onDeleteActivity={handleDeleteActivity}
                          onViewActivity={handleViewActivity}
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
                  </TabsContent>

                  <TabsContent value="map" className="mt-4">
                    {mapScope === "day" && !selectedDateStr && (
                      <div className="text-xs text-muted-foreground mb-3">
                        Seleziona un giorno nella barra sopra per visualizzare solo quel giorno.
                      </div>
                    )}
                    {activitiesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ItineraryMap
                        activities={mapActivities}
                        active={viewMode === "map"}
                        onViewActivity={handleViewActivity}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Activity Detail Dialog */}
      <ActivityDetailDialog
        activity={selectedActivity}
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        onUpdate={handleUpdateActivity}
        onDelete={handleDeleteActivityFromDialog}
      />
      {tripId && <TripAIAssistant tripId={tripId} tripDetails={trip} />}
    </AppLayout>
  );
}

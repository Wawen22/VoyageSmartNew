import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Plane, Euro, Route, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTransports } from "@/hooks/useTransports";
import { AddTransportDialog } from "@/components/transports/AddTransportDialog";
import { TransportCard } from "@/components/transports/TransportCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";
import { useTripDetails } from "@/hooks/useTripDetails";
import { TripNavBar } from "@/components/trip-details/navigation/TripNavBar";

interface Trip {
  id: string;
  title: string;
  destination: string;
}

export default function Transports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tripId = searchParams.get("trip") || undefined;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  const {
    transports,
    loading,
    totalCost,
    createTransport,
    updateTransport,
    deleteTransport,
  } = useTransports(tripId);
  const { data: tripDetails } = useTripDetails(tripId);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchTrips() {
      if (!user) return;
      
      const { data } = await supabase
        .from("trips")
        .select("id, title, destination")
        .order("start_date", { ascending: false });
      
      setTrips(data || []);
      setTripsLoading(false);

      if (!tripId && data && data.length > 0) {
        setSearchParams({ trip: data[0].id });
      }
    }
    fetchTrips();
  }, [user, tripId, setSearchParams]);

  if (authLoading || tripsLoading) {
    return (
      <AppLayout>
        <main className="pt-24 pb-16 relative z-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </AppLayout>
    );
  }

  const selectedTrip = trips.find(t => t.id === tripId);

  return (
    <AppLayout>
      {tripId && <TripNavBar tripId={tripId} />}
      <main className="pt-24 pb-24 min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={tripId ? `/trips/${tripId}` : "/trips"}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna al viaggio
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{selectedTrip?.title || "Trasporti"}</span>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-3 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <Plane className="h-6 w-6 text-primary" />
                  Trasporti
                </h2>
                <p className="text-muted-foreground">
                  Gestisci voli, treni e altri mezzi di trasporto
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Select
                  value={tripId || ""}
                  onValueChange={(value) => setSearchParams({ trip: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleziona viaggio" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {tripId && (
                  <AddTransportDialog tripId={tripId} onAdd={createTransport} />
                )}
              </div>
            </div>

            {!tripId ? (
              <div className="text-center py-12 border rounded-lg border-dashed bg-muted/10">
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">Seleziona un viaggio per vedere i trasporti</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-lg bg-muted/40 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Route className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Totale Trasporti</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{transports.length}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/40 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Euro className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-xs text-muted-foreground">Costo Totale</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">€{totalCost.toFixed(2)}</p>
                  </div>
                </div>

                {/* Transports List */}
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : transports.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg border-dashed bg-muted/10">
                    <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground mb-4">Nessun trasporto ancora</p>
                    <AddTransportDialog tripId={tripId} onAdd={createTransport} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transports.map((transport) => (
                      <TransportCard
                        key={transport.id}
                        transport={transport}
                        onUpdate={updateTransport}
                        onDelete={deleteTransport}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      {tripId && <TripAIAssistant tripId={tripId} tripDetails={tripDetails || null} />}
    </AppLayout>
  );
}
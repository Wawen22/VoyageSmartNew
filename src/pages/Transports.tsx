import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Plane, Euro, Route, Loader2, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTransports } from "@/hooks/useTransports";
import { AddTransportDialog } from "@/components/transports/AddTransportDialog";
import { TransportCard } from "@/components/transports/TransportCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

  const { transports, loading, totalCost, createTransport, deleteTransport } = useTransports(tripId);

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

      // Auto-select first trip if none selected
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
      <main className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                to={tripId ? `/trips/${tripId}` : "/trips"}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Dettagli viaggio
              </Link>
            </Button>
            <h1 className="text-3xl font-semibold flex items-center gap-2">
              <Plane className="h-8 w-8" />
              Trasporti
            </h1>
            <p className="text-muted-foreground mt-1">
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
          <Card className="app-surface">
            <CardContent className="py-12 text-center">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Seleziona un viaggio per vedere i trasporti</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="app-surface">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Totale Trasporti</CardTitle>
                  <Route className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{transports.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedTrip?.destination}
                  </p>
                </CardContent>
              </Card>

              <Card className="app-surface">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Costo Totale</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{totalCost.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Transports List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transports.length === 0 ? (
              <Card className="app-surface">
                <CardContent className="py-12 text-center">
                  <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Nessun trasporto ancora</p>
                  <AddTransportDialog tripId={tripId} onAdd={createTransport} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {transports.map((transport) => (
                  <TransportCard
                    key={transport.id}
                    transport={transport}
                    onDelete={deleteTransport}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </AppLayout>
  );
}

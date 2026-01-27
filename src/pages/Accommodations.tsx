import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Building2, Euro, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAccommodations } from "@/hooks/useAccommodations";
import { AddAccommodationDialog } from "@/components/accommodations/AddAccommodationDialog";
import { AccommodationCard } from "@/components/accommodations/AccommodationCard";
import { supabase } from "@/integrations/supabase/client";

interface Trip {
  id: string;
  title: string;
  destination: string;
}

export default function Accommodations() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tripId = searchParams.get("trip") || undefined;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);

  const { accommodations, loading, totalCost, createAccommodation, deleteAccommodation } = useAccommodations(tripId);

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
            <h1 className="text-3xl font-semibold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Alloggi
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestisci le prenotazioni alloggi del viaggio
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
              <AddAccommodationDialog tripId={tripId} onAdd={createAccommodation} />
            )}
          </div>
        </div>

        {!tripId ? (
          <Card className="app-surface">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Seleziona un viaggio per vedere gli alloggi</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="app-surface">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Totale Alloggi</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accommodations.length}</div>
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

            {/* Accommodations List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : accommodations.length === 0 ? (
              <Card className="app-surface">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Nessun alloggio ancora</p>
                  <AddAccommodationDialog tripId={tripId} onAdd={createAccommodation} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {accommodations.map((accommodation) => (
                  <AccommodationCard
                    key={accommodation.id}
                    accommodation={accommodation}
                    onDelete={deleteAccommodation}
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

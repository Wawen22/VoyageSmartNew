import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Plus, 
  Search,
  Loader2,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  cover_image: string | null;
}

interface TripUXManagerProps {
  onTripSelected: (tripId: string) => void;
  title: string;
  description: string;
}

export function TripUXManager({ onTripSelected, title, description }: TripUXManagerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user) return;
      try {
        const { data: memberTrips } = await supabase
          .from("trip_members")
          .select("trip_id")
          .eq("user_id", user.id);

        const tripIds = memberTrips?.map(m => m.trip_id) || [];

        if (tripIds.length > 0) {
          const { data: tripsData } = await supabase
            .from("trips")
            .select("id, title, destination, start_date, cover_image")
            .in("id", tripIds)
            .order("start_date", { ascending: false });

          setTrips(tripsData || []);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const filteredTrips = trips.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Caricamento viaggi...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Globe className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Nessun viaggio trovato</h3>
        <p className="text-muted-foreground max-w-sm mb-8">
          Devi far parte di almeno un viaggio per accedere a questa sezione.
        </p>
        <Button onClick={() => navigate("/trips/new")} className="rounded-2xl h-12 px-8 gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          Crea il tuo primo viaggio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Cerca tra i tuoi viaggi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-[1.2rem] border-border bg-card/50 backdrop-blur-sm border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTrips.map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="group cursor-pointer overflow-hidden rounded-3xl border-border/50 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 bg-card/40 backdrop-blur-sm"
              onClick={() => onTripSelected(trip.id)}
            >
              <div className="flex items-center p-4 gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={trip.cover_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200"} 
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate group-hover:text-primary transition-colors">{trip.title}</h4>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(trip.start_date).getFullYear()}</span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {filteredTrips.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed">
            Nessun viaggio corrisponde alla ricerca.
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  MoreHorizontal,
  Search,
  Filter,
  Plane,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PendingInvitationsBanner } from "@/components/trips/PendingInvitationsBanner";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: string;
  member_count?: number;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  planning: { label: "In Pianificazione", class: "bg-amber-500/10 text-amber-600" },
  upcoming: { label: "In Arrivo", class: "bg-primary/10 text-primary" },
  active: { label: "In Corso", class: "bg-forest/10 text-forest" },
  completed: { label: "Completato", class: "bg-muted-foreground/10 text-muted-foreground" },
};

const defaultImages = [
  "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600",
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600",
];

export default function Trips() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch member counts for each trip
      const tripsWithCounts = await Promise.all(
        (data || []).map(async (trip) => {
          const { count } = await supabase
            .from("trip_members")
            .select("*", { count: "exact", head: true })
            .eq("trip_id", trip.id);

          return { ...trip, member_count: count || 1 };
        })
      );

      setTrips(tripsWithCounts);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i viaggi. Riprova.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                I Miei Viaggi
              </h1>
              <p className="text-muted-foreground">
                Pianifica, organizza e gestisci le tue avventure
              </p>
            </div>
            <Link to="/trips/new">
              <Button variant="hero" size="lg">
                <Plus className="w-5 h-5" />
                Nuovo Viaggio
              </Button>
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cerca viaggi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <Button variant="outline" size="lg" className="h-12">
              <Filter className="w-5 h-5 mr-2" />
              Filtri
            </Button>
          </div>

          {/* Pending Invitations */}
          <PendingInvitationsBanner />

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredTrips.length > 0 ? (
            /* Trips Grid */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/trips/${trip.id}`}>
                    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={trip.cover_image || defaultImages[index % defaultImages.length]}
                          alt={trip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[trip.status]?.class || statusConfig.planning.class}`}>
                          {statusConfig[trip.status]?.label || "In Pianificazione"}
                        </div>

                        {/* More Button */}
                        <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {trip.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          {trip.destination}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(trip.start_date).toLocaleDateString("it-IT", {
                              month: "short",
                              day: "numeric",
                            })}
                            {" - "}
                            {new Date(trip.end_date).toLocaleDateString("it-IT", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {trip.member_count || 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Nessun viaggio ancora
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Inizia a pianificare la tua prossima avventura! Crea un viaggio e 
                lascia che l'AI ti aiuti a costruire l'itinerario perfetto.
              </p>
              <Link to="/trips/new">
                <Button variant="hero" size="lg">
                  <Plus className="w-5 h-5" />
                  Crea il Tuo Primo Viaggio
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

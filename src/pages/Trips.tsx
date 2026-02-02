import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PendingInvitationsBanner } from "@/components/trips/PendingInvitationsBanner";
import { searchPlace } from "@/lib/mapbox";

import { TripsHeader } from "@/components/trips/dashboard/TripsHeader";
import { DashboardWelcome } from "@/components/trips/dashboard/DashboardWelcome";
import { TripsFilterBar } from "@/components/trips/dashboard/TripsFilterBar";
import { TripsViewTabs } from "@/components/trips/dashboard/TripsViewTabs";

export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: string;
  member_count?: number;
  latitude?: number | null;
  longitude?: number | null;
}

export default function Trips() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

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

  const enrichTripsWithCoordinates = async (rawTrips: Trip[]) => {
    const tripsToProcess = rawTrips.filter(t => !t.latitude || !t.longitude);
    if (tripsToProcess.length === 0) return;

    const enrichedTrips = await Promise.all(rawTrips.map(async (trip) => {
      if (trip.latitude && trip.longitude) return trip;
      if (trip.destination) {
        const coords = await searchPlace(trip.destination);
        if (coords) {
          supabase.from('trips').update({ 
            latitude: coords.lat, 
            longitude: coords.lng 
          }).eq('id', trip.id).then(({ error }) => {
             if (error) console.error("Error updating coords for trip", trip.id, error);
          });
          return { ...trip, latitude: coords.lat, longitude: coords.lng };
        }
      }
      return trip;
    }));
    setTrips(enrichedTrips);
  };

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

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
      enrichTripsWithCoordinates(tripsWithCounts);
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

  // Filter Logic
  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter.length === 0 || statusFilter.includes(trip.status);

    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  if (authLoading) {
    return (
      <AppLayout>
        <main className="pt-24 pb-16 relative z-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="pt-24 pb-16 relative z-10 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <TripsHeader tripCount={trips.length} />
          
          <DashboardWelcome userName={user?.user_metadata?.first_name || user?.email?.split('@')[0]} />

          <TripsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
          />

          <PendingInvitationsBanner />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <TripsViewTabs
               trips={filteredTrips}
               viewMode={viewMode}
               onViewModeChange={setViewMode}
            />
          )}
        </div>
      </main>
    </AppLayout>
  );
}

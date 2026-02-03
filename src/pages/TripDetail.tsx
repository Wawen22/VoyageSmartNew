import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TripHero } from "@/components/trip-details/hero/TripHero";
import { TripNavBar } from "@/components/trip-details/navigation/TripNavBar";
import { TripOverview } from "@/components/trip-details/widgets/TripOverview";
import { EditTripDialog } from "@/components/trip-details/settings/EditTripDialog";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";

type Trip = {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  description: string | null;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  is_public_shared: boolean;
  public_share_token: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTrip();
    }
  }, [id]);

  const fetchTrip = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Viaggio non trovato",
          description: "Il viaggio richiesto non esiste",
          variant: "destructive",
        });
        navigate("/trips");
        return;
      }

      setTrip(data);
    } catch (error: any) {
      console.error("Error fetching trip:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli del viaggio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <main className="pt-24 pb-16 relative z-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </AppLayout>
    );
  }

  if (!trip) return null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 lg:pt-20 pt-16">
        
        {/* 1. HERO SECTION */}
        <TripHero 
          trip={trip} 
          onEdit={() => setIsEditOpen(true)}
          onUpdate={fetchTrip}
        />

        {/* 2. NAVIGATION BAR (Sticky) */}
        <TripNavBar tripId={trip.id} />

        {/* 3. MAIN DASHBOARD CONTENT */}
        <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
          <TripOverview trip={trip} />
        </div>

      </div>

      {/* DIALOGS & OVERLAYS */}
      <EditTripDialog 
        trip={trip} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen}
        onUpdate={fetchTrip}
      />
      
      <TripAIAssistant tripId={trip.id} tripDetails={trip} />
    </AppLayout>
  );
}
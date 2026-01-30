import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { IdeaBoard } from "@/components/ideas/IdeaBoard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function TripIdeas() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const navigate = useNavigate();
  const [tripTitle, setTripTitle] = useState("");

  useEffect(() => {
    if (!tripId) {
      navigate("/trips");
      return;
    }

    const fetchTrip = async () => {
      const { data } = await supabase
        .from("trips")
        .select("title")
        .eq("id", tripId)
        .single();
      
      if (data) {
        setTripTitle(data.title);
      }
    };

    fetchTrip();
  }, [tripId, navigate]);

  if (!tripId) return null;

  return (
    <AppLayout>
      <main className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${tripId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna al viaggio
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{tripTitle}</span>
          </div>
          
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <IdeaBoard tripId={tripId} />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

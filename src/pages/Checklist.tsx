import { useState, useEffect } from "react";
import { useSearchParams, Navigate, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Loader2, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useChecklist } from "@/hooks/useChecklist";
import { ChecklistSection } from "@/components/checklist/ChecklistSection";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TripAIAssistant } from "@/components/ai-assistant/TripAIAssistant";
import { useTripDetails } from "@/hooks/useTripDetails";

export default function Checklist() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");
  const { user, loading: authLoading } = useAuth();
  const [tripTitle, setTripTitle] = useState("");

  const {
    groupItems,
    personalItems,
    isLoading,
    addItem,
    toggleItem,
    deleteItem,
    isAdding,
    groupStats,
    personalStats,
  } = useChecklist(tripId);

  const { data: tripDetails } = useTripDetails(tripId);

  useEffect(() => {
    async function fetchTripTitle() {
      if (!tripId) return;
      const { data } = await supabase
        .from("trips")
        .select("title")
        .eq("id", tripId)
        .single();
      if (data) setTripTitle(data.title);
    }
    fetchTripTitle();
  }, [tripId]);

  if (authLoading) {
    return (
      <AppLayout>
        <main className="pt-24 pb-16 relative z-10">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!tripId) {
    return <Navigate to="/trips" replace />;
  }

  const totalItems = groupStats.total + personalStats.total;
  const totalCompleted = groupStats.completed + personalStats.completed;
  const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <AppLayout>
      <main className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/trips/${tripId}`} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna al viaggio
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{tripTitle || "Checklist"}</span>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                Checklist Viaggio
              </h2>
              <p className="text-muted-foreground">
                {totalItems > 0
                  ? `${totalCompleted}/${totalItems} elementi completati (${overallProgress}%)`
                  : "Organizza cosa portare e cosa fare"}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Group Checklist */}
                <ChecklistSection
                  title="Checklist di Gruppo"
                  isPersonal={false}
                  items={groupItems}
                  stats={groupStats}
                  onAdd={addItem}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                  isAdding={isAdding}
                />

                {/* Personal Checklist */}
                <ChecklistSection
                  title="La Mia Checklist"
                  isPersonal={true}
                  items={personalItems}
                  stats={personalStats}
                  onAdd={addItem}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                  isAdding={isAdding}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      {tripId && <TripAIAssistant tripId={tripId} tripDetails={tripDetails || null} />}
    </AppLayout>
  );
}
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ItineraryActivity {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  location: string | null;
  activity_date: string;
  start_time: string | null;
  end_time: string | null;
  category: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateActivityData {
  trip_id: string;
  title: string;
  description?: string;
  location?: string;
  activity_date: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  notes?: string;
}

export function useItinerary(tripId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ItineraryActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  
  // Keep toast ref updated without triggering re-renders
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const fetchActivities = useCallback(async () => {
    if (!tripId || !user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("itinerary_activities")
        .select("*")
        .eq("trip_id", tripId)
        .order("activity_date", { ascending: true })
        .order("start_time", { ascending: true, nullsFirst: false });

      if (error) throw error;
      setActivities((data || []) as ItineraryActivity[]);
    } catch (error: any) {
      console.error("Error fetching activities:", error);
      toastRef.current({
        title: "Errore",
        description: "Impossibile caricare le attività",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  const createActivity = async (data: CreateActivityData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("itinerary_activities").insert({
        trip_id: data.trip_id,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        activity_date: data.activity_date,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        category: data.category || "activity",
        notes: data.notes || null,
        created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Attività aggiunta",
        description: data.title
      });

      await fetchActivities();
      return true;
    } catch (error: any) {
      console.error("Error creating activity:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare l'attività",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteActivity = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("itinerary_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Attività eliminata" });
      await fetchActivities();
      return true;
    } catch (error: any) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'attività",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (!tripId) return;

    fetchActivities();

    // Debounced realtime subscription to prevent multiple rapid refetches
    let debounceTimer: NodeJS.Timeout;
    
    const channel = supabase
      .channel(`itinerary-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "itinerary_activities",
          filter: `trip_id=eq.${tripId}`
        },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchActivities();
          }, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchActivities]);

  return {
    activities,
    loading,
    createActivity,
    deleteActivity,
    refetch: fetchActivities
  };
}

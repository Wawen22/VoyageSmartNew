import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ItineraryActivity {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
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
  latitude?: number | null;
  longitude?: number | null;
  activity_date: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  notes?: string;
}

interface UpdateActivityData {
  title?: string;
  description?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  activity_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  category?: string;
  notes?: string;
}

export function useItinerary(tripId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: async () => {
      if (!tripId || !user) return [];

      const { data, error } = await supabase
        .from("itinerary_activities")
        .select("*")
        .eq("trip_id", tripId)
        .order("activity_date", { ascending: true })
        .order("start_time", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return (data || []) as ItineraryActivity[];
    },
    enabled: !!tripId && !!user
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateActivityData) => {
      const { error } = await supabase.from("itinerary_activities").insert({
        trip_id: data.trip_id,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        activity_date: data.activity_date,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        category: data.category || "activity",
        notes: data.notes || null,
        created_by: user!.id
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
      toast({ title: "Attività aggiunta", description: variables.title });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile creare l'attività", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateActivityData }) => {
      const updateData: Record<string, any> = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.location !== undefined) updateData.location = data.location || null;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.activity_date !== undefined) updateData.activity_date = data.activity_date;
      if (data.start_time !== undefined) updateData.start_time = data.start_time || null;
      if (data.end_time !== undefined) updateData.end_time = data.end_time || null;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      const { error } = await supabase
        .from("itinerary_activities")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
      toast({ title: "Attività aggiornata" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile aggiornare l'attività", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("itinerary_activities")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
      toast({ title: "Attività eliminata" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile eliminare l'attività", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!tripId) return;

    // Realtime subscription
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
            queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
          }, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  return {
    activities,
    loading,
    createActivity: async (data: CreateActivityData) => {
      await createMutation.mutateAsync(data);
      return true;
    },
    updateActivity: async (id: string, data: UpdateActivityData) => {
      await updateMutation.mutateAsync({ id, data });
      return true;
    },
    deleteActivity: async (id: string) => {
      await deleteMutation.mutateAsync(id);
      return true;
    },
    refetch
  };
}

export type { UpdateActivityData };
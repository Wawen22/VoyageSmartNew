import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Accommodation {
  id: string;
  trip_id: string;
  name: string;
  address: string | null;
  check_in: string;
  check_out: string;
  check_in_time: string | null;
  check_out_time: string | null;
  price: number | null;
  currency: string;
  booking_reference: string | null;
  booking_url: string | null;
  notes: string | null;
  document_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateAccommodationData {
  trip_id: string;
  name: string;
  address?: string;
  check_in: string;
  check_out: string;
  check_in_time?: string;
  check_out_time?: string;
  price?: number;
  currency?: string;
  booking_reference?: string;
  booking_url?: string;
  notes?: string;
  document_url?: string;
}

export interface UpdateAccommodationData {
  id: string;
  name: string;
  address: string | null;
  check_in: string;
  check_out: string;
  check_in_time: string | null;
  check_out_time: string | null;
  price: number | null;
  booking_reference: string | null;
  booking_url: string | null;
  notes: string | null;
  document_url: string | null;
}

export function useAccommodations(tripId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accommodations = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['accommodations', tripId],
    queryFn: async () => {
      if (!tripId || !user) return [];

      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("trip_id", tripId)
        .order("check_in", { ascending: true });

      if (error) throw error;
      return (data || []) as Accommodation[];
    },
    enabled: !!tripId && !!user
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAccommodationData) => {
      const { error } = await supabase.from("accommodations").insert({
        trip_id: data.trip_id,
        name: data.name,
        address: data.address || null,
        check_in: data.check_in,
        check_out: data.check_out,
        check_in_time: data.check_in_time || null,
        check_out_time: data.check_out_time || null,
        price: data.price || null,
        currency: data.currency || "EUR",
        booking_reference: data.booking_reference || null,
        booking_url: data.booking_url || null,
        notes: data.notes || null,
        document_url: data.document_url || null,
        created_by: user!.id
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
      toast({ title: "Alloggio aggiunto", description: variables.name });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile creare l'alloggio", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accommodations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
      toast({ title: "Alloggio eliminato" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile eliminare l'alloggio", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateAccommodationData) => {
      const { id, ...payload } = data;
      const { error } = await supabase.from("accommodations").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
      toast({ title: "Alloggio aggiornato", description: variables.name });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile aggiornare l'alloggio", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!tripId) return;

    let debounceTimer: NodeJS.Timeout;
    
    const channel = supabase
      .channel(`accommodations-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accommodations",
          filter: `trip_id=eq.${tripId}`
        },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['accommodations', tripId] });
          }, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  const totalCost = useMemo(() => accommodations.reduce((acc, a) => acc + (a.price || 0), 0), [accommodations]);

  return {
    accommodations,
    loading,
    totalCost,
    createAccommodation: async (data: CreateAccommodationData) => {
      await createMutation.mutateAsync(data);
      return true;
    },
    updateAccommodation: async (data: UpdateAccommodationData) => {
      await updateMutation.mutateAsync(data);
      return true;
    },
    deleteAccommodation: async (id: string) => {
      await deleteMutation.mutateAsync(id);
      return true;
    },
    refetch
  };
}

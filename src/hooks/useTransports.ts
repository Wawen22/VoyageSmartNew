import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type TransportType = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';

export interface Transport {
  id: string;
  trip_id: string;
  transport_type: TransportType;
  departure_location: string;
  arrival_location: string;
  departure_datetime: string;
  arrival_datetime: string | null;
  booking_reference: string | null;
  carrier: string | null;
  price: number | null;
  currency: string;
  notes: string | null;
  document_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CreateTransportData {
  trip_id: string;
  transport_type: TransportType;
  departure_location: string;
  arrival_location: string;
  departure_datetime: string;
  arrival_datetime?: string;
  booking_reference?: string;
  carrier?: string;
  price?: number;
  currency?: string;
  notes?: string;
  document_url?: string;
}

export function useTransports(tripId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transports = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['transports', tripId],
    queryFn: async () => {
      if (!tripId || !user) return [];

      const { data, error } = await supabase
        .from("transports")
        .select("*")
        .eq("trip_id", tripId)
        .order("departure_datetime", { ascending: true });

      if (error) throw error;
      return (data || []) as Transport[];
    },
    enabled: !!tripId && !!user
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateTransportData) => {
      const { error } = await supabase.from("transports").insert({
        trip_id: data.trip_id,
        transport_type: data.transport_type,
        departure_location: data.departure_location,
        arrival_location: data.arrival_location,
        departure_datetime: data.departure_datetime,
        arrival_datetime: data.arrival_datetime || null,
        booking_reference: data.booking_reference || null,
        carrier: data.carrier || null,
        price: data.price || null,
        currency: data.currency || "EUR",
        notes: data.notes || null,
        document_url: data.document_url || null,
        created_by: user!.id
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
      toast({ title: "Trasporto aggiunto", description: `${variables.departure_location} → ${variables.arrival_location}` });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile creare il trasporto", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
      toast({ title: "Trasporto eliminato" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Errore", description: "Impossibile eliminare il trasporto", variant: "destructive" });
    }
  });

  useEffect(() => {
    if (!tripId) return;

    let debounceTimer: NodeJS.Timeout;
    
    const channel = supabase
      .channel(`transports-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transports",
          filter: `trip_id=eq.${tripId}`
        },
        () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['transports', tripId] });
          }, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  const totalCost = useMemo(() => transports.reduce((acc, t) => acc + (t.price || 0), 0), [transports]);

  return {
    transports,
    loading,
    totalCost,
    createTransport: async (data: CreateTransportData) => {
      await createMutation.mutateAsync(data);
      return true;
    },
    deleteTransport: async (id: string) => {
      await deleteMutation.mutateAsync(id);
      return true;
    },
    refetch
  };
}
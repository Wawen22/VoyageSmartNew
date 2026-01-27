import { useState, useEffect, useCallback, useRef } from "react";
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
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const fetchTransports = useCallback(async () => {
    if (!tripId || !user) {
      setTransports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transports")
        .select("*")
        .eq("trip_id", tripId)
        .order("departure_datetime", { ascending: true });

      if (error) throw error;
      setTransports((data || []) as Transport[]);
    } catch (error: any) {
      console.error("Error fetching transports:", error);
      toastRef.current({
        title: "Errore",
        description: "Impossibile caricare i trasporti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  const createTransport = async (data: CreateTransportData): Promise<boolean> => {
    if (!user) return false;

    try {
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
        created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Trasporto aggiunto",
        description: `${data.departure_location} → ${data.arrival_location}`
      });

      await fetchTransports();
      return true;
    } catch (error: any) {
      console.error("Error creating transport:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il trasporto",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTransport = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("transports")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Trasporto eliminato" });
      await fetchTransports();
      return true;
    } catch (error: any) {
      console.error("Error deleting transport:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il trasporto",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (!tripId) return;

    fetchTransports();

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
            fetchTransports();
          }, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchTransports]);

  const totalCost = transports.reduce((acc, t) => acc + (t.price || 0), 0);

  return {
    transports,
    loading,
    totalCost,
    createTransport,
    deleteTransport,
    refetch: fetchTransports
  };
}

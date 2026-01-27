import { useState, useEffect, useCallback, useRef } from "react";
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

export function useAccommodations(tripId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const fetchAccommodations = useCallback(async () => {
    if (!tripId || !user) {
      setAccommodations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("trip_id", tripId)
        .order("check_in", { ascending: true });

      if (error) throw error;
      setAccommodations(data || []);
    } catch (error: any) {
      console.error("Error fetching accommodations:", error);
      toastRef.current({
        title: "Errore",
        description: "Impossibile caricare gli alloggi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [tripId, user]);

  const createAccommodation = async (data: CreateAccommodationData): Promise<boolean> => {
    if (!user) return false;

    try {
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
        created_by: user.id
      });

      if (error) throw error;

      toast({
        title: "Alloggio aggiunto",
        description: data.name
      });

      await fetchAccommodations();
      return true;
    } catch (error: any) {
      console.error("Error creating accommodation:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare l'alloggio",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteAccommodation = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("accommodations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Alloggio eliminato" });
      await fetchAccommodations();
      return true;
    } catch (error: any) {
      console.error("Error deleting accommodation:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'alloggio",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (!tripId) return;

    fetchAccommodations();

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
            fetchAccommodations();
          }, 300);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [tripId, fetchAccommodations]);

  const totalCost = accommodations.reduce((acc, a) => acc + (a.price || 0), 0);

  return {
    accommodations,
    loading,
    totalCost,
    createAccommodation,
    deleteAccommodation,
    refetch: fetchAccommodations
  };
}

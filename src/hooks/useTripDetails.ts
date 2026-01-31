
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TripDetails {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  description: string | null;
  [key: string]: any;
}

export const useTripDetails = (tripId: string | undefined | null) => {
  return useQuery({
    queryKey: ["trip-details", tripId],
    queryFn: async () => {
      if (!tripId) return null;
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();
      
      if (error) throw error;
      return data as TripDetails;
    },
    enabled: !!tripId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

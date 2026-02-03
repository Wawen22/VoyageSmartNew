import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TripDestination {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  order_index: number;
  is_primary: boolean;
}

export function useTripDestinations(tripId: string | undefined) {
  return useQuery({
    queryKey: ["trip-destinations", tripId],
    queryFn: async () => {
      if (!tripId) return [];
      
      const { data, error } = await supabase
        .from("trip_destinations")
        .select("*")
        .eq("trip_id", tripId)
        .order("order_index", { ascending: true });
        
      if (error) throw error;
      return data as TripDestination[];
    },
    enabled: !!tripId,
  });
}

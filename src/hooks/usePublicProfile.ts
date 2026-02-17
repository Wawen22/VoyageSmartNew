import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBadges, UserStats, Badge as GameBadge, calculateUserStats } from "@/utils/gamification";

export interface PublicProfile {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
}

export interface PublicTrip {
  id: string;
  title: string;
  destination: string;
  cover_image: string | null;
  start_date: string;
  end_date: string;
  status: string;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  destinations?: any[];
}

export const usePublicProfile = (username: string | undefined) => {
  return useQuery({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      if (!username) throw new Error("Username required");

      // 1. Get Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) return null;

      // 2. Get Public Trips with destinations
      const { data: trips } = await supabase
        .from('trips')
        .select(`
          id, title, destination, cover_image, start_date, end_date, status, country_code, latitude, longitude,
          destinations:trip_destinations(id, name, latitude, longitude, order_index)
        `)
        .eq('user_id', profile.user_id)
        .eq('is_public_shared', true)
        .order('start_date', { ascending: false });

      // 3. Get Real Stats via RPC (Counts all trips, private included)
      const { data: rpcStats, error: rpcError } = await supabase
        .rpc('get_profile_stats', { target_username: username });

      if (rpcError) {
        console.error("Error fetching stats:", rpcError);
      }

      const publicTrips = (trips || []) as PublicTrip[];
      
      // Calculate dynamic stats from all visible trips
      const computedStats = calculateUserStats(publicTrips);

      // Merge RPC stats with computed stats
      const stats: UserStats = {
        totalTrips: rpcStats?.total_trips || publicTrips.length,
        totalCountries: rpcStats?.countries_visited || computedStats.totalCountries,
        totalKm: computedStats.totalKm,
        visitedCountries: computedStats.visitedCountries
      };

      // Calculate Badges dynamically
      const computedBadges = getBadges(stats, publicTrips);

      return {
        profile: profile as PublicProfile,
        trips: publicTrips,
        badges: computedBadges,
        stats
      };
    },
    enabled: !!username,
    retry: false
  });
};

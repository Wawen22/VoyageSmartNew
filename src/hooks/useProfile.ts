import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  is_pro?: boolean;
  stripe_customer_id?: string | null;
  ai_usage_count?: number;
  trial_ends_at?: string | null;
  pro_source?: string | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error("Error fetching profile:", error);
        }
        setProfile(null);
      } else {
        setProfile(data as ProfileData);
      }
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Subscribe to profile changes
    if (user) {
      const channel = supabase
        .channel(`profile-updates-${user.id}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles', 
            filter: `user_id=eq.${user.id}` 
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              setProfile(null);
            } else {
              setProfile(payload.new as ProfileData);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return { profile, loading, refreshProfile: fetchProfile };
};

-- Function to get profile stats bypassing RLS
-- This ensures we count ALL trips (even private ones) for the stats counters on public profiles

CREATE OR REPLACE FUNCTION public.get_profile_stats(target_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_trips', COUNT(DISTINCT t.id),
        'countries_visited', COUNT(DISTINCT COALESCE(t.country_code, td.country_code))
    )
    INTO result
    FROM public.profiles p
    LEFT JOIN public.trips t ON t.user_id = p.user_id
    LEFT JOIN public.trip_destinations td ON td.trip_id = t.id
    WHERE p.username = target_username;

    RETURN result;
END;
$$;

-- Allow public access
GRANT EXECUTE ON FUNCTION public.get_profile_stats(TEXT) TO anon, authenticated;

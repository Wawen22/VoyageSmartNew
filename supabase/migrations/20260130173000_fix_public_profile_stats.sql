-- Update get_profile_stats to include trips where user is a member (not just owner)
CREATE OR REPLACE FUNCTION public.get_profile_stats(target_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
    result JSON;
BEGIN
    -- Get User ID
    SELECT user_id INTO target_user_id FROM public.profiles WHERE username = target_username;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object('total_trips', 0, 'countries_visited', 0);
    END IF;

    -- Calculate Stats using trip_members to catch both owners and participants
    SELECT json_build_object(
        'total_trips', COUNT(DISTINCT tm.trip_id),
        'countries_visited', COUNT(DISTINCT COALESCE(t.country_code, td.country_code))
    )
    INTO result
    FROM public.trip_members tm
    JOIN public.trips t ON t.id = tm.trip_id
    LEFT JOIN public.trip_destinations td ON td.trip_id = t.id
    WHERE tm.user_id = target_user_id;

    RETURN result;
END;
$$;

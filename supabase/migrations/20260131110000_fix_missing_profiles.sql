-- Fix missing profiles for trip members
-- This ensures that every user participating in a trip has a corresponding profile row

DO $$
DECLARE
  missing_user RECORD;
BEGIN
  FOR missing_user IN
    SELECT tm.user_id, u.email, u.raw_user_meta_data
    FROM public.trip_members tm
    LEFT JOIN public.profiles p ON tm.user_id = p.user_id
    JOIN auth.users u ON tm.user_id = u.id
    WHERE p.id IS NULL
    GROUP BY tm.user_id, u.email, u.raw_user_meta_data
  LOOP
    -- Insert missing profile
    INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
    VALUES (
      missing_user.user_id,
      COALESCE(
        missing_user.raw_user_meta_data->>'username', 
        split_part(missing_user.email, '@', 1)
      ),
      COALESCE(
        missing_user.raw_user_meta_data->>'full_name', 
        missing_user.raw_user_meta_data->>'name',
        split_part(missing_user.email, '@', 1)
      ),
      missing_user.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$;
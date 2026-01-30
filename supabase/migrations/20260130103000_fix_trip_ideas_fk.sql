-- Fix Foreign Key constraint for trip_ideas.created_by
-- Previous migration incorrectly linked to public.profiles(id) instead of auth.users(id)

ALTER TABLE public.trip_ideas
DROP CONSTRAINT IF EXISTS trip_ideas_created_by_fkey;

ALTER TABLE public.trip_ideas
ADD CONSTRAINT trip_ideas_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

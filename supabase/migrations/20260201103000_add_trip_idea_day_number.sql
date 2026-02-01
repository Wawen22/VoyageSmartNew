-- Add day number to trip_ideas to tag ideas by trip day
ALTER TABLE public.trip_ideas
ADD COLUMN IF NOT EXISTS day_number INTEGER;

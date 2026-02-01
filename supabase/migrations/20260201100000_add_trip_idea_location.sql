-- Add location to trip_ideas for grouping ideas by place
ALTER TABLE public.trip_ideas
ADD COLUMN IF NOT EXISTS location TEXT;

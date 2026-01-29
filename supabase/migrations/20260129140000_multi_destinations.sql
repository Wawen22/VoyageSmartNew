-- Create trip_destinations table
CREATE TABLE public.trip_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_destinations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view destinations for their trips"
ON public.trip_destinations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_destinations.trip_id
    AND (auth.uid() = t.user_id OR public.is_trip_member(auth.uid(), t.id))
  )
);

CREATE POLICY "Users can insert destinations for their trips"
ON public.trip_destinations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_destinations.trip_id
    AND auth.uid() = t.user_id
  )
);

CREATE POLICY "Users can update destinations for their trips"
ON public.trip_destinations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_destinations.trip_id
    AND (auth.uid() = t.user_id OR public.is_trip_admin(auth.uid(), t.id))
  )
);

CREATE POLICY "Users can delete destinations for their trips"
ON public.trip_destinations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_destinations.trip_id
    AND (auth.uid() = t.user_id OR public.is_trip_admin(auth.uid(), t.id))
  )
);

-- Migrate existing data
INSERT INTO public.trip_destinations (trip_id, name, is_primary, latitude, longitude)
SELECT id, destination, true, latitude, longitude
FROM public.trips;

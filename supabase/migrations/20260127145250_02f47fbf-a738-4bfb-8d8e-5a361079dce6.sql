-- Add public sharing columns to trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS public_share_token UUID UNIQUE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_public_shared BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_trips_public_share_token ON public.trips(public_share_token) WHERE public_share_token IS NOT NULL;

-- Create a function to get public trip data (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_public_trip_by_token(_token UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  destination TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  cover_image TEXT,
  status TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id,
    t.title,
    t.destination,
    t.description,
    t.start_date,
    t.end_date,
    t.cover_image,
    t.status
  FROM public.trips t
  WHERE t.public_share_token = _token
    AND t.is_public_shared = true;
$$;

-- Create function to get public trip activities
CREATE OR REPLACE FUNCTION public.get_public_trip_activities(_trip_id UUID, _token UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  activity_date DATE,
  start_time TIME,
  end_time TIME,
  category TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.title,
    a.description,
    a.location,
    a.activity_date,
    a.start_time,
    a.end_time,
    a.category
  FROM public.itinerary_activities a
  INNER JOIN public.trips t ON t.id = a.trip_id
  WHERE a.trip_id = _trip_id
    AND t.public_share_token = _token
    AND t.is_public_shared = true
  ORDER BY a.activity_date, a.start_time;
$$;

-- Create function to get public trip transports
CREATE OR REPLACE FUNCTION public.get_public_trip_transports(_trip_id UUID, _token UUID)
RETURNS TABLE (
  id UUID,
  transport_type TEXT,
  departure_location TEXT,
  arrival_location TEXT,
  departure_datetime TIMESTAMPTZ,
  arrival_datetime TIMESTAMPTZ,
  carrier TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tr.id,
    tr.transport_type::TEXT,
    tr.departure_location,
    tr.arrival_location,
    tr.departure_datetime,
    tr.arrival_datetime,
    tr.carrier
  FROM public.transports tr
  INNER JOIN public.trips t ON t.id = tr.trip_id
  WHERE tr.trip_id = _trip_id
    AND t.public_share_token = _token
    AND t.is_public_shared = true
  ORDER BY tr.departure_datetime;
$$;

-- Create function to get public trip accommodations
CREATE OR REPLACE FUNCTION public.get_public_trip_accommodations(_trip_id UUID, _token UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  check_in DATE,
  check_out DATE,
  check_in_time TIME,
  check_out_time TIME
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    acc.id,
    acc.name,
    acc.address,
    acc.check_in,
    acc.check_out,
    acc.check_in_time,
    acc.check_out_time
  FROM public.accommodations acc
  INNER JOIN public.trips t ON t.id = acc.trip_id
  WHERE acc.trip_id = _trip_id
    AND t.public_share_token = _token
    AND t.is_public_shared = true
  ORDER BY acc.check_in;
$$;
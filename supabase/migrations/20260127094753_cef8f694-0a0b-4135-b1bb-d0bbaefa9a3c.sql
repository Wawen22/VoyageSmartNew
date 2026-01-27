-- Create transport type enum
CREATE TYPE public.transport_type AS ENUM ('flight', 'train', 'bus', 'car', 'ferry', 'other');

-- Create accommodations table
CREATE TABLE public.accommodations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'EUR',
  booking_reference TEXT,
  booking_url TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transports table
CREATE TABLE public.transports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  transport_type public.transport_type NOT NULL DEFAULT 'other',
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  departure_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_datetime TIMESTAMP WITH TIME ZONE,
  booking_reference TEXT,
  carrier TEXT,
  price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transports ENABLE ROW LEVEL SECURITY;

-- RLS policies for accommodations
CREATE POLICY "Trip members can view accommodations"
  ON public.accommodations FOR SELECT
  USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can create accommodations"
  ON public.accommodations FOR INSERT
  WITH CHECK (is_trip_member(auth.uid(), trip_id) AND created_by = auth.uid());

CREATE POLICY "Creator can update accommodations"
  ON public.accommodations FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Creator or admin can delete accommodations"
  ON public.accommodations FOR DELETE
  USING (created_by = auth.uid() OR is_trip_admin(auth.uid(), trip_id));

-- RLS policies for transports
CREATE POLICY "Trip members can view transports"
  ON public.transports FOR SELECT
  USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can create transports"
  ON public.transports FOR INSERT
  WITH CHECK (is_trip_member(auth.uid(), trip_id) AND created_by = auth.uid());

CREATE POLICY "Creator can update transports"
  ON public.transports FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Creator or admin can delete transports"
  ON public.transports FOR DELETE
  USING (created_by = auth.uid() OR is_trip_admin(auth.uid(), trip_id));

-- Triggers for updated_at
CREATE TRIGGER update_accommodations_updated_at
  BEFORE UPDATE ON public.accommodations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transports_updated_at
  BEFORE UPDATE ON public.transports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.accommodations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transports;
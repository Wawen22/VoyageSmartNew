-- Table for tracking settlements between members
CREATE TABLE public.settlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  notes TEXT,
  settled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trip members can view settlements"
ON public.settlements
FOR SELECT
USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can create settlements"
ON public.settlements
FOR INSERT
WITH CHECK (is_trip_member(auth.uid(), trip_id) AND created_by = auth.uid());

CREATE POLICY "Creator can delete settlements"
ON public.settlements
FOR DELETE
USING (created_by = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.settlements;
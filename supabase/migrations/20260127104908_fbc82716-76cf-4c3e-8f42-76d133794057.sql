-- Create itinerary_activities table for custom planned activities
CREATE TABLE public.itinerary_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  activity_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  category TEXT DEFAULT 'activity',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itinerary_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Trip members can view activities" 
ON public.itinerary_activities 
FOR SELECT 
USING (is_trip_member(auth.uid(), trip_id));

CREATE POLICY "Trip members can create activities" 
ON public.itinerary_activities 
FOR INSERT 
WITH CHECK (is_trip_member(auth.uid(), trip_id) AND created_by = auth.uid());

CREATE POLICY "Creator can update activities" 
ON public.itinerary_activities 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Creator or admin can delete activities" 
ON public.itinerary_activities 
FOR DELETE 
USING (created_by = auth.uid() OR is_trip_admin(auth.uid(), trip_id));

-- Trigger for updated_at
CREATE TRIGGER update_itinerary_activities_updated_at
BEFORE UPDATE ON public.itinerary_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.itinerary_activities;
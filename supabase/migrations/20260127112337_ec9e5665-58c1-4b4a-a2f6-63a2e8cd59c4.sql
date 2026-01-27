-- Create checklist_items table
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID, -- NULL for group items, user_id for personal items
  text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  category TEXT DEFAULT 'general',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_checklist_items_trip_id ON public.checklist_items(trip_id);
CREATE INDEX idx_checklist_items_user_id ON public.checklist_items(user_id);

-- Enable RLS
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- SELECT: Trip members can view group items (user_id IS NULL) and their own personal items
CREATE POLICY "Trip members can view checklist items"
ON public.checklist_items
FOR SELECT
USING (
  is_trip_member(auth.uid(), trip_id) AND 
  (user_id IS NULL OR user_id = auth.uid())
);

-- INSERT: Trip members can create items
CREATE POLICY "Trip members can create checklist items"
ON public.checklist_items
FOR INSERT
WITH CHECK (
  is_trip_member(auth.uid(), trip_id) AND 
  created_by = auth.uid() AND
  (user_id IS NULL OR user_id = auth.uid())
);

-- UPDATE: Any member can update group items, only owner can update personal items
CREATE POLICY "Members can update checklist items"
ON public.checklist_items
FOR UPDATE
USING (
  is_trip_member(auth.uid(), trip_id) AND 
  (user_id IS NULL OR user_id = auth.uid())
);

-- DELETE: Creator can delete their items, admin can delete group items
CREATE POLICY "Creator or admin can delete checklist items"
ON public.checklist_items
FOR DELETE
USING (
  created_by = auth.uid() OR 
  (user_id IS NULL AND is_trip_admin(auth.uid(), trip_id))
);

-- Add trigger for updated_at
CREATE TRIGGER update_checklist_items_updated_at
BEFORE UPDATE ON public.checklist_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items;
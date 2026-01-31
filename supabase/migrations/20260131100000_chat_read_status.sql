-- Add last_read_chat_at column to trip_members
ALTER TABLE public.trip_members 
ADD COLUMN IF NOT EXISTS last_read_chat_at TIMESTAMPTZ DEFAULT NOW();

-- Function to mark chat as read for the current user
CREATE OR REPLACE FUNCTION public.mark_trip_chat_read(p_trip_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trip_members
  SET last_read_chat_at = NOW()
  WHERE trip_id = p_trip_id AND user_id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.mark_trip_chat_read(UUID) TO authenticated;

-- Create trip_messages table
CREATE TABLE IF NOT EXISTS public.trip_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trip members can view messages"
    ON public.trip_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_messages.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can send messages"
    ON public.trip_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_messages.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

-- Enable Realtime for this table
-- Note: Check if publication exists first or just alter. Supabase usually has supabase_realtime created.
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_messages;

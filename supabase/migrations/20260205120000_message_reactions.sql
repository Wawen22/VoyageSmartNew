-- Create trip_message_reactions table
CREATE TABLE IF NOT EXISTS public.trip_message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.trip_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.trip_message_reactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Trip members can view reactions"
    ON public.trip_message_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_messages
            JOIN public.trip_members ON trip_members.trip_id = trip_messages.trip_id
            WHERE trip_messages.id = trip_message_reactions.message_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can add reactions"
    ON public.trip_message_reactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_messages
            JOIN public.trip_members ON trip_members.trip_id = trip_messages.trip_id
            WHERE trip_messages.id = trip_message_reactions.message_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove their own reactions"
    ON public.trip_message_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_message_reactions;

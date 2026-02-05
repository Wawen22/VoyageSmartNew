-- Create trip_polls table
CREATE TABLE IF NOT EXISTS public.trip_polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    allow_multiple_answers BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create trip_poll_options table
CREATE TABLE IF NOT EXISTS public.trip_poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES public.trip_polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL
);

-- Create trip_poll_votes table
CREATE TABLE IF NOT EXISTS public.trip_poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES public.trip_polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES public.trip_poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(poll_id, user_id)
);

-- Add poll_id to trip_messages
ALTER TABLE public.trip_messages ADD COLUMN poll_id UUID REFERENCES public.trip_polls(id) ON DELETE SET NULL;

-- Relax content check for polls
ALTER TABLE public.trip_messages ALTER COLUMN content DROP NOT NULL;
ALTER TABLE public.trip_messages DROP CONSTRAINT IF EXISTS trip_messages_content_check;
ALTER TABLE public.trip_messages ADD CONSTRAINT trip_messages_content_check CHECK (
    (poll_id IS NOT NULL) OR (content IS NOT NULL AND char_length(content) > 0)
);

-- Enable RLS
ALTER TABLE public.trip_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for trip_polls
CREATE POLICY "Trip members can view polls"
    ON public.trip_polls FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_polls.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can create polls"
    ON public.trip_polls FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_polls.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

-- Policies for trip_poll_options
CREATE POLICY "Trip members can view poll options"
    ON public.trip_poll_options FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_polls
            JOIN public.trip_members ON trip_members.trip_id = trip_polls.trip_id
            WHERE trip_polls.id = trip_poll_options.poll_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can create poll options"
    ON public.trip_poll_options FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_polls
            JOIN public.trip_members ON trip_members.trip_id = trip_polls.trip_id
            WHERE trip_polls.id = trip_poll_options.poll_id
            AND trip_members.user_id = auth.uid()
        )
    );

-- Policies for trip_poll_votes
CREATE POLICY "Trip members can view poll votes"
    ON public.trip_poll_votes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_polls
            JOIN public.trip_members ON trip_members.trip_id = trip_polls.trip_id
            WHERE trip_polls.id = trip_poll_votes.poll_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can vote"
    ON public.trip_poll_votes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.trip_polls
            JOIN public.trip_members ON trip_members.trip_id = trip_polls.trip_id
            WHERE trip_polls.id = trip_poll_votes.poll_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can change their vote"
    ON public.trip_poll_votes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote"
    ON public.trip_poll_votes FOR DELETE
    USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_poll_votes;

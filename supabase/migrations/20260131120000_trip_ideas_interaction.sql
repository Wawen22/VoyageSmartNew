-- Create trip_idea_votes table
CREATE TABLE IF NOT EXISTS public.trip_idea_votes (
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    idea_id UUID NOT NULL REFERENCES public.trip_ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (idea_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trip_idea_votes ENABLE ROW LEVEL SECURITY;

-- Policies for votes
CREATE POLICY "Trip members can view votes"
    ON public.trip_idea_votes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_idea_votes.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can vote"
    ON public.trip_idea_votes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_idea_votes.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove their own votes"
    ON public.trip_idea_votes FOR DELETE
    USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_idea_votes;

-- Create trip_idea_comments table
CREATE TABLE IF NOT EXISTS public.trip_idea_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    idea_id UUID NOT NULL REFERENCES public.trip_ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.trip_idea_comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Trip members can view comments"
    ON public.trip_idea_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_idea_comments.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can comment"
    ON public.trip_idea_comments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_idea_comments.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own comments"
    ON public.trip_idea_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_idea_comments;

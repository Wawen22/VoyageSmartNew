-- Create trip_ideas table
CREATE TABLE IF NOT EXISTS public.trip_ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    type TEXT NOT NULL CHECK (type IN ('NOTE', 'LINK', 'IMAGE')),
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.trip_ideas ENABLE ROW LEVEL SECURITY;

-- Policies for trip_ideas
CREATE POLICY "Trip members can view ideas"
    ON public.trip_ideas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_ideas.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can insert ideas"
    ON public.trip_ideas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_ideas.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Creators can delete their own ideas"
    ON public.trip_ideas FOR DELETE
    USING (auth.uid() = created_by);

-- Storage Bucket Setup for trip-ideas
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-ideas', 'trip-ideas', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Trip members can view idea images"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'trip-ideas' );

CREATE POLICY "Trip members can upload idea images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'trip-ideas' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Creators can delete their own idea images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'trip-ideas' AND
        auth.uid() = owner
    );

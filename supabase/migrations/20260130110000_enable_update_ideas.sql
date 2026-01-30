-- Enable users to update their own ideas
CREATE POLICY "Creators can update their own ideas"
    ON public.trip_ideas FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Update policy to allow all trip members to edit ideas (Collaborative approach)
-- This fixes the RLS blocking issues when updating ideas

DROP POLICY IF EXISTS "Creators can update their own ideas" ON public.trip_ideas;

CREATE POLICY "Trip members can update ideas"
    ON public.trip_ideas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_ideas.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

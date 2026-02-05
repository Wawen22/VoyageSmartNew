-- Add is_pinned to trip_messages
ALTER TABLE public.trip_messages 
ADD COLUMN is_pinned BOOLEAN DEFAULT false;

-- Add policy or update existing ones if necessary (usually view/insert policies cover this, but update might be needed)
CREATE POLICY "Trip members can pin messages"
    ON public.trip_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_messages.trip_id
            AND trip_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = trip_messages.trip_id
            AND trip_members.user_id = auth.uid()
        )
    );

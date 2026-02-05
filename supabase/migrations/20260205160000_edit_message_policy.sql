-- Add is_edited column to trip_messages
ALTER TABLE public.trip_messages 
ADD COLUMN is_edited BOOLEAN DEFAULT false;

-- Add policy for editing messages within 15 minutes
CREATE POLICY "Users can edit their own messages within 15 minutes"
ON public.trip_messages FOR UPDATE
USING (
    auth.uid() = sender_id 
    AND created_at > (now() - interval '15 minutes')
)
WITH CHECK (
    auth.uid() = sender_id 
    AND created_at > (now() - interval '15 minutes')
);

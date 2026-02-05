-- Add delete policy for trip_messages with 15-minute time limit
CREATE POLICY "Users can delete their own messages within 15 minutes"
ON public.trip_messages FOR DELETE
USING (
    auth.uid() = sender_id 
    AND created_at > (now() - interval '15 minutes')
);

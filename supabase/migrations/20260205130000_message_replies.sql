-- Add reply_to_message_id to trip_messages
ALTER TABLE public.trip_messages 
ADD COLUMN reply_to_message_id UUID REFERENCES public.trip_messages(id) ON DELETE SET NULL;

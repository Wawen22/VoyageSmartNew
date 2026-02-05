-- Change unique constraint to allow multiple votes per user on different options
ALTER TABLE public.trip_poll_votes DROP CONSTRAINT IF EXISTS trip_poll_votes_poll_id_user_id_key;
ALTER TABLE public.trip_poll_votes ADD CONSTRAINT trip_poll_votes_poll_id_user_id_option_id_key UNIQUE(poll_id, user_id, option_id);

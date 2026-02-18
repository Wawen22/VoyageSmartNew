-- Trigger function for new chat messages
CREATE OR REPLACE FUNCTION public.on_chat_message_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
  trip_title TEXT;
BEGIN
  -- Don't notify for poll messages (they have their own trigger)
  IF NEW.poll_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id;
  SELECT title INTO trip_title FROM public.trips WHERE id = NEW.trip_id;
  
  PERFORM public.notify_trip_members(
    NEW.trip_id,
    NEW.sender_id,
    'chat',
    format('Nuovo messaggio in %s', trip_title),
    format('%s: %s', COALESCE(sender_name, 'Qualcuno'), 
      CASE 
        WHEN length(NEW.content) > 50 THEN left(NEW.content, 47) || '...'
        ELSE NEW.content
      END
    ),
    format('/chat/%s', NEW.trip_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_chat_message_created_trigger
AFTER INSERT ON public.trip_messages
FOR EACH ROW EXECUTE FUNCTION public.on_chat_message_created();

-- Trigger function for new polls
CREATE OR REPLACE FUNCTION public.on_poll_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_name TEXT;
  trip_title TEXT;
BEGIN
  SELECT full_name INTO creator_name FROM public.profiles WHERE user_id = NEW.creator_id;
  SELECT title INTO trip_title FROM public.trips WHERE id = NEW.trip_id;
  
  PERFORM public.notify_trip_members(
    NEW.trip_id,
    NEW.creator_id,
    'poll',
    'Nuovo sondaggio disponibile',
    format('%s ha creato un sondaggio in "%s": "%s"', 
      COALESCE(creator_name, 'Un utente'), 
      trip_title,
      NEW.question
    ),
    format('/chat/%s', NEW.trip_id)
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_poll_created_trigger
AFTER INSERT ON public.trip_polls
FOR EACH ROW EXECUTE FUNCTION public.on_poll_created();

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (via service role or triggers)
CREATE POLICY "Trip members can receive notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify trip members (excluding actor)
CREATE OR REPLACE FUNCTION public.notify_trip_members(
  _trip_id UUID,
  _actor_id UUID,
  _type TEXT,
  _title TEXT,
  _message TEXT,
  _link TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, trip_id, type, title, message, link)
  SELECT tm.user_id, _trip_id, _type, _title, _message, _link
  FROM public.trip_members tm
  WHERE tm.trip_id = _trip_id
    AND tm.user_id != _actor_id;
END;
$$;

-- Trigger function for new expenses
CREATE OR REPLACE FUNCTION public.on_expense_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trip_title TEXT;
BEGIN
  SELECT title INTO trip_title FROM public.trips WHERE id = NEW.trip_id;
  
  PERFORM public.notify_trip_members(
    NEW.trip_id,
    NEW.created_by,
    'expense',
    'Nuova spesa aggiunta',
    format('È stata aggiunta una spesa di %s %s per "%s"', NEW.amount, NEW.currency, NEW.description),
    format('/expenses?trip=%s', NEW.trip_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_expense_created_trigger
AFTER INSERT ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.on_expense_created();

-- Trigger function for new accommodations
CREATE OR REPLACE FUNCTION public.on_accommodation_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_trip_members(
    NEW.trip_id,
    NEW.created_by,
    'accommodation',
    'Nuovo alloggio aggiunto',
    format('È stato aggiunto l''alloggio "%s"', NEW.name),
    format('/accommodations?trip=%s', NEW.trip_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_accommodation_created_trigger
AFTER INSERT ON public.accommodations
FOR EACH ROW EXECUTE FUNCTION public.on_accommodation_created();

-- Trigger function for new transports
CREATE OR REPLACE FUNCTION public.on_transport_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_trip_members(
    NEW.trip_id,
    NEW.created_by,
    'transport',
    'Nuovo trasporto aggiunto',
    format('È stato aggiunto un trasporto da %s a %s', NEW.departure_location, NEW.arrival_location),
    format('/transports?trip=%s', NEW.trip_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transport_created_trigger
AFTER INSERT ON public.transports
FOR EACH ROW EXECUTE FUNCTION public.on_transport_created();

-- Trigger function for new activities
CREATE OR REPLACE FUNCTION public.on_activity_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_trip_members(
    NEW.trip_id,
    NEW.created_by,
    'activity',
    'Nuova attività aggiunta',
    format('È stata aggiunta l''attività "%s"', NEW.title),
    format('/itinerary?trip=%s', NEW.trip_id)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_activity_created_trigger
AFTER INSERT ON public.itinerary_activities
FOR EACH ROW EXECUTE FUNCTION public.on_activity_created();

-- Trigger function for new invitations
CREATE OR REPLACE FUNCTION public.on_invitation_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trip_title TEXT;
  inviter_name TEXT;
  invited_user_id UUID;
BEGIN
  SELECT title INTO trip_title FROM public.trips WHERE id = NEW.trip_id;
  SELECT COALESCE(full_name, 'Un utente') INTO inviter_name 
  FROM public.profiles WHERE user_id = NEW.invited_by;
  
  -- Find user by email
  SELECT id INTO invited_user_id FROM auth.users WHERE email = NEW.invited_email;
  
  IF invited_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, trip_id, type, title, message, link)
    VALUES (
      invited_user_id,
      NEW.trip_id,
      'invitation',
      'Nuovo invito al viaggio',
      format('%s ti ha invitato al viaggio "%s"', inviter_name, trip_title),
      '/trips'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_invitation_created_trigger
AFTER INSERT ON public.trip_invitations
FOR EACH ROW EXECUTE FUNCTION public.on_invitation_created();
-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to call the Edge Function for push notifications
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- These should be set in your Supabase project
  -- Or you can hardcode them if you are sure (not recommended for keys)
  -- For local dev, we use the internal docker network URL if possible
  -- But usually, we get them from vault or settings
  
  -- We'll try to get them from a custom setting or use defaults
  edge_function_url := current_setting('app.edge_function_url', true);
  IF edge_function_url IS NULL THEN
    -- Fallback to a placeholder or common pattern
    edge_function_url := 'https://your-project-ref.supabase.co/functions/v1/send-push-notification';
  END IF;

  service_role_key := current_setting('app.service_role_key', true);

  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', service_role_key)
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'message', NEW.message,
      'link', NEW.link
    )
  );

  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new notification is created
-- This ensures that ANY notification (chat, expense, invite, poll)
-- that gets inserted into the notifications table also triggers a push.
CREATE TRIGGER on_notification_created_push_trigger
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.trigger_push_notification();

-- Note: You need to set the custom settings in Supabase:
-- ALTER DATABASE postgres SET "app.edge_function_url" = 'https://YOUR_PROJECT.supabase.co/functions/v1/send-push-notification';
-- ALTER DATABASE postgres SET "app.service_role_key" = 'YOUR_SERVICE_ROLE_KEY';

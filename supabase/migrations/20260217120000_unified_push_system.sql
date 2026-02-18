-- ==========================================
-- 1. TABELLA SOTTOSCRIZIONI PUSH
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_json JSONB NOT NULL,
    platform TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, subscription_json)
);

-- Abilita RLS
ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiche RLS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own subscriptions') THEN
        CREATE POLICY "Users can manage their own subscriptions"
            ON public.user_push_subscriptions FOR ALL
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- ==========================================
-- 2. TRIGGER PER NOTIFICHE CHAT E SONDAGGI
-- ==========================================

-- Funzione per inserire notifiche quando arriva un messaggio o un sondaggio
CREATE OR REPLACE FUNCTION public.on_chat_or_poll_created()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  trip_title TEXT;
  target_trip_id UUID;
  actor_id UUID;
BEGIN
  -- Identifica tabella e dati
  IF TG_TABLE_NAME = 'trip_messages' THEN
    target_trip_id := NEW.trip_id;
    actor_id := NEW.sender_id;
    
    -- Notifica solo se NON è un messaggio legato a un sondaggio (evitiamo doppioni)
    IF NEW.poll_id IS NULL THEN
        SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = actor_id;
        SELECT title INTO trip_title FROM public.trips WHERE id = target_trip_id;
        
        PERFORM public.notify_trip_members(
          target_trip_id, actor_id, 'chat', 
          format('Messaggio in %s', trip_title), 
          format('%s: %s', COALESCE(sender_name, 'Qualcuno'), 
            CASE WHEN length(NEW.content) > 50 THEN left(NEW.content, 47) || '...' ELSE NEW.content END),
          format('/chat/%s', target_trip_id)
        );
    END IF;
    
  ELSIF TG_TABLE_NAME = 'trip_polls' THEN
    target_trip_id := NEW.trip_id;
    actor_id := NEW.creator_id;
    
    SELECT full_name INTO sender_name FROM public.profiles WHERE user_id = actor_id;
    SELECT title INTO trip_title FROM public.trips WHERE id = target_trip_id;
    
    PERFORM public.notify_trip_members(
      target_trip_id, actor_id, 'poll', 
      'Nuovo sondaggio disponibile', 
      format('%s ha creato un sondaggio in "%s": %s', COALESCE(sender_name, 'Un utente'), trip_title, NEW.question),
      format('/chat/%s', target_trip_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per Messaggi
DROP TRIGGER IF EXISTS on_chat_message_created_trigger ON public.trip_messages;
CREATE TRIGGER on_chat_message_created_trigger
AFTER INSERT ON public.trip_messages
FOR EACH ROW EXECUTE FUNCTION public.on_chat_or_poll_created();

-- Trigger per Sondaggi
DROP TRIGGER IF EXISTS on_poll_created_trigger ON public.trip_polls;
CREATE TRIGGER on_poll_created_trigger
AFTER INSERT ON public.trip_polls
FOR EACH ROW EXECUTE FUNCTION public.on_chat_or_poll_created();

-- ==========================================
-- 3. TRIGGER WEBHOOK (PUSH)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  edge_url TEXT;
  role_key TEXT;
BEGIN
  -- Recupera configurazioni dalle impostazioni del DB
  edge_url := current_setting('app.edge_function_url', true);
  role_key := current_setting('app.service_role_key', true);

  -- Esci se le configurazioni mancano (evita errori bloccanti)
  IF edge_url IS NULL OR role_key IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', format('Bearer %s', role_key)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_notification_created_push_trigger ON public.notifications;
CREATE TRIGGER on_notification_created_push_trigger
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.trigger_push_notification();

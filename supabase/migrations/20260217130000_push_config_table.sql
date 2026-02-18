-- ==========================================
-- 1. TABELLA DI CONFIGURAZIONE APP
-- ==========================================
-- Creiamo una tabella sicura per memorizzare URL e Chiavi, 
-- aggirando i limiti di permessi di Postgres su Supabase.

CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disabilitiamo RLS per questa tabella o la rendiamo leggibile solo dal sistema
-- In questo caso, essendo usata solo da funzioni SECURITY DEFINER, non serve esporla via API.
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
-- Nessuna policy = Nessun accesso via REST API (Sicuro)

-- Inserimento dei valori di default (Sostituisci la chiave se necessario dopo l'esecuzione)
INSERT INTO public.app_config (key, value) VALUES 
('edge_function_url', 'https://cbuymqxvzhvvgdqsmytw.supabase.co/functions/v1/send-push-notification'),
('service_role_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidXltcXh2emh2dmdkcXNteXR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ4OTgxOCwiZXhwIjoyMDg1MDY1ODE4fQ.hxaOiIhk7RbuigJTpjtKaawaykJp8nS14rYWJQSUCF8')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ==========================================
-- 2. AGGIORNAMENTO FUNZIONE TRIGGER PUSH
-- ==========================================

-- Sovrascriviamo la funzione precedente per leggere dalla nuova tabella
CREATE OR REPLACE FUNCTION public.trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  edge_url TEXT;
  role_key TEXT;
BEGIN
  -- Recupera i valori dalla tabella app_config
  SELECT value INTO edge_url FROM public.app_config WHERE key = 'edge_function_url';
  SELECT value INTO role_key FROM public.app_config WHERE key = 'service_role_key';

  -- Se i dati non sono configurati, usciamo silenziosamente per non bloccare le transazioni
  IF edge_url IS NULL OR role_key IS NULL THEN
    RETURN NEW;
  END IF;

  -- Invio asincrono della notifica push tramite pg_net
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

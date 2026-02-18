import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    const { user_id, title, message, link } = payload

    if (!user_id) throw new Error('user_id is required')

    // 1. Recupera le sottoscrizioni
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('user_push_subscriptions')
      .select('subscription_json')
      .eq('user_id', user_id)

    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log(`Tentativo di invio a ${subscriptions.length} dispositivi per ${user_id}...`)

    // 2. Invio notifiche
    const results = await Promise.all(subscriptions.map(async (sub: any) => {
      const endpoint = sub.subscription_json.endpoint;
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'TTL': '60',
          },
          // Inviamo un corpo VUOTO. 
          // Questo non richiede crittografia complessa e "sveglia" il Service Worker.
          body: null 
        })
        
        return { 
          success: response.ok, 
          status: response.status,
          endpoint: endpoint.split('/').pop()?.substring(0, 10) + '...'
        }
      } catch (err) {
        console.error('Error sending to subscription:', err);
        return { success: false, error: err.message };
      }
    }))

    return new Response(JSON.stringify({ 
      success: true, 
      sent_count: results.filter(r => r.success).length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Errore funzione:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiting (per instance)
// In production, use Redis or similar for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // Max attempts
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // First request or window expired
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW / 1000 };
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    const resetIn = Math.ceil((userLimit.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  userLimit.count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX - userLimit.count, 
    resetIn: Math.ceil((userLimit.resetAt - now) / 1000) 
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create Supabase client with user's auth context
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: authHeader } 
        } 
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'UNAUTHORIZED', message: 'Invalid session' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'RATE_LIMITED', 
          message: `Troppi tentativi. Riprova tra ${rateLimit.resetIn} secondi.`,
          retryAfter: rateLimit.resetIn 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetIn.toString(),
          }, 
          status: 429 
        }
      );
    }

    // Parse request body
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_INPUT', message: 'Inserisci un codice valido.' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Clean and validate code format
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 3 || cleanCode.length > 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_CODE', message: 'Codice non valido.' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get client info for fraud detection
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     null;
    const userAgent = req.headers.get('user-agent') || null;

    // Call the secure database function using admin client
    const { data, error } = await supabaseAdmin.rpc('redeem_promo_code', {
      p_code: cleanCode,
      p_ip_address: clientIP,
      p_user_agent: userAgent,
    });

    if (error) {
      console.error('Redemption error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'SERVER_ERROR', message: 'Si è verificato un errore. Riprova.' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Return the result from the database function
    const statusCode = data?.success ? 200 : (data?.error === 'UNAUTHORIZED' ? 401 : 400);
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        }, 
        status: statusCode 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Function error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: 'SERVER_ERROR', message: 'Si è verificato un errore imprevisto.' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

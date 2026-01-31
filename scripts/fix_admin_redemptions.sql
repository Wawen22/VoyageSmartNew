-- ============================================
-- FIX: get_admin_promo_redemptions function
-- ESEGUI QUESTO SCRIPT NEL SUPABASE SQL EDITOR
-- ============================================
-- Questo script risolve l'errore:
-- "Returned type character varying does not match expected type text in column 3"
-- ============================================

-- Drop the old function first
DROP FUNCTION IF EXISTS get_admin_promo_redemptions(uuid);

-- Recreate with explicit type casts to match return type
CREATE OR REPLACE FUNCTION get_admin_promo_redemptions(p_code_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_email text,
  user_fullname text,
  promo_code text,
  promo_code_name text,
  redeemed_at timestamptz,
  ip_address inet,
  trial_ends_at timestamptz,
  discount_applied int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check admin access
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    -- Cast to text to match return type (auth.users.email is varchar)
    COALESCE(u.email::text, 'unknown@email.com'::text) as user_email,
    COALESCE(p.full_name::text, 'Utente'::text) as user_fullname,
    COALESCE(pc.code::text, ''::text) as promo_code,
    COALESCE(pc.name::text, ''::text) as promo_code_name,
    r.redeemed_at,
    r.ip_address,
    r.trial_ends_at,
    r.discount_applied
  FROM public.promo_code_redemptions r
  LEFT JOIN auth.users u ON r.user_id = u.id
  LEFT JOIN public.profiles p ON r.user_id = p.user_id
  LEFT JOIN public.promo_codes pc ON r.promo_code_id = pc.id
  WHERE (p_code_id IS NULL OR r.promo_code_id = p_code_id)
  ORDER BY r.redeemed_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_admin_promo_redemptions(uuid) TO authenticated;

-- Verify the function was created
SELECT 'Function get_admin_promo_redemptions created successfully!' as result;

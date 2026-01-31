-- ============================================
-- USER ROLES SYSTEM
-- Admin role for VoyageSmart administration
-- ============================================

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================
-- ADMIN CHECK FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = p_user_id
    AND role = 'admin'
  );
END;
$$;

-- ============================================
-- UPDATE RLS POLICIES FOR PROMO_CODES
-- Admins can read/write promo_codes
-- ============================================

-- Drop old restrictive policy
DROP POLICY IF EXISTS "promo_codes_no_direct_access" ON public.promo_codes;

-- Admin can read all promo codes
CREATE POLICY "admins_can_read_promo_codes"
  ON public.promo_codes FOR SELECT
  USING (is_admin());

-- Admin can insert promo codes
CREATE POLICY "admins_can_insert_promo_codes"
  ON public.promo_codes FOR INSERT
  WITH CHECK (is_admin());

-- Admin can update promo codes
CREATE POLICY "admins_can_update_promo_codes"
  ON public.promo_codes FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin can delete promo codes
CREATE POLICY "admins_can_delete_promo_codes"
  ON public.promo_codes FOR DELETE
  USING (is_admin());

-- ============================================
-- UPDATE RLS POLICIES FOR PROMO_CODE_REDEMPTIONS
-- Admins can read all redemptions
-- ============================================

-- Admin can read all redemptions
CREATE POLICY "admins_can_read_all_redemptions"
  ON public.promo_code_redemptions FOR SELECT
  USING (is_admin());

-- ============================================
-- ADMIN FUNCTIONS FOR PROMO CODE MANAGEMENT
-- ============================================

-- Get all promo codes with stats (admin only)
CREATE OR REPLACE FUNCTION get_admin_promo_codes()
RETURNS TABLE (
  id uuid,
  code text,
  name text,
  description text,
  type promo_code_type,
  trial_days int,
  discount_percent int,
  lifetime_pro boolean,
  max_total_uses int,
  current_uses int,
  max_uses_per_user int,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  notes text,
  usage_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    pc.id,
    pc.code,
    pc.name,
    pc.description,
    pc.type,
    pc.trial_days,
    pc.discount_percent,
    pc.lifetime_pro,
    pc.max_total_uses,
    pc.current_uses,
    pc.max_uses_per_user,
    pc.starts_at,
    pc.expires_at,
    pc.is_active,
    pc.created_at,
    pc.updated_at,
    pc.notes,
    CASE 
      WHEN pc.max_total_uses IS NULL THEN NULL
      WHEN pc.max_total_uses = 0 THEN 0
      ELSE ROUND(100.0 * pc.current_uses / pc.max_total_uses, 2)
    END as usage_percentage
  FROM public.promo_codes pc
  ORDER BY pc.created_at DESC;
END;
$$;

-- Get promo code redemptions with user info (admin only)
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
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    u.email as user_email,
    p.full_name as user_fullname,
    pc.code as promo_code,
    pc.name as promo_code_name,
    r.redeemed_at,
    r.ip_address,
    r.trial_ends_at,
    r.discount_applied
  FROM public.promo_code_redemptions r
  JOIN auth.users u ON r.user_id = u.id
  LEFT JOIN public.profiles p ON r.user_id = p.user_id
  JOIN public.promo_codes pc ON r.promo_code_id = pc.id
  WHERE (p_code_id IS NULL OR r.promo_code_id = p_code_id)
  ORDER BY r.redeemed_at DESC;
END;
$$;

-- Update promo code (admin only)
CREATE OR REPLACE FUNCTION update_promo_code(
  p_id uuid,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_max_total_uses int DEFAULT NULL,
  p_expires_at timestamptz DEFAULT NULL,
  p_is_active boolean DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_code record;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACCESS_DENIED', 'message', 'Accesso negato: ruolo admin richiesto');
  END IF;

  UPDATE public.promo_codes
  SET 
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    max_total_uses = COALESCE(p_max_total_uses, max_total_uses),
    expires_at = COALESCE(p_expires_at, expires_at),
    is_active = COALESCE(p_is_active, is_active),
    notes = COALESCE(p_notes, notes),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_updated_code;

  IF v_updated_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Codice promozionale non trovato');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Codice aggiornato con successo',
    'code', v_updated_code.code
  );
END;
$$;

-- Delete promo code (admin only)
CREATE OR REPLACE FUNCTION delete_promo_code(p_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_redemption_count int;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACCESS_DENIED', 'message', 'Accesso negato: ruolo admin richiesto');
  END IF;

  -- Check if code exists and get info
  SELECT code INTO v_code FROM public.promo_codes WHERE id = p_id;
  
  IF v_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Codice promozionale non trovato');
  END IF;

  -- Check redemption count
  SELECT COUNT(*) INTO v_redemption_count 
  FROM public.promo_code_redemptions 
  WHERE promo_code_id = p_id;

  -- Delete redemptions first (cascade)
  DELETE FROM public.promo_code_redemptions WHERE promo_code_id = p_id;
  
  -- Delete the code
  DELETE FROM public.promo_codes WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', format('Codice %s eliminato con successo (%s redemption rimosse)', v_code, v_redemption_count),
    'deleted_code', v_code,
    'deleted_redemptions', v_redemption_count
  );
END;
$$;

-- Get promo codes stats summary (admin only)
CREATE OR REPLACE FUNCTION get_promo_codes_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACCESS_DENIED');
  END IF;

  SELECT jsonb_build_object(
    'total_codes', (SELECT COUNT(*) FROM public.promo_codes),
    'active_codes', (SELECT COUNT(*) FROM public.promo_codes WHERE is_active = true),
    'total_redemptions', (SELECT COUNT(*) FROM public.promo_code_redemptions),
    'redemptions_today', (SELECT COUNT(*) FROM public.promo_code_redemptions WHERE redeemed_at >= CURRENT_DATE),
    'redemptions_this_week', (SELECT COUNT(*) FROM public.promo_code_redemptions WHERE redeemed_at >= CURRENT_DATE - INTERVAL '7 days'),
    'by_type', (
      SELECT jsonb_object_agg(type, cnt)
      FROM (
        SELECT type, COUNT(*) as cnt
        FROM public.promo_codes
        GROUP BY type
      ) t
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$;

-- ============================================
-- Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_promo_codes() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_promo_redemptions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_promo_code(uuid, text, text, int, timestamptz, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_promo_code(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_promo_codes_stats() TO authenticated;

-- ============================================
-- IMPORTANT: Set your first admin user
-- Run this manually in SQL Editor replacing YOUR_USER_ID
-- ============================================
-- UPDATE public.profiles SET role = 'admin' WHERE user_id = 'YOUR_USER_ID';

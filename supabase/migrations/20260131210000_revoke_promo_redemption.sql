-- ============================================
-- ADMIN: Revoke a promo code redemption
-- ============================================

CREATE OR REPLACE FUNCTION revoke_promo_redemption(p_redemption_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption record;
  v_has_lifetime boolean;
  v_new_trial_end timestamptz;
BEGIN
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACCESS_DENIED', 'message', 'Accesso negato: ruolo admin richiesto');
  END IF;

  SELECT r.id,
         r.user_id,
         r.promo_code_id,
         r.trial_ends_at,
         pc.code,
         pc.type
    INTO v_redemption
  FROM public.promo_code_redemptions r
  JOIN public.promo_codes pc ON pc.id = r.promo_code_id
  WHERE r.id = p_redemption_id
  FOR UPDATE;

  IF v_redemption IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Redemption non trovata');
  END IF;

  -- Remove redemption
  DELETE FROM public.promo_code_redemptions WHERE id = p_redemption_id;

  -- Decrement usage counter (avoid negative values)
  UPDATE public.promo_codes
  SET current_uses = GREATEST(current_uses - 1, 0),
      updated_at = now()
  WHERE id = v_redemption.promo_code_id;

  -- Recalculate promo-based PRO status for the user
  SELECT EXISTS (
    SELECT 1
    FROM public.promo_code_redemptions r2
    JOIN public.promo_codes pc2 ON pc2.id = r2.promo_code_id
    WHERE r2.user_id = v_redemption.user_id
      AND pc2.type = 'lifetime'
  ) INTO v_has_lifetime;

  IF v_has_lifetime THEN
    v_new_trial_end := NULL;
  ELSE
    SELECT MAX(r2.trial_ends_at)
      INTO v_new_trial_end
    FROM public.promo_code_redemptions r2
    JOIN public.promo_codes pc2 ON pc2.id = r2.promo_code_id
    WHERE r2.user_id = v_redemption.user_id
      AND pc2.type IN ('trial', 'subscription')
      AND r2.trial_ends_at IS NOT NULL
      AND r2.trial_ends_at > now();
  END IF;

  UPDATE public.profiles
  SET is_pro = CASE WHEN v_has_lifetime OR v_new_trial_end IS NOT NULL THEN true ELSE false END,
      trial_ends_at = CASE WHEN v_has_lifetime THEN NULL ELSE v_new_trial_end END,
      pro_source = CASE
        WHEN v_has_lifetime OR v_new_trial_end IS NOT NULL THEN 'promo_code'
        ELSE NULL
      END,
      updated_at = now()
  WHERE user_id = v_redemption.user_id
    AND pro_source = 'promo_code';

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Riscatto revocato con successo',
    'code', v_redemption.code
  );
END;
$$;

GRANT EXECUTE ON FUNCTION revoke_promo_redemption(uuid) TO authenticated;

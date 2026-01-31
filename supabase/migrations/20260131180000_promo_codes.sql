-- ============================================
-- PROMO CODES SYSTEM
-- Secure redemption codes for VoyageSmart Pro
-- ============================================

-- Create enum for promo code types
create type promo_code_type as enum ('trial', 'subscription', 'lifetime', 'discount');

-- Create promo_codes table
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  code_hash text unique not null, -- SHA256 hash for secure lookup
  name text not null, -- Friendly name for admin reference
  description text, -- What this code grants
  type promo_code_type not null default 'trial',
  
  -- Benefits
  trial_days int, -- For trial type: number of days of Pro
  discount_percent int, -- For discount type: percentage off
  lifetime_pro boolean default false, -- For lifetime type
  
  -- Limits
  max_total_uses int, -- NULL = unlimited total uses
  current_uses int default 0,
  max_uses_per_user int default 1, -- How many times each user can use this code
  
  -- Validity
  starts_at timestamptz default now(),
  expires_at timestamptz, -- NULL = never expires
  is_active boolean default true,
  
  -- Admin tracking
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  notes text -- Internal admin notes
);

-- Create promo_code_redemptions table
create table if not exists public.promo_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
  
  -- Redemption details
  redeemed_at timestamptz default now(),
  ip_address inet, -- For fraud detection
  user_agent text, -- For fraud detection
  
  -- Benefits applied
  trial_ends_at timestamptz, -- When the trial expires
  discount_applied int, -- Discount percentage applied
  
  -- Tracking
  metadata jsonb default '{}',
  
  -- Constraint: unique per user per code (based on max_uses_per_user)
  unique(user_id, promo_code_id)
);

-- Create indexes for performance
create index idx_promo_codes_code_hash on public.promo_codes(code_hash);
create index idx_promo_codes_active on public.promo_codes(is_active) where is_active = true;
create index idx_promo_code_redemptions_user on public.promo_code_redemptions(user_id);
create index idx_promo_code_redemptions_code on public.promo_code_redemptions(promo_code_id);

-- Add trial tracking fields to profiles
alter table public.profiles
add column if not exists trial_ends_at timestamptz,
add column if not exists pro_source text; -- 'stripe', 'promo_code', 'admin'

-- Enable RLS
alter table public.promo_codes enable row level security;
alter table public.promo_code_redemptions enable row level security;

-- RLS Policies for promo_codes
-- Users cannot directly read/modify promo codes (only through functions)
create policy "promo_codes_no_direct_access"
  on public.promo_codes for all
  using (false);

-- RLS Policies for promo_code_redemptions
-- Users can only view their own redemptions
create policy "users_view_own_redemptions"
  on public.promo_code_redemptions for select
  using (auth.uid() = user_id);

-- Users cannot directly insert/update/delete redemptions (only through functions)
create policy "redemptions_insert_via_function"
  on public.promo_code_redemptions for insert
  with check (false);

-- ============================================
-- SECURE FUNCTION: Redeem Promo Code
-- All validation happens server-side
-- ============================================
create or replace function redeem_promo_code(
  p_code text,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_code_hash text;
  v_promo_code record;
  v_existing_redemption record;
  v_user_redemption_count int;
  v_trial_ends_at timestamptz;
  v_result jsonb;
begin
  -- Get current user
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Devi essere autenticato per redimere un codice.');
  end if;

  -- Normalize and hash the code for lookup
  v_code_hash := encode(sha256(upper(trim(p_code))::bytea), 'hex');

  -- Find the promo code
  select * into v_promo_code
  from public.promo_codes
  where code_hash = v_code_hash
    and is_active = true
  for update; -- Lock the row

  if v_promo_code is null then
    -- Generic error to prevent code enumeration
    return jsonb_build_object('success', false, 'error', 'INVALID_CODE', 'message', 'Codice non valido o scaduto.');
  end if;

  -- Check if code has started
  if v_promo_code.starts_at > now() then
    return jsonb_build_object('success', false, 'error', 'NOT_STARTED', 'message', 'Questo codice non è ancora attivo.');
  end if;

  -- Check if code has expired
  if v_promo_code.expires_at is not null and v_promo_code.expires_at < now() then
    return jsonb_build_object('success', false, 'error', 'EXPIRED', 'message', 'Questo codice è scaduto.');
  end if;

  -- Check total uses limit
  if v_promo_code.max_total_uses is not null and v_promo_code.current_uses >= v_promo_code.max_total_uses then
    return jsonb_build_object('success', false, 'error', 'MAX_USES_REACHED', 'message', 'Questo codice ha raggiunto il numero massimo di utilizzi.');
  end if;

  -- Check if user has already used this code
  select * into v_existing_redemption
  from public.promo_code_redemptions
  where user_id = v_user_id
    and promo_code_id = v_promo_code.id;

  if v_existing_redemption is not null then
    return jsonb_build_object('success', false, 'error', 'ALREADY_REDEEMED', 'message', 'Hai già utilizzato questo codice.');
  end if;

  -- Check user's total redemptions for this code (for codes with max_uses_per_user > 1)
  select count(*) into v_user_redemption_count
  from public.promo_code_redemptions
  where user_id = v_user_id
    and promo_code_id = v_promo_code.id;

  if v_user_redemption_count >= v_promo_code.max_uses_per_user then
    return jsonb_build_object('success', false, 'error', 'USER_LIMIT_REACHED', 'message', 'Hai raggiunto il limite di utilizzo per questo codice.');
  end if;

  -- Apply benefits based on code type
  case v_promo_code.type
    when 'trial' then
      -- Calculate trial end date
      v_trial_ends_at := now() + (v_promo_code.trial_days || ' days')::interval;
      
      -- Update user profile with trial
      update public.profiles
      set is_pro = true,
          trial_ends_at = v_trial_ends_at,
          pro_source = 'promo_code',
          updated_at = now()
      where user_id = v_user_id;

      v_result := jsonb_build_object(
        'success', true,
        'type', 'trial',
        'message', format('Hai attivato %s giorni di prova Pro!', v_promo_code.trial_days),
        'trial_ends_at', v_trial_ends_at,
        'benefit', format('%s giorni di VoyageSmart Pro', v_promo_code.trial_days)
      );

    when 'lifetime' then
      -- Grant lifetime pro
      update public.profiles
      set is_pro = true,
          trial_ends_at = null, -- No expiry
          pro_source = 'promo_code',
          updated_at = now()
      where user_id = v_user_id;

      v_result := jsonb_build_object(
        'success', true,
        'type', 'lifetime',
        'message', 'Hai attivato VoyageSmart Pro a vita!',
        'benefit', 'VoyageSmart Pro illimitato'
      );

    when 'subscription' then
      -- Grant pro subscription (typically 1 year)
      v_trial_ends_at := now() + '1 year'::interval;
      
      update public.profiles
      set is_pro = true,
          trial_ends_at = v_trial_ends_at,
          pro_source = 'promo_code',
          updated_at = now()
      where user_id = v_user_id;

      v_result := jsonb_build_object(
        'success', true,
        'type', 'subscription',
        'message', 'Hai attivato 1 anno di VoyageSmart Pro!',
        'trial_ends_at', v_trial_ends_at,
        'benefit', '12 mesi di VoyageSmart Pro'
      );

    when 'discount' then
      -- Discount codes are handled differently (for checkout)
      v_result := jsonb_build_object(
        'success', true,
        'type', 'discount',
        'message', format('Sconto del %s%% applicato!', v_promo_code.discount_percent),
        'discount_percent', v_promo_code.discount_percent,
        'benefit', format('%s%% di sconto sull''abbonamento', v_promo_code.discount_percent)
      );

    else
      return jsonb_build_object('success', false, 'error', 'UNKNOWN_TYPE', 'message', 'Tipo di codice non supportato.');
  end case;

  -- Record the redemption
  insert into public.promo_code_redemptions (
    user_id,
    promo_code_id,
    ip_address,
    user_agent,
    trial_ends_at,
    discount_applied,
    metadata
  ) values (
    v_user_id,
    v_promo_code.id,
    p_ip_address,
    p_user_agent,
    v_trial_ends_at,
    v_promo_code.discount_percent,
    jsonb_build_object('code_name', v_promo_code.name, 'code_type', v_promo_code.type)
  );

  -- Increment usage counter
  update public.promo_codes
  set current_uses = current_uses + 1,
      updated_at = now()
  where id = v_promo_code.id;

  return v_result;
end;
$$;

-- ============================================
-- ADMIN FUNCTION: Create Promo Code
-- Only for authenticated users (should add admin check in production)
-- ============================================
create or replace function create_promo_code(
  p_code text,
  p_name text,
  p_type promo_code_type,
  p_trial_days int default null,
  p_discount_percent int default null,
  p_lifetime_pro boolean default false,
  p_max_total_uses int default null,
  p_max_uses_per_user int default 1,
  p_expires_at timestamptz default null,
  p_description text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_code_normalized text;
  v_code_hash text;
  v_new_code record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  end if;

  -- Normalize the code
  v_code_normalized := upper(trim(p_code));
  v_code_hash := encode(sha256(v_code_normalized::bytea), 'hex');

  -- Check if code already exists
  if exists(select 1 from public.promo_codes where code_hash = v_code_hash) then
    return jsonb_build_object('success', false, 'error', 'CODE_EXISTS', 'message', 'Questo codice esiste già.');
  end if;

  -- Insert the code
  insert into public.promo_codes (
    code,
    code_hash,
    name,
    description,
    type,
    trial_days,
    discount_percent,
    lifetime_pro,
    max_total_uses,
    max_uses_per_user,
    expires_at,
    notes,
    created_by
  ) values (
    v_code_normalized,
    v_code_hash,
    p_name,
    p_description,
    p_type,
    p_trial_days,
    p_discount_percent,
    p_lifetime_pro,
    p_max_total_uses,
    p_max_uses_per_user,
    p_expires_at,
    p_notes,
    v_user_id
  )
  returning * into v_new_code;

  return jsonb_build_object(
    'success', true,
    'code', v_new_code.code,
    'id', v_new_code.id,
    'message', 'Codice creato con successo!'
  );
end;
$$;

-- ============================================
-- FUNCTION: Get User's Redemption History
-- ============================================
create or replace function get_user_redemptions()
returns table (
  id uuid,
  code_name text,
  code_type promo_code_type,
  redeemed_at timestamptz,
  trial_ends_at timestamptz,
  discount_applied int,
  benefit text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    r.id,
    pc.name as code_name,
    pc.type as code_type,
    r.redeemed_at,
    r.trial_ends_at,
    r.discount_applied,
    case pc.type
      when 'trial' then format('%s giorni di Pro', pc.trial_days)
      when 'lifetime' then 'VoyageSmart Pro illimitato'
      when 'subscription' then '12 mesi di Pro'
      when 'discount' then format('%s%% di sconto', pc.discount_percent)
    end as benefit
  from public.promo_code_redemptions r
  join public.promo_codes pc on pc.id = r.promo_code_id
  where r.user_id = auth.uid()
  order by r.redeemed_at desc;
end;
$$;

-- ============================================
-- TRIGGER: Check trial expiration
-- Run periodically via cron or check on access
-- ============================================
create or replace function check_trial_expiration()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If trial has ended and user is marked as pro via promo, downgrade
  if new.trial_ends_at is not null 
     and new.trial_ends_at < now() 
     and new.pro_source = 'promo_code' then
    new.is_pro := false;
  end if;
  return new;
end;
$$;

-- Add trigger to check on profile access/update
drop trigger if exists check_trial_on_profile_update on public.profiles;
create trigger check_trial_on_profile_update
  before update on public.profiles
  for each row
  execute function check_trial_expiration();

-- ============================================
-- Grant necessary permissions
-- ============================================
grant usage on schema public to authenticated;
grant execute on function redeem_promo_code(text, inet, text) to authenticated;
grant execute on function get_user_redemptions() to authenticated;
-- Note: create_promo_code should be restricted to admins in production

-- ============================================
-- SAMPLE CODES (for testing - REMOVE IN PRODUCTION)
-- ============================================
-- Uncomment to add test codes:
/*
select create_promo_code(
  'FRIEND2024',
  'Codice Amici 2024',
  'trial',
  p_trial_days := 30,
  p_max_total_uses := 100,
  p_description := 'Codice promozionale per amici - 30 giorni di prova'
);

select create_promo_code(
  'LIFETIME-VIP',
  'Codice Lifetime VIP',
  'lifetime',
  p_lifetime_pro := true,
  p_max_total_uses := 10,
  p_description := 'Accesso Pro a vita per utenti VIP'
);
*/

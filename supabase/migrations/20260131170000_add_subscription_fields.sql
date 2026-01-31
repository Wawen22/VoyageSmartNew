
alter table public.profiles
add column if not exists is_pro boolean default false,
add column if not exists stripe_customer_id text,
add column if not exists ai_usage_count int default 0;

-- Function to increment usage securely
create or replace function increment_ai_usage(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set ai_usage_count = coalesce(ai_usage_count, 0) + 1
  where user_id = p_user_id;
end;
$$;

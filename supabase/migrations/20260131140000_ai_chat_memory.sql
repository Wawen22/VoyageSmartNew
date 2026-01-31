
create table if not exists public.ai_chat_messages (
    id uuid not null default gen_random_uuid(),
    trip_id uuid not null references public.trips(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    content text not null,
    created_at timestamp with time zone not null default now(),
    primary key (id)
);

-- Enable RLS
alter table public.ai_chat_messages enable row level security;

-- Policies
create policy "Users can view their own AI chat messages"
    on public.ai_chat_messages
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own AI chat messages"
    on public.ai_chat_messages
    for insert
    with check (auth.uid() = user_id);

-- Index
create index ai_chat_messages_trip_user_idx on public.ai_chat_messages(trip_id, user_id);


create policy "Users can delete their own AI chat messages"
    on public.ai_chat_messages
    for delete
    using (auth.uid() = user_id);

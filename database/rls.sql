alter table public.profiles enable row level security;
alter table public.policies enable row level security;
alter table public.articles enable row level security;
alter table public.policy_chats enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "policies_authenticated_read" on public.policies for select to authenticated using (true);

create policy "articles_own_select" on public.articles for select using (auth.uid() = user_id);
create policy "articles_own_insert" on public.articles for insert with check (auth.uid() = user_id);
create policy "articles_own_update" on public.articles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "articles_own_delete" on public.articles for delete using (auth.uid() = user_id);

create policy "chats_own_select" on public.policy_chats for select using (auth.uid() = user_id);
create policy "chats_own_insert" on public.policy_chats for insert with check (auth.uid() = user_id);
create policy "chats_own_delete" on public.policy_chats for delete using (auth.uid() = user_id);

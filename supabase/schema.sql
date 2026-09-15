-- Nerdy account data. All browser requests are authorized by the user's JWT and RLS.
create table public.learner_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint learner_state_shape check ((
    jsonb_typeof(state) = 'object'
    and state->>'version' = '1'
    and jsonb_typeof(state->'name') = 'string'
    and length(state->>'name') between 1 and 24
    and jsonb_typeof(state->'skills') = 'object'
    and jsonb_typeof(state->'attempts') = 'array'
    and jsonb_typeof(state->'sessions') = 'array'
    and jsonb_typeof(state->'days') = 'array'
    and octet_length(state::text) <= 5242880
  ) is true)
);
alter table public.learner_states enable row level security;
revoke all on public.learner_states from anon;
grant select, insert, update, delete on public.learner_states to authenticated;
create policy "Read own learning" on public.learner_states for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own learning" on public.learner_states for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own learning" on public.learner_states for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Clear own learning" on public.learner_states for delete to authenticated using ((select auth.uid()) = user_id);

-- Compare-and-swap prevents two devices from silently overwriting one another.
create function public.save_learner_state(p_state jsonb, p_revision bigint)
returns table(revision bigint, updated_at timestamptz)
language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in to save progress' using errcode = '42501'; end if;
  if p_revision < 0 then raise exception 'Invalid revision' using errcode = '22023'; end if;
  if p_revision = 0 then
    return query insert into public.learner_states as s(user_id, state, revision)
      values (uid, p_state, 1) on conflict (user_id) do nothing
      returning s.revision, s.updated_at;
  else
    return query update public.learner_states as s
      set state = p_state, revision = s.revision + 1, updated_at = now()
      where s.user_id = uid and s.revision = p_revision
      returning s.revision, s.updated_at;
  end if;
  if not found then raise exception 'Progress changed on another device' using errcode = '40001'; end if;
end;
$$;
revoke all on function public.save_learner_state(jsonb,bigint) from public, anon;
grant execute on function public.save_learner_state(jsonb,bigint) to authenticated;

-- Private learning-journal exports. The first folder must be the account's UID.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('learning-journals','learning-journals',false,5242880,array['application/json'])
on conflict(id) do nothing;
create policy "Read own journals" on storage.objects for select to authenticated
using(bucket_id = 'learning-journals' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Upload own journals" on storage.objects for insert to authenticated
with check(bucket_id = 'learning-journals' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Replace own journals" on storage.objects for update to authenticated
using(bucket_id = 'learning-journals' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check(bucket_id = 'learning-journals' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Remove own journals" on storage.objects for delete to authenticated
using(bucket_id = 'learning-journals' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Only usage counts are persisted. Chat text and generated reports are never stored.
create schema if not exists nerdy_private;
revoke all on schema nerdy_private from public, anon, authenticated;
create table nerdy_private.ai_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('chat','report','coach')),
 day date not null default current_date,
 used integer not null default 0,
 minute_start timestamptz not null default now(),
 minute_used integer not null default 0,
 primary key (user_id,kind)
);
alter table nerdy_private.ai_usage enable row level security;
revoke all on nerdy_private.ai_usage from public, anon, authenticated;
grant usage on schema nerdy_private to service_role;
grant select,insert,update on nerdy_private.ai_usage to service_role;
create policy "Backend usage only" on nerdy_private.ai_usage for all to service_role using (true) with check (true);
create function public.claim_nova_request(p_user_id uuid,p_kind text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare uid uuid := p_user_id; r nerdy_private.ai_usage%rowtype;
begin
 if uid is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if p_kind not in ('chat','report','coach') then raise exception 'Invalid request'; end if;
 insert into nerdy_private.ai_usage(user_id,kind) values(uid,p_kind) on conflict do nothing;
 select * into r from nerdy_private.ai_usage where user_id=uid and kind=p_kind for update;
 if r.day<>current_date then r.used:=0; end if;
 if now()-r.minute_start>=interval '1 minute' then r.minute_used:=0;r.minute_start:=now();end if;
 if r.used >= (case when p_kind='chat' then 100 when p_kind='coach' then 300 else 10 end)
 or r.minute_used >= (case when p_kind='chat' then 10 when p_kind='coach' then 30 else 2 end) then return false;end if;
 update nerdy_private.ai_usage set day=current_date,used=r.used+1,minute_start=r.minute_start,minute_used=r.minute_used+1 where user_id=uid and kind=p_kind;
 return true;
end; $$;
revoke all on function public.claim_nova_request(uuid,text) from public,anon,authenticated;
grant execute on function public.claim_nova_request(uuid,text) to service_role;

-- Edge Functions only: encrypted Vault value never goes to an authenticated browser.
create function public.nova_provider_key() returns text
language sql security definer set search_path='' as $$
 select decrypted_secret from vault.decrypted_secrets where name='nerdy_groq_api_key' limit 1;
$$;
revoke all on function public.nova_provider_key() from public,anon,authenticated;
grant execute on function public.nova_provider_key() to service_role;

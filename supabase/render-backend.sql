-- Allow the Render API to spend only the calling account's Nova quota.
-- Auth is verified by Supabase using the caller's JWT; the private usage table remains inaccessible.
create or replace function public.nova_claim_own_request(p_kind text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); r nerdy_private.ai_usage%rowtype;
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
revoke all on function public.nova_claim_own_request(text) from public,anon;
grant execute on function public.nova_claim_own_request(text) to authenticated;

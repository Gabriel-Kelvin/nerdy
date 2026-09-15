-- Transactional verification only: all test users and rows roll back.
begin;
select set_config('nerdy.test_a',gen_random_uuid()::text,true);
select set_config('nerdy.test_b',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,created_at,updated_at)
select current_setting(k)::uuid,'authenticated','authenticated',current_setting(k)||'@nerdy-test.invalid',now(),now()
from unnest(array['nerdy.test_a','nerdy.test_b']) k;
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('nerdy.test_a'),'role','authenticated')::text,true);
select * from public.save_learner_state('{"version":1,"name":"RLS Test","grade":1,"avatar":"🌱","days":[],"sessions":[],"attempts":[],"skills":{},"seeds":0,"sound":false,"untimed":false}'::jsonb,0);
do $$ begin
  if (select count(*) from public.learner_states) != 1 then raise exception 'Owner cannot read state'; end if;
  begin
    perform public.save_learner_state('{"version":1,"name":"RLS Test","days":[],"sessions":[],"attempts":[],"skills":{}}'::jsonb,0);
    raise exception 'Stale revision was accepted';
  exception when serialization_failure then null; end;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('nerdy.test_b'),'role','authenticated')::text,true);
do $$ declare affected integer; begin
  if (select count(*) from public.learner_states) != 0 then raise exception 'Cross-account read'; end if;
  update public.learner_states set state = state || '{"name":"Wrong owner"}'::jsonb where user_id = current_setting('nerdy.test_a')::uuid;
  get diagnostics affected = row_count;
  if affected != 0 then raise exception 'Cross-account write'; end if;
  begin
    insert into public.learner_states(user_id,state) values(current_setting('nerdy.test_a')::uuid,'{"version":1,"name":"Wrong owner","days":[],"sessions":[],"attempts":[],"skills":{}}');
    raise exception 'Cross-account insert accepted';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin
    perform * from public.learner_states;
    raise exception 'Anonymous table access';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_learner_state('{}'::jsonb,0);
    raise exception 'Anonymous function execution';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: own access, cross-account denial, anonymous denial, stale-write protection' as verification;
rollback;

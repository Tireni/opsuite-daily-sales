-- Run against the configured project. All test rows are rolled back.
begin;
do $$
declare
  baseline jsonb := public.daily_sales_dashboard();
  midnight timestamptz := ((current_timestamp at time zone 'Africa/Lagos')::date)::timestamp at time zone 'Africa/Lagos';
  result jsonb;
begin
  if has_table_privilege('anon', 'public.daily_sales', 'select')
    or has_table_privilege('anon', 'public.daily_sales', 'insert')
    or has_table_privilege('authenticated', 'public.daily_sales', 'insert')
    or has_function_privilege('anon', 'public.record_daily_sale(text,bigint,uuid)', 'execute')
    or has_function_privilege('anon', 'public.daily_sales_dashboard()', 'execute') then
    raise exception 'Public database access must be denied';
  end if;
  insert into public.daily_sales (request_id, item, amount_kobo, sold_at) values
    (gen_random_uuid(), 'Boundary test: yesterday', 100, midnight - interval '1 microsecond'),
    (gen_random_uuid(), 'Boundary test: today', 77, midnight),
    (gen_random_uuid(), 'Boundary test: tomorrow', 200, midnight + interval '1 day');
  result := public.daily_sales_dashboard();
  if (result->>'count')::bigint <> (baseline->>'count')::bigint + 1 then
    raise exception 'Day boundary count mismatch';
  end if;
  if (result->>'total_kobo')::bigint <> (baseline->>'total_kobo')::bigint + 77 then
    raise exception 'Day boundary total mismatch';
  end if;
  begin
    insert into public.daily_sales (request_id, item, amount_kobo) values (gen_random_uuid(), 'Invalid amount', 0);
    raise exception 'Zero amount was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.daily_sales (request_id, item, amount_kobo) values (gen_random_uuid(), ' ', 100);
    raise exception 'Empty name was accepted';
  exception when check_violation then null;
  end;
end;
$$;
rollback;
select 'PASS: Lagos boundaries, exact aggregate, database constraints and denied direct anonymous database access' as result;

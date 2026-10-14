-- Preserve and display past sales while calculating today's totals separately.
-- No records are deleted or changed by this migration.
begin;
create or replace function public.daily_sales_dashboard() returns jsonb
language sql stable security invoker set search_path = '' as $$
  with bounds as (
    select (statement_timestamp() at time zone 'Africa/Lagos')::date as day
  ), history as (
    select s.*, b.day::timestamp at time zone 'Africa/Lagos' as today_start
    from public.daily_sales s cross join bounds b
    where s.sold_at < (b.day + 1)::timestamp at time zone 'Africa/Lagos'
  )
  select jsonb_build_object(
    'day', (select day from bounds),
    'count', count(*),
    'today_count', count(*) filter (where sold_at >= today_start),
    'total_kobo', coalesce(sum(amount_kobo) filter (where sold_at >= today_start), 0),
    'sales', coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'item', item, 'amount_kobo', amount_kobo, 'sold_at', sold_at
    ) order by sold_at desc, id desc), '[]'::jsonb)
  ) from history;
$$;
revoke all on function public.daily_sales_dashboard() from public, anon, authenticated;
grant execute on function public.daily_sales_dashboard() to service_role;
commit;

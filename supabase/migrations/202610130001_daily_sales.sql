begin;

create table public.daily_sales (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  item text not null check (char_length(btrim(item)) between 1 and 120 and item = btrim(item) and item !~ '[[:cntrl:]]'),
  amount_kobo bigint not null check (amount_kobo between 1 and 9999999999),
  sold_at timestamptz not null default now()
);
create index daily_sales_sold_at_idx on public.daily_sales (sold_at desc, id desc);
alter table public.daily_sales enable row level security;
revoke all on public.daily_sales from anon, authenticated;
grant select, insert on public.daily_sales to service_role;

create function public.daily_sales_dashboard() returns jsonb
language sql stable security invoker set search_path = '' as $$
  with bounds as (
    select (statement_timestamp() at time zone 'Africa/Lagos')::date as day
  ), todays_sales as (
    select s.* from public.daily_sales s cross join bounds b
    where s.sold_at >= b.day::timestamp at time zone 'Africa/Lagos'
      and s.sold_at < (b.day + 1)::timestamp at time zone 'Africa/Lagos'
  )
  select jsonb_build_object(
    'day', (select day from bounds),
    'count', count(*),
    'total_kobo', coalesce(sum(amount_kobo), 0),
    'sales', coalesce(jsonb_agg(jsonb_build_object('id', id, 'item', item, 'amount_kobo', amount_kobo, 'sold_at', sold_at) order by sold_at desc, id desc), '[]'::jsonb)
  ) from todays_sales;
$$;

create function public.record_daily_sale(p_item text, p_amount_kobo bigint, p_request_id uuid) returns jsonb
language plpgsql volatile security invoker set search_path = '' as $$
declare result public.daily_sales;
begin
  insert into public.daily_sales (item, amount_kobo, request_id)
  values (p_item, p_amount_kobo, p_request_id)
  on conflict (request_id) do nothing
  returning * into result;
  if result.id is null then
    select * into result from public.daily_sales where request_id = p_request_id;
    if result.item <> p_item or result.amount_kobo <> p_amount_kobo then
      raise exception 'Submission ID already used for a different sale';
    end if;
  end if;
  return jsonb_build_object('id', result.id, 'item', result.item, 'amount_kobo', result.amount_kobo, 'sold_at', result.sold_at);
end;
$$;

revoke all on function public.daily_sales_dashboard() from public, anon, authenticated;
revoke all on function public.record_daily_sale(text, bigint, uuid) from public, anon, authenticated;
grant execute on function public.daily_sales_dashboard() to service_role;
grant execute on function public.record_daily_sale(text, bigint, uuid) to service_role;
commit;

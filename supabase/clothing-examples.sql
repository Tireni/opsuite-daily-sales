-- Explicit one-time reset requested by the owner for a clothing-brand demo.
-- WARNING: replaces all existing sales. Never run automatically or on app startup.
begin;
delete from public.daily_sales;
insert into public.daily_sales (request_id, item, amount_kobo, sold_at)
select gen_random_uuid(), item, amount_naira * 100,
  greatest(
    ((current_timestamp at time zone 'Africa/Lagos')::date)::timestamp at time zone 'Africa/Lagos',
    current_timestamp - (10 - position) * interval '12 minutes'
  )
from (values
  (1, 'Essential Cotton T-shirt - Black / M', 18000),
  (2, 'Oversized Graphic T-shirt - Cream / L', 22000),
  (3, 'Classic Pique Polo Shirt - Navy / M', 28000),
  (4, 'Oxford Button-down Shirt - White / L', 35000),
  (5, 'Straight-leg Denim Jeans - Indigo / W32', 45000),
  (6, 'Tailored Chino Trousers - Sand / W34', 38000),
  (7, 'Linen Shorts - Olive / M', 24000),
  (8, 'Cropped Sweatshirt - Grey / S', 32000),
  (9, 'Signature Zip-up Hoodie - Charcoal / L', 55000),
  (10, 'Ribbed Tank Top - Cocoa / S', 20000)
) as examples(position, item, amount_naira);
commit;
select count(*) as sales_count, sum(amount_kobo) as total_kobo from public.daily_sales;

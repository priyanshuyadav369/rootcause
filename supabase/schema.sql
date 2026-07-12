-- ============================================================
-- RootCause — Supabase schema
-- Run this in Supabase SQL Editor on a NEW project
-- (do not reuse a Micro/Minor project, per assignment rules)
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  notify_email boolean not null default true,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ---------- PLANTS ----------
create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text,
  location text check (location in ('balcony', 'terrace', 'indoor')) default 'balcony',
  date_added date not null default current_date,
  cover_image_url text,
  current_status text check (current_status in ('healthy', 'watch', 'urgent')) default 'healthy',
  created_at timestamptz not null default now()
);

alter table plants enable row level security;

create policy "Users manage their own plants"
  on plants for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------- SCANS ----------
create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_type text check (scan_type in ('leaf', 'root')) not null,
  image_url text,
  ai_diagnosis text,
  detected_issue text,
  severity text check (severity in ('low', 'medium', 'high')) default 'low',
  recommended_action text,
  created_at timestamptz not null default now()
);

alter table scans enable row level security;

create policy "Users manage their own scans"
  on scans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------- PRODUCTS (shop catalog) ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('fertilizer', 'pesticide', 'soil-amendment', 'tool')) not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  tags text[] default '{}',
  stock int not null default 100,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- catalog is readable by any signed-in user; writes are done from the
-- Supabase dashboard/SQL editor only (no client insert/update/delete policy)
create policy "Authenticated users can view products"
  on products for select
  using (auth.role() = 'authenticated');


-- ---------- CART ----------
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table cart_items enable row level security;

create policy "Users manage their own cart"
  on cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------- ORDERS ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_amount numeric(10,2) not null default 0,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Users manage their own orders"
  on orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null check (quantity > 0),
  price_at_purchase numeric(10,2) not null
);

alter table order_items enable row level security;

create policy "Users manage items on their own orders"
  on order_items for all
  using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  )
  with check (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );


-- ---------- WEEKLY REPORT LOG ----------
create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sent_at timestamptz not null default now(),
  summary_snapshot jsonb
);

alter table weekly_reports enable row level security;

create policy "Users view their own report log"
  on weekly_reports for select
  using (auth.uid() = user_id);

-- The manual "Send Now" button runs entirely client-side (see
-- src/lib/email.js) and logs its own send here directly, so it needs an
-- insert policy. The automatic weekly cron job (api/weekly-cron.js) uses
-- the service role key instead, which bypasses RLS entirely.
create policy "Users log their own report sends"
  on weekly_reports for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- STORAGE — bucket for scan photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('scan-images', 'scan-images', true)
on conflict (id) do nothing;

-- users can only upload into a folder named after their own user id,
-- e.g. scan-images/<user_id>/1699999999-leaf.jpg (the Scan page does this)
create policy "Users can upload their own scan images"
  on storage.objects for insert
  with check (bucket_id = 'scan-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can manage their own scan images"
  on storage.objects for all
  using (bucket_id = 'scan-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'scan-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- bucket is public, so reading via getPublicUrl() works for anyone with the link
-- (fine for this use case — scan photos aren't sensitive)


-- ============================================================
-- SEED DATA — sample shop products
-- ============================================================
insert into products (name, category, description, price, tags, stock) values
  ('Cocopeat Block (5kg, expands to ~75L)', 'soil-amendment', 'Coconut-husk growing medium — improves water retention and aeration for pots.', 149.00, '{"water-retention","root-rot","soil-mix"}', 200),
  ('Vermicompost, 2kg', 'fertilizer', 'Slow-release organic nutrition from earthworm composting. Good general-purpose feed.', 199.00, '{"nitrogen-deficiency","general-nutrition","slow-growth"}', 150),
  ('Neem Oil Concentrate, 100ml', 'pesticide', 'Cold-pressed neem oil concentrate for fungal spots and common leaf pests.', 229.00, '{"fungal","pest","leaf-spots","aphids"}', 120),
  ('Bone Meal Powder, 500g', 'fertilizer', 'Phosphorus-rich amendment for root development and flowering.', 179.00, '{"phosphorus-deficiency","root-development","flowering"}', 100),
  ('Epsom Salt (Magnesium Sulphate), 500g', 'fertilizer', 'Corrects magnesium deficiency — often shows as yellowing between leaf veins.', 99.00, '{"magnesium-deficiency","yellowing","leaf-veins"}', 180),
  ('Copper Fungicide Spray, 250ml', 'pesticide', 'Broad-spectrum fungicide for bacterial and fungal leaf disease.', 259.00, '{"fungal","bacterial","leaf-spots"}', 90),
  ('Perlite, 1L', 'soil-amendment', 'Improves drainage for pots prone to root rot from overwatering.', 129.00, '{"root-rot","drainage","overwatering"}', 130),
  ('Hand Pruning Shears', 'tool', 'For removing damaged leaves and stems cleanly to prevent spread of infection.', 349.00, '{"pruning","disease-control"}', 60)
on conflict do nothing;

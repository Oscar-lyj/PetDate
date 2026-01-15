-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, service_role;

-- 1. PROFILES (Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. COUPLES (Connection between two users)
create table public.couples (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) not null,
  partner_1_id uuid references public.profiles(id), -- Usually created_by
  partner_2_id uuid references public.profiles(id), -- The invited partner
  code text unique not null, -- Simple 6-char code for connecting
  anniversary_date date,
  created_at timestamptz default now()
);
alter table public.couples enable row level security;
-- Policy: Users can view their own couple data
create policy "Users can view own couple." on public.couples for select 
using (auth.uid() = partner_1_id or auth.uid() = partner_2_id);
-- Policy: Creator can insert
create policy "Users can create couple." on public.couples for insert 
with check (auth.uid() = created_by);
-- Policy: Update (e.g. partner joining)
create policy "Users can update couple." on public.couples for update 
using (true); -- Simplified for MVP, ideally restricted to partners or code match

-- 3. PET STATS
create table public.pet_stats (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references public.couples(id) not null,
  pet_id text not null, -- 'dog' or 'cat'
  name text default 'Mochi',
  hunger int default 60,
  affection int default 80,
  feed_count_today int default 0,
  play_count_today int default 0,
  last_interaction timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.pet_stats enable row level security;
create policy "Couples can view pet stats." on public.pet_stats for select 
using (exists (select 1 from public.couples c where c.id = pet_stats.couple_id and (c.partner_1_id = auth.uid() or c.partner_2_id = auth.uid())));
create policy "Couples can update pet stats." on public.pet_stats for update 
using (exists (select 1 from public.couples c where c.id = pet_stats.couple_id and (c.partner_1_id = auth.uid() or c.partner_2_id = auth.uid())));
create policy "Couples can insert pet stats." on public.pet_stats for insert
with check (exists (select 1 from public.couples c where c.id = pet_stats.couple_id and (c.partner_1_id = auth.uid() or c.partner_2_id = auth.uid())));

-- 4. CHAT MESSAGES
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references public.couples(id) not null,
  sender_id uuid references public.profiles(id) not null,
  text text not null,
  created_at timestamptz default now()
);
alter table public.chat_messages enable row level security;
create policy "Couples can view messages." on public.chat_messages for select 
using (exists (select 1 from public.couples c where c.id = chat_messages.couple_id and (c.partner_1_id = auth.uid() or c.partner_2_id = auth.uid())));
create policy "Couples can insert messages." on public.chat_messages for insert 
with check (exists (select 1 from public.couples c where c.id = chat_messages.couple_id and (c.partner_1_id = auth.uid() or c.partner_2_id = auth.uid())));

-- 5. GALLERY ITEMS
create table public.gallery_items (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references public.couples(id) not null,
  uploader_id uuid references public.profiles(id) not null,
  image_url text not null,
  caption text,
  taken_date timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.gallery_items enable row level security;
create policy "Couples can view gallery." on public.gallery_items for select 
using (exists (select 1 from public.couples c where c.id = gallery_items.couple_id and (c.partner_1_id = auth.uid() or c.partner_2_id = auth.uid())));
create policy "Couples can insert gallery." on public.gallery_items for insert 
with check (exists (select 1 from public.couples c where c.id = gallery_items.couple_id and (c.partner_1_id = auth.uid() or c.partner_2_id = auth.uid())));

-- FUNCTIONS
create or replace function handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Supabase schema for Harmonic Alignment user profiles

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  personal_url text,  -- personal website or social link
  bio text,  -- short bio/description
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Note: Profiles are unlisted by default - only accessible via shared link

-- User practices (tracks which practices user knows and their ratings)
create table public.user_practices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  practice_id text not null,  -- matches tradition id from traditions.json
  status text check (status in ('interested', 'learning', 'practicing', 'experienced')) default 'interested',
  rating integer check (rating between 1 and 5),  -- personal effectiveness rating 1-5
  notes text,
  favorite_resource text,  -- URL to favorite guided meditation, teacher, app, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, practice_id)
);

-- Practice logs (optional - for tracking sessions)
create table public.practice_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  practice_id text not null,
  duration_minutes integer,
  state_before text,  -- anxious, scattered, calm, etc.
  state_after text,
  notes text,
  practiced_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.user_practices enable row level security;
alter table public.practice_logs enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = id);

create policy "Users can view own practices" on public.user_practices
  for select using (auth.uid() = user_id);

create policy "Users can insert own practices" on public.user_practices
  for insert with check (auth.uid() = user_id);

create policy "Users can update own practices" on public.user_practices
  for update using (auth.uid() = user_id);

create policy "Users can delete own practices" on public.user_practices
  for delete using (auth.uid() = user_id);

create policy "Users can view own logs" on public.practice_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own logs" on public.practice_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own logs" on public.practice_logs
  for delete using (auth.uid() = user_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policies for shared profiles (anyone can view)
create policy "Anyone can view profiles" on public.profiles
  for select using (true);

create policy "Anyone can view practices by user id" on public.user_practices
  for select using (true);

-- Indexes for performance
create index idx_user_practices_user_id on public.user_practices(user_id);
create index idx_practice_logs_user_id on public.practice_logs(user_id);
create index idx_practice_logs_practiced_at on public.practice_logs(practiced_at);

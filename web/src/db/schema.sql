-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Create a table for recognition history
create table history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  artist text not null,
  album text,
  album_art_url text,
  spotify_id text,
  youtube_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for favorites
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  history_id uuid references history(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, history_id)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table history enable row level security;
alter table favorites enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

create policy "Users can view their own history." on history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own history." on history
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own history." on history
  for delete using (auth.uid() = user_id);

create policy "Users can view their own favorites." on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites." on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites." on favorites
  for delete using (auth.uid() = user_id);

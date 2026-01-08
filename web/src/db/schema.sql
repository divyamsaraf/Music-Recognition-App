-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc', now())
);

alter table profiles enable row level security;

drop policy if exists "Public profiles are viewable" on profiles;
create policy "Public profiles are viewable" on profiles
  for select using (true);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

alter table history
add column if not exists anonymous_id uuid;

alter table history
add column if not exists confidence float;

alter table history
alter column user_id drop not null;

-- Create a table for recognition history
create table if not exists history (
  id uuid default gen_random_uuid() primary key,
  -- Authenticated users
  user_id uuid references auth.users on delete cascade,
  -- Anonymous users (device/session based)
  anonymous_id uuid,
  title text not null,
  artist text not null,
  album text,
  album_art_url text,
  spotify_id text,
  youtube_id text,
  confidence float,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists history_user_id_idx on history(user_id);
create index if not exists history_anonymous_id_idx on history(anonymous_id);

alter table history enable row level security;

-- SELECT: user sees ONLY their own history
drop policy if exists "View own history only" on history;
create policy "View own history only" on history
  for select using (
    (auth.uid() = user_id) OR
    (
      auth.uid() is null AND
      anonymous_id = (current_setting('request.headers', true)::json ->> 'x-anonymous-id')::uuid
    )
  );

-- INSERT: logged-in or anonymous
drop policy if exists "Insert own history" on history;
create policy "Insert own history" on history
  for insert with check (
    (auth.uid() = user_id) OR
    (
      auth.uid() is null AND
      user_id is null AND
      anonymous_id = (current_setting('request.headers', true)::json ->> 'x-anonymous-id')::uuid
    )
  );

-- DELETE: only owner
drop policy if exists "Delete own history" on history;
create policy "Delete own history" on history
  for delete using (
    (auth.uid() = user_id) OR
    (
      auth.uid() is null AND
      anonymous_id = (current_setting('request.headers', true)::json ->> 'x-anonymous-id')::uuid
    )
  );

-- Create a table for favorites
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  history_id uuid references history(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  unique (user_id, history_id)
);



alter table favorites enable row level security;

drop policy if exists "View own favorites" on favorites;
create policy "View own favorites" on favorites
  for select using (auth.uid() = user_id);

drop policy if exists "Insert own favorites" on favorites;
create policy "Insert own favorites" on favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "Delete own favorites" on favorites;
create policy "Delete own favorites" on favorites
  for delete using (auth.uid() = user_id);

-- RSF: Merge Function
create or replace function merge_anonymous_history(anon_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update history
  set user_id = auth.uid(),
      anonymous_id = null
  where anonymous_id = anon_id
  and user_id is null;
end;
$$;

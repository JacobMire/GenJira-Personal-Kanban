-- GenJira Supabase Schema (Synchronized with Production)

-- 1. Create Tables
create table boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text default 'My Board',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Safety Constraint: Enforce one board per user
  CONSTRAINT unique_user_board UNIQUE (user_id),
  
  -- Settings: Store user preferences (JSON)
  settings jsonb default '{}'::jsonb
);

create table columns (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards on delete cascade not null,
  title text not null,
  position integer not null default 0,
  width integer default 320,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table tasks (
  id uuid default gen_random_uuid() primary key,
  column_id uuid references columns on delete cascade not null,
  title text not null,
  description text,
  priority text default 'Medium',
  tags text[] default '{}',
  story_points integer,
  acceptance_criteria text[] default '{}',
  position integer not null default 0,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Security (RLS)
alter table boards enable row level security;
alter table columns enable row level security;
alter table tasks enable row level security;

-- 3. Create Access Policies
-- Boards
create policy "Users can view their own boards" on boards for select using (auth.uid() = user_id);
create policy "Users can insert their own boards" on boards for insert with check (auth.uid() = user_id);
create policy "Users can update their own boards" on boards for update using (auth.uid() = user_id);
create policy "Users can delete their own boards" on boards for delete using (auth.uid() = user_id);

-- Columns
create policy "Users can interact with columns on their boards" on columns
  for all using (
    exists (select 1 from boards where boards.id = columns.board_id and boards.user_id = auth.uid())
  );

-- Tasks
create policy "Users can interact with tasks on their boards" on tasks
  for all using (
    exists (
      select 1 from columns
      join boards on boards.id = columns.board_id
      where columns.id = tasks.column_id and boards.user_id = auth.uid()
    )
  );
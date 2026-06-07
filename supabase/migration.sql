-- ============================================
-- dobby-elf Supabase  schema 补齐迁移
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. profiles 表添加应用所需字段
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists points integer not null default 0,
  add column if not exists level integer not null default 1,
  add column if not exists tree_growth integer not null default 0,
  add column if not exists parent_id uuid references public.profiles(id) on delete cascade,
  add column if not exists child_name text,
  add column if not exists pin_code text,
  add column if not exists is_active boolean not null default true;

-- 2. 待办任务表
create table if not exists public.daily_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  completed boolean not null default false,
  reward integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.daily_tasks enable row level security;
create policy if not exists "daytask_all" on public.daily_tasks for all using (auth.uid() = user_id);

-- 3. 作业表
create table if not exists public.homework (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  subject text,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.homework enable row level security;
create policy if not exists "homework_all" on public.homework for all using (auth.uid() = user_id);

-- 4. 成就表
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  date text not null,
  type text not null,
  icon_name text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.achievements enable row level security;
create policy if not exists "achievements_all" on public.achievements for all using (auth.uid() = user_id);

-- 5. 修订 profiles RLS 策略（允许家长读取自己孩子的资料）
drop policy if exists "用户可查看自己的资料" on public.profiles;
drop policy if exists "用户可更新自己的资料" on public.profiles;
create policy "profiles_select" on public.profiles for select using (
  auth.uid() = id or auth.uid() = parent_id
);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- 6. 确保 username 唯一（如果还没有）
create unique index if not exists profiles_username_unique on public.profiles(username) where username is not null;

-- ============================================
-- dobby-elf: 补齐 profiles 表字段 + 创建新表
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. 补齐 profiles 表缺失字段
alter table public.profiles 
  add column if not exists display_name text,
  add column if not exists points integer not null default 0,
  add column if not exists level integer not null default 1,
  add column if not exists tree_growth integer not null default 0,
  add column if not exists parent_id uuid references public.profiles(id) on delete cascade,
  add column if not exists child_name text,
  add column if not exists pin_code text,
  add column if not exists is_active boolean not null default true;

-- 2. 创建 daily_tasks 表（如果不存在）
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

-- 3. 创建 homework 表
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

-- 4. 创建 achievements 表
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  icon text,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.achievements enable row level security;
create policy if not exists "achievement_select" on public.achievements for select using (auth.uid() = user_id);

-- 5. 索引
create index if not exists idx_profiles_parent_id on public.profiles (parent_id);
create index if not exists idx_profiles_username on public.profiles (username);
create index if not exists idx_daily_tasks_user_id on public.daily_tasks (user_id);
create index if not exists idx_homework_user_id on public.homework (user_id);

-- 6. 更新 RLS 策略（允许家长查看孩子资料）
drop policy if exists "用户可查看自己的资料" on public.profiles;
create policy if not exists "用户可查看自己的资料" 
  on public.profiles for select 
  using (auth.uid() = id or auth.uid() = parent_id);

select '字段补齐完成！' as result;

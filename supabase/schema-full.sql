-- ============================================
-- dobby-elf v2.0 数据库 Schema (完整版)
-- 云端 PostgreSQL (Supabase)
-- 执行方式：在 Supabase Dashboard > SQL Editor 中运行此文件
-- ============================================

-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. 用户资料表（扩展 Supabase Auth）
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('parent', 'student', 'child', 'teacher')),
  grade integer check (grade between 1 and 9),  -- 年级（1-6 小学，7-9 初中）
  school text,
  -- 游戏化字段
  points integer not null default 0,
  level integer not null default 1,
  tree_growth integer not null default 0,
  -- 孩子账号字段
  parent_id uuid references public.profiles(id) on delete cascade,
  child_name text,
  pin_code text,  -- 4-6位PIN码（明文，孩子登录用）
  is_active boolean not null default true,
  -- 时间戳
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用行级安全
alter table public.profiles enable row level security;

-- RLS 策略：用户可查看自己的资料，家长可查看自己孩子的资料
create policy if not exists "用户可查看自己的资料" 
  on public.profiles for select 
  using (auth.uid() = id or auth.uid() = parent_id);

create policy if not exists "用户可更新自己的资料" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy if not exists "用户可插入自己的资料" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- ============================================
-- 2. 每日任务表
-- ============================================
create table if not exists public.daily_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  completed boolean not null default false,
  reward integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.daily_tasks enable row level security;

create policy if not exists "用户可管理自己的任务" 
  on public.daily_tasks for all 
  using (auth.uid() = user_id);

-- ============================================
-- 3. 对话表
-- ============================================
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default '新对话',
  model text not null default 'qwen3.6-flash',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;
create policy if not exists "用户可管理自己的对话" 
  on public.conversations for all 
  using (auth.uid() = user_id);

-- ============================================
-- 4. 消息表
-- ============================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  images text[],  -- 图片 URL 数组（存在 Supabase Storage）
  metadata jsonb,  -- 额外元数据（tokens 使用、工具调用等）
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;
create policy if not exists "用户可管理自己对话的消息" 
  on public.messages for all 
  using (auth.uid() = user_id);

create index if not exists idx_messages_conversation_id on public.messages (conversation_id);
create index if not exists idx_messages_user_id on public.messages (user_id);

-- ============================================
-- 5. 课程表
-- ============================================
create table if not exists public.courses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  teacher text,
  location text,
  day_of_week integer not null check (day_of_week between 1 and 7),  -- 1=周一, 7=周日
  start_time time not null,
  end_time time not null,
  color text default '#4ECDC4',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;
create policy if not exists "用户可管理自己的课程" 
  on public.courses for all 
  using (auth.uid() = user_id);

-- ============================================
-- 6. 知识图谱表
-- ============================================
create table if not exists public.knowledge_nodes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,  -- 学科：math, chinese, english, science
  topic text not null,     -- 知识点
  mastery integer not null default 0 check (mastery between 0 and 100),  -- 掌握度
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, subject, topic)
);

alter table public.knowledge_nodes enable row level security;
create policy if not exists "用户可管理自己的知识节点" 
  on public.knowledge_nodes for all 
  using (auth.uid() = user_id);

-- ============================================
-- 7. 练习题表
-- ============================================
create table if not exists public.exercises (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  conversation_id uuid references public.conversations on delete set null,
  subject text not null,
  question text not null,
  answer text,
  user_answer text,
  is_correct boolean,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exercises enable row level security;
create policy if not exists "用户可管理自己的练习题" 
  on public.exercises for all 
  using (auth.uid() = user_id);

-- ============================================
-- 8. 作业表
-- ============================================
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
create policy if not exists "用户可管理自己的作业" 
  on public.homework for all 
  using (auth.uid() = user_id);

-- ============================================
-- 9. 成就表
-- ============================================
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  icon text,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.achievements enable row level security;
create policy if not exists "用户可查看自己的成就" 
  on public.achievements for select 
  using (auth.uid() = user_id);

-- ============================================
-- 索引
-- ============================================
create index if not exists idx_profiles_parent_id on public.profiles (parent_id);
create index if not exists idx_profiles_username on public.profiles (username);
create index if not exists idx_conversations_user_id on public.conversations (user_id);
create index if not exists idx_courses_user_id on public.courses (user_id);
create index if not exists idx_knowledge_nodes_user_id on public.knowledge_nodes (user_id);
create index if not exists idx_homework_user_id on public.homework (user_id);
create index if not exists idx_achievements_user_id on public.achievements (user_id);
create index if not exists idx_daily_tasks_user_id on public.daily_tasks (user_id);

-- ============================================
-- 函数：自动更新 updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 为已有表添加 updated_at 触发器（如果还没有）
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'handle_profiles_updated_at'
  ) then
    create trigger handle_profiles_updated_at
      before update on public.profiles
      for each row execute function public.handle_updated_at();
  end if;
  
  if not exists (
    select 1 from pg_trigger where tgname = 'handle_conversations_updated_at'
  ) then
    create trigger handle_conversations_updated_at
      before update on public.conversations
      for each row execute function public.handle_updated_at();
  end if;
  
  if not exists (
    select 1 from pg_trigger where tgname = 'handle_knowledge_nodes_updated_at'
  ) then
    create trigger handle_knowledge_nodes_updated_at
      before update on public.knowledge_nodes
      for each row execute function public.handle_updated_at();
  end if;
end $$;

-- ============================================
-- 函数：新用户注册时自动创建 profile
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 创建触发器（如果还没有）
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end $$;

-- ============================================
-- 完成提示
-- ============================================
select 'Schema 创建完成！' as result;

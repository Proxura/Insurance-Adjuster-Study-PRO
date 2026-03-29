-- Cortex by Proxura — Initial Database Schema
-- Run via Supabase CLI: supabase db push

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'standard', 'premium')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- EXAM MODULES
-- ============================================================
create table public.exam_modules (
  id text primary key,
  name text not null,
  state text not null,
  category text not null,
  series_code text,
  version text not null default '1.0',
  question_count integer not null,
  time_limit_minutes integer not null,
  passing_score integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.exam_modules enable row level security;

create policy "Exam modules are viewable by everyone"
  on public.exam_modules for select
  using (true);

-- ============================================================
-- USER PROGRESS
-- ============================================================
create table public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exam_module_id text references public.exam_modules(id) on delete cascade not null,
  mastered_card_ids text[] not null default '{}',
  weak_card_ids text[] not null default '{}',
  performance_by_topic jsonb not null default '{}',
  total_study_ms bigint not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_study_date date,
  exam_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exam_module_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- ============================================================
-- QUIZ RESULTS
-- ============================================================
create table public.quiz_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exam_module_id text references public.exam_modules(id) on delete cascade not null,
  score integer not null,
  total integer not null,
  topic_id text,
  wrong_question_ids text[] not null default '{}',
  completed_at timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

create policy "Users can view own quiz results"
  on public.quiz_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz results"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('standard', 'premium')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  exam_module_ids text[] not null default '{}',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- ORGANIZATIONS (for institutional buyers)
-- ============================================================
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null default 'insurance_agency',
  admin_user_id uuid references public.profiles(id),
  seat_count integer not null default 25,
  stripe_customer_id text unique,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

create table public.org_members (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('admin', 'manager', 'member')),
  enrolled_exam_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

alter table public.org_members enable row level security;

create policy "Org members can view own membership"
  on public.org_members for select
  using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_user_progress_user on public.user_progress(user_id);
create index idx_user_progress_module on public.user_progress(exam_module_id);
create index idx_quiz_results_user on public.quiz_results(user_id);
create index idx_quiz_results_module on public.quiz_results(exam_module_id);
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_org_members_org on public.org_members(org_id);
create index idx_org_members_user on public.org_members(user_id);

-- ============================================================
-- SEED: Michigan Adjuster Exam Module
-- ============================================================
insert into public.exam_modules (id, name, state, category, series_code, question_count, time_limit_minutes, passing_score)
values (
  'michigan-adjuster-16-72',
  'Michigan Insurance Adjuster Exam',
  'MI',
  'insurance',
  'Series 16-72',
  150,
  150,
  70
);

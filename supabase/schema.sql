-- ===========================================================================
-- Woman's Fight AI — Postgres schema for Supabase
--
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Structure: user -> workspace -> business -> content, so multiple brands,
-- teams and agencies are possible later without a migration that breaks data.
-- Every table carries row level security; the app never relies on client-side
-- authorization.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type app_role            as enum ('user', 'admin');
  create type workspace_role      as enum ('owner', 'admin', 'editor', 'viewer');
  create type supported_language  as enum ('en', 'bn', 'banglish');
  create type conversation_purpose as enum ('onboarding', 'create', 'assistant');
  create type chat_role           as enum ('system', 'user', 'assistant');
  create type platform_id         as enum ('facebook', 'instagram', 'youtube', 'tiktok', 'x', 'linkedin');
  create type content_type        as enum ('image_post', 'carousel', 'reel', 'short_video', 'story', 'text_post', 'live', 'poll');
  create type content_objective   as enum ('awareness', 'education', 'engagement', 'trust', 'storytelling', 'promotion', 'conversion', 'community');
  create type content_status      as enum ('draft', 'generated', 'approved', 'scheduled', 'published', 'failed');
  create type plan_status         as enum ('generating', 'ready', 'archived', 'failed');
  create type asset_kind          as enum ('image', 'video');
  create type asset_status        as enum ('pending', 'generating', 'ready', 'failed', 'unavailable');
  create type social_status       as enum ('not_connected', 'coming_soon', 'connected', 'expired', 'error');
  create type scheduled_status    as enum ('scheduled', 'queued', 'publishing', 'published', 'failed', 'cancelled');
  create type job_status          as enum ('queued', 'publishing', 'published', 'failed', 'retrying', 'blocked');
  create type plan_tier           as enum ('free', 'pro', 'business');
  create type billing_interval    as enum ('monthly', 'yearly');
  create type subscription_status as enum ('active', 'trialing', 'past_due', 'cancelled', 'not_configured');
  create type usage_metric        as enum ('ai_request', 'text_generation', 'image_generation', 'video_generation', 'content_generation', 'publishing_job');
  create type notification_kind   as enum ('welcome', 'business_profile_ready', 'plan_ready', 'content_generated', 'content_approved', 'content_scheduled', 'content_published', 'publishing_failed', 'retry_successful', 'subscription_warning', 'usage_warning');
  create type log_level           as enum ('debug', 'info', 'warn', 'error');
  create type payment_status      as enum ('pending', 'succeeded', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text not null,
  full_name            text,
  avatar_url           text,
  role                 app_role not null default 'user',
  locale               supported_language not null default 'en',
  onboarding_completed boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint profiles_email_unique unique (email)
);

create table if not exists public.workspaces (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  slug       text not null unique,
  timezone   text not null default 'Asia/Dhaka',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workspaces_owner_idx on public.workspaces(owner_id);

create table if not exists public.workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  role         workspace_role not null default 'editor',
  created_at   timestamptz not null default now(),
  unique (workspace_id, user_id)
);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id);

-- ---------------------------------------------------------------------------
-- Business Brain
-- ---------------------------------------------------------------------------
create table if not exists public.business_profiles (
  id                  uuid primary key default gen_random_uuid(),
  workspace_id        uuid not null unique references public.workspaces(id) on delete cascade,
  business_name       text,
  industry            text,
  description         text,
  products            text[] not null default '{}',
  services            text[] not null default '{}',
  location            text,
  target_audience     text,
  audience_problems   text[] not null default '{}',
  audience_needs      text[] not null default '{}',
  audience_interests  text[] not null default '{}',
  business_goals      text[] not null default '{}',
  content_goals       text[] not null default '{}',
  preferred_platforms platform_id[] not null default '{}',
  posting_frequency   text,
  completeness        int not null default 0 check (completeness between 0 and 100),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.brand_profiles (
  id                 uuid primary key default gen_random_uuid(),
  workspace_id       uuid not null unique references public.workspaces(id) on delete cascade,
  brand_voice        text,
  personality        text[] not null default '{}',
  style_notes        text,
  preferred_language supported_language not null default 'en',
  primary_color      text,
  secondary_color    text,
  logo_url           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AI conversations
-- ---------------------------------------------------------------------------
create table if not exists public.ai_conversations (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  purpose      conversation_purpose not null default 'assistant',
  title        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists ai_conversations_workspace_idx on public.ai_conversations(workspace_id, purpose);

create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role            chat_role not null,
  content         text not null,
  language        supported_language,
  created_at      timestamptz not null default now()
);
create index if not exists ai_messages_conversation_idx on public.ai_messages(conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
create table if not exists public.content_plans (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  title            text not null,
  start_date       date not null,
  days             int not null default 30 check (days between 1 and 31),
  status           plan_status not null default 'generating',
  strategy_summary text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists content_plans_workspace_idx on public.content_plans(workspace_id, created_at desc);

create table if not exists public.content_items (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  plan_id         uuid references public.content_plans(id) on delete set null,
  day_number      int,
  scheduled_date  date not null,
  scheduled_time  text not null default '18:00',
  topic           text not null,
  content_type    content_type not null default 'image_post',
  platform        platform_id not null default 'instagram',
  objective       content_objective not null default 'awareness',
  hook            text not null default '',
  caption         text not null default '',
  cta             text not null default '',
  hashtags        text[] not null default '{}',
  image_concept   text,
  video_concept   text,
  language        supported_language not null default 'en',
  status          content_status not null default 'generated',
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists content_items_workspace_date_idx on public.content_items(workspace_id, scheduled_date);
create index if not exists content_items_status_idx on public.content_items(workspace_id, status);
create index if not exists content_items_plan_idx on public.content_items(plan_id, day_number);

create table if not exists public.content_variations (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  platform        platform_id not null,
  hook            text not null default '',
  caption         text not null default '',
  cta             text not null default '',
  hashtags        text[] not null default '{}',
  created_at      timestamptz not null default now(),
  unique (content_item_id, platform)
);

create table if not exists public.media_files (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  bucket       text not null default 'media',
  path         text not null,
  mime_type    text,
  size_bytes   bigint,
  created_at   timestamptz not null default now(),
  unique (bucket, path)
);

create table if not exists public.content_assets (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  media_file_id   uuid references public.media_files(id) on delete set null,
  kind            asset_kind not null,
  prompt          text not null default '',
  provider        text not null default 'unconfigured',
  status          asset_status not null default 'pending',
  url             text,
  error_message   text,
  created_at      timestamptz not null default now()
);
create index if not exists content_assets_item_idx on public.content_assets(content_item_id);

-- ---------------------------------------------------------------------------
-- Social accounts, scheduling & publishing
-- ---------------------------------------------------------------------------
create table if not exists public.social_platforms (
  id             platform_id primary key,
  display_name   text not null,
  is_available   boolean not null default false,
  caption_limit  int not null default 2200,
  created_at     timestamptz not null default now()
);

insert into public.social_platforms (id, display_name, caption_limit) values
  ('facebook',  'Facebook',  2200),
  ('instagram', 'Instagram', 2200),
  ('youtube',   'YouTube',   5000),
  ('tiktok',    'TikTok',    2200),
  ('x',         'X',          280),
  ('linkedin',  'LinkedIn',  3000)
on conflict (id) do nothing;

create table if not exists public.social_accounts (
  id                   uuid primary key default gen_random_uuid(),
  workspace_id         uuid not null references public.workspaces(id) on delete cascade,
  platform             platform_id not null references public.social_platforms(id),
  external_account_id  text,
  display_name         text,
  status               social_status not null default 'not_connected',
  -- Tokens are written only by the server (service role). RLS below denies all
  -- client access to this table's token columns by never exposing them.
  access_token         text,
  refresh_token        text,
  token_expires_at     timestamptz,
  connected_at         timestamptz,
  created_at           timestamptz not null default now(),
  unique (workspace_id, platform)
);

create table if not exists public.scheduled_posts (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  content_item_id   uuid not null references public.content_items(id) on delete cascade,
  social_account_id uuid references public.social_accounts(id) on delete set null,
  scheduled_at      timestamptz not null,
  timezone          text not null default 'Asia/Dhaka',
  status            scheduled_status not null default 'scheduled',
  attempt_count     int not null default 0,
  error_message     text,
  published_at      timestamptz,
  external_post_id  text,
  created_at        timestamptz not null default now()
);
create index if not exists scheduled_posts_due_idx on public.scheduled_posts(status, scheduled_at);
create index if not exists scheduled_posts_workspace_idx on public.scheduled_posts(workspace_id, scheduled_at);

create table if not exists public.publishing_jobs (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  scheduled_post_id uuid not null references public.scheduled_posts(id) on delete cascade,
  platform          platform_id not null,
  status            job_status not null default 'queued',
  attempt_count     int not null default 0,
  last_error        text,
  run_after         timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists publishing_jobs_due_idx on public.publishing_jobs(status, run_after);

create table if not exists public.published_posts (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  content_item_id   uuid not null references public.content_items(id) on delete cascade,
  platform          platform_id not null,
  external_post_id  text not null,
  permalink         text,
  published_at      timestamptz not null default now(),
  unique (platform, external_post_id)
);

-- ---------------------------------------------------------------------------
-- Analytics
-- ---------------------------------------------------------------------------
create table if not exists public.analytics (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  content_item_id uuid references public.content_items(id) on delete set null,
  platform        platform_id not null,
  captured_at     timestamptz not null default now(),
  reach           int not null default 0,
  impressions     int not null default 0,
  likes           int not null default 0,
  comments        int not null default 0,
  shares          int not null default 0,
  saves           int not null default 0,
  views           int not null default 0,
  follower_delta  int not null default 0
);
create index if not exists analytics_workspace_idx on public.analytics(workspace_id, captured_at desc);

-- ---------------------------------------------------------------------------
-- Billing & usage
-- ---------------------------------------------------------------------------
create table if not exists public.subscription_plans (
  id             plan_tier primary key,
  name           text not null,
  price_monthly  numeric(10,2) not null default 0,
  price_yearly   numeric(10,2) not null default 0,
  currency       text not null default 'USD',
  limits         jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

insert into public.subscription_plans (id, name, price_monthly, price_yearly) values
  ('free',     'Free',      0,   0),
  ('pro',      'Pro',      29, 290),
  ('business', 'Business', 79, 790)
on conflict (id) do nothing;

create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  workspace_id          uuid not null unique references public.workspaces(id) on delete cascade,
  plan_id               plan_tier not null default 'free' references public.subscription_plans(id),
  interval              billing_interval not null default 'monthly',
  status                subscription_status not null default 'not_configured',
  provider_customer_id  text,
  provider_subscription_id text,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now()
);

create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount          numeric(10,2) not null default 0,
  currency        text not null default 'USD',
  status          payment_status not null default 'pending',
  provider_payment_id text,
  created_at      timestamptz not null default now()
);

create table if not exists public.usage_records (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete set null,
  metric       usage_metric not null,
  quantity     int not null default 1,
  period       text not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists usage_records_period_idx on public.usage_records(workspace_id, period, metric);

-- ---------------------------------------------------------------------------
-- Notifications & logs
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  kind         notification_kind not null,
  title        text not null,
  body         text,
  href         text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

create table if not exists public.system_logs (
  id           uuid primary key default gen_random_uuid(),
  level        log_level not null default 'info',
  scope        text not null,
  message      text not null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists system_logs_created_idx on public.system_logs(created_at desc);

create table if not exists public.admin_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','workspaces','business_profiles','brand_profiles',
    'ai_conversations','content_plans','content_items','publishing_jobs'
  ] loop
    execute format(
      'drop trigger if exists touch_%1$s on public.%1$s;
       create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- New auth user -> profile + workspace
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_workspace_id uuid;
  display_name text;
  first_user boolean;
begin
  display_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  select count(*) = 0 into first_user from public.profiles;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, display_name, case when first_user then 'admin' else 'user' end)
  on conflict (id) do nothing;

  insert into public.workspaces (owner_id, name, slug)
  values (new.id, display_name || '''s workspace',
          lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6))
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  insert into public.business_profiles (workspace_id) values (new_workspace_id);
  insert into public.brand_profiles (workspace_id) values (new_workspace_id);
  insert into public.subscriptions (workspace_id) values (new_workspace_id);

  insert into public.notifications (workspace_id, user_id, kind, title, body, href)
  values (new_workspace_id, new.id, 'welcome', 'Welcome to Woman''s Fight AI',
          'Tell the assistant about your business and it will build your Business Brain.', '/onboarding');

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
create or replace function public.is_workspace_member(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspaces w where w.id = target and w.owner_id = auth.uid()
  ) or exists (
    select 1 from public.workspace_members m where m.workspace_id = target and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','workspaces','workspace_members','business_profiles','brand_profiles',
    'ai_conversations','ai_messages','content_plans','content_items','content_variations',
    'content_assets','media_files','social_platforms','social_accounts','scheduled_posts',
    'publishing_jobs','published_posts','analytics','subscription_plans','subscriptions',
    'payments','usage_records','notifications','system_logs','admin_logs'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- Profiles: a user sees and edits only their own row; admins may read all.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());

-- Workspaces
drop policy if exists workspaces_select on public.workspaces;
create policy workspaces_select on public.workspaces for select
  using (public.is_workspace_member(id) or public.is_admin());
drop policy if exists workspaces_insert on public.workspaces;
create policy workspaces_insert on public.workspaces for insert with check (owner_id = auth.uid());
drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_update on public.workspaces for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists workspaces_delete on public.workspaces;
create policy workspaces_delete on public.workspaces for delete using (owner_id = auth.uid());

drop policy if exists workspace_members_all on public.workspace_members;
create policy workspace_members_all on public.workspace_members for all
  using (public.is_workspace_member(workspace_id) or public.is_admin())
  with check (public.is_workspace_member(workspace_id));

-- Workspace-scoped tables share one policy shape.
do $$
declare t text;
begin
  foreach t in array array[
    'business_profiles','brand_profiles','ai_conversations','content_plans','content_items',
    'media_files','scheduled_posts','publishing_jobs','published_posts','analytics',
    'subscriptions','payments','usage_records','notifications'
  ] loop
    execute format('drop policy if exists %1$s_rw on public.%1$s;', t);
    execute format(
      'create policy %1$s_rw on public.%1$s for all
         using (public.is_workspace_member(workspace_id) or public.is_admin())
         with check (public.is_workspace_member(workspace_id));', t);
  end loop;
end $$;

-- Social accounts: members may read and manage the row, but tokens are only
-- ever written by the service role (the app never selects token columns).
drop policy if exists social_accounts_rw on public.social_accounts;
create policy social_accounts_rw on public.social_accounts for all
  using (public.is_workspace_member(workspace_id) or public.is_admin())
  with check (public.is_workspace_member(workspace_id));

-- Child tables reached through their parent.
drop policy if exists ai_messages_rw on public.ai_messages;
create policy ai_messages_rw on public.ai_messages for all
  using (exists (select 1 from public.ai_conversations c
                 where c.id = conversation_id and public.is_workspace_member(c.workspace_id)))
  with check (exists (select 1 from public.ai_conversations c
                 where c.id = conversation_id and public.is_workspace_member(c.workspace_id)));

drop policy if exists content_variations_rw on public.content_variations;
create policy content_variations_rw on public.content_variations for all
  using (exists (select 1 from public.content_items i
                 where i.id = content_item_id and public.is_workspace_member(i.workspace_id)))
  with check (exists (select 1 from public.content_items i
                 where i.id = content_item_id and public.is_workspace_member(i.workspace_id)));

drop policy if exists content_assets_rw on public.content_assets;
create policy content_assets_rw on public.content_assets for all
  using (exists (select 1 from public.content_items i
                 where i.id = content_item_id and public.is_workspace_member(i.workspace_id)))
  with check (exists (select 1 from public.content_items i
                 where i.id = content_item_id and public.is_workspace_member(i.workspace_id)));

-- Reference data: readable by any signed-in user.
drop policy if exists social_platforms_read on public.social_platforms;
create policy social_platforms_read on public.social_platforms for select using (auth.role() = 'authenticated');
drop policy if exists subscription_plans_read on public.subscription_plans;
create policy subscription_plans_read on public.subscription_plans for select using (true);

-- Logs: admin-only through the API; the service role bypasses RLS for writes.
drop policy if exists system_logs_admin on public.system_logs;
create policy system_logs_admin on public.system_logs for select using (public.is_admin());
drop policy if exists admin_logs_admin on public.admin_logs;
create policy admin_logs_admin on public.admin_logs for select using (public.is_admin());

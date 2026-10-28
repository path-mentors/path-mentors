-- =============================================================================
-- PathMentors — Complete & Secure Production Schema Migration
-- Source: PathMentors SRS v3.0
-- =============================================================================

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------
create type public.user_role          as enum ('student', 'mentor', 'moderator');
create type public.user_status        as enum ('active', 'suspended');
create type public.student_status     as enum ('undergraduate', 'postgraduate', 'recent_graduate', 'other');
create type public.challenge_type     as enum (
  'career_uncertainty', 'financial_pressure', 'fear_of_rejection',
  'feeling_behind_peers', 'no_mentors_or_network', 'isolation',
  'academic_stress', 'other'
);
create type public.topic_category     as enum ('wellbeing', 'career');
create type public.mentor_status      as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.circle_status      as enum ('draft', 'proposed', 'scheduled', 'completed', 'cancelled');
create type public.registration_status as enum ('registered', 'cancelled', 'attended', 'no_show');
create type public.report_reason      as enum (
  'inappropriate_content', 'harassment', 'unsafe_advice', 'impersonation',
  'privacy_concern', 'crisis_concern', 'other'
);
create type public.report_severity    as enum ('low', 'medium', 'high', 'crisis');
create type public.report_status      as enum ('open', 'in_review', 'resolved', 'dismissed');


-- -----------------------------------------------------------------------------
-- 2. TABLES
-- -----------------------------------------------------------------------------

create table public.users (
  id                      uuid primary key references auth.users (id) on delete cascade,
  email                   text,
  role                    public.user_role    not null default 'student',
  status                  public.user_status  not null default 'active',
  display_name            text                not null,
  current_status          public.student_status,
  main_challenge          public.challenge_type,
  disclaimer_accepted_at  timestamptz,
  guidelines_accepted_at  timestamptz,
  onboarding_completed_at timestamptz,
  created_at              timestamptz         not null default now(),
  updated_at              timestamptz         not null default now(),
  constraint users_display_name_length check (char_length(btrim(display_name)) between 2 and 40),
  constraint users_display_name_no_email check (position('@' in display_name) = 0)
);

create table public.topics (
  id          uuid primary key default gen_random_uuid(),
  slug        text                  not null unique,
  name        text                  not null,
  description text,
  category    public.topic_category not null,
  is_active   boolean               not null default true,
  sort_order  integer               not null default 0,
  created_at  timestamptz           not null default now(),
  constraint topics_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table public.user_interests (
  user_id    uuid not null references public.users (id)  on delete cascade,
  topic_id   uuid not null references public.topics (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table public.mentors (
  id                            uuid primary key default gen_random_uuid(),
  user_id                       uuid not null unique references public.users (id) on delete cascade,
  field                         text not null,
  current_position              text not null,
  languages                     text[] not null default array['English'],
  bio                           text not null,
  availability                  text,
  lived_experience              text,
  motivation                    text,
  status                        public.mentor_status not null default 'pending',
  rejection_reason              text,
  reviewed_by                   uuid references public.users (id) on delete set null,
  reviewed_at                   timestamptz,
  training_completed_at         timestamptz,
  code_of_conduct_accepted_at   timestamptz,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  constraint mentors_languages_not_empty check (cardinality(languages) >= 1),
  constraint mentors_bio_length         check (char_length(btrim(bio)) between 20 and 1500),
  constraint mentors_field_length       check (char_length(btrim(field)) between 2 and 100),
  constraint mentors_position_length    check (char_length(btrim(current_position)) between 2 and 120)
);

create table public.circles (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text not null,
  topic_id            uuid not null references public.topics (id) on delete restrict,
  starts_at           timestamptz not null,
  ends_at             timestamptz not null,
  capacity            integer not null default 20,
  mentor_id           uuid references public.mentors (id) on delete set null,
  status              public.circle_status not null default 'draft',
  cancellation_reason text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint circles_capacity_range  check (capacity between 1 and 500),
  constraint circles_time_order      check (ends_at > starts_at),
  constraint circles_title_length    check (char_length(btrim(title)) between 3 and 120),
  constraint circles_description_length check (char_length(btrim(description)) between 10 and 3000)
);

create table public.circle_meeting_links (
  circle_id    uuid primary key references public.circles (id) on delete cascade,
  meeting_link text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint meeting_link_https check (meeting_link ~* '^https://[^[:space:]]+$')
);

create table public.registrations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id)   on delete cascade,
  circle_id    uuid not null references public.circles (id) on delete restrict,
  status       public.registration_status not null default 'registered',
  cancelled_at timestamptz,
  attended_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint registrations_unique_per_circle unique (user_id, circle_id)
);

create table public.feedback (
  id                       uuid primary key default gen_random_uuid(),
  registration_id          uuid not null unique references public.registrations (id) on delete cascade,
  feeling_before           smallint not null,
  feeling_after            smallint not null,
  connection_rating        smallint not null,
  confidence_change        smallint not null,
  next_step                text not null,
  next_step_completed      boolean not null default false,
  next_step_completed_at   timestamptz,
  comment                  text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint feedback_feeling_before_range   check (feeling_before   between 1 and 5),
  constraint feedback_feeling_after_range    check (feeling_after    between 1 and 5),
  constraint feedback_connection_range       check (connection_rating between 1 and 5),
  constraint feedback_confidence_range       check (confidence_change between -2 and 2),
  constraint feedback_next_step_length       check (char_length(btrim(next_step)) between 3 and 280),
  constraint feedback_comment_length         check (comment is null or char_length(comment) <= 1000)
);

create table public.reports (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.users (id)   on delete set null,
  circle_id          uuid references public.circles (id) on delete set null,
  reported_user_id   uuid references public.users (id)   on delete set null,
  reason             public.report_reason   not null,
  details            text,
  severity           public.report_severity not null default 'medium',
  status             public.report_status   not null default 'open',
  assigned_to        uuid references public.users (id) on delete set null,
  first_response_at  timestamptz,
  resolved_at        timestamptz,
  resolved_by        uuid references public.users (id) on delete set null,
  resolution_notes   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint reports_details_length check (details is null or (char_length(btrim(details)) between 1 and 2000))
);

create table public.referral_resources (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  description   text,
  resource_link text,
  phone         text,
  country_code  text,
  is_emergency  boolean not null default false,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint referral_link_https  check (resource_link is null or resource_link ~* '^https?://[^[:space:]]+$')
);

create table public.referrals (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references public.reports (id) on delete cascade,
  resource_id   uuid references public.referral_resources (id) on delete set null,
  resource_name text not null,
  resource_link text,
  notes         text,
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- 3. INDEXES
-- -----------------------------------------------------------------------------
create index user_interests_topic_idx      on public.user_interests (topic_id);
create index mentors_user_idx              on public.mentors (user_id);
create index feedback_registration_idx      on public.feedback (registration_id);
create index mentors_status_idx            on public.mentors (status);
create index circles_upcoming_idx          on public.circles (starts_at) where status = 'scheduled';
create index circles_topic_idx             on public.circles (topic_id);
create index circles_mentor_idx            on public.circles (mentor_id);
create index circles_status_idx            on public.circles (status);
create index registrations_circle_idx      on public.registrations (circle_id) where status <> 'cancelled';
create index registrations_user_idx        on public.registrations (user_id);
create index reports_queue_idx             on public.reports (status, severity, created_at);


-- -----------------------------------------------------------------------------
-- 4. HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
create function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = ''
as $$ select u.role from public.users u where u.id = (select auth.uid()) $$;

create function public.is_moderator()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select u.role = 'moderator' and u.status = 'active'
       from public.users u where u.id = (select auth.uid())),
    false)
$$;

create function public.is_active_user()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select u.status = 'active' from public.users u where u.id = (select auth.uid())),
    false)
$$;

create function public.is_circle_mentor(p_circle_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
      from public.circles c
      join public.mentors m on m.id = c.mentor_id
     where c.id = p_circle_id
       and m.user_id = (select auth.uid())
       and m.status = 'approved')
$$;

create function public.is_registered_for(p_circle_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.registrations r
     where r.circle_id = p_circle_id
       and r.user_id = (select auth.uid())
       and r.status in ('registered', 'attended'))
$$;


-- -----------------------------------------------------------------------------
-- 5. CONCURRENCY-SAFE REGISTRATION STORED PROCEDURE
-- -----------------------------------------------------------------------------
create function public.register_for_circle(p_circle_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_capacity int;
  v_current_count int;
  v_circle_status public.circle_status;
  v_mentor_user_id uuid;
  v_user_role public.user_role;
  v_user_status public.user_status;
begin
  if v_user_id is null then
    raise exception 'Unauthorized' using errcode = 'PM401';
  end if;

  select role, status into v_user_role, v_user_status
  from public.users where id = v_user_id;

  if v_user_status != 'active' or v_user_role != 'student' then
    raise exception 'NOT_ELIGIBLE' using errcode = 'PM403';
  end if;

  -- Lock circle row for concurrent updates
  select c.capacity, c.status, m.user_id 
  into v_capacity, v_circle_status, v_mentor_user_id
  from public.circles c
  left join public.mentors m on c.mentor_id = m.id
  where c.id = p_circle_id
  for update;

  if not found then
    raise exception 'CIRCLE_NOT_FOUND' using errcode = 'PM404';
  end if;

  if v_circle_status != 'scheduled' then
    raise exception 'CIRCLE_NOT_OPEN' using errcode = 'PM409';
  end if;

  if v_mentor_user_id = v_user_id then
    raise exception 'MENTOR_CANNOT_REGISTER' using errcode = 'PM409';
  end if;

  select count(*) into v_current_count
  from public.registrations
  where circle_id = p_circle_id and status in ('registered', 'attended');

  if v_current_count >= v_capacity then
    raise exception 'CIRCLE_FULL' using errcode = 'PM409';
  end if;

  insert into public.registrations (user_id, circle_id, status)
  values (v_user_id, p_circle_id, 'registered')
  on conflict (user_id, circle_id) 
  do update set status = 'registered', cancelled_at = null, updated_at = now()
  where registrations.status = 'cancelled';

  return json_build_object('success', true, 'message', 'Successfully registered.');
end;
$$;


-- -----------------------------------------------------------------------------
-- 6. TRIGGERS
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end $$;

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger mentors_set_updated_at before update on public.mentors for each row execute function public.set_updated_at();
create trigger circles_set_updated_at before update on public.circles for each row execute function public.set_updated_at();
create trigger circle_meeting_links_set_updated_at before update on public.circle_meeting_links for each row execute function public.set_updated_at();
create trigger registrations_set_updated_at before update on public.registrations for each row execute function public.set_updated_at();
create trigger feedback_set_updated_at before update on public.feedback for each row execute function public.set_updated_at();
create trigger reports_set_updated_at before update on public.reports for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'display_name', 'Student' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.topics enable row level security;
alter table public.user_interests enable row level security;
alter table public.mentors enable row level security;
alter table public.circles enable row level security;
alter table public.circle_meeting_links enable row level security;
alter table public.registrations enable row level security;
alter table public.feedback enable row level security;
alter table public.reports enable row level security;
alter table public.referral_resources enable row level security;
alter table public.referrals enable row level security;

-- Topics & Resources (Public Read)
create policy "Anyone can view active topics" on public.topics for select using (is_active = true);
create policy "Anyone can view active referral resources" on public.referral_resources for select using (is_active = true);

-- Mentors (Public Read Approved)
create policy "Public view approved mentors" on public.mentors for select using (status = 'approved');
create policy "Users manage own mentor application" on public.mentors for all using (user_id = auth.uid());

-- Circles (Public Scheduled Read)
create policy "Public view scheduled circles" on public.circles for select using (status = 'scheduled');

-- Meeting Links (Restricted)
create policy "Meeting links viewable by registered or mentors" on public.circle_meeting_links for select using (
  public.is_moderator() or
  public.is_circle_mentor(circle_id) or
  public.is_registered_for(circle_id)
);

-- Registrations
create policy "Users view own registrations" on public.registrations for select using (user_id = auth.uid() or public.is_moderator());
create policy "Students delete/cancel own registration" on public.registrations for update using (user_id = auth.uid());

-- Feedback
create policy "Users view own feedback" on public.feedback for select using (
  exists (select 1 from public.registrations r where r.id = registration_id and r.user_id = auth.uid()) or
  public.is_moderator()
);
create policy "Students insert feedback" on public.feedback for insert with check (
  exists (select 1 from public.registrations r where r.id = registration_id and r.user_id = auth.uid() and r.status = 'attended')
);

-- Reports & Referrals
create policy "Users view own reports" on public.reports for select using (user_id = auth.uid() or public.is_moderator());
create policy "Users create reports" on public.reports for insert with check (user_id = auth.uid());
create policy "Moderators manage referrals" on public.referrals for all using (public.is_moderator());
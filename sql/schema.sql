create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.site_settings (
  id integer primary key,
  name text not null,
  short_name text not null,
  hero_label text not null,
  hero_title text not null,
  hero_description text not null,
  tagline text not null,
  email text not null,
  phone text not null,
  whatsapp text not null,
  address text not null,
  founded text not null,
  mission text not null,
  vision text not null,
  focus text not null,
  about text not null,
  facebook text not null,
  instagram text not null,
  youtube text not null,
  tiktok text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  format text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_label text not null,
  location text not null,
  summary text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  quote text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null,
  url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  image text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.programs enable row level security;
alter table public.team enable row level security;
alter table public.events enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.partners enable row level security;
alter table public.gallery enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

-- public read policies
drop policy if exists "public can read site settings" on public.site_settings;
create policy "public can read site settings"
on public.site_settings
for select
using (true);

drop policy if exists "public can read services" on public.services;
create policy "public can read services"
on public.services
for select
using (true);

drop policy if exists "public can read programs" on public.programs;
create policy "public can read programs"
on public.programs
for select
using (true);

drop policy if exists "public can read team" on public.team;
create policy "public can read team"
on public.team
for select
using (true);

drop policy if exists "public can read events" on public.events;
create policy "public can read events"
on public.events
for select
using (true);

drop policy if exists "public can read testimonials" on public.testimonials;
create policy "public can read testimonials"
on public.testimonials
for select
using (true);

drop policy if exists "public can read faqs" on public.faqs;
create policy "public can read faqs"
on public.faqs
for select
using (true);

drop policy if exists "public can read partners" on public.partners;
create policy "public can read partners"
on public.partners
for select
using (true);

drop policy if exists "public can read gallery" on public.gallery;
create policy "public can read gallery"
on public.gallery
for select
using (true);

-- admin write policies
drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings"
on public.site_settings
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage services" on public.services;
create policy "admins manage services"
on public.services
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage programs" on public.programs;
create policy "admins manage programs"
on public.programs
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage team" on public.team;
create policy "admins manage team"
on public.team
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage events" on public.events;
create policy "admins manage events"
on public.events
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage testimonials" on public.testimonials;
create policy "admins manage testimonials"
on public.testimonials
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage faqs" on public.faqs;
create policy "admins manage faqs"
on public.faqs
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage partners" on public.partners;
create policy "admins manage partners"
on public.partners
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage gallery" on public.gallery;
create policy "admins manage gallery"
on public.gallery
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- v2 additions: theme is client-side; these columns add Portuguese (PT)
-- translations, editable section headings, and image/link fields.
-- Safe to run on an existing database (idempotent).
-- ---------------------------------------------------------------------------

-- Editable section headings + optional Portuguese copy for site settings.
alter table public.site_settings add column if not exists hero_label_pt text not null default '';
alter table public.site_settings add column if not exists hero_title_pt text not null default '';
alter table public.site_settings add column if not exists hero_description_pt text not null default '';
alter table public.site_settings add column if not exists tagline_pt text not null default '';
alter table public.site_settings add column if not exists mission_pt text not null default '';
alter table public.site_settings add column if not exists vision_pt text not null default '';
alter table public.site_settings add column if not exists focus_pt text not null default '';
alter table public.site_settings add column if not exists about_pt text not null default '';
alter table public.site_settings add column if not exists about_eyebrow text not null default '';
alter table public.site_settings add column if not exists about_title text not null default '';
alter table public.site_settings add column if not exists about_description text not null default '';
alter table public.site_settings add column if not exists about_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists about_title_pt text not null default '';
alter table public.site_settings add column if not exists about_description_pt text not null default '';
alter table public.site_settings add column if not exists services_eyebrow text not null default '';
alter table public.site_settings add column if not exists services_title text not null default '';
alter table public.site_settings add column if not exists services_description text not null default '';
alter table public.site_settings add column if not exists services_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists services_title_pt text not null default '';
alter table public.site_settings add column if not exists services_description_pt text not null default '';
alter table public.site_settings add column if not exists testimonials_eyebrow text not null default '';
alter table public.site_settings add column if not exists testimonials_title text not null default '';
alter table public.site_settings add column if not exists testimonials_description text not null default '';
alter table public.site_settings add column if not exists testimonials_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists testimonials_title_pt text not null default '';
alter table public.site_settings add column if not exists testimonials_description_pt text not null default '';

-- Editable section headings for the remaining public sections.
alter table public.site_settings add column if not exists programs_eyebrow text not null default '';
alter table public.site_settings add column if not exists programs_title text not null default '';
alter table public.site_settings add column if not exists programs_description text not null default '';
alter table public.site_settings add column if not exists programs_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists programs_title_pt text not null default '';
alter table public.site_settings add column if not exists programs_description_pt text not null default '';
alter table public.site_settings add column if not exists team_eyebrow text not null default '';
alter table public.site_settings add column if not exists team_title text not null default '';
alter table public.site_settings add column if not exists team_description text not null default '';
alter table public.site_settings add column if not exists team_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists team_title_pt text not null default '';
alter table public.site_settings add column if not exists team_description_pt text not null default '';
alter table public.site_settings add column if not exists events_eyebrow text not null default '';
alter table public.site_settings add column if not exists events_title text not null default '';
alter table public.site_settings add column if not exists events_description text not null default '';
alter table public.site_settings add column if not exists events_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists events_title_pt text not null default '';
alter table public.site_settings add column if not exists events_description_pt text not null default '';
alter table public.site_settings add column if not exists gallery_eyebrow text not null default '';
alter table public.site_settings add column if not exists gallery_title text not null default '';
alter table public.site_settings add column if not exists gallery_description text not null default '';
alter table public.site_settings add column if not exists gallery_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists gallery_title_pt text not null default '';
alter table public.site_settings add column if not exists gallery_description_pt text not null default '';
alter table public.site_settings add column if not exists partners_eyebrow text not null default '';
alter table public.site_settings add column if not exists partners_title text not null default '';
alter table public.site_settings add column if not exists partners_description text not null default '';
alter table public.site_settings add column if not exists partners_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists partners_title_pt text not null default '';
alter table public.site_settings add column if not exists partners_description_pt text not null default '';
alter table public.site_settings add column if not exists faq_eyebrow text not null default '';
alter table public.site_settings add column if not exists faq_title text not null default '';
alter table public.site_settings add column if not exists faq_description text not null default '';
alter table public.site_settings add column if not exists faq_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists faq_title_pt text not null default '';
alter table public.site_settings add column if not exists faq_description_pt text not null default '';
alter table public.site_settings add column if not exists contact_eyebrow text not null default '';
alter table public.site_settings add column if not exists contact_title text not null default '';
alter table public.site_settings add column if not exists contact_description text not null default '';
alter table public.site_settings add column if not exists contact_eyebrow_pt text not null default '';
alter table public.site_settings add column if not exists contact_title_pt text not null default '';
alter table public.site_settings add column if not exists contact_description_pt text not null default '';

-- Portuguese translations for each content collection.
alter table public.services add column if not exists title_pt text not null default '';
alter table public.services add column if not exists description_pt text not null default '';

-- Per-card icon for "What we do" services. Falls back to a cycling default
-- set in the app when empty, so existing rows keep working unchanged.
alter table public.services add column if not exists icon text not null default '';

alter table public.programs add column if not exists title_pt text not null default '';
alter table public.programs add column if not exists format_pt text not null default '';
alter table public.programs add column if not exists description_pt text not null default '';

alter table public.team add column if not exists image text not null default '';
alter table public.team add column if not exists name_pt text not null default '';
alter table public.team add column if not exists role_pt text not null default '';
alter table public.team add column if not exists bio_pt text not null default '';

alter table public.events add column if not exists image text not null default '';
alter table public.events add column if not exists link text not null default '';
alter table public.events add column if not exists title_pt text not null default '';
alter table public.events add column if not exists date_label_pt text not null default '';
alter table public.events add column if not exists location_pt text not null default '';
alter table public.events add column if not exists summary_pt text not null default '';

alter table public.testimonials add column if not exists name_pt text not null default '';
alter table public.testimonials add column if not exists role_pt text not null default '';
alter table public.testimonials add column if not exists quote_pt text not null default '';

alter table public.faqs add column if not exists question_pt text not null default '';
alter table public.faqs add column if not exists answer_pt text not null default '';

alter table public.partners add column if not exists image text not null default '';
alter table public.partners add column if not exists tag_pt text not null default '';

alter table public.gallery add column if not exists title_pt text not null default '';
alter table public.gallery add column if not exists category_pt text not null default '';

-- ---------------------------------------------------------------------------
-- Public image storage bucket ("media") used for team photos, event images,
-- partner logos and the gallery. Public read; only admins can upload/change.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read media" on storage.objects;
create policy "public can read media"
on storage.objects
for select
using (bucket_id = 'media');

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media"
on storage.objects
for insert
with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins update media" on storage.objects;
create policy "admins update media"
on storage.objects
for update
using (bucket_id = 'media' and public.is_admin())
with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media"
on storage.objects
for delete
using (bucket_id = 'media' and public.is_admin());

-- v2.1: optional Google Maps link for the address.
alter table public.site_settings add column if not exists address_url text not null default '';

-- v2.2: customizable hero image + flexible social links.
alter table public.site_settings add column if not exists hero_image text not null default '';

create table if not exists public.socials (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.socials enable row level security;

drop policy if exists "public can read socials" on public.socials;
create policy "public can read socials"
on public.socials
for select
using (true);

drop policy if exists "admins manage socials" on public.socials;
create policy "admins manage socials"
on public.socials
for all
using (public.is_admin())
with check (public.is_admin());

-- v2.3: Course Registration feature.
-- Admin-controlled visibility toggle for the public "Course Registration"
-- header button. Stored as text ("true"/"false") to match every other
-- settings column in this project.
alter table public.site_settings add column if not exists registration_enabled text not null default 'false';

-- Subject line for the notification email sent to the institute on every
-- submission. The admin must set this before the button can be enabled.
alter table public.site_settings add column if not exists registration_email_subject text not null default '';

-- Submitted registrations. The public can only INSERT (submit their own
-- form) — never read, edit, or delete anyone's entry, including their own,
-- once sent. Only admins can view or remove entries, e.g. to export to CSV
-- and then clear the table to keep storage usage low.
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  date_of_birth date not null,
  gender text not null,
  email text not null,
  phone text not null,
  address text not null,
  occupation text not null,
  program_title text not null default '',
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

drop policy if exists "public can submit registrations" on public.registrations;
create policy "public can submit registrations"
on public.registrations
for insert
with check (true);

drop policy if exists "admins read registrations" on public.registrations;
create policy "admins read registrations"
on public.registrations
for select
using (public.is_admin());

drop policy if exists "admins delete registrations" on public.registrations;
create policy "admins delete registrations"
on public.registrations
for delete
using (public.is_admin());

-- v2.4: Per-program registration scheduling.
-- Admins can set a start/end date-time per program so registration opens
-- and closes automatically, and can manually force it open or closed at
-- any time — the manual override always takes priority. registration_start
-- and registration_end are stored as UTC ISO timestamps (as text, matching
-- every other column in this project); registration_override is one of
-- '', 'open', or 'closed'.
alter table public.programs add column if not exists registration_start text not null default '';
alter table public.programs add column if not exists registration_end text not null default '';
alter table public.programs add column if not exists registration_override text not null default '';

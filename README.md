# JusMentor Academia — Official Website

The official website for **JusMentor Academia**, a legal education institute in
Dili, Timor-Leste. Built with **Next.js** and **Supabase**.

It includes:

- a fast, responsive **public website** with real institute content
- **light and dark themes** — visitors switch with the moon/sun button; the site
  also respects the visitor's system preference and remembers their choice
- **English and Portuguese** — visitors switch with the language button (EN/PT);
  the interface is fully translated, and each piece of admin content can carry an
  optional Portuguese version (it falls back to the English text when left blank)
- a **working contact form** that reaches the institute's inbox
- a private **admin dashboard** at `/admin` for editing content
- **images and links** for team members, events, and partners, plus editable
  headings for the "What we do" and "In their words" sections
- SEO, social sharing, sitemap, favicon, PWA manifest, and security headers
- accessibility built in (keyboard navigation, focus states, reduced motion)

The public site works out of the box with built-in content. Supabase is only
needed if you want to edit content live from the admin dashboard.

---

## 1) Requirements

- Node.js 20 or newer
- npm

---

## 2) Install

```bash
npm install
```

## 3) Environment variables

Copy the example file and fill in what you need:

```bash
cp .env.example .env.local
```

| Variable | Needed? | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Your live domain, used for SEO and share links. |
| `NEXT_PUBLIC_SUPABASE_URL` | For admin | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For admin | Supabase anon/public key. |
| `NEXT_PUBLIC_FORMSPREE_ID` | Optional | Enables silent background contact-form delivery. |

## 4) Run locally

```bash
npm run dev
```

- Public website: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`

## 5) The contact form

The contact form works with **no setup**: when a visitor sends a message, it
opens their email app with everything filled in and addressed to the institute.

Want messages delivered silently in the background instead? Create a free form
at [formspree.io](https://formspree.io), point it at your inbox, and set
`NEXT_PUBLIC_FORMSPREE_ID` in `.env.local`. The form switches automatically.

## 6) Editing content with Supabase (optional)

1. Create a Supabase project.
2. In the Supabase **SQL Editor**, run `sql/schema.sql`, then `sql/seed.sql`.
3. Add your Supabase values to `.env.local`.
4. Open `/admin`, click **Sign up**, and create your account.
5. In the SQL Editor, make yourself an admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-email@example.com';
   ```

6. Refresh `/admin` and sign in. You can now edit every section of the site.

Running `sql/schema.sql` also creates a public storage bucket called **`media`**
for uploaded images (team photos, event pictures, partner logos, and gallery
images). No manual bucket setup is needed. If you are **upgrading an existing
site**, just re-run `sql/schema.sql` — it only adds the new columns and bucket
and leaves your existing content untouched.

Only signed-in admins can change content. Everything else stays public.

## 7) Using the admin dashboard

Each tab in the dashboard edits one part of the site:

- **Settings** — name, contact details, and the hero/about text. This is also
  where you set the **hero photo** (the large image beside the headline — paste a
  URL or upload one; its left edge fades so it never clashes with the title) and
  the **address link** (Google Maps).
- **Social links** — add as many platforms as you like (Facebook, Instagram,
  YouTube, TikTok, LinkedIn, X, WhatsApp, Telegram, or anything else). Type the
  platform name and its link; the matching icon is chosen automatically, and
  anything unrecognised gets a neat generic link icon. These icons appear in the
  contact section and the footer.
  Every text field has an optional **(Português)** field; fill it in to show a
  translation when a visitor switches to Portuguese, or leave it blank to reuse
  the English text.
- **Services / Testimonials** — these tabs start with a **Section heading**
  editor (the "What we do" and "In their words" titles) followed by the cards.
- **Team** — add a **Photo** for each member (paste a URL or upload a file);
  members without a photo show their initials instead.
- **Events** — add an **Event photo** and an optional **Link**. When a link is
  set, clicking the event on the site opens that link in a new tab.
- **Partners** — add a **Logo / photo** and an optional **Website / link**;
  clicking a partner opens the link.
- **Gallery / Programs / FAQs** — text and images, each with optional Portuguese.

Click **Save** in each tab to publish. Uploaded images are stored in the `media`
bucket and served publicly.

# Course Registration feature — file list

Read **README-REGISTRATION.md** first — it has the Gmail App Password setup
and how to turn the feature on.

## Where each file goes (mirrors your project structure exactly)

**New files:**
- `app/api/register/route.ts` — validates each submission, lowercases text
  fields, saves it to Supabase, and emails your institute via Gmail SMTP.
- `app/register/page.tsx` — the `/register` route.
- `components/RegistrationForm.tsx` — the form, review screen, and
  success/error states.

**Replace these existing files:**
- `package.json` — adds `nodemailer` (+ its types) as a dependency.
- `.env.example` — documents the 2 new Gmail variables.
- `app/globals.css` — adds all the form/review/result styling.
- `components/AdminSite.tsx` — adds the on/off toggle, the required email
  subject field, and the Export-to-CSV / Delete-all buttons in Settings.
- `components/PublicSite.tsx` — adds the header + mobile-menu button.
- `lib/types.ts` — adds `registrationEnabled` and `registrationEmailSubject`.
- `lib/defaults.ts` — wires both fields into the default/save/load logic.
- `lib/i18n.ts` — adds every EN + PT label used in the flow.
- `sql/schema.sql` — adds the 2 new settings columns and the `registrations`
  table (your primary storage) with its access rules.

## Quick start
1. Copy all files into your project (matching the paths above).
2. `npm install` (pulls in `nodemailer`).
3. Run the new lines in `sql/schema.sql` against your Supabase database
   (uses `if not exists`, safe to just re-run the whole file).
4. Follow `README-REGISTRATION.md` to create a Gmail App Password (2
   minutes, no Google Cloud, no card) and add it to your env vars.
5. Sign in to `/admin` → Settings → set the email subject → enable **Course
   Registration**.

## How data flows
1. Visitor fills the form → reviews → submits.
2. Server lowercases the text fields, saves the row to Supabase.
3. Server emails your institute (From: your Gmail, Reply-To: the
   registrant) — a failure here never blocks the registration itself.
4. When you're ready, export everything to CSV from the admin panel, then
   delete the rows to keep Supabase storage minimal.


# Per-program registration scheduling — file list

## Where each file goes (mirrors your project structure)

**New files:**
- `lib/registration.ts` — the shared logic. `isRegistrationOpen(start, end, override)`
  is the single source of truth, used by both the admin panel and the
  public site so they always agree.
- No new pages — `app/register/page.tsx` already existed, just updated (see below).

**Replace these existing files:**
- `lib/types.ts` — adds 3 fields to `ProgramItem`.
- `lib/i18n.ts` — adds "Registration open/closed/Register now" in EN + PT.
- `sql/schema.sql` — adds 3 columns to `programs`, 1 column to `registrations`.
- `components/AdminSite.tsx` — adds the schedule/override UI per Program.
  **Also fixes a real bug I found**: `.registration-toggle` CSS was
  completely missing from your file, so your existing site-wide
  registration checkbox was likely unstyled — that's restored now too.
- `components/PublicSite.tsx` — Program cards show a live status badge and
  a "Register now" link when open.
- `components/RegistrationForm.tsx` — reads `?program=` from the URL,
  shows it, includes it in the submission.
- `app/register/page.tsx` — wrapped in `<Suspense>` (required by Next.js
  whenever a page reads URL query params like this one now does).
- `app/api/register/route.ts` — saves and emails the program name too.
- `app/globals.css` — all the new styling, plus that restored
  `.registration-toggle` fix.

## Required: run the new SQL
```sql
alter table public.programs add column if not exists registration_start text not null default '';
alter table public.programs add column if not exists registration_end text not null default '';
alter table public.programs add column if not exists registration_override text not null default '';
alter table public.registrations add column if not exists program_title text not null default '';
```
(Already appended to `sql/schema.sql` too — safe to just re-run the whole
file, everything uses `if not exists`.)

## How it works

**No cron job, no background worker.** Instead of trying to flip a stored
"is open" boolean at the exact scheduled moment (which needs paid
infrastructure and is never perfectly on time), the open/closed status is
**computed fresh every time it's read** — when the admin panel loads, and
when a visitor loads the public site. This is simpler, free on any hosting
tier, and just as accurate, since the only moment the status actually
matters is the moment someone is looking at it.

**Per program, in the admin panel (Programs tab):**
- A checkbox showing the live current status. Toggling it directly sets a
  **manual override** — takes priority over the schedule immediately, works
  even with no dates set at all.
- A **"Follow schedule instead"** link appears once an override is set,
  clearing it so the dates take over deciding again.
- Two date/time pickers for **Registration start** and **Registration
  end**. Leave End blank for "stays open indefinitely once started."
- Times are treated as **Dili (Timor-Leste) local time**, stored internally
  as UTC so the open/closed status is correct for every visitor regardless
  of their own timezone.

**On the public site:** each Program card shows a small status badge
("Registration open" / "Registration closed"). When open, a **"Register
now"** button appears, linking to `/register?program=<that program's
title>` — which pre-fills the registration flow with which program it's
for, and includes that in both the Supabase row and both notification
emails.

## One thing worth trying after you deploy
Set a Program's start time to a couple of minutes in the future, leave the
override blank, and refresh the public site before and after that time
passes — you should see the badge and Register button appear automatically,
with no admin action needed.




## 8) Launch

1. Push the project to GitHub.
2. Import it into [Vercel](https://vercel.com).
3. Add the same environment variables in Vercel's project settings.
4. Deploy, then connect your custom domain.

That's it — the site is ready to go live.

---

## Project structure

```
app/            App Router pages, layout, SEO routes, icons
components/     PublicSite (public website) and AdminSite (dashboard)
lib/            Content defaults, types, Supabase client
sql/            Database schema and seed content
public/         Logo and favicon
```
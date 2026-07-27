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


# Storage cleanup fix

Replace: `components/AdminSite.tsx`

## The problem you found
Supabase does **not** auto-delete replaced images. Every upload used a unique
filename, so swapping a photo (or removing a card entirely) just left the old
file behind forever, quietly using up your storage quota.

## What this fixes
1. **Replacing an image** (any team photo, event photo, partner logo, gallery
   image, or the hero image) now deletes the old file right after the new one
   uploads successfully.
2. **Deleting a whole card** (e.g. removing a team member) now also deletes
   any image that card was using.
3. **New "Clean up unused images" button** on the Settings tab — a one-time
   sweep for files that were already orphaned *before* this fix existed. It
   compares every file actually in storage against what your database
   currently references, and removes anything unreferenced. Files uploaded in
   the last 15 minutes are always left alone, so it never touches an
   in-progress upload you haven't saved yet.

## Safety notes
- Cleanup only ever deletes files matching your own Supabase public-URL
  pattern. If you paste an external image URL (e.g. one hosted elsewhere)
  instead of uploading, it's never touched.
- Your existing RLS policy (`admins delete media`) already permits this — no
  database changes needed.
- Deletion is best-effort and silent: if a delete call fails for some reason,
  it won't interrupt or error out the save/upload you were doing.

## Try it
1. Replace the file, redeploy (or run `npm run dev` locally).
2. Sign in to `/admin`, go to **Settings**, click **Clean up unused images**.
3. It'll report how many files it removed the first time — that's your
   accumulated backlog from before. After that, day-to-day replace/delete
   actions keep storage tidy automatically, so you likely won't need to press
   it again except very occasionally.

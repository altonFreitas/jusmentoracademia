# Course Registration — setup guide

Registrations are saved in **Supabase** (your database) and a notification
email is sent to your institute email for every submission, via your own
Gmail account. No Google Cloud project, no billing account, no card —
just a security setting in your normal Google Account.

## 1. One-time Gmail setup (required for the email notification)

### a. Turn on 2-Step Verification
App Passwords only exist once 2-Step Verification is on. Go to
[myaccount.google.com/security](https://myaccount.google.com/security) →
turn on **2-Step Verification** if it isn't already (this is the account you
want registration emails to come *from* — likely your institute's Gmail).

### b. Create an App Password
1. Still in [myaccount.google.com/security](https://myaccount.google.com/security),
   search for **"App passwords"** (or go directly to
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
2. Give it a name, e.g. `jusmentor-website`.
3. Click **Create**. Google shows you a **16-character code** — copy it now,
   it's shown only once.

### c. Add it to your project
In `.env.local`:
```
GMAIL_USER=jusmentoracademia@gmail.com
GMAIL_APP_PASSWORD=abcdabcdabcdabcd
```
(paste the 16-character code exactly as shown, spaces don't matter)

On **Vercel** once deployed: Project → **Settings → Environment Variables** →
add both → redeploy.

## 2. Run the database update
Run the new lines in `sql/schema.sql` against your Supabase database (they
use `if not exists`, so it's safe to just re-run the whole file). This adds:
- `registration_enabled` and `registration_email_subject` columns
- a new `registrations` table, with row-level security so only admins can
  read or delete entries — the public can only submit their own

## 3. Turn the feature on
Sign in to `/admin` → **Settings** tab → find the **Course Registration**
card:
1. Fill in **Notification email subject** — this becomes the subject line
   of every registration email. **Required** — if you try to enable the
   button without setting this, you'll see *"Define the subject for
   Email"* and the toggle won't turn on.
2. Check **"Show the Course Registration button on the public site"**.
3. Click **Save**.

The button now appears in the header (after the language toggle) and in the
mobile menu.

## 4. How the notification email works
Every submission sends an email:
```
From:     JusMentor Academia <your-gmail-address>
To:       your institute email (from Settings)
Reply-To: the registrant's email
Subject:  whatever you set in step 3
Body:     full name, date of birth, gender, email, phone, address, occupation
```
The `From` address has to be your own Gmail account — email providers block
messages that fake a `From` address they don't control, which is why we use
`Reply-To` instead: when you hit **Reply** in your inbox, it goes straight
to the registrant, even though the email itself arrived from your institute
account. See the earlier conversation for the full technical reason if
you're curious.

## 5. Managing storage — export, then delete
Since your data is stored in Supabase's free tier, the Course Registration
card has two more buttons once you have submissions:
- **Export to Excel (CSV)** — downloads every saved registration as a
  `.csv` file, which opens directly in Excel, Numbers, or Google Sheets.
- **Delete all registrations** — permanently clears the table. Asks for
  confirmation first. Use this after exporting, once you've collected what
  you need for a course intake, to keep Supabase's storage usage minimal.

Realistically, even hundreds of registrations only take up a few hundred
KB — nowhere close to Supabase's 500MB free-tier limit — but this export
→ delete workflow is good practice regardless, and matches how you said
you'd like to run it (batch by course/organizational decision, then clear).

## Notes
- Text fields (name, gender, email, address, occupation) are lowercased
  automatically before saving, exactly as specified. Phone and date of birth
  are left as entered (lowercasing digits/dates has no effect anyway).
- The form includes a basic honeypot spam trap (invisible to real visitors).
- If the notification email fails to send for any reason (e.g. a Gmail
  hiccup), the registration is still saved in Supabase regardless — the
  email step never blocks or breaks the actual submission.
- Registered emails aren't verified/confirmed — this assumes trusted, direct
  submissions rather than a public open sign-up flow with fraud concerns. If
  you need stronger anti-spam later (e.g. CAPTCHA), that can be added on top.

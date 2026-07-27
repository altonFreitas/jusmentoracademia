# Security + Cookies + Legal pages — install guide

This package adds a GDPR/ePrivacy-aligned cookie consent system, three legal
pages (Privacy, Cookies, Terms), and a hardened security header set including a
Content-Security-Policy. Everything typechecks clean against your project.

Files mirror your project structure — copy each one to the same path.

## New files (just add them)
- `components/CookieConsent.tsx` — consent provider + banner + preferences panel + `getConsent()` helper.
- `components/LegalPage.tsx` — shared shell used by the three legal pages.
- `app/privacy/page.tsx` — Privacy Policy (route: `/privacy`).
- `app/cookies/page.tsx` — Cookie Policy (route: `/cookies`).
- `app/terms/page.tsx` — Terms of Service (route: `/terms`).

## Changed files (replace your existing ones)
- `next.config.mjs` — adds Content-Security-Policy + COOP/CORP + extra Permissions-Policy entries.
- `app/layout.tsx` — wraps the app in `<CookieConsentProvider>`.
- `app/globals.css` — appended section 23 (banner + legal page styles). Nothing above it changed.
- `app/sitemap.ts` — adds the three legal routes.
- `lib/i18n.ts` — adds `navPrivacy / navCookies / navTerms / navCookiePrefs` (EN + PT).
- `components/PublicSite.tsx` — footer now shows the legal links + a "Cookie preferences" button.

## What you get
1. **Consent is opt-in.** Analytics/marketing default OFF and nothing loads until the visitor chooses. "Reject all" is as prominent as "Accept all" (an EU requirement).
2. **Granular + revocable.** Visitors can toggle categories, and reopen the panel any time via the footer link or `/cookies`.
3. **Provable + versioned.** The choice is stored with a timestamp and `CONSENT_VERSION`. Bump that constant in `CookieConsent.tsx` when your policy materially changes and everyone is re-asked.
4. **CSP** limits where scripts/styles/images/connections may come from — the main browser-side defence against injected content.

## How to load analytics *only after consent* (when you add it later)
The consent system exposes a helper and an event. Example for a future script:

```ts
import { getConsent, CONSENT_EVENT } from "@/components/CookieConsent";

function loadAnalyticsIfAllowed() {
  if (!getConsent().analytics) return;
  // ... inject your analytics script here ...
}

loadAnalyticsIfAllowed();
window.addEventListener(CONSENT_EVENT, loadAnalyticsIfAllowed);
```

If you add a provider like Plausible/GA, also add its domain to `connect-src`
(and `script-src` if it injects a script) in `next.config.mjs`.

## Before you publish — two quick things
1. **Dates:** each legal page has a `const UPDATED = "26 July 2026";` — set to your real launch date.
2. **Legal review:** these are solid, standard templates, but they are not a
   substitute for advice from a qualified lawyer for your jurisdiction. Since you
   run a legal-education institute, a quick review before launch is worth it.

## Verifying the CSP after deploy
Load the site, open DevTools → Console. If something is blocked by CSP it logs a
clear message naming the directive to adjust. The policy already allows your
Supabase project (derived automatically from `NEXT_PUBLIC_SUPABASE_URL`) and
Unsplash images. Test the admin dashboard too (sign in, upload an image) since
that exercises Supabase auth + storage.

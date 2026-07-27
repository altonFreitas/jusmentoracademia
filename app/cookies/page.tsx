import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CookiePreferencesLink } from "@/components/CookieConsent";
import { defaultSettings } from "@/lib/defaults";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "What cookies and local storage JusMentor Academia uses, and how to control them.",
  alternates: { canonical: "/cookies" },
};

const UPDATED = "26 July 2026";

export default function CookiePolicyPage() {
  const email = defaultSettings.email;

  return (
    <LegalPage title="Cookie Policy" updated={UPDATED}>
      <p>
        This Cookie Policy explains how {defaultSettings.name} uses cookies and
        similar technologies (such as browser local storage) when you visit our
        website, and how you can control them. It should be read together with our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device by websites you visit.
        &quot;Local storage&quot; is a similar technology that keeps small pieces
        of information in your browser. Both let a site remember things between
        visits. We refer to all of these as &quot;cookies&quot; below for
        simplicity.
      </p>

      <h2>2. Our approach: consent first</h2>
      <p>
        By default we set only strictly necessary storage. Anything else —
        analytics or marketing — is loaded <strong>only after you opt in</strong>
        {" "}through our consent banner. Rejecting is as easy as accepting, and you
        can change your mind at any time.
      </p>

      <h2>3. Categories we use</h2>

      <h3>Strictly necessary (always active)</h3>
      <p>
        These are required for the site to function and cannot be switched off.
        They do not track you for advertising.
      </p>
      <ul>
        <li>
          <strong>jma-theme</strong> — remembers your light/dark preference
          (local storage, on your device).
        </li>
        <li>
          <strong>jma-lang</strong> — remembers your language choice (local
          storage, on your device).
        </li>
        <li>
          <strong>jma-consent</strong> — remembers your cookie choices and when
          you made them (local storage, on your device).
        </li>
        <li>
          <strong>Authentication session</strong> — for administrators only, set
          by our secure sign-in provider to keep them logged in while managing
          content. Not set for ordinary visitors.
        </li>
        <li>
          <strong>Security &amp; delivery</strong> — our host may use short-lived
          technical cookies to serve the site securely and balance traffic.
        </li>
      </ul>

      <h3>Analytics (optional, off by default)</h3>
      <p>
        If you allow them, analytics cookies help us understand how visitors use
        the site — for example which pages are most read — in an aggregated,
        anonymous way. We do not currently run an analytics provider, but this
        category reserves your choice so that if we add one it will respect your
        consent from the start.
      </p>

      <h3>Marketing (optional, off by default)</h3>
      <p>
        Marketing cookies would be used to measure campaigns or show relevant
        content. We do not use marketing cookies today; this category exists so
        your preference is honoured if that ever changes.
      </p>

      <h2>4. Third-party cookies</h2>
      <p>
        We do not embed advertising trackers. Links to external platforms (such as
        our social media pages or WhatsApp) will take you to those services, which
        set their own cookies under their own policies. We encourage you to review
        the privacy and cookie notices of any third-party site you visit.
      </p>

      <h2>5. Managing your choices</h2>
      <p>
        You can reopen the preferences panel at any time here:{" "}
        <CookiePreferencesLink className="legal-inline-btn">
          Manage cookie preferences
        </CookiePreferencesLink>
        . You can also delete cookies and local storage through your browser
        settings; note that clearing them will reset your saved theme, language
        and consent choice.
      </p>

      <h2>6. Changes to this policy</h2>
      <p>
        If we materially change how we use cookies, we will update this page and,
        where required, ask for your consent again.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about cookies? Email{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </LegalPage>
  );
}

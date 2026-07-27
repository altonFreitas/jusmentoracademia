import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { defaultSettings } from "@/lib/defaults";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How JusMentor Academia collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "26 July 2026";

export default function PrivacyPolicyPage() {
  const email = defaultSettings.email;

  return (
    <LegalPage title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how {defaultSettings.name} (&quot;JusMentor
        Academia&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;)
        collects, uses, shares and protects personal information when you visit
        our website or contact us. We are committed to handling your data
        responsibly and in line with recognised data-protection principles,
        including the EU General Data Protection Regulation (GDPR) where it
        applies to you.
      </p>

      <h2>1. Who we are</h2>
      <p>
        {defaultSettings.name} is a legal-education institute based in{" "}
        {defaultSettings.address}. For any privacy question or request, contact
        us at <a href={`mailto:${email}`}>{email}</a>. For the purposes of data
        protection law, we act as the data controller for the information
        described here.
      </p>

      <h2>2. The information we collect</h2>
      <p>We keep data collection to a minimum. Depending on how you use the site, we may process:</p>
      <ul>
        <li>
          <strong>Information you give us directly.</strong> If you email us or
          message us on WhatsApp, we receive your name, contact details and the
          contents of your message.
        </li>
        <li>
          <strong>Preferences stored on your device.</strong> Your chosen theme
          (light/dark), language and your cookie-consent choice are saved locally
          in your browser. These never leave your device and are not sent to us.
        </li>
        <li>
          <strong>Technical and usage data.</strong> Like most websites, our
          hosting provider may automatically process limited technical data (such
          as IP address and browser type) to deliver the site securely. Optional
          analytics, if you consent to them, help us understand aggregate,
          anonymous usage.
        </li>
        <li>
          <strong>Administrator accounts.</strong> Staff who manage site content
          sign in through a secure authentication service that stores their email
          and an encrypted password.
        </li>
      </ul>

      <h2>3. How and why we use your information</h2>
      <ul>
        <li>To respond to your enquiries and provide information about our programs.</li>
        <li>To operate, secure and maintain the website.</li>
        <li>To remember your preferences and consent choices.</li>
        <li>
          With your consent, to measure aggregate usage so we can improve the
          site.
        </li>
      </ul>
      <p>
        Where GDPR applies, our legal bases are: your <strong>consent</strong>
        {" "}(for optional analytics), our <strong>legitimate interests</strong>
        {" "}(to run and secure the site and answer enquiries), and{" "}
        <strong>performance of a request</strong> you make to us.
      </p>

      <h2>4. Cookies and similar technologies</h2>
      <p>
        We use only strictly necessary storage by default. Any analytics or other
        non-essential technologies are loaded only after you opt in. For full
        details and to change your choice at any time, see our{" "}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>5. Sharing your information</h2>
      <p>
        We do not sell your personal data. We share it only with trusted service
        providers who help us run the site — for example our website host and our
        authentication/database provider — and only to the extent needed to
        provide those services. These providers process data under their own
        security and privacy commitments. We may also disclose information if
        required by law.
      </p>

      <h2>6. International transfers</h2>
      <p>
        Our service providers may process data on servers located outside your
        country. Where required, we rely on appropriate safeguards (such as
        standard contractual clauses) for these transfers.
      </p>

      <h2>7. How long we keep it</h2>
      <p>
        We retain personal data only as long as necessary for the purposes above
        or as required by law. Enquiry emails are kept while relevant to our
        correspondence and then deleted. Device-level preferences remain until you
        clear them in your browser.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Subject to applicable law, you may have the right to access, correct,
        delete, restrict or object to our processing of your data, to withdraw
        consent at any time, and to data portability. To exercise any of these,
        email <a href={`mailto:${email}`}>{email}</a>. You also have the right to
        complain to your local data-protection authority.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard measures to protect your data, including
        encrypted connections (HTTPS), strict security headers, access controls
        and database row-level security. No method of transmission over the
        internet is completely secure, but we work to protect your information
        and review our practices regularly.
      </p>

      <h2>10. Children</h2>
      <p>
        Our site is intended for a general audience. We do not knowingly collect
        personal data from children without appropriate consent. If you believe a
        child has provided us data, contact us and we will delete it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        reflected by the &quot;Last updated&quot; date above and, where
        appropriate, by asking for your consent again.
      </p>

      <h2>12. Contact us</h2>
      <p>
        Questions about this policy or your data? Email{" "}
        <a href={`mailto:${email}`}>{email}</a> or write to us at{" "}
        {defaultSettings.address}.
      </p>
    </LegalPage>
  );
}

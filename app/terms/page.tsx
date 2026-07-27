import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { defaultSettings } from "@/lib/defaults";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of the JusMentor Academia website.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "26 July 2026";

export default function TermsPage() {
  const email = defaultSettings.email;

  return (
    <LegalPage title="Terms of Service" updated={UPDATED}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of the {defaultSettings.name} website (the &quot;Site&quot;). By using the
        Site, you agree to these Terms. If you do not agree, please do not use the
        Site.
      </p>

      <h2>1. About the Site</h2>
      <p>
        The Site provides information about {defaultSettings.name}, a
        legal-education institute, including its programs, events and activities.
        It is intended for general informational purposes.
      </p>

      <h2>2. Not legal advice</h2>
      <p>
        Content on this Site is educational and informational only. It is{" "}
        <strong>not legal advice</strong> and does not create a lawyer–client or
        advisor–client relationship. You should consult a qualified professional
        for advice on your specific situation. We make no warranty that the
        information is complete, current or applicable to your circumstances.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Site in any unlawful way or for any unlawful purpose;</li>
        <li>
          attempt to gain unauthorised access to the Site, its administration
          area, servers or databases;
        </li>
        <li>
          interfere with or disrupt the Site, introduce malware, or attempt to
          probe, scan or breach security or authentication measures;
        </li>
        <li>
          scrape, harvest or collect data from the Site by automated means
          without our permission;
        </li>
        <li>
          copy, reproduce or redistribute our content except as permitted below.
        </li>
      </ul>

      <h2>4. Intellectual property</h2>
      <p>
        The Site and its content — including text, graphics, logos and the site
        design — are owned by or licensed to {defaultSettings.name} and are
        protected by applicable intellectual-property laws. You may view and share
        links to our content for personal, non-commercial purposes. Any other use
        requires our prior written permission.
      </p>

      <h2>5. Third-party links</h2>
      <p>
        The Site may link to third-party websites and services (such as social
        media or messaging platforms). We do not control and are not responsible
        for their content, policies or practices. Accessing them is at your own
        risk and subject to their terms.
      </p>

      <h2>6. Availability</h2>
      <p>
        We aim to keep the Site available and accurate, but we provide it
        &quot;as is&quot; and &quot;as available&quot;, without warranties of any
        kind, express or implied. We may modify, suspend or discontinue any part
        of the Site at any time without notice.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {defaultSettings.name} will not be
        liable for any indirect, incidental, special or consequential damages, or
        for any loss arising from your use of, or inability to use, the Site.
        Nothing in these Terms excludes liability that cannot be excluded by law.
      </p>

      <h2>8. Privacy</h2>
      <p>
        Your use of the Site is also governed by our{" "}
        <a href="/privacy">Privacy Policy</a> and{" "}
        <a href="/cookies">Cookie Policy</a>, which explain how we handle your
        information.
      </p>

      <h2>9. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The &quot;Last updated&quot;
        date above shows when they last changed. Continued use of the Site after
        changes take effect means you accept the revised Terms.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of Timor-Leste, without regard to
        conflict-of-law principles. Courts located in Timor-Leste will have
        jurisdiction, unless mandatory local consumer law provides otherwise.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href={`mailto:${email}`}>{email}</a> or write to us at{" "}
        {defaultSettings.address}.
      </p>
    </LegalPage>
  );
}

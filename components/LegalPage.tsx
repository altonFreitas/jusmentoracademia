import Link from "next/link";
import type { ReactNode } from "react";
import { logoSrc, defaultSettings } from "@/lib/defaults";

/* A lightweight, server-rendered wrapper for static legal documents. It reuses
   the site's design tokens (.page-shell) but stays intentionally simple and
   fully readable without JavaScript. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell legal-shell">
      <header className="legal-topbar">
        <div className="container legal-topbar-inner">
          <Link href="/" className="brand" aria-label={`${defaultSettings.name} home`}>
            <img src={logoSrc} alt="" className="brand-logo" width={48} height={48} />
            <span className="brand-text">
              <span className="brand-name">{defaultSettings.shortName}</span>
              <span className="brand-sub">{defaultSettings.name}</span>
            </span>
          </Link>
          <Link href="/" className="nav-link">← Back to site</Link>
        </div>
      </header>

      <main className="container legal-main">
        <article className="legal-article">
          <p className="legal-eyebrow">Legal</p>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-updated">Last updated: {updated}</p>
          <div className="legal-body">{children}</div>
        </article>

        <nav className="legal-crosslinks" aria-label="Legal documents">
          <Link href="/privacy" className="legal-crosslink">Privacy Policy</Link>
          <Link href="/cookies" className="legal-crosslink">Cookie Policy</Link>
          <Link href="/terms" className="legal-crosslink">Terms of Service</Link>
        </nav>
      </main>

      <footer className="footer legal-footer">
        <div className="container footer-inner">
          <div className="footer-legal">
            © {new Date().getFullYear()} {defaultSettings.name}. All rights reserved.
            <br />
            {defaultSettings.address}
          </div>
        </div>
      </footer>
    </div>
  );
}

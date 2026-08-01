"use client";

/* ---------------------------------------------------------------------------
   Cookie / privacy consent — GDPR & ePrivacy aligned.

   Design principles baked in here:
   • Opt-in, not opt-out. Nothing beyond strictly-necessary storage runs until
     the visitor makes a choice. "Analytics" and "marketing" default to OFF.
   • Granular categories the visitor can accept or reject independently.
   • Reject is as easy as Accept (equal prominence) — required in the EU.
   • The choice, its timestamp and a policy version are stored so you can prove
     consent and re-ask when your policy materially changes.
   • Consent is remembered in localStorage (first-party, no cookie needed for
     the record itself) and broadcast via a custom event + helper so analytics
     scripts can subscribe and only load once allowed.
   --------------------------------------------------------------------------- */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ConsentCategories = {
  necessary: true; // always on, cannot be disabled
  analytics: boolean;
  marketing: boolean;
};

type StoredConsent = {
  version: number;
  at: string; // ISO timestamp
  categories: ConsentCategories;
};

/* Bump this when your Cookie/Privacy Policy materially changes — visitors will
   be asked to consent again. */
export const CONSENT_VERSION = 1;
const CONSENT_KEY = "jma-consent";
export const CONSENT_EVENT = "jma-consent-change";

const DENIED: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const GRANTED: ConsentCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
};

function readConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null; // policy changed → re-ask
    return parsed;
  } catch {
    return null;
  }
}

/** Read-only helper any script can call to check the current state. */
export function getConsent(): ConsentCategories {
  return readConsent()?.categories ?? DENIED;
}

type ConsentContextValue = {
  categories: ConsentCategories;
  decided: boolean;
  open: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (partial: Omit<ConsentCategories, "necessary">) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within <CookieConsentProvider>");
  return ctx;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ConsentCategories>(DENIED);
  const [decided, setDecided] = useState(true); // assume decided until we read storage (avoids SSR flash)
  const [bannerOpen, setBannerOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setCategories(stored.categories);
      setDecided(true);
      setBannerOpen(false);
    } else {
      setDecided(false);
      setBannerOpen(true);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("has-cookie-banner", bannerOpen);
      return () => document.body.classList.remove("has-cookie-banner");
  }, [bannerOpen]);

  const persist = useCallback((next: ConsentCategories) => {
    const record: StoredConsent = {
      version: CONSENT_VERSION,
      at: new Date().toISOString(),
      categories: next,
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch {
      // storage unavailable — consent simply won't be remembered
    }
    setCategories(next);
    setDecided(true);
    setBannerOpen(false);
    setPrefsOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
    }
  }, []);

  const acceptAll = useCallback(() => persist(GRANTED), [persist]);
  const rejectAll = useCallback(() => persist(DENIED), [persist]);
  const save = useCallback(
    (partial: Omit<ConsentCategories, "necessary">) =>
      persist({ necessary: true, ...partial }),
    [persist],
  );
  const open = useCallback(() => {
    setPrefsOpen(true);
    setBannerOpen(true);
  }, []);

  const value = useMemo(
    () => ({ categories, decided, open, acceptAll, rejectAll, save }),
    [categories, decided, open, acceptAll, rejectAll, save],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {bannerOpen ? (
        <ConsentBanner
          prefsOpen={prefsOpen}
          setPrefsOpen={setPrefsOpen}
          initial={categories}
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onSave={save}
        />
      ) : null}
    </ConsentContext.Provider>
  );
}

function ConsentBanner({
  prefsOpen,
  setPrefsOpen,
  initial,
  onAcceptAll,
  onRejectAll,
  onSave,
}: {
  prefsOpen: boolean;
  setPrefsOpen: (v: boolean) => void;
  initial: ConsentCategories;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSave: (partial: Omit<ConsentCategories, "necessary">) => void;
}) {
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [marketing, setMarketing] = useState(initial.marketing);

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-desc"
    >
      <div className="cookie-card">
        {!prefsOpen ? (
          <>
            <div className="cookie-head">
              <span className="cookie-icon" aria-hidden="true">🍪</span>
              <h2 className="cookie-title">We value your privacy</h2>
            </div>
            <p id="cookie-banner-desc" className="cookie-text">
              We use strictly necessary storage to make this site work. With your
              permission, we&apos;d also like to use analytics to understand how the
              site is used. You can accept, reject, or choose exactly what you
              allow. Read our{" "}
              <a href="/cookies" className="cookie-link">Cookie Policy</a> and{" "}
              <a href="/privacy" className="cookie-link">Privacy Policy</a>.
            </p>
            <div className="cookie-actions">
              <button type="button" className="cookie-btn ghost" onClick={onRejectAll}>
                Reject all
              </button>
              <button
                type="button"
                className="cookie-btn ghost"
                onClick={() => setPrefsOpen(true)}
              >
                Manage preferences
              </button>
              <button type="button" className="cookie-btn primary" onClick={onAcceptAll}>
                Accept all
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-head">
              <span className="cookie-icon" aria-hidden="true">⚙️</span>
              <h2 className="cookie-title">Manage cookie preferences</h2>
            </div>
            <p className="cookie-text">
              Choose which categories to allow. Strictly necessary items are
              always on because the site cannot function without them.
            </p>

            <ul className="cookie-list">
              <li className="cookie-row">
                <div className="cookie-row-text">
                  <span className="cookie-row-title">Strictly necessary</span>
                  <span className="cookie-row-desc">
                    Security, load balancing and remembering your theme, language
                    and this consent choice. Always active.
                  </span>
                </div>
                <span className="cookie-toggle locked" aria-hidden="true">Always on</span>
              </li>

              <li className="cookie-row">
                <div className="cookie-row-text">
                  <span className="cookie-row-title">Analytics</span>
                  <span className="cookie-row-desc">
                    Anonymous, aggregated statistics that help us improve the site.
                    Set only if you allow it.
                  </span>
                </div>
                <label className="cookie-switch">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <span className="cookie-switch-track" aria-hidden="true" />
                  <span className="visually-hidden">Allow analytics cookies</span>
                </label>
              </li>

              <li className="cookie-row">
                <div className="cookie-row-text">
                  <span className="cookie-row-title">Marketing</span>
                  <span className="cookie-row-desc">
                    Used to measure campaigns or show relevant content. We do not
                    use these today, but this reserves your choice for the future.
                  </span>
                </div>
                <label className="cookie-switch">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                  <span className="cookie-switch-track" aria-hidden="true" />
                  <span className="visually-hidden">Allow marketing cookies</span>
                </label>
              </li>
            </ul>

            <div className="cookie-actions">
              <button type="button" className="cookie-btn ghost" onClick={onRejectAll}>
                Reject all
              </button>
              <button
                type="button"
                className="cookie-btn primary"
                onClick={() => onSave({ analytics, marketing })}
              >
                Save preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Small footer/link trigger to reopen the preferences at any time. */
export function CookiePreferencesLink({
  className = "",
  children = "Cookie preferences",
}: {
  className?: string;
  children?: ReactNode;
}) {
  const { open } = useConsent();
  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}

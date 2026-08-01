"use client";

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  dbSettingsToSiteSettings,
  defaultContent,
  logoSrc,
} from "@/lib/defaults";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { tr, loc, type UiKey } from "@/lib/i18n";
import type { Lang, SiteContent, Theme } from "@/lib/types";
import { CookiePreferencesLink } from "@/components/CookieConsent";

const THEME_KEY = "jma-theme";
const LANG_KEY = "jma-lang";
/* Minimum time the skeletons stay on screen so fast fetches never "flash". */
const MIN_SKELETON_MS = 520;

const NAV_LINKS: { href: string; key: UiKey }[] = [
  { href: "#about", key: "navAbout" },
  { href: "#services", key: "navServices" },
  { href: "#programs", key: "navPrograms" },
  { href: "#events", key: "navEvents" },
  { href: "#gallery", key: "navGallery" },
  { href: "#contact", key: "navContact" },
];

/* --------------------------------------------------------------------------
   Motion helpers — pure CSS transitions driven by a little pointer maths.
   No animation library required; everything degrades to static when the
   user prefers reduced motion.
   -------------------------------------------------------------------------- */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

type ElementWithRect = HTMLElement & { _rect?: DOMRect };

/** A card that subtly tilts toward the pointer and lights up under it. */
function MotionCard({
  as = "div",
  className,
  children,
  style,
  interactive = true,
  ...rest
}: {
  as?: "div" | "a" | "figure";
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  interactive?: boolean;
  [key: string]: unknown;
}) {
  const reduced = useReducedMotion();
  const enabled = interactive && !reduced;

  const onEnter = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    (e.currentTarget as ElementWithRect)._rect =
      e.currentTarget.getBoundingClientRect();
  }, []);

  const onMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget as ElementWithRect;
    const r = el._rect ?? el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 5.5;
    const ry = (px - 0.5) * 5.5;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--px", `${(px * 100).toFixed(2)}%`);
    el.style.setProperty("--py", `${(py * 100).toFixed(2)}%`);
    el.style.setProperty("--glow", "1");
  }, []);

  const onLeave = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glow", "0");
  }, []);

  return createElement(
    as,
    {
      className,
      style,
      ...(enabled
        ? { onPointerEnter: onEnter, onPointerMove: onMove, onPointerLeave: onLeave }
        : {}),
      ...rest,
    },
    children,
  );
}

/** A button/link that leans toward the cursor for a tactile, magnetic feel. */
function Magnetic({
  as = "a",
  className,
  children,
  strength = 0.35,
  style,
  ...rest
}: {
  as?: "a" | "button";
  className?: string;
  children: ReactNode;
  strength?: number;
  style?: CSSProperties;
  [key: string]: unknown;
}) {
  const reduced = useReducedMotion();

  const onMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - (r.left + r.width / 2)) * strength;
      const my = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.setProperty("--mx", `${mx.toFixed(1)}px`);
      el.style.setProperty("--my", `${my.toFixed(1)}px`);
    },
    [strength],
  );

  const onLeave = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  }, []);

  return createElement(
    as,
    {
      className,
      style,
      ...(reduced ? {} : { onPointerMove: onMove, onPointerLeave: onLeave }),
      ...rest,
    },
    children,
  );
}

/** A horizontally scrollable row of cards with prev/next arrow controls.
    Arrows only appear when the content actually overflows. */
function Carousel({
  children,
  trackClassName = "",
  className = "",
}: {
  children: ReactNode;
  trackClassName?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, children]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > *");
    const amount = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className={`carousel ${className}`}>
      <div className={`carousel-track ${trackClassName}`} ref={trackRef}>
        {children}
      </div>
      {canPrev && (
        <button
          type="button"
          className="carousel-arrow prev"
          aria-label="Previous"
          onClick={() => scrollByCard(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
      )}
      {canNext && (
        <button
          type="button"
          className="carousel-arrow next"
          aria-label="Next"
          onClick={() => scrollByCard(1)}
        >
          <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Skeleton primitives — shown while the JSON content is in flight.
   -------------------------------------------------------------------------- */

function SkeletonCard({
  media = false,
  lines = 3,
  className = "",
}: {
  media?: boolean;
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      {media ? <div className="skeleton skeleton-media" /> : null}
      <div className="skeleton-card-body">
        <div className="skeleton skeleton-chip" />
        <div className="skeleton skeleton-title" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton-line"
            style={{ width: `${92 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function SkeletonGrid({
  count,
  columns,
  media = false,
  lines = 3,
}: {
  count: number;
  columns: "three-grid" | "four-grid";
  media?: boolean;
  lines?: number;
}) {
  return (
    <div className={`${columns} top-gap-lg skeleton-grid`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} media={media} lines={lines} />
      ))}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  light?: boolean;
}) {
  return (
    <div className="section-title-wrap reveal">
      <div className={light ? "eyebrow eyebrow-light" : "eyebrow"}>{eyebrow}</div>
      <h2 className={light ? "section-title light" : "section-title"}>{title}</h2>
      <p className={light ? "section-description light" : "section-description"}>
        {description}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Iconography (unchanged brand set).
   -------------------------------------------------------------------------- */

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

/** Compact United States flag, used on the language toggle. */
function FlagUS() {
  return (
    <svg viewBox="0 0 20 14" width="18" height="13" aria-hidden="true" className="flag-icon">
      <rect width="20" height="14" rx="2" fill="#fff" />
      <g clipPath="url(#flagUsClip)">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x="0" y={i * 2} width="20" height="1" fill="#B22234" />
        ))}
        <rect x="0" y="0" width="9" height="7" fill="#3C3B6E" />
      </g>
      <clipPath id="flagUsClip">
        <rect width="20" height="14" rx="2" />
      </clipPath>
    </svg>
  );
}

/** Compact Portugal flag, used on the language toggle. */
function FlagPT() {
  return (
    <svg viewBox="0 0 20 14" width="18" height="13" aria-hidden="true" className="flag-icon">
      <clipPath id="flagPtClip">
        <rect width="20" height="14" rx="2" />
      </clipPath>
      <g clipPath="url(#flagPtClip)">
        <rect width="20" height="14" fill="#FF0000" />
        <rect width="8" height="14" fill="#046A38" />
        <circle cx="8" cy="7" r="3" fill="#FFCC00" stroke="#fff" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

function SocialIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  const common = {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    "aria-hidden": true as const,
  };
  if (n.includes("facebook"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
      </svg>
    );
  if (n.includes("instagram"))
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (n.includes("youtube"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.77-1.77C19.33 5.13 12 5.13 12 5.13s-7.33 0-8.83.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.77 1.77c1.5.4 8.83.4 8.83.4s7.33 0 8.83-.4a2.5 2.5 0 0 0 1.77-1.77C23 15.2 23 12 23 12zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    );
  if (n.includes("tiktok"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.1v12.63a2.53 2.53 0 0 1-2.53 2.44 2.53 2.53 0 1 1 .77-4.94v-3.16a5.66 5.66 0 0 0-.77-.05 5.68 5.68 0 1 0 5.68 5.68V9.01a7.35 7.35 0 0 0 4.29 1.37V7.28a4.28 4.28 0 0 1-3.28-1.46z" />
      </svg>
    );
  if (n.includes("linkedin"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z" />
      </svg>
    );
  if (n.includes("whatsapp"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M16.01 3.2c-7.06 0-12.8 5.73-12.8 12.79 0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.6-1.73a12.8 12.8 0 0 0 6.2 1.58c7.06 0 12.8-5.73 12.8-12.79 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.04-3.61z" transform="scale(0.75)" />
      </svg>
    );
  if (n.includes("twitter") || n === "x" || n.includes(" x") || n.includes("x "))
    return (
      <svg {...common} fill="currentColor">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25H8.08l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.01 4.13H5.04l12.04 15.64z" />
      </svg>
    );
  if (n.includes("telegram"))
    return (
      <svg {...common} fill="currentColor">
        <path d="M21.94 4.5 2.9 11.84c-.86.33-.85.8-.16 1.02l4.88 1.52 1.9 5.8c.23.64.11.9.78.9.52 0 .75-.24 1.04-.52l2.5-2.43 5.2 3.84c.96.53 1.65.26 1.89-.89l3.42-16.13c.35-1.4-.53-2.03-1.45-1.62z" />
      </svg>
    );
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

export default function PublicSite() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState<boolean>(hasSupabaseEnv);
  const [faqIndex, setFaqIndex] = useState<number>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("en");

  const rootRef = useRef<HTMLDivElement>(null);

  // Restore saved theme + language on first load.
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
      const prefersDark =
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      const nextTheme: Theme = savedTheme ?? (prefersDark ? "dark" : "light");
      setTheme(nextTheme);

      const savedLang = localStorage.getItem(LANG_KEY) as Lang | null;
      if (savedLang === "pt" || savedLang === "en") setLang(savedLang);
    } catch {
      // localStorage unavailable — keep defaults.
    }
  }, []);

  // Apply theme to <html> so it also styles the scrollbar/background.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Load dynamic JSON content from Supabase, keeping skeletons up for a
  // graceful minimum so the transition never feels like a flash.
  useEffect(() => {
    let alive = true;

    async function loadContent() {
      if (!hasSupabaseEnv) {
        setLoading(false);
        return;
      }
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const startedAt = Date.now();
      try {
        const [
          settingsRes,
          servicesRes,
          programsRes,
          teamRes,
          eventsRes,
          testimonialsRes,
          faqsRes,
          partnersRes,
          galleryRes,
          socialsRes,
        ] = await Promise.all([
          supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
          supabase.from("services").select("*").order("sort_order"),
          supabase.from("programs").select("*").order("sort_order"),
          supabase.from("team").select("*").order("sort_order"),
          supabase.from("events").select("*").order("sort_order"),
          supabase.from("testimonials").select("*").order("sort_order"),
          supabase.from("faqs").select("*").order("sort_order"),
          supabase.from("partners").select("*").order("sort_order"),
          supabase.from("gallery").select("*").order("sort_order"),
          supabase.from("socials").select("*").order("sort_order"),
        ]);

        if (!alive) return;

        setContent({
          settings: dbSettingsToSiteSettings(
            settingsRes.data as Record<string, unknown> | null,
          ),
          services: servicesRes.data?.length ? servicesRes.data : defaultContent.services,
          programs: programsRes.data?.length ? programsRes.data : defaultContent.programs,
          team: teamRes.data?.length ? teamRes.data : defaultContent.team,
          events: eventsRes.data?.length ? eventsRes.data : defaultContent.events,
          testimonials: testimonialsRes.data?.length
            ? testimonialsRes.data
            : defaultContent.testimonials,
          faqs: faqsRes.data?.length ? faqsRes.data : defaultContent.faqs,
          partners: partnersRes.data?.length ? partnersRes.data : defaultContent.partners,
          gallery: galleryRes.data?.length ? galleryRes.data : defaultContent.gallery,
          socials: socialsRes.data?.length ? socialsRes.data : defaultContent.socials,
        });
      } catch {
        // Public site always has real default content, so failures degrade gracefully.
      } finally {
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, MIN_SKELETON_MS - elapsed);
        window.setTimeout(() => {
          if (alive) setLoading(false);
        }, wait);
      }
    }

    void loadContent();
    return () => {
      alive = false;
    };
  }, []);

  // Sticky-header state + reading-progress bar.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 12);
        setProgress(max > 0 ? Math.min(1, y / max) : 0);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Scroll-triggered reveal, respecting reduced-motion preferences. Re-binds
  // whenever the content, language, or loading state changes so freshly
  // mapped JSON animates into view instead of snapping in.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const items = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [content, lang, loading]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const settings = useMemo(() => content.settings, [content]);
  const year = new Date().getFullYear();

  const t = (key: UiKey) => tr(lang, key);
  const L = (item: Record<string, unknown>, key: string) => loc(item, key, lang);
  const s = (base: string, basePt: string) =>
    lang === "pt" && basePt.trim() ? basePt : base;
  const heading = (base: string, basePt: string, key: UiKey) =>
    lang === "pt" ? basePt.trim() || t(key) : base.trim() || t(key);

  const whatsappHref = `https://wa.me/${settings.whatsapp}`;
  const mapsHref =
    settings.addressUrl.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      settings.address,
    )}`;

  // Small helper: stagger index for the reveal delay of mapped items.
  const stagger = (i: number) => ({ ["--i" as string]: i } as CSSProperties);

  const headerControls = (
    <div className="header-controls">
      <button
        type="button"
        className="icon-btn"
        aria-label={theme === "dark" ? t("themeToLight") : t("themeToDark")}
        title={theme === "dark" ? t("themeToLight") : t("themeToDark")}
        onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
      <button
        type="button"
        className="lang-btn"
        aria-label={t("langLabel")}
        onClick={() => setLang((v) => (v === "pt" ? "en" : "pt"))}
      >
        {lang === "pt" ? <FlagUS /> : <FlagPT />}
        <span>{lang === "pt" ? "EN" : "PT"}</span>
      </button>
      {settings.registrationEnabled === "true" ? (
        <a href="/register" className="gold-btn register-btn">
          {t("courseRegistration")}
        </a>
      ) : null}
    </div>
  );

  const socialIcons = (
    <div className="social-icons">
      {content.socials
        .filter((sc) => sc.url && sc.url.trim())
        .map((sc, i) => (
          <a
            key={(sc.id || sc.label) + i}
            href={sc.url}
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            aria-label={sc.label}
            title={sc.label}
            style={stagger(i)}
          >
            <SocialIcon name={sc.label} />
          </a>
        ))}
    </div>
  );

  return (
    <div
      className="page-shell"
      ref={rootRef}
      data-theme={theme}
      data-loading={loading ? "true" : "false"}
    >
      <a href="#main" className="skip-link">
        {t("skipToContent")}
      </a>

      {/* Reading-progress + async load indicator */}
      <div className="scroll-progress" style={{ ["--p" as string]: progress } as CSSProperties} aria-hidden="true" />
      <div className={loading ? "route-loader active" : "route-loader"} aria-hidden="true">
        <span />
      </div>

      <header className={scrolled ? "topbar is-scrolled" : "topbar"}>
        <div className="container topbar-inner">
          <a href="#top" className="brand" aria-label={`${settings.name} home`}>
            <img src={logoSrc} alt="" className="brand-logo" width={40} height={40} />
            <span className="brand-text">
              <span className="brand-name">{settings.shortName}</span>
              <span className="brand-sub">{settings.name}</span>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                {t(link.key)}
              </a>
            ))}
          </nav>

          {headerControls}

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={menuOpen ? "menu-icon open" : "menu-icon"} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <div
          id="mobile-menu"
          className={menuOpen ? "mobile-menu open" : "mobile-menu"}
          hidden={!menuOpen}
        >
          <nav className="mobile-nav" aria-label="Mobile">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={stagger(i)}
              >
                {t(link.key)}
              </a>
            ))}
            {settings.registrationEnabled === "true" ? (
              <a
                href="/register"
                className="mobile-nav-register"
                onClick={() => setMenuOpen(false)}
                style={stagger(NAV_LINKS.length)}
              >
                {t("courseRegistration")}
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      <main id="main">
        <section id="top" className="hero">
          {settings.heroImage ? (
            <div className="hero-media" aria-hidden="true">
              <img
                src={settings.heroImage}
                alt=""
                className="hero-media-img"
                fetchPriority="high"
                decoding="async"
              />
              <div className="hero-scrim" />
            </div>
          ) : (
            <div className="hero-aurora" aria-hidden="true" />
          )}

          <div className="container hero-grid hero-grid--solo">
            <div className="hero-copy">
              <div className="eyebrow eyebrow-light reveal">
                {s(settings.heroLabel, settings.heroLabelPt)}
              </div>
              <h1 className="hero-title reveal" style={stagger(1)}>
                {s(settings.heroTitle, settings.heroTitlePt)}
              </h1>
              <p className="hero-text reveal" style={stagger(2)}>
                {s(settings.heroDescription, settings.heroDescriptionPt)}
              </p>

              <div className="hero-actions reveal" style={stagger(3)}>
                <Magnetic href="#programs" className="hero-btn primary">
                  <span className="btn-label">
                    {t("heroExplore")} <span aria-hidden="true">→</span>
                  </span>
                </Magnetic>
                <Magnetic href="#contact" className="hero-btn secondary">
                  <span className="btn-label">{t("heroGetInTouch")}</span>
                </Magnetic>
              </div>

              <div className="hero-stats hero-stats-row reveal" style={stagger(4)}>
                <div className="stat-card">
                  <div className="stat-label">{t("heroFounded")}</div>
                  <div className="stat-value">{settings.founded}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t("heroBasedIn")}</div>
                  <div className="stat-value">{t("heroBasedInValue")}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t("heroFocus")}</div>
                  <div className="stat-value">{t("heroFocusValue")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.aboutEyebrow, settings.aboutEyebrowPt, "aboutEyebrow")}
              title={heading(settings.aboutTitle, settings.aboutTitlePt, "aboutTitle")}
              description={heading(settings.aboutDescription, settings.aboutDescriptionPt, "aboutDescription")}
            />

            <div className="about-grid">
              <MotionCard className="card reveal">
                <div className="card-body">
                  <div className="story-label">{t("ourStory")}</div>
                  <div className="story-text">{s(settings.about, settings.aboutPt)}</div>
                  <div className="three-grid compact-grid">
                    <div className="feature-box">
                      <div className="feature-icon" aria-hidden="true">◎</div>
                      <div className="feature-title">{t("mission")}</div>
                      <div className="feature-text">{s(settings.mission, settings.missionPt)}</div>
                    </div>
                    <div className="feature-box">
                      <div className="feature-icon" aria-hidden="true">◉</div>
                      <div className="feature-title">{t("vision")}</div>
                      <div className="feature-text">{s(settings.vision, settings.visionPt)}</div>
                    </div>
                    <div className="feature-box">
                      <div className="feature-icon" aria-hidden="true">◆</div>
                      <div className="feature-title">{t("focus")}</div>
                      <div className="feature-text">{s(settings.focus, settings.focusPt)}</div>
                    </div>
                  </div>
                </div>
              </MotionCard>

              <div className="stack-grid">
                <MotionCard className="card dark reveal">
                  <div className="card-body">
                    <div className="story-label gold-text">{t("standForTitle")}</div>
                    <ul className="value-list top-gap-sm">
                      <li><strong>{t("stand1Strong")}</strong> {t("stand1")}</li>
                      <li><strong>{t("stand2Strong")}</strong> {t("stand2")}</li>
                      <li><strong>{t("stand3Strong")}</strong> {t("stand3")}</li>
                      <li><strong>{t("stand4Strong")}</strong> {t("stand4")}</li>
                    </ul>
                  </div>
                </MotionCard>
                <MotionCard className="card reveal">
                  <div className="card-body">
                    <div className="story-label">{t("reachUs")}</div>
                    <div className="button-stack top-gap-sm">
                      <a href={`mailto:${settings.email}`} className="quick-btn">
                        {t("emailInstitute")} <span aria-hidden="true">→</span>
                      </a>
                      <a href={whatsappHref} className="quick-btn" target="_blank" rel="noreferrer">
                        {t("chatWhatsApp")} <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </MotionCard>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="section white-band services-section">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.servicesEyebrow, settings.servicesEyebrowPt, "servicesEyebrow")}
              title={heading(settings.servicesTitle, settings.servicesTitlePt, "servicesTitle")}
              description={heading(settings.servicesDescription, settings.servicesDescriptionPt, "servicesDescription")}
            />
            {loading ? (
              <SkeletonGrid count={4} columns="four-grid" lines={3} />
            ) : (
              <Carousel className="top-gap-lg" trackClassName="services-cards-grid">
                {content.services.map((service, index) => (
                  <MotionCard
                    className="card reveal"
                    key={(service.id || service.title) + index}
                    style={stagger(index)}
                  >
                    <div className="card-body">
                      <div className="feature-icon" aria-hidden="true">
                        {service.icon?.trim() || ["⚖", "🎓", "🗣", "🤝"][index % 4]}
                      </div>
                      <div className="feature-title">{L(service, "title")}</div>
                      <div className="feature-text">{L(service, "description")}</div>
                    </div>
                  </MotionCard>
                ))}
              </Carousel>
            )}
          </div>
        </section>

        <section id="programs" className="section band-dark programs-section">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.programsEyebrow, settings.programsEyebrowPt, "programsEyebrow")}
              title={heading(settings.programsTitle, settings.programsTitlePt, "programsTitle")}
              description={heading(settings.programsDescription, settings.programsDescriptionPt, "programsDescription")}
              light
            />
            {loading ? (
              <SkeletonGrid count={3} columns="three-grid" lines={3} />
            ) : (
              <Carousel className="top-gap-lg" trackClassName="three">
                {content.programs.map((program, index) => (
                  <MotionCard
                    className="card dark reveal"
                    key={(program.id || program.title) + index}
                    style={stagger(index)}
                  >
                    <div className="card-body">
                      <div className="pill">{L(program, "format")}</div>
                      <div className="feature-title light-text">{L(program, "title")}</div>
                      <div className="feature-text light-text">{L(program, "description")}</div>
                    </div>
                  </MotionCard>
                ))}
              </Carousel>
            )}
          </div>
        </section>

        <section id="team" className="section">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.teamEyebrow, settings.teamEyebrowPt, "teamEyebrow")}
              title={heading(settings.teamTitle, settings.teamTitlePt, "teamTitle")}
              description={heading(settings.teamDescription, settings.teamDescriptionPt, "teamDescription")}
            />
            {loading ? (
              <SkeletonGrid count={3} columns="three-grid" lines={3} />
            ) : (
              <Carousel className="top-gap-lg" trackClassName="three">
                {content.team.map((member, index) => {
                  const name = L(member, "name");
                  return (
                    <MotionCard
                      className="card reveal"
                      key={(member.id || member.name) + index}
                      style={stagger(index)}
                    >
                      <div className="card-body">
                        <div className="team-role">{L(member, "role")}</div>
                        <div className="feature-title">{name}</div>
                        <div className="feature-text">{L(member, "bio")}</div>
                      </div>
                    </MotionCard>
                  );
                })}
              </Carousel>
            )}
          </div>
        </section>

        <section id="events" className="section band-cream">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.eventsEyebrow, settings.eventsEyebrowPt, "eventsEyebrow")}
              title={heading(settings.eventsTitle, settings.eventsTitlePt, "eventsTitle")}
              description={heading(settings.eventsDescription, settings.eventsDescriptionPt, "eventsDescription")}
            />
            {loading ? (
              <SkeletonGrid count={3} columns="three-grid" media lines={3} />
            ) : (
              <Carousel className="top-gap-lg" trackClassName="three">
                {content.events.map((eventItem, index) => {
                  const key = (eventItem.id || eventItem.title) + index;
                  const hasLink = Boolean(eventItem.link && eventItem.link.trim());
                  const inner = (
                    <>
                      {eventItem.image ? (
                        <div
                          className="event-image"
                          role="img"
                          aria-label={L(eventItem, "title")}
                          style={{ backgroundImage: `url(${eventItem.image})` }}
                        />
                      ) : null}
                      <div className="card-body">
                        <div className="story-label">{L(eventItem, "date_label")}</div>
                        <div className="feature-title">{L(eventItem, "title")}</div>
                        <div className="feature-subtitle">{L(eventItem, "location")}</div>
                        <div className="feature-text">{L(eventItem, "summary")}</div>
                        {hasLink ? (
                          <div className="event-more">
                            {t("eventLearnMore")} <span aria-hidden="true">→</span>
                          </div>
                        ) : null}
                      </div>
                    </>
                  );
                  return hasLink ? (
                    <MotionCard
                      as="a"
                      key={key}
                      href={eventItem.link}
                      target="_blank"
                      rel="noreferrer"
                      className="card reveal event-card is-link"
                      style={stagger(index)}
                    >
                      {inner}
                    </MotionCard>
                  ) : (
                    <MotionCard
                      key={key}
                      className="card reveal event-card"
                      style={stagger(index)}
                    >
                      {inner}
                    </MotionCard>
                  );
                })}
              </Carousel>
            )}
          </div>
        </section>

        <section id="gallery" className="section white-band">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.galleryEyebrow, settings.galleryEyebrowPt, "galleryEyebrow")}
              title={heading(settings.galleryTitle, settings.galleryTitlePt, "galleryTitle")}
              description={heading(settings.galleryDescription, settings.galleryDescriptionPt, "galleryDescription")}
            />
            {loading ? (
              <SkeletonGrid count={3} columns="three-grid" media lines={1} />
            ) : (
              <Carousel className="top-gap-lg" trackClassName="three">
                {content.gallery.map((item, index) => (
                  <MotionCard
                    className="card gallery-card reveal"
                    key={(item.id || item.title) + index}
                    style={stagger(index)}
                  >
                    <div
                      className="gallery-image"
                      role="img"
                      aria-label={`${L(item, "title")} — ${L(item, "category")}`}
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="card-body">
                      <div className="story-label">{L(item, "category")}</div>
                      <div className="feature-title">{L(item, "title")}</div>
                    </div>
                  </MotionCard>
                ))}
              </Carousel>
            )}
          </div>
        </section>

        <section id="testimonials" className="section band-dark">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.testimonialsEyebrow, settings.testimonialsEyebrowPt, "testimonialsEyebrow")}
              title={heading(settings.testimonialsTitle, settings.testimonialsTitlePt, "testimonialsTitle")}
              description={heading(settings.testimonialsDescription, settings.testimonialsDescriptionPt, "testimonialsDescription")}
              light
            />
            {loading ? (
              <SkeletonGrid count={3} columns="three-grid" lines={3} />
            ) : (
              <div className="three-grid top-gap-lg">
                {content.testimonials.map((item, index) => (
                  <MotionCard
                    as="figure"
                    className="card dark reveal"
                    key={(item.id || item.name) + index}
                    style={stagger(index)}
                  >
                    <div className="card-body">
                      <div className="quote-mark" aria-hidden="true">“</div>
                      <blockquote className="feature-text light-text top-gap-xs">
                        {L(item, "quote")}
                      </blockquote>
                      <figcaption>
                        <div className="quote-name">{L(item, "name")}</div>
                        <div className="quote-role">{L(item, "role")}</div>
                      </figcaption>
                    </div>
                  </MotionCard>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="partners" className="section">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.partnersEyebrow, settings.partnersEyebrowPt, "partnersEyebrow")}
              title={heading(settings.partnersTitle, settings.partnersTitlePt, "partnersTitle")}
              description={heading(settings.partnersDescription, settings.partnersDescriptionPt, "partnersDescription")}
            />
            {loading ? (
              <SkeletonGrid count={3} columns="three-grid" lines={2} />
            ) : (
              <Carousel className="top-gap-lg" trackClassName="three">
                {content.partners.map((partner, index) => {
                  const key = (partner.id || partner.name) + index;
                  const hasUrl = Boolean(partner.url && partner.url.trim());
                  const inner = (
                    <div className="card-body center-text">
                      {partner.image ? (
                        <img
                          className="partner-logo"
                          src={partner.image}
                          alt={partner.name}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="feature-icon center-icon" aria-hidden="true">🤝</div>
                      )}
                      <div className="feature-title">{partner.name}</div>
                      <div className="feature-text">{L(partner, "tag")}</div>
                      {hasUrl ? (
                        <div className="partner-more top-gap-sm">
                          {t("visitLink")} <span aria-hidden="true">→</span>
                        </div>
                      ) : null}
                    </div>
                  );
                  return hasUrl ? (
                    <MotionCard
                      as="a"
                      key={key}
                      href={partner.url}
                      target="_blank"
                      rel="noreferrer"
                      className="card reveal partner-card is-link"
                      style={stagger(index)}
                    >
                      {inner}
                    </MotionCard>
                  ) : (
                    <MotionCard
                      key={key}
                      className="card reveal partner-card"
                      style={stagger(index)}
                    >
                      {inner}
                    </MotionCard>
                  );
                })}
              </Carousel>
            )}
          </div>
        </section>

        <section id="faq" className="section band-cream">
          <div className="container">
            <SectionTitle
              eyebrow={heading(settings.faqEyebrow, settings.faqEyebrowPt, "faqEyebrow")}
              title={heading(settings.faqTitle, settings.faqTitlePt, "faqTitle")}
              description={heading(settings.faqDescription, settings.faqDescriptionPt, "faqDescription")}
            />
            {loading ? (
              <div className="faq-list top-gap-lg skeleton-grid" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div className="skeleton skeleton-faq" key={i} />
                ))}
              </div>
            ) : (
              <div className="faq-list top-gap-lg">
                {content.faqs.map((faq, index) => {
                  const open = faqIndex === index;
                  return (
                    <div
                      className="faq-card reveal"
                      data-open={open || undefined}
                      key={(faq.id || faq.question) + index}
                      style={stagger(index)}
                    >
                      <button
                        type="button"
                        className="faq-btn"
                        aria-expanded={open}
                        onClick={() => setFaqIndex(open ? -1 : index)}
                      >
                        <span className="faq-q">{L(faq, "question")}</span>
                        <span className="faq-arrow" aria-hidden="true" />
                      </button>
                      <div className="faq-a-wrap">
                        <div className="faq-a">{L(faq, "answer")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section id="contact" className="section band-dark">
          <div className="container">
            <div className="card dark contact-center reveal">
              <div className="card-body">
                <div className="eyebrow eyebrow-light">
                  {heading(settings.contactEyebrow, settings.contactEyebrowPt, "contactEyebrow")}
                </div>
                <h2 className="section-title light top-gap-sm">
                  {heading(settings.contactTitle, settings.contactTitlePt, "contactTitle")}
                </h2>
                <p className="section-description light top-gap-sm contact-center-copy">
                  {heading(settings.contactDescription, settings.contactDescriptionPt, "contactDescription")}
                </p>

                <div className="contact-center-grid top-gap-lg">
                  <div className="contact-item">
                    <div className="contact-k">{t("labelEmail")}</div>
                    <a className="contact-v" href={`mailto:${settings.email}`}>
                      {settings.email}
                    </a>
                  </div>
                  <div className="contact-item">
                    <div className="contact-k">{t("labelPhone")}</div>
                    <a className="contact-v" href={whatsappHref} target="_blank" rel="noreferrer">
                      {settings.phone}
                    </a>
                  </div>
                  <div className="contact-item">
                    <div className="contact-k">{t("labelAddress")}</div>
                    <a
                      className="contact-v"
                      href={mapsHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {settings.address}
                    </a>
                  </div>
                </div>

                <div className="contact-actions top-gap-lg">
                  <Magnetic href={`mailto:${settings.email}`} className="hero-btn primary">
                    <span className="btn-label">
                      {t("emailInstitute")} <span aria-hidden="true">→</span>
                    </span>
                  </Magnetic>
                  <Magnetic
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="hero-btn secondary"
                  >
                    <span className="btn-label">{t("chatWhatsApp")}</span>
                  </Magnetic>
                </div>

                {socialIcons}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src={logoSrc} alt="" className="footer-logo" width={46} height={46} />
            <div className="footer-title">{settings.name}</div>
            <div className="footer-tagline">
              {s(settings.tagline, settings.taglinePt)}
            </div>
          </div>

          <div className="footer-legal">
            © {year} {settings.name}. {t("footerRights")}
            <br />
            {settings.address}
          </div>

          <div className="footer-legal-links">
            <a href="/privacy">{t("navPrivacy")}</a>
            <a href="/cookies">{t("navCookies")}</a>
            <a href="/terms">{t("navTerms")}</a>
            <CookiePreferencesLink>{t("navCookiePrefs")}</CookiePreferencesLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

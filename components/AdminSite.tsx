"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  collectionLabels,
  dbSettingsToSiteSettings,
  defaultContent,
  defaultSettings,
  logoSrc,
  siteSettingsToDbRow,
} from "@/lib/defaults";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import type {
  AdminCollectionKey,
  SiteContent,
  SiteSettings,
} from "@/lib/types";

const ADMIN_SESSION_MS = 10 * 60 * 1000;
const ADMIN_EXPIRY_KEY = "jma-admin-expiry";
const MEDIA_BUCKET = "media";

/** All storage subfolders any upload could have landed in. */
const MEDIA_FOLDERS: string[] = [
  "services",
  "programs",
  "team",
  "events",
  "testimonials",
  "faqs",
  "partners",
  "gallery",
  "socials",
  "settings",
];

/** Turn one of our own Supabase public URLs into its storage object path.
    Returns null for anything else (a manually pasted external URL, empty
    value, etc.) so we never attempt to delete a file we don't own. */
function storagePathFromUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split(/[?#]/)[0];
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

type FieldDef = {
  key: string;
  label: string;
  textarea?: boolean;
  i18n?: boolean; // also show a Portuguese input for `${key}_pt`
  image?: boolean; // render an upload + preview + URL input
  iconPicker?: boolean; // render a searchable icon/emoji picker
  url?: boolean; // a plain link field (not translated)
  help?: string;
};

const collectionFields: Record<AdminCollectionKey, FieldDef[]> = {
  services: [
    { key: "icon", label: "Icon", iconPicker: true },
    { key: "title", label: "Title", i18n: true },
    { key: "description", label: "Description", textarea: true, i18n: true },
  ],
  programs: [
    { key: "title", label: "Program title", i18n: true },
    { key: "format", label: "Format / category", i18n: true },
    { key: "description", label: "Description", textarea: true, i18n: true },
  ],
  team: [
    { key: "image", label: "Photo", image: true },
    { key: "name", label: "Name / unit", i18n: true },
    { key: "role", label: "Role", i18n: true },
    { key: "bio", label: "Bio", textarea: true, i18n: true },
  ],
  events: [
    { key: "image", label: "Event photo", image: true },
    { key: "title", label: "Event title", i18n: true },
    { key: "date_label", label: "Date / frequency", i18n: true },
    { key: "location", label: "Location", i18n: true },
    { key: "summary", label: "Summary", textarea: true, i18n: true },
    {
      key: "link",
      label: "Link",
      url: true,
      help: "Optional. When set, clicking the event opens this link.",
    },
  ],
  testimonials: [
    { key: "name", label: "Name", i18n: true },
    { key: "role", label: "Role", i18n: true },
    { key: "quote", label: "Quote", textarea: true, i18n: true },
  ],
  faqs: [
    { key: "question", label: "Question", i18n: true },
    { key: "answer", label: "Answer", textarea: true, i18n: true },
  ],
  partners: [
    { key: "image", label: "Logo / photo", image: true },
    { key: "name", label: "Partner name" },
    { key: "tag", label: "Tagline", i18n: true },
    {
      key: "url",
      label: "Website / link",
      url: true,
      help: "Optional. When set, clicking the partner opens this link.",
    },
  ],
  gallery: [
    { key: "image", label: "Image", image: true },
    { key: "title", label: "Image title", i18n: true },
    { key: "category", label: "Category", i18n: true },
  ],
  socials: [
    {
      key: "label",
      label: "Platform name",
      help: "e.g. Facebook, Instagram, YouTube, TikTok, LinkedIn, X, WhatsApp, or any other. The matching icon is chosen automatically.",
    },
    { key: "url", label: "Link", url: true },
  ],
};

// Section-heading editors shown at the top of these collection tabs. The
// values are stored in site settings so the public headings stay editable.
const sectionHeadingConfig: Partial<
  Record<
    AdminCollectionKey,
    {
      title: string;
      eyebrow: keyof SiteSettings;
      heading: keyof SiteSettings;
      description: keyof SiteSettings;
      eyebrowPt: keyof SiteSettings;
      headingPt: keyof SiteSettings;
      descriptionPt: keyof SiteSettings;
    }
  >
> = {
  services: {
    title: 'Section heading — "What we do"',
    eyebrow: "servicesEyebrow",
    heading: "servicesTitle",
    description: "servicesDescription",
    eyebrowPt: "servicesEyebrowPt",
    headingPt: "servicesTitlePt",
    descriptionPt: "servicesDescriptionPt",
  },
  testimonials: {
    title: 'Section heading — "In their words"',
    eyebrow: "testimonialsEyebrow",
    heading: "testimonialsTitle",
    description: "testimonialsDescription",
    eyebrowPt: "testimonialsEyebrowPt",
    headingPt: "testimonialsTitlePt",
    descriptionPt: "testimonialsDescriptionPt",
  },
  programs: {
    title: 'Section heading — "Programs"',
    eyebrow: "programsEyebrow",
    heading: "programsTitle",
    description: "programsDescription",
    eyebrowPt: "programsEyebrowPt",
    headingPt: "programsTitlePt",
    descriptionPt: "programsDescriptionPt",
  },
  team: {
    title: 'Section heading — "Our Team"',
    eyebrow: "teamEyebrow",
    heading: "teamTitle",
    description: "teamDescription",
    eyebrowPt: "teamEyebrowPt",
    headingPt: "teamTitlePt",
    descriptionPt: "teamDescriptionPt",
  },
  events: {
    title: 'Section heading — "Events & Activities"',
    eyebrow: "eventsEyebrow",
    heading: "eventsTitle",
    description: "eventsDescription",
    eyebrowPt: "eventsEyebrowPt",
    headingPt: "eventsTitlePt",
    descriptionPt: "eventsDescriptionPt",
  },
  gallery: {
    title: 'Section heading — "Gallery"',
    eyebrow: "galleryEyebrow",
    heading: "galleryTitle",
    description: "galleryDescription",
    eyebrowPt: "galleryEyebrowPt",
    headingPt: "galleryTitlePt",
    descriptionPt: "galleryDescriptionPt",
  },
  partners: {
    title: 'Section heading — "Partners"',
    eyebrow: "partnersEyebrow",
    heading: "partnersTitle",
    description: "partnersDescription",
    eyebrowPt: "partnersEyebrowPt",
    headingPt: "partnersTitlePt",
    descriptionPt: "partnersDescriptionPt",
  },
  faqs: {
    title: 'Section heading — "FAQ"',
    eyebrow: "faqEyebrow",
    heading: "faqTitle",
    description: "faqDescription",
    eyebrowPt: "faqEyebrowPt",
    headingPt: "faqTitlePt",
    descriptionPt: "faqDescriptionPt",
  },
};

/** Every sidebar destination — "Settings" plus every collection tab — sorted
    alphabetically (A→Z) by its visible label, so the nav reads like a clean
    list rather than a hand-picked order. */
const sidebarNavItems: { key: "settings" | AdminCollectionKey; label: string }[] =
  (
    [
      { key: "settings", label: "Settings" },
      ...(Object.keys(collectionLabels) as AdminCollectionKey[]).map((key) => ({
        key,
        label: collectionLabels[key],
      })),
    ] as { key: "settings" | AdminCollectionKey; label: string }[]
  ).sort((a, b) => a.label.localeCompare(b.label));

function textFromError(error: unknown) {
  if (!error) return "Something went wrong.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    const parts = [e.message, e.details, e.hint]
      .filter(Boolean)
      .map((v) => String(v));
    if (parts.length) return parts.join(" — ");
    if (e.code) return `Error code ${String(e.code)}`;
  }
  return "Something went wrong.";
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6A13.3 13.3 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 5.4-1.6" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88M1 1l22 22" />
    </svg>
  );
}

/** Broom-style sweep icon, used on the "clean up unused images" action. */
function SweepIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 6 9 16" />
      <path d="M13 20 4 11a3 3 0 0 1 0-4l1-1a3 3 0 0 1 4 0l9 9-3 3a2 2 0 0 1-2 1z" />
      <path d="M17.5 3.5 21 7" />
      <path d="M2 22l4-4" />
    </svg>
  );
}

/** Circular refresh/cycle icon, used on the "refresh image cache" action. */
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 0 1-15.3 6.4M3 12a9 9 0 0 1 15.3-6.4" />
      <path d="M21 4v5h-5M3 20v-5h5" />
    </svg>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {textarea ? (
        <textarea
          className="field-input field-textarea"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="field-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  onUpload,
  busy,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
  busy: boolean;
}) {
  return (
    <div className="image-field">
      <Field label={`${label} — paste a URL or upload below`} value={value} onChange={onChange} />
      <div className="top-gap-sm">
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={label} className="gallery-preview-image" />
      ) : null}
    </div>
  );
}

/** A curated set of icons relevant to an education/legal/community site,
    each tagged with search keywords. Not exhaustive — the picker also lets
    you paste any emoji you find elsewhere (your OS emoji keyboard, an emoji
    site, etc.), so this list is a helpful starting point, not a limit. */
const ICON_CHOICES: { icon: string; keywords: string }[] = [
  { icon: "⚖", keywords: "law legal justice scale balance court" },
  { icon: "👨‍⚖️", keywords: "judge law legal court gavel" },
  { icon: "👩‍⚖️", keywords: "judge law legal court gavel woman" },
  { icon: "🔨", keywords: "gavel law legal court hammer justice" },
  { icon: "📜", keywords: "law legal document scroll certificate contract" },
  { icon: "📋", keywords: "clipboard document form checklist policy" },
  { icon: "📑", keywords: "documents papers file law legal" },
  { icon: "🛡", keywords: "shield protection safety security defend" },
  { icon: "🔏", keywords: "lock privacy security confidential seal" },
  { icon: "🗳", keywords: "ballot vote election civic rights" },
  { icon: "🎓", keywords: "graduation education school student cap" },
  { icon: "📚", keywords: "books education study learning library" },
  { icon: "📖", keywords: "book open reading study education" },
  { icon: "✏️", keywords: "pencil write edit study writing" },
  { icon: "🖊", keywords: "pen write sign document" },
  { icon: "🏫", keywords: "school building education institute academy" },
  { icon: "🧑‍🏫", keywords: "teacher instructor educator professor training" },
  { icon: "👩‍🏫", keywords: "teacher instructor educator professor training woman" },
  { icon: "🎒", keywords: "backpack school student education" },
  { icon: "📝", keywords: "notes writing exam memo document" },
  { icon: "💡", keywords: "idea lightbulb insight innovation knowledge" },
  { icon: "🧠", keywords: "brain mind knowledge thinking learning" },
  { icon: "🗣", keywords: "speaking talk seminar discussion voice" },
  { icon: "📢", keywords: "announcement megaphone advocacy campaign" },
  { icon: "📣", keywords: "megaphone advocacy outreach campaign speak" },
  { icon: "🎤", keywords: "microphone talk speech seminar event" },
  { icon: "💬", keywords: "chat conversation talk discussion message" },
  { icon: "🗨", keywords: "speech bubble talk discussion chat" },
  { icon: "📰", keywords: "news article press media" },
  { icon: "🤝", keywords: "handshake partnership agreement cooperation support" },
  { icon: "👥", keywords: "people community group team" },
  { icon: "👪", keywords: "family community people" },
  { icon: "🧑‍🤝‍🧑", keywords: "people partnership community together" },
  { icon: "🌍", keywords: "world global community earth" },
  { icon: "🕊", keywords: "peace dove freedom" },
  { icon: "❤️", keywords: "heart care support love community" },
  { icon: "🙌", keywords: "celebration support community hands raised" },
  { icon: "👐", keywords: "open hands support community help" },
  { icon: "💼", keywords: "briefcase business work career professional" },
  { icon: "📈", keywords: "growth chart progress increase business" },
  { icon: "📉", keywords: "chart decline data business" },
  { icon: "📊", keywords: "chart graph data statistics report" },
  { icon: "📅", keywords: "calendar date event schedule" },
  { icon: "🗓", keywords: "calendar schedule event date" },
  { icon: "⏰", keywords: "clock time deadline alarm" },
  { icon: "⌛", keywords: "hourglass time waiting deadline" },
  { icon: "🎯", keywords: "target goal focus objective" },
  { icon: "🚀", keywords: "launch growth progress rocket start" },
  { icon: "🏆", keywords: "trophy award achievement success" },
  { icon: "🥇", keywords: "medal award achievement first" },
  { icon: "🔑", keywords: "key access solution important" },
  { icon: "🧩", keywords: "puzzle solution piece solve" },
  { icon: "🛠", keywords: "tools build fix support service" },
  { icon: "⚙", keywords: "gear settings process system" },
  { icon: "🔍", keywords: "search find magnify research" },
  { icon: "🔎", keywords: "search find magnify research" },
  { icon: "📌", keywords: "pin location important note" },
  { icon: "📍", keywords: "location pin place address" },
  { icon: "✅", keywords: "check done complete approved success" },
  { icon: "☑", keywords: "checkbox check done approved" },
  { icon: "🔒", keywords: "lock security privacy protection" },
  { icon: "🔓", keywords: "unlock open access" },
  { icon: "💻", keywords: "laptop computer technology online" },
  { icon: "📱", keywords: "phone mobile technology app" },
  { icon: "🌐", keywords: "globe internet online web world" },
  { icon: "✉️", keywords: "email letter mail contact message" },
  { icon: "📧", keywords: "email mail contact message" },
  { icon: "📞", keywords: "phone call contact support" },
  { icon: "☎️", keywords: "phone call contact telephone" },
  { icon: "🌱", keywords: "growth new start plant seedling" },
  { icon: "🌳", keywords: "tree growth community nature" },
  { icon: "☀️", keywords: "sun bright hope new day" },
  { icon: "⭐", keywords: "star favorite featured quality" },
  { icon: "✨", keywords: "sparkle new special highlight" },
  { icon: "🔥", keywords: "fire popular trending hot" },
  { icon: "🌈", keywords: "diversity inclusion hope rainbow" },
  { icon: "➡️", keywords: "arrow next forward direction" },
  { icon: "🚩", keywords: "flag milestone marker goal" },
  { icon: "🏳", keywords: "flag milestone" },
  { icon: "📖", keywords: "book knowledge reading education" },
  { icon: "🏛", keywords: "institute government building court" },
];

function IconPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = ICON_CHOICES.filter((entry) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return entry.keywords.includes(q) || entry.icon.includes(q);
  });

  return (
    <div className="icon-field">
      <span className="field-label">{label}</span>
      <div className="icon-field-row top-gap-xs">
        <button
          type="button"
          className="icon-field-preview"
          onClick={() => setOpen((v) => !v)}
          aria-label="Choose an icon"
          title="Choose an icon"
        >
          {value?.trim() ? value : <span className="icon-field-empty">＋</span>}
        </button>
        <input
          type="text"
          className="field-input"
          placeholder="Or paste any emoji here (e.g. from your keyboard)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {open ? (
        <div className="icon-picker top-gap-sm">
          <input
            type="text"
            className="field-input"
            placeholder="Search icons — e.g. 'law', 'education', 'community'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="icon-picker-grid top-gap-xs">
            {filtered.length ? (
              filtered.map((entry) => (
                <button
                  key={entry.icon}
                  type="button"
                  className="icon-picker-option"
                  onClick={() => {
                    onChange(entry.icon);
                    setOpen(false);
                    setQuery("");
                  }}
                  title={entry.keywords.split(" ")[0]}
                >
                  {entry.icon}
                </button>
              ))
            ) : (
              <p className="admin-hint">
                No matches — you can still paste any emoji directly into the
                field above.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function makeEmptyItem(section: AdminCollectionKey) {
  return Object.fromEntries(
    collectionFields[section].map((field) => [field.key, ""]),
  );
}

export default function AdminSite() {
  const [sessionEmail, setSessionEmail] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [activeTab, setActiveTab] = useState<"settings" | AdminCollectionKey>(
    "settings",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const logoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearLogoutTimer() {
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
  }

  async function expireAdminSession() {
    setAuthLoading(true);
    clearLogoutTimer();

    try {
      await supabase?.auth.signOut();
    } catch {
      // ignore
    }

    localStorage.removeItem(ADMIN_EXPIRY_KEY);
    setLoggedIn(false);
    setIsAdmin(false);
    setSessionEmail("");
    setMessage("Session expired. Please sign in again.");
    window.location.href = "/admin";
  }

  function startLogoutTimer(expiryAt: number) {
    clearLogoutTimer();

    const remaining = expiryAt - Date.now();

    if (remaining <= 0) {
      void expireAdminSession();
      return;
    }

    logoutTimeoutRef.current = setTimeout(() => {
      void expireAdminSession();
    }, remaining);
  }

  async function uploadImage(
    section: AdminCollectionKey,
    index: number,
    field: string,
    file: File,
  ) {
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    // Remember what this field pointed to *before* the upload so we can
    // remove the now-unused file once the new one is safely in place.
    const previousUrl = (content[section]?.[index] as
      | Record<string, unknown>
      | undefined)?.[field] as string | undefined;

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
      const fileName = `${section}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(fileName);

      updateCollectionItem(section, index, field, data.publicUrl);
      setMessage(
        `Image uploaded. Click Save ${collectionLabels[section]} to keep it.`,
      );

      // Best-effort cleanup: only removes files we recognise as our own
      // uploads, and never blocks or fails the main upload flow.
      const oldPath = storagePathFromUrl(previousUrl);
      if (oldPath) {
        void supabase.storage.from(MEDIA_BUCKET).remove([oldPath]);
      }
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  async function uploadSettingImage<K extends keyof SiteSettings>(
    key: K,
    file: File,
  ) {
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    const previousUrl = content.settings[key] as unknown as string | undefined;

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg";
      const fileName = `settings/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(fileName);

      updateSetting(key, data.publicUrl as SiteSettings[K]);
      setMessage("Image uploaded. Click Save settings to keep it.");

      const oldPath = storagePathFromUrl(previousUrl);
      if (oldPath) {
        void supabase.storage.from(MEDIA_BUCKET).remove([oldPath]);
      }
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const client = supabase;

    if (!client) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    async function init() {
      if (!client) return;
      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!mounted) return;

        setLoggedIn(Boolean(session));
        setSessionEmail(session?.user.email || "");

        if (session?.user.id) {
          const savedExpiry = localStorage.getItem(ADMIN_EXPIRY_KEY);
          const expiryAt = savedExpiry
            ? Number(savedExpiry)
            : Date.now() + ADMIN_SESSION_MS;

          if (!savedExpiry) {
            localStorage.setItem(ADMIN_EXPIRY_KEY, String(expiryAt));
          }

          if (Date.now() >= expiryAt) {
            await expireAdminSession();
            return;
          }

          startLogoutTimer(expiryAt);
          await loadRoleAndContent(session.user.id);
        }
      } catch (error) {
        setMessage(textFromError(error));
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    void init();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setLoggedIn(Boolean(nextSession));
      setSessionEmail(nextSession?.user.email || "");

      if (nextSession?.user.id) {
        const savedExpiry = localStorage.getItem(ADMIN_EXPIRY_KEY);
        const expiryAt = savedExpiry
          ? Number(savedExpiry)
          : Date.now() + ADMIN_SESSION_MS;

        if (!savedExpiry) {
          localStorage.setItem(ADMIN_EXPIRY_KEY, String(expiryAt));
        }

        if (Date.now() >= expiryAt) {
          void expireAdminSession();
          return;
        }

        startLogoutTimer(expiryAt);
        setAuthLoading(false);

        setTimeout(() => {
          if (mounted) void loadRoleAndContent(nextSession.user.id);
        }, 0);
      } else {
        clearLogoutTimer();
        localStorage.removeItem(ADMIN_EXPIRY_KEY);
        setIsAdmin(false);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearLogoutTimer();
    };
  }, [supabase]);

  async function loadRoleAndContent(userId: string) {
    if (!supabase) return;

    const profileRes = await supabase
      .from("profiles")
      .select("role,email")
      .eq("id", userId)
      .maybeSingle();

    if (profileRes.error) {
      setIsAdmin(false);
      setMessage(profileRes.error.message);
      return;
    }

    const role = profileRes.data?.role === "admin";
    setIsAdmin(role);

    if (role) {
      await loadContent();
      setMessage("Signed in as admin.");
    } else {
      setMessage(
        profileRes.data?.email
          ? `Signed in as ${profileRes.data.email}, but this account is not an admin yet.`
          : "Signed in, but no admin access was found yet.",
      );
    }
  }

  async function loadContent() {
    if (!supabase) return;

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

    setContent({
      settings: dbSettingsToSiteSettings(
        settingsRes.data as Record<string, unknown> | null,
      ),
      services: servicesRes.data?.length
        ? servicesRes.data
        : defaultContent.services,
      programs: programsRes.data?.length
        ? programsRes.data
        : defaultContent.programs,
      team: teamRes.data?.length ? teamRes.data : defaultContent.team,
      events: eventsRes.data?.length ? eventsRes.data : defaultContent.events,
      testimonials: testimonialsRes.data?.length
        ? testimonialsRes.data
        : defaultContent.testimonials,
      faqs: faqsRes.data?.length ? faqsRes.data : defaultContent.faqs,
      partners: partnersRes.data?.length
        ? partnersRes.data
        : defaultContent.partners,
      gallery: galleryRes.data?.length
        ? galleryRes.data
        : defaultContent.gallery,
      socials: socialsRes.data?.length
        ? socialsRes.data
        : defaultContent.socials,
    });
  }

  async function signIn() {
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const expiryAt = Date.now() + ADMIN_SESSION_MS;
      localStorage.setItem(ADMIN_EXPIRY_KEY, String(expiryAt));

      setMessage("Signed in successfully.");
      window.location.href = "/admin";
    } catch (error) {
      const msg = textFromError(error);
      setMessage(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  async function signUp() {
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;

      setMessage(
        "Account created. Check your email if Supabase confirmation is enabled.",
      );
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;

    clearLogoutTimer();
    localStorage.removeItem(ADMIN_EXPIRY_KEY);

    await supabase.auth.signOut();
    setLoggedIn(false);
    setIsAdmin(false);
    setSessionEmail("");
    setMessage("Signed out.");
    window.location.href = "/admin";
  }

  async function saveSettings() {
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    try {
      const payload = siteSettingsToDbRow(content.settings);
      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      setMessage("Site settings saved.");
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  async function saveCollection(section: AdminCollectionKey) {
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    try {
      const tableName = section;
      const items = content[section].map((item, index) => {
        return {
          ...item,
          id: item.id || crypto.randomUUID(),
          sort_order: index,
        } as Record<string, string | number>;
      });

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .gte("sort_order", 0);

      if (
        deleteError &&
        !deleteError.message.toLowerCase().includes("0 rows")
      ) {
        throw deleteError;
      }

      if (items.length) {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(items);

        if (insertError) throw insertError;
      }

      setMessage(`${collectionLabels[section]} saved.`);
      await loadContent();
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  async function seedDefaults() {
    if (!supabase) return;

    setBusy(true);
    setMessage("");

    try {
      const { error: settingsError } = await supabase
        .from("site_settings")
        .upsert(siteSettingsToDbRow(defaultContent.settings), {
          onConflict: "id",
        });

      if (settingsError) throw settingsError;

      const sections: AdminCollectionKey[] = [
        "services",
        "programs",
        "team",
        "events",
        "testimonials",
        "faqs",
        "partners",
        "gallery",
        "socials",
      ];

      for (const section of sections) {
        const items = defaultContent[section].map((item, index) => ({
          ...item,
          id: crypto.randomUUID(),
          sort_order: index,
        }));

        const { error: deleteError } = await supabase
          .from(section)
          .delete()
          .gte("sort_order", 0);

        if (
          deleteError &&
          !deleteError.message.toLowerCase().includes("0 rows")
        ) {
          throw deleteError;
        }

        if (items.length) {
          const { error: insertError } = await supabase
            .from(section)
            .insert(items);

          if (insertError) throw insertError;
        }
      }

      setMessage("Default content seeded to the database.");
      await loadContent();
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  const REGISTRATION_COLUMNS = [
    "created_at",
    "full_name",
    "date_of_birth",
    "gender",
    "email",
    "phone",
    "address",
    "occupation",
  ] as const;

  /** Downloads every saved registration as a CSV file (opens fine in
      Excel/Numbers/Google Sheets). Read-only — does not touch the data. */
  async function exportRegistrationsCsv() {
    if (!supabase) return;
    setBusy(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(REGISTRATION_COLUMNS.join(","))
        .order("created_at", { ascending: true });

      if (error) throw error;

      const rows = (data ?? []) as unknown as Record<string, string>[];
      if (!rows.length) {
        setMessage("No registrations to export yet.");
        return;
      }

      const escapeCsv = (value: unknown) => {
        const s = String(value ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const header = REGISTRATION_COLUMNS.join(",");
      const body = rows
        .map((row) =>
          REGISTRATION_COLUMNS.map((col) => escapeCsv(row[col])).join(","),
        )
        .join("\n");
      const csv = `${header}\n${body}`;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage(`Exported ${rows.length} registration${rows.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  /** Permanently deletes every saved registration. Meant to be used right
      after exporting a CSV backup, to keep database storage usage low. */
  async function deleteAllRegistrations() {
    if (!supabase) return;
    const confirmed = window.confirm(
      "Delete ALL saved registrations? This cannot be undone — export a CSV backup first if you need one.",
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .not("id", "is", null);

      if (error) throw error;
      setMessage("All registrations deleted.");
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  function updateSetting<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) {
    setContent((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [key]: value,
      },
    }));
  }

  function updateCollectionItem(
    section: AdminCollectionKey,
    index: number,
    key: string,
    value: string,
  ) {
    setContent((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function addCollectionItem(section: AdminCollectionKey) {
    setContent((current) => ({
      ...current,
      [section]: [
        ...current[section],
        { id: crypto.randomUUID(), ...makeEmptyItem(section) },
      ],
    }));
  }

  function deleteCollectionItem(section: AdminCollectionKey, index: number) {
    // Best-effort: also remove any of our own uploaded images this item was
    // using, so deleting a card doesn't leave its photo behind in storage.
    const item = content[section]?.[index] as Record<string, unknown> | undefined;
    if (supabase && item) {
      for (const fieldDef of collectionFields[section]) {
        if (!fieldDef.image) continue;
        const path = storagePathFromUrl(item[fieldDef.key] as string | undefined);
        if (path) void supabase.storage.from(MEDIA_BUCKET).remove([path]);
      }
    }

    setContent((current) => ({
      ...current,
      [section]: current[section].filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  /** Scans the whole `media` bucket against what's actually referenced in
      the database (not just this session's unsaved edits) and removes any
      file nothing points to. Skips anything uploaded in the last 15 minutes
      so an in-progress, not-yet-saved upload is never touched. Intended as a
      one-off tidy-up for files that were orphaned before automatic cleanup
      existed — day to day, replacing or deleting an image now cleans up
      after itself. */
  async function cleanupUnusedStorage() {
    if (!supabase) return;
    setBusy(true);
    setMessage("Scanning storage for unused images...");

    try {
      const referenced = new Set<string>();
      const addRef = (url: unknown) => {
        const path = storagePathFromUrl(typeof url === "string" ? url : undefined);
        if (path) referenced.add(path);
      };

      const [settingsRes, teamRes, eventsRes, partnersRes, galleryRes] =
        await Promise.all([
          supabase.from("site_settings").select("hero_image").eq("id", 1).maybeSingle(),
          supabase.from("team").select("image"),
          supabase.from("events").select("image"),
          supabase.from("partners").select("image"),
          supabase.from("gallery").select("image"),
        ]);

      addRef(settingsRes.data?.hero_image);
      for (const row of teamRes.data ?? []) addRef((row as { image?: string }).image);
      for (const row of eventsRes.data ?? []) addRef((row as { image?: string }).image);
      for (const row of partnersRes.data ?? []) addRef((row as { image?: string }).image);
      for (const row of galleryRes.data ?? []) addRef((row as { image?: string }).image);

      const gracePeriodMs = 15 * 60 * 1000;
      const cutoff = Date.now() - gracePeriodMs;
      let removed = 0;

      for (const folder of MEDIA_FOLDERS) {
        const { data: files, error: listError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .list(folder, { limit: 1000 });
        if (listError || !files) continue;

        const toRemove: string[] = [];
        for (const file of files) {
          if (!file.name) continue;
          const path = `${folder}/${file.name}`;
          if (referenced.has(path)) continue;
          const createdAt = file.created_at ? Date.parse(file.created_at) : 0;
          if (createdAt && createdAt > cutoff) continue; // too recent — leave it alone
          toRemove.push(path);
        }

        if (toRemove.length) {
          const { error: removeError } = await supabase.storage
            .from(MEDIA_BUCKET)
            .remove(toRemove);
          if (!removeError) removed += toRemove.length;
        }
      }

      setMessage(
        removed > 0
          ? `Cleanup complete — removed ${removed} unused image${removed === 1 ? "" : "s"}.`
          : "Cleanup complete — no unused images found.",
      );
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  /** One-off maintenance action: re-applies the current 7-day cache-control
      setting to every file already sitting in storage. New uploads already
      get this automatically (set in uploadImage/uploadSettingImage); this is
      only needed for files uploaded before that cache duration was set, so
      they don't keep re-downloading on every repeat visit for another year.
      Downloads then re-uploads each file's exact same bytes, so it does cost
      some bandwidth to run — a one-time cost that pays for itself quickly
      once repeat visitors start benefiting from the longer cache. */
  async function refreshImageCacheHeaders() {
    if (!supabase) return;
    setBusy(true);
    setMessage("Refreshing cache settings on existing images...");

    try {
      let updated = 0;
      let failed = 0;

      for (const folder of MEDIA_FOLDERS) {
        const { data: files, error: listError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .list(folder, { limit: 1000 });
        if (listError || !files) continue;

        for (const file of files) {
          if (!file.name) continue;
          const path = `${folder}/${file.name}`;

          try {
            const { data: blob, error: downloadError } = await supabase.storage
              .from(MEDIA_BUCKET)
              .download(path);
            if (downloadError || !blob) {
              failed += 1;
              continue;
            }

            const contentType = file.metadata?.mimetype || blob.type || undefined;

            const { error: updateError } = await supabase.storage
              .from(MEDIA_BUCKET)
              .update(path, blob, {
                cacheControl: "604800",
                upsert: true,
                contentType,
              });

            if (updateError) failed += 1;
            else updated += 1;
          } catch {
            failed += 1;
          }
        }
      }

      setMessage(
        `Cache refresh complete — updated ${updated} file${updated === 1 ? "" : "s"}` +
          (failed ? `, ${failed} failed (safe to run again).` : "."),
      );
    } catch (error) {
      setMessage(textFromError(error));
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return (
      <div className="admin-page-shell">
        <div className="container admin-page-wrap">
          <div className="admin-standalone-card">
            <img src={logoSrc} alt="JMA logo" className="admin-logo" />
            <h1>Loading admin...</h1>
            <p>Please wait while we verify your session.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSupabaseEnv) {
    return (
      <div className="admin-page-shell">
        <div className="container admin-page-wrap">
          <div className="admin-standalone-card">
            <img src={logoSrc} alt="JMA logo" className="admin-logo" />
            <h1>Connect Supabase first</h1>
            <p>
              Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{" "}
              <code>.env.local</code>, then restart the app.
            </p>
            <a className="wa-btn inline-btn" href="/">
              ← Back to public site
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-shell">
      <div className="container admin-page-wrap">
        <div className="admin-header-row">
          <a href="/" className="brand">
            <img src={logoSrc} alt="JMA logo" className="brand-logo" />
            <div>
              <div className="brand-name">{defaultSettings.shortName}</div>
              <div className="brand-sub">Private admin</div>
            </div>
          </a>

          {loggedIn ? (
            <button type="button" className="ghost-btn" onClick={signOut}>
              Sign out
            </button>
          ) : null}
        </div>

        {!loggedIn ? (
          <div className="admin-standalone-card">
            <h1>Admin login</h1>
            <p>
              Sign in with an admin account to edit live content. If this is
              your first account, sign up first and then promote the account to{" "}
              <code>admin</code> in Supabase.
            </p>

            <div className="auth-grid top-gap-sm">
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
              />
              <label className="field">
                <span className="field-label">Password</span>
                <div className="password-wrap">
                  <input
                    className="field-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </label>
            </div>

            <div className="button-row top-gap-sm">
              <button
                type="button"
                className="gold-btn"
                disabled={busy || authLoading}
                onClick={signIn}
              >
                {busy ? "Working..." : "Sign in"}
              </button>

              <button
                type="button"
                className="ghost-btn"
                disabled={busy || authLoading}
                onClick={signUp}
              >
                {busy ? "Working..." : "Sign up"}
              </button>
            </div>

            {message ? (
              <div className="admin-message top-gap-sm">{message}</div>
            ) : null}
          </div>
        ) : !isAdmin ? (
          <div className="admin-standalone-card">
            <h1>Checking access...</h1>
            <p>Please refresh the page or sign in again.</p>
            {message ? (
              <div className="admin-message top-gap-sm">{message}</div>
            ) : null}
          </div>
        ) : (
          <div className="admin-app-grid">
            <aside className="admin-sidebar">
              <div className="admin-sidebar-block">
                <div className="admin-small-label">Logged in as</div>
                <div className="admin-user">{sessionEmail || "—"}</div>
              </div>

              <nav className="admin-sidebar-block admin-nav" aria-label="Admin sections">
                {sidebarNavItems.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={
                      activeTab === item.key ? "nav-btn active" : "nav-btn"
                    }
                    onClick={() => setActiveTab(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="admin-sidebar-block">
                <button
                  type="button"
                  className="gold-btn"
                  disabled={busy}
                  onClick={seedDefaults}
                >
                  Seed defaults
                </button>

                <a
                  className="ghost-btn inline-btn"
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open public site
                </a>
              </div>
            </aside>

            <main className="admin-main">
              <div className="admin-toolbar">
                <div>
                  <div className="admin-small-label">Admin studio</div>
                  <h1>
                    {activeTab === "settings"
                      ? "Site settings"
                      : collectionLabels[activeTab]}
                  </h1>
                </div>

                {activeTab === "settings" ? (
                  <div className="button-row">
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={busy}
                      onClick={cleanupUnusedStorage}
                      title="Remove uploaded images that no card or setting currently uses"
                    >
                      <SweepIcon />
                      {busy ? "Working..." : "Clean up images"}
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={busy}
                      onClick={refreshImageCacheHeaders}
                      title="Apply the current 7-day cache setting to images uploaded before it was set — a one-time fix"
                    >
                      <RefreshIcon />
                      {busy ? "Working..." : "Refresh cache"}
                    </button>
                    <button
                      type="button"
                      className="gold-btn"
                      disabled={busy}
                      onClick={saveSettings}
                    >
                      {busy ? "Saving..." : "Save settings"}
                    </button>
                  </div>
                ) : (
                  <div className="button-row">
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={busy}
                      onClick={() => addCollectionItem(activeTab)}
                    >
                      Add item
                    </button>

                    <button
                      type="button"
                      className="gold-btn"
                      disabled={busy}
                      onClick={() => saveCollection(activeTab)}
                    >
                      {busy
                        ? "Saving..."
                        : `Save ${collectionLabels[activeTab]}`}
                    </button>
                  </div>
                )}
              </div>

              {message ? <div className="admin-message">{message}</div> : null}

              {activeTab === "settings" ? (
                <div className="editor-card top-gap-sm">
                  <div className="editor-card-top">
                    <strong>Section heading — &quot;About&quot;</strong>
                    <button
                      type="button"
                      className="gold-btn"
                      disabled={busy}
                      onClick={saveSettings}
                    >
                      {busy ? "Saving..." : "Save heading"}
                    </button>
                  </div>
                  <p className="admin-hint">
                    The heading shown above the About section on the site.
                    Portuguese fields are optional.
                  </p>
                  <div className="settings-grid top-gap-sm">
                    <Field
                      label="Eyebrow"
                      value={content.settings.aboutEyebrow}
                      onChange={(v) => updateSetting("aboutEyebrow", v)}
                    />
                    <Field
                      label="Eyebrow (Português)"
                      value={content.settings.aboutEyebrowPt}
                      onChange={(v) => updateSetting("aboutEyebrowPt", v)}
                    />
                    <div className="span-2">
                      <Field
                        label="Title"
                        value={content.settings.aboutTitle}
                        onChange={(v) => updateSetting("aboutTitle", v)}
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="Title (Português)"
                        value={content.settings.aboutTitlePt}
                        onChange={(v) => updateSetting("aboutTitlePt", v)}
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="Description"
                        value={content.settings.aboutDescription}
                        onChange={(v) => updateSetting("aboutDescription", v)}
                        textarea
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="Description (Português)"
                        value={content.settings.aboutDescriptionPt}
                        onChange={(v) =>
                          updateSetting("aboutDescriptionPt", v)
                        }
                        textarea
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "settings" ? (
                <div className="editor-card top-gap-sm">
                  <div className="editor-card-top">
                    <strong>Course Registration</strong>
                  </div>
                  <p className="admin-hint">
                    When enabled, a &quot;Course Registration&quot; button
                    appears in the site header (after the language switch).
                    Submissions are saved below and a notification email is
                    sent to your institute email for every registration —
                    replying to that email goes straight to the registrant.
                  </p>

                  <div className="top-gap-sm">
                    <Field
                      label="Notification email subject"
                      value={content.settings.registrationEmailSubject}
                      onChange={(v) =>
                        updateSetting("registrationEmailSubject", v)
                      }
                    />
                    <p className="admin-hint">
                      Required before the button can be enabled — used as the
                      subject line of every registration notification email.
                    </p>
                  </div>

                  <label className="registration-toggle top-gap-sm">
                    <input
                      type="checkbox"
                      checked={content.settings.registrationEnabled === "true"}
                      onChange={(e) => {
                        if (
                          e.target.checked &&
                          !content.settings.registrationEmailSubject.trim()
                        ) {
                          setMessage("Define the subject for Email");
                          return;
                        }
                        updateSetting(
                          "registrationEnabled",
                          e.target.checked ? "true" : "false",
                        );
                      }}
                    />
                    <span>
                      Show the Course Registration button on the public site
                    </span>
                  </label>

                  <div className="button-row top-gap-sm">
                    <button
                      type="button"
                      className="gold-btn"
                      disabled={busy}
                      onClick={saveSettings}
                    >
                      {busy ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      disabled={busy}
                      onClick={exportRegistrationsCsv}
                      title="Download every saved registration as a CSV file (opens in Excel)"
                    >
                      Export to Excel (CSV)
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      disabled={busy}
                      onClick={deleteAllRegistrations}
                      title="Permanently delete every saved registration — export first if you need a copy"
                    >
                      Delete all registrations
                    </button>
                  </div>
                </div>
              ) : null}

              {activeTab === "settings" ? (
                <div className="settings-card top-gap-sm">
                  <div className="settings-grid">
                    <Field
                      label="Institute name"
                      value={content.settings.name}
                      onChange={(value) => updateSetting("name", value)}
                    />
                    <Field
                      label="Short name"
                      value={content.settings.shortName}
                      onChange={(value) => updateSetting("shortName", value)}
                    />
                    <Field
                      label="Founded year"
                      value={content.settings.founded}
                      onChange={(value) => updateSetting("founded", value)}
                    />
                    <Field
                      label="Tagline"
                      value={content.settings.tagline}
                      onChange={(value) => updateSetting("tagline", value)}
                    />
                    <Field
                      label="Tagline (Português)"
                      value={content.settings.taglinePt}
                      onChange={(value) => updateSetting("taglinePt", value)}
                    />
                    <Field
                      label="Email"
                      value={content.settings.email}
                      onChange={(value) => updateSetting("email", value)}
                    />
                    <Field
                      label="Phone"
                      value={content.settings.phone}
                      onChange={(value) => updateSetting("phone", value)}
                    />
                    <Field
                      label="WhatsApp digits only"
                      value={content.settings.whatsapp}
                      onChange={(value) => updateSetting("whatsapp", value)}
                    />
                    <Field
                      label="Address"
                      value={content.settings.address}
                      onChange={(value) => updateSetting("address", value)}
                    />
                    <Field
                      label="Address link (Google Maps)"
                      value={content.settings.addressUrl}
                      onChange={(value) => updateSetting("addressUrl", value)}
                    />

                    <div className="span-2">
                      <Field
                        label="Hero label"
                        value={content.settings.heroLabel}
                        onChange={(value) => updateSetting("heroLabel", value)}
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="Hero label (Português)"
                        value={content.settings.heroLabelPt}
                        onChange={(value) => updateSetting("heroLabelPt", value)}
                      />
                    </div>

                    <div className="span-2">
                      <Field
                        label="Hero title"
                        value={content.settings.heroTitle}
                        onChange={(value) => updateSetting("heroTitle", value)}
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="Hero title (Português)"
                        value={content.settings.heroTitlePt}
                        onChange={(value) => updateSetting("heroTitlePt", value)}
                      />
                    </div>

                    <div className="span-2">
                      <Field
                        label="Hero description"
                        value={content.settings.heroDescription}
                        onChange={(value) =>
                          updateSetting("heroDescription", value)
                        }
                        textarea
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="Hero description (Português)"
                        value={content.settings.heroDescriptionPt}
                        onChange={(value) =>
                          updateSetting("heroDescriptionPt", value)
                        }
                        textarea
                      />
                    </div>

                    <div className="span-2">
                      <Field
                        label="About text"
                        value={content.settings.about}
                        onChange={(value) => updateSetting("about", value)}
                        textarea
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="About text (Português)"
                        value={content.settings.aboutPt}
                        onChange={(value) => updateSetting("aboutPt", value)}
                        textarea
                      />
                    </div>

                    <Field
                      label="Mission"
                      value={content.settings.mission}
                      onChange={(value) => updateSetting("mission", value)}
                      textarea
                    />
                    <Field
                      label="Mission (Português)"
                      value={content.settings.missionPt}
                      onChange={(value) => updateSetting("missionPt", value)}
                      textarea
                    />
                    <Field
                      label="Vision"
                      value={content.settings.vision}
                      onChange={(value) => updateSetting("vision", value)}
                      textarea
                    />
                    <Field
                      label="Vision (Português)"
                      value={content.settings.visionPt}
                      onChange={(value) => updateSetting("visionPt", value)}
                      textarea
                    />

                    <div className="span-2">
                      <Field
                        label="Focus"
                        value={content.settings.focus}
                        onChange={(value) => updateSetting("focus", value)}
                        textarea
                      />
                    </div>
                    <div className="span-2">
                      <Field
                        label="Focus (Português)"
                        value={content.settings.focusPt}
                        onChange={(value) => updateSetting("focusPt", value)}
                        textarea
                      />
                    </div>

                    <div className="span-2">
                      <span className="field-label">Hero image</span>
                      <div className="image-field top-gap-xs">
                        <input
                          className="field-input"
                          placeholder="Paste an image URL, or upload below"
                          value={content.settings.heroImage}
                          onChange={(e) =>
                            updateSetting("heroImage", e.target.value)
                          }
                        />
                        <div className="top-gap-sm">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={busy}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void uploadSettingImage("heroImage", file);
                            }}
                          />
                        </div>
                        {content.settings.heroImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={content.settings.heroImage}
                            alt="Hero"
                            className="gallery-preview-image"
                          />
                        ) : null}
                        <p className="admin-hint">
                          Shown beside the hero title. Its left edge fades out so
                          it never covers the text. Leave empty to hide it.
                        </p>
                      </div>
                    </div>

                    <div className="span-2">
                      <p className="admin-hint">
                        Social links now live in their own <strong>Social
                        links</strong> tab, where you can add any platform.
                      </p>
                    </div>
                  </div>

                  <div className="editor-card top-gap-sm">
                    <div className="editor-card-top">
                      <strong>Section heading — &quot;Contact&quot;</strong>
                      <button
                        type="button"
                        className="gold-btn"
                        disabled={busy}
                        onClick={saveSettings}
                      >
                        {busy ? "Saving..." : "Save heading"}
                      </button>
                    </div>
                    <p className="admin-hint">
                      The heading shown above the contact card at the bottom of
                      the site. Portuguese fields are optional.
                    </p>
                    <div className="settings-grid top-gap-sm">
                      <Field
                        label="Eyebrow"
                        value={content.settings.contactEyebrow}
                        onChange={(v) => updateSetting("contactEyebrow", v)}
                      />
                      <Field
                        label="Eyebrow (Português)"
                        value={content.settings.contactEyebrowPt}
                        onChange={(v) => updateSetting("contactEyebrowPt", v)}
                      />
                      <div className="span-2">
                        <Field
                          label="Title"
                          value={content.settings.contactTitle}
                          onChange={(v) => updateSetting("contactTitle", v)}
                        />
                      </div>
                      <div className="span-2">
                        <Field
                          label="Title (Português)"
                          value={content.settings.contactTitlePt}
                          onChange={(v) => updateSetting("contactTitlePt", v)}
                        />
                      </div>
                      <div className="span-2">
                        <Field
                          label="Description"
                          value={content.settings.contactDescription}
                          onChange={(v) =>
                            updateSetting("contactDescription", v)
                          }
                          textarea
                        />
                      </div>
                      <div className="span-2">
                        <Field
                          label="Description (Português)"
                          value={content.settings.contactDescriptionPt}
                          onChange={(v) =>
                            updateSetting("contactDescriptionPt", v)
                          }
                          textarea
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {sectionHeadingConfig[activeTab] ? (
                    (() => {
                      const cfg = sectionHeadingConfig[activeTab]!;
                      return (
                        <div className="editor-card top-gap-sm">
                          <div className="editor-card-top">
                            <strong>{cfg.title}</strong>
                            <button
                              type="button"
                              className="gold-btn"
                              disabled={busy}
                              onClick={saveSettings}
                            >
                              {busy ? "Saving..." : "Save heading"}
                            </button>
                          </div>
                          <p className="admin-hint">
                            The heading shown above this section on the site.
                            Portuguese fields are optional.
                          </p>
                          <div className="settings-grid top-gap-sm">
                            <Field
                              label="Eyebrow"
                              value={content.settings[cfg.eyebrow]}
                              onChange={(v) => updateSetting(cfg.eyebrow, v)}
                            />
                            <Field
                              label="Eyebrow (Português)"
                              value={content.settings[cfg.eyebrowPt]}
                              onChange={(v) => updateSetting(cfg.eyebrowPt, v)}
                            />
                            <div className="span-2">
                              <Field
                                label="Title"
                                value={content.settings[cfg.heading]}
                                onChange={(v) => updateSetting(cfg.heading, v)}
                              />
                            </div>
                            <div className="span-2">
                              <Field
                                label="Title (Português)"
                                value={content.settings[cfg.headingPt]}
                                onChange={(v) => updateSetting(cfg.headingPt, v)}
                              />
                            </div>
                            <div className="span-2">
                              <Field
                                label="Description"
                                value={content.settings[cfg.description]}
                                onChange={(v) =>
                                  updateSetting(cfg.description, v)
                                }
                                textarea
                              />
                            </div>
                            <div className="span-2">
                              <Field
                                label="Description (Português)"
                                value={content.settings[cfg.descriptionPt]}
                                onChange={(v) =>
                                  updateSetting(cfg.descriptionPt, v)
                                }
                                textarea
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : null}

                  <div className="editor-stack top-gap-sm">
                    {content[activeTab].map((item, index) => {
                      const record = item as Record<string, unknown>;
                      return (
                        <div
                          key={(item.id || "new") + index}
                          className="editor-card"
                        >
                          <div className="editor-card-top">
                            <strong>
                              {collectionLabels[activeTab]} #{index + 1}
                            </strong>

                            <button
                              type="button"
                              className="danger-btn"
                              onClick={() =>
                                deleteCollectionItem(activeTab, index)
                              }
                            >
                              Delete
                            </button>
                          </div>

                          <div className="settings-grid">
                            {collectionFields[activeTab].flatMap((field) => {
                              const value = String(record[field.key] ?? "");

                              if (field.image) {
                                return [
                                  <div className="span-2" key={field.key}>
                                    <ImageField
                                      label={field.label}
                                      value={value}
                                      busy={busy}
                                      onChange={(v) =>
                                        updateCollectionItem(
                                          activeTab,
                                          index,
                                          field.key,
                                          v,
                                        )
                                      }
                                      onUpload={(file) =>
                                        void uploadImage(
                                          activeTab,
                                          index,
                                          field.key,
                                          file,
                                        )
                                      }
                                    />
                                  </div>,
                                ];
                              }

                              if (field.iconPicker) {
                                return [
                                  <div key={field.key}>
                                    <IconPickerField
                                      label={field.label}
                                      value={value}
                                      onChange={(v) =>
                                        updateCollectionItem(
                                          activeTab,
                                          index,
                                          field.key,
                                          v,
                                        )
                                      }
                                    />
                                  </div>,
                                ];
                              }

                              const cells = [
                                <div
                                  className={field.textarea ? "span-2" : ""}
                                  key={field.key}
                                >
                                  <Field
                                    label={field.label}
                                    value={value}
                                    onChange={(v) =>
                                      updateCollectionItem(
                                        activeTab,
                                        index,
                                        field.key,
                                        v,
                                      )
                                    }
                                    textarea={field.textarea}
                                  />
                                  {field.help ? (
                                    <p className="admin-hint">{field.help}</p>
                                  ) : null}
                                </div>,
                              ];

                              if (field.i18n) {
                                cells.push(
                                  <div
                                    className={field.textarea ? "span-2" : ""}
                                    key={`${field.key}_pt`}
                                  >
                                    <Field
                                      label={`${field.label} (Português)`}
                                      value={String(
                                        record[`${field.key}_pt`] ?? "",
                                      )}
                                      onChange={(v) =>
                                        updateCollectionItem(
                                          activeTab,
                                          index,
                                          `${field.key}_pt`,
                                          v,
                                        )
                                      }
                                      textarea={field.textarea}
                                    />
                                  </div>,
                                );
                              }

                              return cells;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

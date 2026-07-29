"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { logoSrc, defaultSettings } from "@/lib/defaults";
import { tr, type UiKey } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const LANG_KEY = "jma-lang";

type FormData = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  /** Honeypot field — must stay empty. Hidden from real visitors via CSS. */
  website: string;
};

const EMPTY_FORM: FormData = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
  occupation: "",
  website: "",
};

type Step = "form" | "review" | "success" | "error";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegistrationForm() {
  const [lang, setLang] = useState<Lang>("en");
  const [step, setStep] = useState<Step>("form");
  const [data, setData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY) as Lang | null;
      if (saved === "pt" || saved === "en") setLang(saved);
    } catch {
      // ignore — default to English
    }
  }, []);

  const t = (key: UiKey) => tr(lang, key);

  const fields: {
    key: keyof Omit<FormData, "website">;
    label: string;
    type: "text" | "date" | "email" | "tel" | "select";
  }[] = useMemo(
    () => [
      { key: "fullName", label: t("regFullName"), type: "text" },
      { key: "dateOfBirth", label: t("regDateOfBirth"), type: "date" },
      { key: "gender", label: t("regGender"), type: "select" },
      { key: "email", label: t("regEmail"), type: "email" },
      { key: "phone", label: t("regPhone"), type: "tel" },
      { key: "address", label: t("regAddress"), type: "text" },
      { key: "occupation", label: t("regOccupation"), type: "text" },
    ],
    [lang], // eslint-disable-line react-hooks/exhaustive-deps
  );

  function update(key: keyof FormData, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormData, string>> = {};
    for (const field of fields) {
      if (!data[field.key].trim()) next[field.key] = t("regRequired");
    }
    if (data.email.trim() && !isValidEmail(data.email.trim())) {
      next.email = t("regInvalidEmail");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleContinue(e: FormEvent) {
    e.preventDefault();
    if (validate()) setStep("review");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(json?.error || t("regErrorBody"));
        setStep("error");
        return;
      }
      setStep("success");
    } catch {
      setErrorMessage(t("regErrorBody"));
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  }

  const genderOptions = [
    { value: "", label: t("regGenderSelect") },
    { value: "male", label: t("regGenderMale") },
    { value: "female", label: t("regGenderFemale") },
    { value: "other", label: t("regGenderOther") },
    { value: "prefer_not_to_say", label: t("regGenderPreferNot") },
  ];

  return (
    <div className="page-shell legal-shell">
      <header className="legal-topbar">
        <div className="container legal-topbar-inner">
          <Link href="/" className="brand" aria-label={`${defaultSettings.name} home`}>
            <img src={logoSrc} alt="" className="brand-logo" width={40} height={40} />
            <span className="brand-text">
              <span className="brand-name">{defaultSettings.shortName}</span>
              <span className="brand-sub">{defaultSettings.name}</span>
            </span>
          </Link>
          <Link href="/" className="nav-link">← {t("regBackHome")}</Link>
        </div>
      </header>

      <main className="container legal-main">
        <article className="legal-article reg-article">
          <p className="legal-eyebrow">{t("courseRegistration")}</p>

          {step === "form" ? (
            <>
              <p className="legal-updated">{t("regPageIntro")}</p>
              <form className="reg-form top-gap-lg" onSubmit={handleContinue} noValidate>
                {/* Honeypot — hidden from real visitors, left for bots to fill in. */}
                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </div>

                <div className="reg-grid">
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className={
                        field.key === "address" || field.key === "occupation"
                          ? "span-2"
                          : undefined
                      }
                    >
                      <label className="field-label" htmlFor={field.key}>
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          id={field.key}
                          className="form-input top-gap-xs"
                          value={data[field.key]}
                          onChange={(e) => update(field.key, e.target.value)}
                        >
                          {genderOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={field.key}
                          type={field.type}
                          className="form-input top-gap-xs"
                          value={data[field.key]}
                          onChange={(e) => update(field.key, e.target.value)}
                          autoComplete="off"
                        />
                      )}
                      {errors[field.key] ? (
                        <p className="reg-field-error">{errors[field.key]}</p>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="top-gap-lg">
                  <button type="submit" className="gold-btn">
                    {t("regContinue")}
                  </button>
                </div>
              </form>
            </>
          ) : null}

          {step === "review" ? (
            <>
              <p className="legal-updated">{t("regReviewIntro")}</p>
              <dl className="reg-review top-gap-lg">
                {fields.map((field) => (
                  <div className="reg-review-row" key={field.key}>
                    <dt>{field.label}</dt>
                    <dd className={field.key === "email" ? "reg-review-value-natural" : undefined}>
                      {field.key === "gender"
                        ? genderOptions.find((o) => o.value === data.gender)?.label
                        : data[field.key]}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="reg-review-actions top-gap-lg">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => setStep("form")}
                  disabled={submitting}
                >
                  {t("regEdit")}
                </button>
                <button
                  type="button"
                  className="gold-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? t("regSubmitting") : t("regSubmit")}
                </button>
              </div>
            </>
          ) : null}

          {step === "success" ? (
            <div className="reg-result top-gap-lg">
              <div className="reg-result-icon" aria-hidden="true">✓</div>
              <h2 className="reg-result-title">{t("regSuccessTitle")}</h2>
              <p className="legal-updated">{t("regSuccessBody")}</p>
              <Link href="/" className="gold-btn top-gap-lg inline-btn">
                {t("regBackHome")}
              </Link>
            </div>
          ) : null}

          {step === "error" ? (
            <div className="reg-result top-gap-lg">
              <div className="reg-result-icon error" aria-hidden="true">!</div>
              <h2 className="reg-result-title">{t("regErrorTitle")}</h2>
              <p className="legal-updated">{errorMessage || t("regErrorBody")}</p>
              <button
                type="button"
                className="gold-btn top-gap-lg"
                onClick={() => setStep("review")}
              >
                {t("regBack")}
              </button>
            </div>
          ) : null}
        </article>
      </main>

      <footer className="footer legal-footer">
        <div className="container footer-inner">
          <div className="footer-legal">
            © {new Date().getFullYear()} {defaultSettings.name}. {defaultSettings.address}
          </div>
        </div>
      </footer>
    </div>
  );
}

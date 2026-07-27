import type { Metadata, Viewport } from "next";
import "./globals.css";
import { defaultSettings } from "@/lib/defaults";
import { CookieConsentProvider } from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jusmentoracademia.org";
const name = defaultSettings.name;
const description = defaultSettings.heroDescription;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${name} — Legal Education Institute in Dili, Timor-Leste`,
    template: `%s · ${name}`,
  },
  description,
  applicationName: name,
  keywords: [
    "JusMentor Academia",
    "legal education",
    "Timor-Leste",
    "Dili",
    "law courses",
    "legal training",
    "advocacy",
    "seminars",
    "community empowerment",
    "youth leadership",
  ],
  authors: [{ name }],
  creator: name,
  publisher: name,
  category: "education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: name,
    title: `${name} — Legal Education Institute in Dili, Timor-Leste`,
    description,
    url: siteUrl,
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: `${name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${name} — Legal Education Institute`,
    description,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0b111f" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

// Runs before paint so the saved theme/language apply with no flash of the wrong theme.
const noFlashScript = `(function(){try{var t=localStorage.getItem('jma-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;var l=localStorage.getItem('jma-lang');if(l==='pt'||l==='en'){document.documentElement.setAttribute('lang',l);}}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name,
  alternateName: defaultSettings.shortName,
  description,
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  email: defaultSettings.email,
  telephone: defaultSettings.phone,
  foundingDate: defaultSettings.founded,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Surikmas",
    addressLocality: "Dili",
    addressCountry: "TL",
  },
  areaServed: "Timor-Leste",
  sameAs: [
    defaultSettings.facebook,
    defaultSettings.instagram,
    defaultSettings.youtube,
    defaultSettings.tiktok,
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <CookieConsentProvider>{children}</CookieConsentProvider>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

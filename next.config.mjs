/** @type {import('next').NextConfig} */

// The Supabase project host is needed in connect-src (API calls) and img-src
// (Storage-hosted images). It's derived from the public env var so you don't
// have to hard-code it. Falls back to allowing all *.supabase.co if unset.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).origin : "https://*.supabase.co";
const supabaseWs = supabaseHost.replace(/^https/, "wss");

// Content-Security-Policy — the single most important browser-side defence.
// It restricts where scripts, styles, images, fonts and connections may come
// from, which sharply limits the impact of any injected/XSS content.
//
// Notes on the choices:
// • 'unsafe-inline' for style-src: Next.js / styled-jsx inject inline styles;
//   removing this would break styling. This is a widely accepted trade-off.
// • 'unsafe-inline' for script-src: the layout ships two tiny inline scripts
//   (the no-flash theme setter and the JSON-LD block). If you later move to a
//   nonce-based setup you can tighten this; for a static content site the risk
//   is low because there is no user-generated HTML rendered on the page.
// • connect-src + img-src include your Supabase project for data and images.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `form-action 'self' mailto:`,
  `frame-ancestors 'self'`,
  `object-src 'none'`,
  // 'unsafe-eval' is added only in development: Next.js dev mode / Turbopack
  // relies on eval() for hot-reload and stack traces. Production builds never
  // use eval(), so the production CSP stays strict.
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://images.unsplash.com ${supabaseHost}`,
  `font-src 'self' data:`,
  `connect-src 'self' ${supabaseHost} ${supabaseWs} https://vitals.vercel-insights.com`,
  `media-src 'self'`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
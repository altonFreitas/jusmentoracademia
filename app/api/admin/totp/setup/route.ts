import { NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { requireAdminUser } from "@/lib/adminAuth";

// otpauth + qrcode both need Node APIs, not the Edge runtime.
export const runtime = "nodejs";

const ISSUER = "JusMentor Academia";

/**
 * Starts (or resumes) 2FA enrollment for the signed-in admin.
 *
 * Generates a fresh random secret the first time this is called, or
 * reuses the existing not-yet-confirmed secret on retry (e.g. the admin
 * refreshed the page mid-setup). Once 2FA is already enabled, this route
 * refuses to hand out a QR code — the admin must disable 2FA first.
 *
 * Compatible with any standard TOTP authenticator app: Google
 * Authenticator, Microsoft Authenticator, Authy, 1Password, Bitwarden,
 * etc. — this is just a standard RFC 6238 otpauth:// URI, not a
 * Google-specific integration.
 */
export async function POST(request: Request) {
  const admin = await requireAdminUser(request);
  if ("error" in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const service = getSupabaseServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Two-factor authentication is not configured." },
      { status: 503 },
    );
  }

  let body: { email?: string } = {};
  try {
    body = await request.json();
  } catch {
    // No body is fine — email is only used for the QR code label.
  }
  const label = (body.email || "admin").trim();

  const { data: existing, error: fetchError } = await service
    .from("admin_totp")
    .select("secret, enabled")
    .eq("id", admin.userId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (existing?.enabled) {
    return NextResponse.json(
      { error: "Two-factor authentication is already enabled on this account." },
      { status: 409 },
    );
  }

  // Reuse the existing pending secret if there is one, otherwise mint a
  // brand new random secret for this enrollment attempt.
  const secret = existing?.secret
    ? OTPAuth.Secret.fromBase32(existing.secret)
    : new OTPAuth.Secret({ size: 20 });

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  const { error: upsertError } = await service.from("admin_totp").upsert({
    id: admin.userId,
    secret: secret.base32,
    enabled: false,
  });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const otpauthUri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUri, {
    width: 240,
    margin: 1,
  });

  return NextResponse.json({
    otpauthUri,
    qrDataUrl,
    // Shown as a fallback for manual entry, in case scanning fails.
    manualEntryKey: secret.base32,
  });
}

import { NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

const ISSUER = "JusMentor Academia";

/**
 * Turns off 2FA for the signed-in admin so it can be set up again (e.g.
 * with a new phone). Requires a currently-valid code, same as any other
 * security-sensitive change to an authenticator enrollment.
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

  let body: { code?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code = String(body.code || "").trim();
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Enter the 6-digit code from your authenticator app." },
      { status: 400 },
    );
  }

  const { data: row, error: fetchError } = await service
    .from("admin_totp")
    .select("secret, enabled")
    .eq("id", admin.userId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!row?.enabled) {
    return NextResponse.json(
      { error: "Two-factor authentication isn't enabled." },
      { status: 400 },
    );
  }

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: "admin",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(row.secret),
  });

  if (totp.validate({ token: code, window: 1 }) === null) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  const { error: deleteError } = await service
    .from("admin_totp")
    .delete()
    .eq("id", admin.userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

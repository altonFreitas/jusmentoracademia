import { NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

type VerifyPayload = {
  code?: string;
  /** "setup" confirms enrollment and turns 2FA on; "login" just checks the
      code against an already-enabled secret without changing anything. */
  mode?: "setup" | "login";
};

const ISSUER = "JusMentor Academia";

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

  let body: VerifyPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code = String(body.code || "").trim();
  const mode = body.mode === "setup" ? "setup" : "login";

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

  if (!row?.secret) {
    return NextResponse.json(
      { error: "No two-factor setup in progress. Start setup again." },
      { status: 400 },
    );
  }

  if (mode === "login" && !row.enabled) {
    return NextResponse.json(
      { error: "Two-factor authentication isn't enabled yet." },
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

  // Allows the code from one step before/after the current one, to absorb
  // small clock drift between the server and the person's phone.
  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  if (mode === "setup" && !row.enabled) {
    const { error: updateError } = await service
      .from("admin_totp")
      .update({ enabled: true, confirmed_at: new Date().toISOString() })
      .eq("id", admin.userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

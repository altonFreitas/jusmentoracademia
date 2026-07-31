import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

// nodemailer needs Node's net/tls modules, so this route must run on the
// Node.js runtime (not the Edge runtime).
export const runtime = "nodejs";

type RegistrationPayload = {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  /** Honeypot — a real visitor never fills this in. Bots that auto-fill
      every field on a form usually do. */
  website?: string;
};

const REQUIRED_FIELDS: (keyof RegistrationPayload)[] = [
  "fullName",
  "dateOfBirth",
  "gender",
  "email",
  "phone",
  "address",
  "occupation",
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Escapes user-supplied text before it's interpolated into an HTML email
    body, so a registrant typing e.g. `<b>` or `&` in their name can't alter
    the email's markup or inject unexpected content. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  // Rate limit first, before doing any work — every hit counts, honeypot
  // or not, so scripted abuse can't dodge the counter by varying the
  // payload to fail validation on purpose. Two windows: a tight burst
  // limit to stop rapid-fire spam, and a looser daily cap to stop a slow
  // drip of automated submissions spread out to evade the burst limit.
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit("register", ip, [
    { windowMinutes: 10, max: 3 },
    { windowMinutes: 24 * 60, max: 10 },
  ]);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many registration attempts from this connection. Please wait a while and try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: RegistrationPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Registration is not available right now. Please try again later." },
      { status: 503 },
    );
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Authoritative, server-side gate — this is the check that actually
  // matters. The admin panel's toggle only controls whether the button is
  // *shown* on the public site; without this check here, anyone who knew
  // or guessed the /register URL could still submit directly regardless of
  // the toggle. This runs before honeypot/field checks so a disabled form
  // fails fast without doing unnecessary work.
  const { data: gateRow, error: gateError } = await supabase
    .from("site_settings")
    .select("registration_enabled, email, registration_email_subject")
    .eq("id", 1)
    .maybeSingle();

  if (gateError) {
    console.error("Could not check registration_enabled:", gateError);
    return NextResponse.json(
      { error: "Registration is not available right now. Please try again later." },
      { status: 503 },
    );
  }

  if (gateRow?.registration_enabled !== "true") {
    return NextResponse.json(
      { error: "Registration is currently closed." },
      { status: 403 },
    );
  }

  // Honeypot tripped — reply as if it succeeded so the bot doesn't learn
  // anything, but don't actually process or store the submission.
  if (body.website && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || !String(body[field]).trim()) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
  }

  const emailRaw = String(body.email).trim();
  if (!isValidEmail(emailRaw)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Required transformation: every text field is uppercased before it's
  // stored anywhere, except the email address — emails are case-sensitive
  // in the local part and commonly contain a mix of upper/lowercase, so it
  // is only trimmed and left exactly as the person typed it. Applied here
  // (server-side) so it's authoritative regardless of what the client sent.
  const record = {
    fullName: String(body.fullName).trim().toUpperCase(),
    dateOfBirth: String(body.dateOfBirth).trim().toUpperCase(),
    gender: String(body.gender).trim().toUpperCase(),
    email: emailRaw,
    phone: String(body.phone).trim().toUpperCase(),
    address: String(body.address).trim().toUpperCase(),
    occupation: String(body.occupation).trim().toUpperCase(),
  };

  // 1) Primary storage: save the registration in Supabase.
  const { error: insertError } = await supabase.from("registrations").insert({
    full_name: record.fullName,
    date_of_birth: record.dateOfBirth,
    gender: record.gender,
    email: record.email,
    phone: record.phone,
    address: record.address,
    occupation: record.occupation,
  });

  if (insertError) {
    console.error("Registration insert failed:", insertError);
    return NextResponse.json(
      {
        error:
          "We couldn't save your registration right now. Please try again in a moment.",
      },
      { status: 502 },
    );
  }

  // 2) Notification email to the institute — a live heads-up on every
  //    submission. A failure here is logged but never fails the request,
  //    since the registration is already safely saved in Supabase.
  try {
    const institutionEmail = gateRow?.email as string | undefined;
    const subject =
      (gateRow?.registration_email_subject as string | undefined)?.trim() ||
      "New Course Registration";

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (institutionEmail && gmailUser && gmailAppPassword) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailAppPassword },
      });

      const bodyLines = [
        `Full Name: ${record.fullName}`,
        `Date of Birth: ${record.dateOfBirth}`,
        `Gender: ${record.gender}`,
        `Email: ${record.email}`,
        `Phone: ${record.phone}`,
        `Home Address: ${record.address}`,
        `Current Occupation: ${record.occupation}`,
      ];
      const bodyLinesHtml = [
        `Full Name: ${escapeHtml(record.fullName)}`,
        `Date of Birth: ${escapeHtml(record.dateOfBirth)}`,
        `Gender: ${escapeHtml(record.gender)}`,
        `Email: ${escapeHtml(record.email)}`,
        `Phone: ${escapeHtml(record.phone)}`,
        `Home Address: ${escapeHtml(record.address)}`,
        `Current Occupation: ${escapeHtml(record.occupation)}`,
      ];

      // Email 1 — to the institute, notifying them of the new registration.
      // Reply-To is the registrant, so hitting Reply in Gmail goes straight
      // to them even though the email itself arrives from your own address.
      await transporter.sendMail({
        from: `"JusMentor Academia" <${gmailUser}>`,
        to: institutionEmail,
        replyTo: record.email,
        subject,
        text: bodyLines.join("\n"),
        html: `<p>${bodyLinesHtml.join("<br>")}</p>`,
      });

      // Email 2 — to the registrant, confirming their submission went
      // through. A failure here is logged separately and never blocks the
      // institute notification above or the saved registration itself.
      try {
        await transporter.sendMail({
          from: `"JusMentor Academia" <${gmailUser}>`,
          to: record.email,
          replyTo: institutionEmail,
          subject: "Registration received — JusMentor Academia",
          text: `Hi ${record.fullName},\n\nThank you for registering with JusMentor Academia. We'll be in touch soon.\n\n— JusMentor Academia`,
          html: `<p>Hi ${escapeHtml(record.fullName)},</p><p>Thank you for registering with JusMentor Academia. We'll be in touch soon.</p><p>— JusMentor Academia</p>`,
        });
      } catch (error) {
        console.error("Registrant confirmation email failed:", error);
      }
    } else {
      console.warn(
        "Registration email skipped — GMAIL_USER/GMAIL_APP_PASSWORD/institute email not fully configured.",
      );
    }
  } catch (error) {
    console.error("Registration notification email failed:", error);
  }

  return NextResponse.json({ ok: true });
}
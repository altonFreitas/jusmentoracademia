import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

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

export async function POST(request: Request) {
  let body: RegistrationPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
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

  // Required transformation: every text field is lowercased before it's
  // stored anywhere. Applied here (server-side) so it's authoritative
  // regardless of what the client sent.
  const record = {
    fullName: String(body.fullName).trim().toLowerCase(),
    dateOfBirth: String(body.dateOfBirth).trim().toLowerCase(),
    gender: String(body.gender).trim().toLowerCase(),
    email: emailRaw.toLowerCase(),
    phone: String(body.phone).trim().toLowerCase(),
    address: String(body.address).trim().toLowerCase(),
    occupation: String(body.occupation).trim().toLowerCase(),
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Registration is not available right now. Please try again later." },
      { status: 503 },
    );
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

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
    const { data: settingsRow } = await supabase
      .from("site_settings")
      .select("email, registration_email_subject")
      .eq("id", 1)
      .maybeSingle();

    const institutionEmail = settingsRow?.email as string | undefined;
    const subject =
      (settingsRow?.registration_email_subject as string | undefined)?.trim() ||
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

      // Email 1 — to the institute, notifying them of the new registration.
      // Reply-To is the registrant, so hitting Reply in Gmail goes straight
      // to them even though the email itself arrives from your own address.
      await transporter.sendMail({
        from: `"JusMentor Academia" <${gmailUser}>`,
        to: institutionEmail,
        replyTo: record.email,
        subject,
        text: bodyLines.join("\n"),
        html: `<p>${bodyLines.join("<br>")}</p>`,
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
          html: `<p>Hi ${record.fullName},</p><p>Thank you for registering with JusMentor Academia. We'll be in touch soon.</p><p>— JusMentor Academia</p>`,
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
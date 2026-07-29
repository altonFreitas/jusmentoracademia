import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { requireAdminUser } from "@/lib/adminAuth";

export const runtime = "nodejs";

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

  const { data, error } = await service
    .from("admin_totp")
    .select("enabled")
    .eq("id", admin.userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enabled: Boolean(data?.enabled) });
}

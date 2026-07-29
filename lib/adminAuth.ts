import { getSupabaseServiceClient, getUserFromAuthHeader } from "@/lib/supabase";

/**
 * Verifies the request's "Authorization: Bearer <access_token>" header
 * belongs to a signed-in Supabase user whose profile role is "admin".
 * Used by every /api/admin/* route so 2FA secrets can never be read,
 * generated, or verified by a non-admin account.
 *
 * Returns the user id on success, or a { error, status } pair to send
 * straight back to the client on failure.
 */
export async function requireAdminUser(
  request: Request,
): Promise<{ userId: string } | { error: string; status: number }> {
  const service = getSupabaseServiceClient();
  if (!service) {
    return {
      error:
        "Two-factor authentication is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to the server environment and restart the app.",
      status: 503,
    };
  }

  const user = await getUserFromAuthHeader(request);
  if (!user) {
    return { error: "Not signed in.", status: 401 };
  }

  const { data: profile, error } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { error: error.message, status: 500 };
  }

  if (profile?.role !== "admin") {
    return { error: "This account is not an admin.", status: 403 };
  }

  return { userId: user.id };
}

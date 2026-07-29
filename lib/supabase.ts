import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export const hasSupabaseEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function getSupabaseBrowserClient() {
  if (!hasSupabaseEnv) return null;

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    );
  }

  return browserClient;
}

/**
 * Server-only Supabase client authenticated with the service role key.
 * Bypasses row level security — never import this from client components.
 * Used exclusively by API routes (e.g. the admin TOTP setup/verify routes)
 * that need to read or write tables with no anon/authenticated RLS policy,
 * such as `admin_totp`.
 */
export const hasSupabaseServiceEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export function getSupabaseServiceClient() {
  if (!hasSupabaseServiceEnv) return null;

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

/**
 * Resolves the Supabase user for a request's "Authorization: Bearer <token>"
 * header, using the service role client so it works regardless of RLS.
 * Returns null if the header is missing or the token is invalid/expired.
 */
export async function getUserFromAuthHeader(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const service = getSupabaseServiceClient();
  if (!service) return null;

  const { data, error } = await service.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

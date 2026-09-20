// lib/supabase/server.ts — service-role client for server-side use only
// NEVER import this in client components or expose to the browser.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("YOUR_SUPABASE") &&
      !key.includes("YOUR_SUPABASE") &&
      url.startsWith("http")
  );
}

export function createServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !isSupabaseConfigured()) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

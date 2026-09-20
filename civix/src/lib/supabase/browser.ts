"use client";
// lib/supabase/browser.ts — anon client for browser-side use

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function isBrowserSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("YOUR_SUPABASE") &&
      !key.includes("YOUR_SUPABASE") &&
      url.startsWith("http")
  );
}

export function getBrowserClient(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !isBrowserSupabaseConfigured()) {
    return null;
  }
  _client = createClient(url, key);
  return _client;
}

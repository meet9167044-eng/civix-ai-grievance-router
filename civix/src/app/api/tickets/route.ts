// app/api/tickets/route.ts — GET /api/tickets
// Returns all tickets sorted by priority_score desc, created_at desc.
// Supports optional filters: ?status=&category=&severity=

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getFallbackTickets } from "@/lib/supabase/fallbackStore";
import type { Ticket, Category, Severity, Status } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as Status | null;
    const category = searchParams.get("category") as Category | null;
    const severity = searchParams.get("severity") as Severity | null;

    const supabase = createServerClient();
    if (supabase) {
      try {
        let query = supabase
          .from("tickets")
          .select("*")
          .order("priority_score", { ascending: false })
          .order("created_at", { ascending: false });

        if (status) query = query.eq("status", status);
        if (category) query = query.eq("category", category);
        if (severity) query = query.eq("severity", severity);

        const { data, error } = await query;
        if (!error && data) {
          return NextResponse.json({ ok: true, data: data as Ticket[] });
        }
        if (error) {
          console.warn("[tickets] Supabase query failed, falling back to local store:", error.message);
        }
      } catch (err) {
        console.warn("[tickets] Supabase query exception, falling back to local store:", (err as Error).message);
      }
    }

    // Fallback store
    const list = getFallbackTickets({ status, category, severity });
    return NextResponse.json({ ok: true, data: list });
  } catch (err) {
    console.error("[tickets] Unexpected error in GET /api/tickets:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error", message: "Failed to fetch tickets." },
      { status: 500 }
    );
  }
}

// app/api/tickets/route.ts — GET /api/tickets
// Returns all tickets sorted by priority_score desc, created_at desc.
// Phase 3 stub — returns empty array until Phase 4 wires up the DB.

import { NextResponse } from "next/server";

export async function GET() {
  // Phase 4 will connect to Supabase here.
  return NextResponse.json({ ok: true, data: [] });
}

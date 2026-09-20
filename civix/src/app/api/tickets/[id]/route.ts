// app/api/tickets/[id]/route.ts — PATCH /api/tickets/:id
// Phase 3 stub — full implementation in Phase 7.

import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Phase 7 will connect to Supabase here.
  return NextResponse.json({ ok: true, id });
}

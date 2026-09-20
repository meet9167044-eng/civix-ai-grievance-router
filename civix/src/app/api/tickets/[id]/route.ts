// app/api/tickets/[id]/route.ts — PATCH /api/tickets/:id
// Updates ticket status or category.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import {
  getFallbackTicketById,
  getFallbackTicketByNo,
  saveFallbackTicket,
} from "@/lib/supabase/fallbackStore";
import type { Ticket, Status, Category } from "@/lib/types";

const PatchSchema = z.object({
  status: z
    .enum(["open", "in_review", "in_progress", "resolved"])
    .optional(),
  category: z
    .enum(["roads", "sanitation", "electrical", "water", "public_spaces", "other"])
    .optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    let ticket: Ticket | null = null;

    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const query = isUuid
          ? supabase.from("tickets").select("*").eq("id", id)
          : supabase.from("tickets").select("*").ilike("ticket_no", id);

        const { data, error } = await query.single();
        if (!error && data) {
          ticket = data as Ticket;
        }
      } catch (err) {
        console.warn("[tickets/id GET] Supabase query exception:", (err as Error).message);
      }
    }

    if (!ticket) {
      ticket = getFallbackTicketById(id) || getFallbackTicketByNo(id) || null;
    }

    if (!ticket) {
      return NextResponse.json(
        { ok: false, error: "not_found", message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: ticket });
  } catch (err) {
    console.error("[tickets/id GET] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error", message: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_json", message: "Malformed JSON body" },
        { status: 400 }
      );
    }
    const parsed = PatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "validation_error", message: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const { status, category } = parsed.data;
    const nowIso = new Date().toISOString();
    const supabase = createServerClient();

    let updatedTicket: Ticket | null = null;

    if (supabase) {
      try {
        const updatePayload: Record<string, unknown> = { updated_at: nowIso };
        if (status) updatePayload.status = status;
        if (category) updatePayload.category = category;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        const query = isUuid
          ? supabase.from("tickets").update(updatePayload).eq("id", id)
          : supabase.from("tickets").update(updatePayload).ilike("ticket_no", id);

        const { data, error } = await query.select().single();

        if (!error && data) {
          updatedTicket = data as Ticket;
        } else {
          console.warn("[tickets/id] Supabase patch failed:", error?.message);
        }
      } catch (err) {
        console.warn("[tickets/id] Supabase patch exception:", (err as Error).message);
      }
    }

    if (!updatedTicket) {
      const existing = getFallbackTicketById(id) || getFallbackTicketByNo(id);
      if (!existing) {
        return NextResponse.json(
          { ok: false, error: "not_found", message: "Ticket not found" },
          { status: 404 }
        );
      }
      updatedTicket = {
        ...existing,
        ...(status ? { status: status as Status } : {}),
        ...(category ? { category: category as Category } : {}),
        updated_at: nowIso,
      };
    }

    if (!updatedTicket) {
      return NextResponse.json(
        { ok: false, error: "not_found", message: "Ticket not found" },
        { status: 404 }
      );
    }

    saveFallbackTicket(updatedTicket);

    return NextResponse.json({ ok: true, data: updatedTicket });
  } catch (err) {
    console.error("[tickets/id] Unexpected error in PATCH:", err);
    return NextResponse.json(
      { ok: false, error: "internal_error", message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

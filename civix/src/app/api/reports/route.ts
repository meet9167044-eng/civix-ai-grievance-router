// app/api/reports/route.ts — POST /api/reports
// Accepts multipart form: image, description, lat, lng, [category_hint], [address_text]
// Classifies with AI, deduplicates (Phase 5), persists (Phase 4), returns ticket.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { classifyImage } from "@/lib/ai/classify";
import { findDuplicateTicket } from "@/lib/ai/dedupe";
import { getDepartment } from "@/lib/departments";
import { computePriority } from "@/lib/priority";
import { isNearSensitiveSite } from "@/data/pois";
import { createServerClient } from "@/lib/supabase/server";
import {
  getFallbackTicketsCount,
  saveFallbackTicket,
  saveFallbackReport,
} from "@/lib/supabase/fallbackStore";
import type { ApiReportResponse, ApiErrorResponse, Ticket, Report, Severity, Category } from "@/lib/types";

// ── Simple in-memory rate limiter (per IP, 10 req / 60s) ─────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

// ── Severity comparison helper ───────────────────────────────────────────────
const SEVERITY_ORDER: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function getHigherSeverity(s1: Severity, s2: Severity): Severity {
  return (SEVERITY_ORDER[s1] ?? 1) >= (SEVERITY_ORDER[s2] ?? 1) ? s1 : s2;
}

// ── Body validation schema ────────────────────────────────────────────────────
const BodySchema = z.object({
  description: z.string().max(500).default(""),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  category_hint: z.string().optional(),
  address_text: z.string().max(200).optional(),
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest): Promise<NextResponse<ApiReportResponse | ApiErrorResponse>> {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many requests. Please wait a minute." },
      { status: 429 }
    );
  }

  // Parse multipart
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "bad_request", message: "Invalid form data." },
      { status: 400 }
    );
  }

  // Validate image
  const imageFile = formData.get("image") as File | null;
  if (!imageFile || typeof imageFile === "string") {
    return NextResponse.json(
      { ok: false, error: "missing_image", message: "An image is required." },
      { status: 400 }
    );
  }
  if (!ALLOWED_MIME.includes(imageFile.type)) {
    return NextResponse.json(
      { ok: false, error: "invalid_mime", message: "Only JPEG, PNG, or WebP images are accepted." },
      { status: 400 }
    );
  }
  if (imageFile.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "image_too_large", message: "Image must be under 5 MB." },
      { status: 400 }
    );
  }

  // Validate body fields
  const rawBody = {
    description: formData.get("description") ?? "",
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    category_hint: formData.get("category_hint") ?? undefined,
    address_text: formData.get("address_text") ?? undefined,
  };
  const bodyResult = BodySchema.safeParse(rawBody);
  if (!bodyResult.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_error",
        message: bodyResult.error.issues.map((i) => i.message).join(", "),
      },
      { status: 400 }
    );
  }
  const { description, lat, lng, address_text, category_hint } = bodyResult.data;

  // Convert image to base64 & buffer
  const arrayBuffer = await imageFile.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  const imageBase64 = imageBuffer.toString("base64");

  // AI classification
  const classification = await classifyImage({
    imageBase64,
    mimeType: imageFile.type,
    description,
    lat,
    lng,
    categoryHint: category_hint && category_hint !== "auto" ? (category_hint as Category) : undefined,
  });

  // Not a civic issue
  if (!classification.is_civic_issue) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_civic_issue",
        message:
          "This photo doesn't appear to show a public infrastructure or sanitation issue.",
      },
      { status: 422 }
    );
  }

  const department = getDepartment(classification.category);
  const supabase = createServerClient();

  // ── 1. Image Storage (Supabase with data URL fallback) ─────────────────────
  let imageUrl: string | null = null;
  const imageId = crypto.randomUUID();
  const storagePath = `reports/${imageId}.jpg`;

  if (supabase) {
    try {
      const { error: uploadError } = await supabase.storage
        .from("civix-images")
        .upload(storagePath, imageBuffer, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("civix-images")
          .getPublicUrl(storagePath);
        imageUrl = publicUrlData.publicUrl;
      } else {
        console.warn("[reports] Supabase storage upload failed, using data URL fallback:", uploadError.message);
        imageUrl = `data:${imageFile.type};base64,${imageBase64}`;
      }
    } catch (err) {
      console.warn("[reports] Supabase storage upload exception, using data URL fallback:", (err as Error).message);
      imageUrl = `data:${imageFile.type};base64,${imageBase64}`;
    }
  } else {
    imageUrl = `data:${imageFile.type};base64,${imageBase64}`;
  }

  const nowIso = new Date().toISOString();

  // ── 2. Phase 5: Duplicate Detection ─────────────────────────────────────────
  const dedupeResult = await findDuplicateTicket({
    category: classification.category,
    lat,
    lng,
    visual_signature: classification.visual_signature,
    description,
  });

  if (dedupeResult.isDuplicate && dedupeResult.duplicateTicket) {
    const existing = dedupeResult.duplicateTicket;
    const previousPriorityScore = existing.priority_score;
    const newReportsCount = existing.reports_count + 1;
    const mergedSeverity = getHigherSeverity(existing.severity, classification.severity);
    const isNearSite = existing.near_sensitive_site || isNearSensitiveSite(lat, lng);
    const newPriorityScore = computePriority(mergedSeverity, newReportsCount, isNearSite);

    const reportRecord: Report = {
      id: crypto.randomUUID(),
      ticket_id: existing.id,
      reporter_label: `Citizen #${newReportsCount}`,
      description: description || null,
      image_url: imageUrl,
      lat,
      lng,
      created_at: nowIso,
    };

    if (supabase) {
      try {
        const { error: updateError } = await supabase
          .from("tickets")
          .update({
            reports_count: newReportsCount,
            severity: mergedSeverity,
            priority_score: newPriorityScore,
            near_sensitive_site: isNearSite,
            updated_at: nowIso,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.warn("[reports] Supabase update ticket error on merge:", updateError.message);
        }

        const { error: reportInsertError } = await supabase
          .from("reports")
          .insert([
            {
              id: reportRecord.id,
              ticket_id: reportRecord.ticket_id,
              reporter_label: reportRecord.reporter_label,
              description: reportRecord.description,
              image_url: reportRecord.image_url,
              lat: reportRecord.lat,
              lng: reportRecord.lng,
              created_at: reportRecord.created_at,
            },
          ]);
        if (reportInsertError) {
          console.warn("[reports] Supabase report insert error on merge:", reportInsertError.message);
        }
      } catch (err) {
        console.warn("[reports] Supabase merge exception:", (err as Error).message);
      }
    }

    const updatedTicket: Ticket = {
      ...existing,
      reports_count: newReportsCount,
      severity: mergedSeverity,
      priority_score: newPriorityScore,
      near_sensitive_site: isNearSite,
      updated_at: nowIso,
    };

    saveFallbackTicket(updatedTicket);
    saveFallbackReport(reportRecord);

    console.info(
      `[reports] Merged into ticket ${existing.ticket_no} (new count: ${newReportsCount}, priority: ${previousPriorityScore} -> ${newPriorityScore})`
    );

    return NextResponse.json({
      ok: true,
      merged: true,
      previous_priority_score: previousPriorityScore,
      data: updatedTicket,
    });
  }

  // ── 3. New Ticket Creation (Not a duplicate) ────────────────────────────────
  const isNearSite = isNearSensitiveSite(lat, lng);
  const priority_score = computePriority(classification.severity, 1, isNearSite);

  let existingCount = 0;
  if (supabase) {
    try {
      const { count: dbCount, error: countError } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true });
      if (!countError && typeof dbCount === "number") {
        existingCount = dbCount;
      } else {
        existingCount = getFallbackTicketsCount();
      }
    } catch {
      existingCount = getFallbackTicketsCount();
    }
  } else {
    existingCount = getFallbackTicketsCount();
  }

  const ticket_no = `CVX-${1000 + existingCount + 1}`;
  const newTicketId = crypto.randomUUID();

  const ticketRecord: Ticket = {
    id: newTicketId,
    ticket_no,
    title: classification.title,
    formal_description: classification.formal_description,
    category: classification.category,
    department,
    severity: classification.severity,
    severity_reason: classification.severity_reason,
    priority_score,
    status: "open",
    lat,
    lng,
    image_url: imageUrl,
    visual_signature: classification.visual_signature,
    ai_confidence: classification.confidence,
    reports_count: 1,
    near_sensitive_site: isNearSite,
    address_text: address_text ?? null,
    status_history: [{ status: "open", at: nowIso }],
    is_seed: false,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const reportRecord: Report = {
    id: crypto.randomUUID(),
    ticket_id: newTicketId,
    reporter_label: "Citizen #1",
    description: description || null,
    image_url: imageUrl,
    lat,
    lng,
    created_at: nowIso,
  };

  if (supabase) {
    try {
      const { error: ticketError } = await supabase.from("tickets").insert([
        {
          id: ticketRecord.id,
          ticket_no: ticketRecord.ticket_no,
          title: ticketRecord.title,
          formal_description: ticketRecord.formal_description,
          category: ticketRecord.category,
          department: ticketRecord.department,
          severity: ticketRecord.severity,
          severity_reason: ticketRecord.severity_reason,
          priority_score: ticketRecord.priority_score,
          status: ticketRecord.status,
          lat: ticketRecord.lat,
          lng: ticketRecord.lng,
          image_url: ticketRecord.image_url,
          visual_signature: ticketRecord.visual_signature,
          ai_confidence: ticketRecord.ai_confidence,
          reports_count: ticketRecord.reports_count,
          near_sensitive_site: ticketRecord.near_sensitive_site,
          address_text: ticketRecord.address_text,
          status_history: ticketRecord.status_history,
          is_seed: ticketRecord.is_seed,
          created_at: ticketRecord.created_at,
          updated_at: ticketRecord.updated_at,
        },
      ]);

      if (ticketError) {
        console.warn("[reports] Supabase ticket insert failed, keeping in fallback store:", ticketError.message);
      } else {
        const { error: reportError } = await supabase.from("reports").insert([
          {
            id: reportRecord.id,
            ticket_id: reportRecord.ticket_id,
            reporter_label: reportRecord.reporter_label,
            description: reportRecord.description,
            image_url: reportRecord.image_url,
            lat: reportRecord.lat,
            lng: reportRecord.lng,
            created_at: reportRecord.created_at,
          },
        ]);
        if (reportError) {
          console.warn("[reports] Supabase report insert failed:", reportError.message);
        }
      }
    } catch (err) {
      console.warn("[reports] Supabase insert exception:", (err as Error).message);
    }
  }

  saveFallbackTicket(ticketRecord);
  saveFallbackReport(reportRecord);

  return NextResponse.json({ ok: true, merged: false, data: ticketRecord });
}

// app/api/reports/route.ts — POST /api/reports
// Accepts multipart form: image, description, lat, lng, [category_hint], [address_text]
// Classifies with AI, deduplicates (Phase 5), persists (Phase 4), returns ticket.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { classifyImage } from "@/lib/ai/classify";
import { getDepartment } from "@/lib/departments";
import type { ApiReportResponse, ApiErrorResponse } from "@/lib/types";

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
  const { description, lat, lng, address_text } = bodyResult.data;

  // Convert image to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const imageBase64 = Buffer.from(arrayBuffer).toString("base64");

  // AI classification
  const classification = await classifyImage({
    imageBase64,
    mimeType: imageFile.type,
    description,
    lat,
    lng,
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

  // ── Phase 4: DB persistence (stub until Phase 4) ──────────────────────────
  // For Phase 3, return a mock ticket so the UI can render.
  const mockTicket = {
    id: crypto.randomUUID(),
    ticket_no: `CVX-${new Date().getFullYear()}-${1000 + Math.floor(Math.random() * 900)}`,
    title: classification.title,
    formal_description: classification.formal_description,
    category: classification.category,
    department,
    severity: classification.severity,
    severity_reason: classification.severity_reason,
    priority_score: 50,
    status: "open" as const,
    lat,
    lng,
    image_url: null,
    visual_signature: classification.visual_signature,
    ai_confidence: classification.confidence,
    reports_count: 1,
    near_sensitive_site: false,
    address_text: address_text ?? null,
    status_history: [{ status: "open" as const, at: new Date().toISOString() }],
    is_seed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return NextResponse.json({ ok: true, merged: false, data: mockTicket });
}

// lib/ai/dedupe.ts — duplicate detection pipeline (Phase 5)
// Identifies if an incoming grievance matches an existing open ticket.

import { GoogleGenAI } from "@google/genai";
import { DEDUPE_PROMPT } from "./prompts";
import { bbox, haversineMeters } from "@/lib/geo";
import { createServerClient } from "@/lib/supabase/server";
import { getFallbackTickets } from "@/lib/supabase/fallbackStore";
import type { Category, Ticket } from "@/lib/types";

export interface FindDuplicateParams {
  category: Category;
  lat: number;
  lng: number;
  visual_signature?: string | null;
  description?: string | null;
}

export interface DuplicateResult {
  isDuplicate: boolean;
  duplicateTicket: Ticket | null;
  confidence: number;
  matchMethod: "ai" | "geo_fallback" | "none";
  reason?: string;
}

export async function findDuplicateTicket(
  params: FindDuplicateParams
): Promise<DuplicateResult> {
  const { category, lat, lng, visual_signature, description } = params;

  // 1. Calculate bounding box for 100 meters
  const { minLat, maxLat, minLng, maxLng } = bbox(lat, lng, 100);

  let rawCandidates: Ticket[] = [];
  const supabase = createServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .neq("status", "resolved")
        .eq("category", category)
        .gte("lat", minLat)
        .lte("lat", maxLat)
        .gte("lng", minLng)
        .lte("lng", maxLng);

      if (!error && data) {
        rawCandidates = data as Ticket[];
      }
    } catch (err) {
      console.warn("[dedupe] Supabase candidate query failed, using local store:", (err as Error).message);
      rawCandidates = getFallbackTickets({ category });
    }
  } else {
    rawCandidates = getFallbackTickets({ category });
  }

  // 2. Filter within 100m using precise haversine distance, nearest first, max 5
  const candidatesWithDistance = rawCandidates
    .filter((t) => t.status !== "resolved")
    .map((ticket) => ({
      ticket,
      distance: haversineMeters({ lat, lng }, { lat: ticket.lat, lng: ticket.lng }),
    }))
    .filter((item) => item.distance <= 100)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (candidatesWithDistance.length === 0) {
    return {
      isDuplicate: false,
      duplicateTicket: null,
      confidence: 0,
      matchMethod: "none",
      reason: "No active same-category ticket found within 100 meters.",
    };
  }

  // 3. Attempt single AI comparison call
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("YOUR_GEMINI")) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

      const candidatesText = candidatesWithDistance
        .map(
          (c, idx) =>
            `Candidate #${idx + 1}:
- ID: ${c.ticket.id}
- Title: ${c.ticket.title}
- Visual Signature: ${c.ticket.visual_signature || "none"}
- Distance: ${Math.round(c.distance)} meters away`
        )
        .join("\n\n");

      const promptText = `${DEDUPE_PROMPT}

New Incoming Report:
- Category: ${category}
- Citizen description: ${description || "none"}
- Visual Signature: ${visual_signature || "none"}
- Coordinates: ${lat}, ${lng}

Existing Candidates:
${candidatesText}

Respond ONLY in JSON format: {"duplicate_of": "<id or null>", "confidence": <number between 0 and 1>}`;

      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(res.text ?? "{}");
      const matchedId = parsed.duplicate_of;
      const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;

      if (matchedId && confidence >= 0.6) {
        const found = candidatesWithDistance.find((c) => c.ticket.id === matchedId);
        if (found) {
          console.info(
            `[dedupe] AI matched duplicate ticket ${found.ticket.ticket_no} (confidence: ${confidence})`
          );
          return {
            isDuplicate: true,
            duplicateTicket: found.ticket,
            confidence,
            matchMethod: "ai",
            reason: `AI matched with ${Math.round(confidence * 100)}% confidence`,
          };
        }
      }

      if (matchedId === null || confidence < 0.6) {
        return {
          isDuplicate: false,
          duplicateTicket: null,
          confidence,
          matchMethod: "ai",
          reason: "AI confirmed different issue.",
        };
      }
    } catch (err) {
      console.warn("[dedupe] AI call failed, falling back to geo rule:", (err as Error).message);
    }
  }

  // 4. Geo-only Fallback per PHASES.md:
  // "If the AI call fails, treat as duplicate when a same-category ticket is within 30 m."
  const nearest = candidatesWithDistance[0];
  if (nearest && nearest.distance <= 30) {
    console.info(
      `[dedupe] Geo fallback matched duplicate ticket ${nearest.ticket.ticket_no} (${Math.round(nearest.distance)}m <= 30m)`
    );
    return {
      isDuplicate: true,
      duplicateTicket: nearest.ticket,
      confidence: 0.85,
      matchMethod: "geo_fallback",
      reason: `Same category issue reported within ${Math.round(nearest.distance)}m`,
    };
  }

  return {
    isDuplicate: false,
    duplicateTicket: null,
    confidence: 0,
    matchMethod: "none",
    reason: "Nearest same-category candidate exceeds 30m fallback threshold.",
  };
}

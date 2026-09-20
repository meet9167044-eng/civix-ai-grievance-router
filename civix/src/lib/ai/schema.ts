// lib/ai/schema.ts — Zod schema for AI classification output
// Severity updated to include "high" per DESIGN.md section 9

import { z } from "zod";
import type { Category, Severity } from "@/lib/types";

export const ClassificationSchema = z.object({
  is_civic_issue: z.boolean(),
  category: z.enum([
    "roads",
    "sanitation",
    "electrical",
    "water",
    "public_spaces",
    "other",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  severity_reason: z.string().max(160),
  confidence: z.number().min(0).max(1),
  title: z.string().max(80),
  formal_description: z.string().max(600),
  visual_signature: z.string().max(160),
  hazard_flags: z.array(z.string()).max(5),
  suggested_action: z.string().max(160),
});

export type Classification = z.infer<typeof ClassificationSchema>;

export function buildFallbackClassification(
  description: string,
  categoryHint?: Category
): Classification {
  const title =
    description.trim().slice(0, 60) || "Citizen-reported civic issue";
  const lower = description.toLowerCase();

  let category: Category = "other";
  if (categoryHint && categoryHint !== "other") {
    category = categoryHint;
  } else if (
    lower.includes("pothole") ||
    lower.includes("road") ||
    lower.includes("footpath") ||
    lower.includes("crater")
  ) {
    category = "roads";
  } else if (
    lower.includes("garbage") ||
    lower.includes("trash") ||
    lower.includes("bin") ||
    lower.includes("dump")
  ) {
    category = "sanitation";
  } else if (
    lower.includes("streetlight") ||
    lower.includes("wire") ||
    lower.includes("electric")
  ) {
    category = "electrical";
  } else if (
    lower.includes("water") ||
    lower.includes("leak") ||
    lower.includes("drain") ||
    lower.includes("pipe")
  ) {
    category = "water";
  } else if (
    lower.includes("park") ||
    lower.includes("tree") ||
    lower.includes("bench")
  ) {
    category = "public_spaces";
  }

  return {
    is_civic_issue: true,
    category,
    severity: "medium" as Severity,
    severity_reason: "Could not auto-classify; default severity applied.",
    confidence: 0,
    title,
    formal_description:
      description.trim() ||
      "Citizen-reported issue pending manual review.",
    visual_signature: title.toLowerCase(),
    hazard_flags: [],
    suggested_action: "Assign to relevant department for manual review.",
  };
}

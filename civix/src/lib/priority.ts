// lib/priority.ts — priority score formula
// Updated with 4-level severity including "high" per DESIGN.md section 9

import type { Severity } from "@/lib/types";

const BASE: Record<Severity, number> = {
  low: 20,
  medium: 40,
  high: 60,
  critical: 80,
} as const;

/**
 * Compute the priority score (0–100) for a ticket.
 * @param severity       AI-assigned severity level
 * @param reportsCount   Total number of reports merged into this ticket
 * @param nearSite       Whether the location is within 200m of a sensitive site
 */
export function computePriority(
  severity: Severity,
  reportsCount: number,
  nearSite: boolean
): number {
  const base = BASE[severity] ?? 20;
  const dupes = Math.min(15, (reportsCount - 1) * 5);
  return Math.min(100, base + dupes + (nearSite ? 10 : 0));
}

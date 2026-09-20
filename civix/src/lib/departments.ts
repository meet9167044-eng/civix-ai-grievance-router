// lib/departments.ts — maps category to the responsible department name

import type { Category } from "@/lib/types";

export const DEPARTMENTS: Record<Category, string> = {
  roads: "Roads & Infrastructure",
  sanitation: "Sanitation & Waste Management",
  electrical: "Electrical & Street Lighting",
  water: "Water & Drainage",
  public_spaces: "Parks & Public Spaces",
  other: "General Administration",
};

export function getDepartment(category: Category): string {
  return DEPARTMENTS[category] ?? "General Administration";
}

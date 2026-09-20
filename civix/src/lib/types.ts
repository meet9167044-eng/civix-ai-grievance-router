// lib/types.ts — shared domain types for Civix

export type Category =
  | "roads"
  | "sanitation"
  | "electrical"
  | "water"
  | "public_spaces"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";

export type Status = "open" | "in_review" | "in_progress" | "resolved";

export interface StatusHistoryEntry {
  status: Status;
  at: string; // ISO timestamp
}

export interface Ticket {
  id: string;
  ticket_no: string;
  title: string;
  formal_description: string;
  category: Category;
  department: string;
  severity: Severity;
  severity_reason: string | null;
  priority_score: number;
  status: Status;
  lat: number;
  lng: number;
  image_url: string | null;
  visual_signature: string | null;
  ai_confidence: number | null;
  reports_count: number;
  near_sensitive_site: boolean;
  address_text: string | null;
  status_history: StatusHistoryEntry[];
  is_seed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  ticket_id: string;
  reporter_label: string;
  description: string | null;
  image_url: string | null;
  lat: number;
  lng: number;
  created_at: string;
}

export interface ReportFormData {
  image: File;
  description: string;
  lat: number;
  lng: number;
  address_text?: string;
  category_hint?: Category | "auto";
}

export interface ApiReportResponse {
  ok: true;
  merged: boolean;
  previous_priority_score?: number;
  data: Ticket;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
  message: string;
}

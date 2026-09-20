// lib/supabase/fallbackStore.ts — in-memory ticket & report store
// Serves as an immediate fallback if Supabase is offline or not yet configured.

import type { Ticket, Report, Category, Severity, Status } from "@/lib/types";

// Global singleton across server invocations in development/production
const globalForStore = globalThis as unknown as {
  _civixTickets: Ticket[] | undefined;
  _civixReports: Report[] | undefined;
};

const tickets: Ticket[] = globalForStore._civixTickets ?? [];
const reports: Report[] = globalForStore._civixReports ?? [];

globalForStore._civixTickets = tickets;
globalForStore._civixReports = reports;

export function getFallbackTicketsCount(): number {
  return tickets.length;
}

export function saveFallbackTicket(ticket: Ticket): void {
  const index = tickets.findIndex((t) => t.id === ticket.id);
  if (index >= 0) {
    tickets[index] = ticket;
  } else {
    tickets.unshift(ticket);
  }
}

export function saveFallbackReport(report: Report): void {
  reports.unshift(report);
}

export function getFallbackTicketById(id: string): Ticket | undefined {
  return tickets.find((t) => t.id === id);
}

export function getFallbackTicketByNo(ticketNo: string): Ticket | undefined {
  return tickets.find((t) => t.ticket_no.toLowerCase() === ticketNo.toLowerCase());
}

export interface TicketFilterOptions {
  status?: Status | null;
  category?: Category | null;
  severity?: Severity | null;
}

export function getFallbackTickets(filters?: TicketFilterOptions): Ticket[] {
  let list = [...tickets];
  if (filters?.status) {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters?.category) {
    list = list.filter((t) => t.category === filters.category);
  }
  if (filters?.severity) {
    list = list.filter((t) => t.severity === filters.severity);
  }
  // Sort by priority_score desc, created_at desc
  list.sort((a, b) => {
    if (b.priority_score !== a.priority_score) {
      return b.priority_score - a.priority_score;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  return list;
}

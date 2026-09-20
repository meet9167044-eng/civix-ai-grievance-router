"use client";
// components/admin/KanbanBoard.tsx — 4-column priority-sorted Kanban board

import { useState } from "react";
import { TicketCard } from "./TicketCard";
import { TicketDrawer } from "./TicketDrawer";
import type { Ticket, Status } from "@/lib/types";

interface KanbanBoardProps {
  tickets: Ticket[];
  loading: boolean;
  onStatusChange: (ticketId: string, newStatus: Status) => Promise<void>;
}

const COLUMNS: { id: Status; label: string; headerColor: string; badgeColor: string }[] = [
  { id: "open", label: "Open", headerColor: "border-blue-500", badgeColor: "bg-blue-100 text-blue-800" },
  { id: "in_review", label: "In Review", headerColor: "border-amber-500", badgeColor: "bg-amber-100 text-amber-800" },
  { id: "in_progress", label: "In Progress", headerColor: "border-purple-500", badgeColor: "bg-purple-100 text-purple-800" },
  { id: "resolved", label: "Resolved", headerColor: "border-emerald-500", badgeColor: "bg-emerald-100 text-emerald-800" },
];

export function KanbanBoard({ tickets, loading, onStatusChange }: KanbanBoardProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Group and sort tickets by priority_score descending
  const columnTickets: Record<Status, Ticket[]> = {
    open: [],
    in_review: [],
    in_progress: [],
    resolved: [],
  };

  tickets.forEach((t) => {
    if (columnTickets[t.status]) {
      columnTickets[t.status].push(t);
    }
  });

  // Sort each column by priority_score desc, then created_at desc
  Object.keys(columnTickets).forEach((key) => {
    const colKey = key as Status;
    columnTickets[colKey].sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  async function handleDrawerStatusChange(ticketId: string, newStatus: Status) {
    await onStatusChange(ticketId, newStatus);
    setSelectedTicket((prev) => (prev && prev.id === ticketId ? { ...prev, status: newStatus } : prev));
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {COLUMNS.map((col) => (
          <div key={col.id} className="bg-gray-100 rounded-xl h-96 p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-28 bg-gray-200 rounded-lg" />
            <div className="h-28 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = columnTickets[col.id];
          return (
            <div
              key={col.id}
              className="bg-gray-50/70 border border-gray-200/60 rounded-2xl p-4 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.headerColor}`}>
                <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                  <span>{col.label}</span>
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {items.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
                {items.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">No tickets in this stage</p>
                  </div>
                ) : (
                  items.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => setSelectedTicket(ticket)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TicketDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleDrawerStatusChange}
      />
    </>
  );
}

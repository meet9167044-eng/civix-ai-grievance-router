"use client";
// components/admin/TicketCard.tsx — Card component for Kanban columns

import { Construction, Trash2, Zap, Droplets, Trees, CircleHelp, Users, Clock } from "lucide-react";
import type { Ticket, Category, Severity } from "@/lib/types";

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  roads: Construction,
  sanitation: Trash2,
  electrical: Zap,
  water: Droplets,
  public_spaces: Trees,
  other: CircleHelp,
};

const SEVERITY_STYLES: Record<Severity, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-600 text-white border-red-700 animate-pulse",
};

function formatAge(isoString: string): string {
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const CategoryIcon = CATEGORY_ICONS[ticket.category] ?? CircleHelp;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group"
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-500 font-mono tracking-tight">
            {ticket.ticket_no}
          </span>
          {ticket.reports_count > 1 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              <Users size={11} />
              {ticket.reports_count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${SEVERITY_STYLES[ticket.severity]}`}>
            {ticket.severity}
          </span>
          <span className="text-xs font-extrabold bg-gray-900 text-white px-2 py-0.5 rounded-full">
            {ticket.priority_score}
          </span>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-ink leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors mb-2">
        {ticket.title}
      </h4>

      {/* Meta bottom */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1 truncate max-w-[150px]">
          <CategoryIcon size={13} className="text-brand-600 flex-shrink-0" />
          <span className="capitalize truncate">{ticket.category.replace("_", " ")}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 text-gray-400">
          <Clock size={11} />
          <span>{formatAge(ticket.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

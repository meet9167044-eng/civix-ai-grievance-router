"use client";
// components/report/ResultCard.tsx — submitted ticket card with merge banner (DESIGN.md 5.3 + 5.4)

import { useState, useEffect } from "react";
import { Construction, Trash2, Zap, Droplets, Trees, CircleHelp, Check, Calendar, MapPin, Tag, Users, Copy, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Ticket } from "@/lib/types";

const CATEGORY_ICONS = {
  roads: Construction,
  sanitation: Trash2,
  electrical: Zap,
  water: Droplets,
  public_spaces: Trees,
  other: CircleHelp,
};

const CATEGORY_LABELS = {
  roads: "Roads & Infrastructure",
  sanitation: "Sanitation & Waste",
  electrical: "Electrical & Lighting",
  water: "Water & Drainage",
  public_spaces: "Parks & Public Spaces",
  other: "Needs Manual Review",
};

const SEVERITY_STYLES = {
  low: "bg-green-50 text-green-700 ring-1 ring-green-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  critical: "bg-red-600 text-white",
};

interface ResultCardProps {
  ticket: Ticket;
  merged: boolean;
  previousPriorityScore?: number;
  onReportAnother: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      aria-label="Copy ticket ID"
      className="p-1.5 rounded-lg hover:bg-brand-100 transition-colors"
    >
      {copied ? <Check size={14} className="text-brand-700" /> : <Copy size={14} className="text-brand-400" />}
    </button>
  );
}

export function ResultCard({ ticket, merged, previousPriorityScore, onReportAnother }: ResultCardProps) {
  const [displayCount, setDisplayCount] = useState(
    merged ? ticket.reports_count - 1 : ticket.reports_count
  );
  const CategoryIcon = CATEGORY_ICONS[ticket.category] ?? CircleHelp;
  const isAiFallback = ticket.ai_confidence === 0;

  // Animate count from N-1 to N for merge moment
  useEffect(() => {
    if (!merged) return;
    const timer = setTimeout(() => setDisplayCount(ticket.reports_count), 300);
    return () => clearTimeout(timer);
  }, [merged, ticket.reports_count]);

  const formattedDate = new Date(ticket.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-[480px] mx-auto w-full">
      {/* Merge banner */}
      {merged && (
        <div className="bg-brand-50 border border-brand-200 rounded-[var(--radius-card)] p-4 mb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-ink">This issue was already reported nearby.</p>
            <p className="text-sm text-gray-600 mt-0.5">We added your report to it, so it gets attention faster.</p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className={`bg-brand-700 text-white text-sm font-bold px-3 py-1 rounded-full pulse-ring`}>
              Reported by{" "}
              <span className="text-lg tabular-nums">{displayCount}</span>{" "}
              {displayCount === 1 ? "person" : "people"}
            </div>
            {previousPriorityScore !== undefined && (
              <div className="text-xs text-brand-700 font-semibold">
                Priority {previousPriorityScore} → {ticket.priority_score} ↑
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-black/5 p-6">
        {/* Success check */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-brand-700 flex items-center justify-center mb-4 scale-in-once">
            <Check size={36} className="text-white stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold text-ink">Your report has been submitted!</h2>
          <p className="text-gray-600 text-sm mt-1">Thank you for making your city better.</p>
        </div>

        {/* Ticket ID box */}
        <div className="bg-brand-50 rounded-[var(--radius-control)] p-4 flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-0.5">Ticket ID</p>
            <p className="text-xl font-bold text-brand-700 tracking-wide">{ticket.ticket_no}</p>
          </div>
          <CopyButton text={ticket.ticket_no} />
        </div>

        {/* Detail rows */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-500">Submitted on</span>
            <span className="text-ink font-medium ml-auto">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-500">Location</span>
            <span className="text-ink font-medium ml-auto text-right truncate max-w-[180px]">
              {ticket.address_text || `${ticket.lat.toFixed(4)}, ${ticket.lng.toFixed(4)}`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Tag size={16} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-500">Category</span>
            <span className="text-ink font-medium ml-auto flex items-center gap-1">
              <CategoryIcon size={14} />
              {CATEGORY_LABELS[ticket.category]}
              {isAiFallback ? "" : " (Auto-detected)"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="w-4 h-4 flex-shrink-0" />
            <span className="text-gray-500">Priority</span>
            <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${SEVERITY_STYLES[ticket.severity]}`}>
              {ticket.severity.charAt(0).toUpperCase() + ticket.severity.slice(1)}
            </span>
          </div>
        </div>

        {isAiFallback && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
            We couldn&apos;t classify this automatically. A staff member will review it.
          </p>
        )}

        {/* Actions */}
        <Link
          href={`/track/${ticket.ticket_no}`}
          className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-control)] border border-brand-600 text-brand-700 font-semibold hover:bg-brand-50 transition-colors w-full mb-3"
        >
          View Ticket
          <ArrowRight size={16} />
        </Link>
        <p className="text-xs text-gray-400 text-center mb-2">
          Track your report anytime from your dashboard.
        </p>
        <button
          onClick={onReportAnother}
          className="text-sm text-brand-700 font-semibold hover:text-brand-800 transition-colors w-full text-center"
        >
          Report another issue
        </button>
      </div>
    </div>
  );
}

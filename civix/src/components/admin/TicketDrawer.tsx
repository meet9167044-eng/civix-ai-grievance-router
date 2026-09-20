"use client";
// components/admin/TicketDrawer.tsx — Details drawer for inspecting and managing a ticket

import { useState } from "react";
import { X, MapPin, Tag, ShieldAlert, Users, Building, Calendar, ExternalLink, Loader2 } from "lucide-react";
import type { Ticket, Status } from "@/lib/types";

interface TicketDrawerProps {
  ticket: Ticket | null;
  onClose: () => void;
  onStatusChange: (ticketId: string, newStatus: Status) => Promise<void>;
}

const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "in_review", label: "In Review", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "in_progress", label: "In Progress", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { value: "resolved", label: "Resolved", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
];

export function TicketDrawer({ ticket, onClose, onStatusChange }: TicketDrawerProps) {
  const [updating, setUpdating] = useState(false);

  if (!ticket) return null;

  async function handleStatusSelect(newStatus: Status) {
    if (!ticket || ticket.status === newStatus || updating) return;
    setUpdating(true);
    try {
      await onStatusChange(ticket.id, newStatus);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-surface">
          <div>
            <span className="text-xs font-mono font-bold text-gray-400">
              TICKET #{ticket.ticket_no}
            </span>
            <h3 className="text-lg font-bold text-ink leading-tight mt-0.5">
              Ticket Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-ink hover:bg-gray-100 transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Dropdown */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Ticket Status
              </p>
              <div className="relative inline-block">
                <select
                  value={ticket.status}
                  disabled={updating}
                  onChange={(e) => handleStatusSelect(e.target.value as Status)}
                  className="font-bold text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-ink shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {updating && (
              <div className="flex items-center gap-1.5 text-xs text-brand-700 font-semibold">
                <Loader2 size={14} className="animate-spin" />
                Updating...
              </div>
            )}
            <div className="text-right">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Priority Score
              </span>
              <span className="text-2xl font-black text-brand-700 font-mono">
                {ticket.priority_score}
                <span className="text-xs font-normal text-gray-400">/100</span>
              </span>
            </div>
          </div>

          {/* Photo */}
          {ticket.image_url && (
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.image_url}
                alt={ticket.title}
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-2">{ticket.title}</h2>
            <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 text-sm text-gray-700 leading-relaxed font-sans">
              <p className="text-xs font-bold text-brand-800 uppercase tracking-wider mb-1">
                Work-Order Description (AI-Generated)
              </p>
              {ticket.formal_description}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Building size={14} className="text-brand-600" />
                <span className="text-xs font-medium">Department</span>
              </div>
              <p className="font-semibold text-ink text-xs md:text-sm truncate">{ticket.department}</p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Users size={14} className="text-brand-600" />
                <span className="text-xs font-medium">Citizen Reports</span>
              </div>
              <p className="font-bold text-ink text-sm">
                {ticket.reports_count} {ticket.reports_count === 1 ? "person" : "people"}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Tag size={14} className="text-brand-600" />
                <span className="text-xs font-medium">Category</span>
              </div>
              <p className="font-semibold text-ink text-sm capitalize">{ticket.category.replace("_", " ")}</p>
            </div>

            <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <ShieldAlert size={14} className="text-brand-600" />
                <span className="text-xs font-medium">Severity</span>
              </div>
              <p className="font-bold text-ink text-sm capitalize">{ticket.severity}</p>
            </div>
          </div>

          {/* Severity Reason */}
          {ticket.severity_reason && (
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Severity Reason:</span> {ticket.severity_reason}
            </div>
          )}

          {/* Location */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={14} className="text-brand-600" />
              <span className="font-medium text-ink">
                {ticket.address_text || `${ticket.lat.toFixed(5)}, ${ticket.lng.toFixed(5)}`}
              </span>
            </div>
            <p className="text-gray-400 pl-5">
              Coordinates: {ticket.lat.toFixed(5)}, {ticket.lng.toFixed(5)}
              {ticket.near_sensitive_site && (
                <span className="ml-2 font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Near Sensitive Site (+10)
                </span>
              )}
            </p>
          </div>

          {/* Created date */}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-gray-100">
            <Calendar size={13} />
            <span>Created on {new Date(ticket.created_at).toLocaleString("en-IN")}</span>
            <a
              href={`/track/${ticket.ticket_no}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-brand-700 font-semibold hover:underline"
            >
              Public tracking link <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

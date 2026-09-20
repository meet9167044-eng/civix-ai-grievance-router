"use client";
// app/track/[ticketNo]/page.tsx — Public interactive citizen ticket tracking page

import { useEffect, useState, use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Check,
  Sparkles,
  Share2,
  RefreshCw,
  Construction,
  Trash2,
  Zap,
  Droplets,
  Trees,
  CircleHelp,
} from "lucide-react";
import type { Ticket, Status, Category, Severity } from "@/lib/types";

// Dynamic map import (ssr: false)
const TrackMap = dynamic(() => import("@/components/report/TrackMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[260px] bg-gray-100 rounded-2xl animate-pulse" />,
});

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ size?: number; className?: string }>> = {
  roads: Construction,
  sanitation: Trash2,
  electrical: Zap,
  water: Droplets,
  public_spaces: Trees,
  other: CircleHelp,
};

const CATEGORY_LABELS: Record<Category, string> = {
  roads: "Roads & Infrastructure",
  sanitation: "Sanitation & Waste",
  electrical: "Electrical & Lighting",
  water: "Water & Drainage",
  public_spaces: "Parks & Public Spaces",
  other: "Manual Review Required",
};

const STATUS_STEPS: { id: Status; label: string; desc: string }[] = [
  { id: "open", label: "Ticket Logged", desc: "Report received & verified" },
  { id: "in_review", label: "Under Review", desc: "Department inspection underway" },
  { id: "in_progress", label: "Crew Dispatched", desc: "Active field remediation" },
  { id: "resolved", label: "Issue Resolved", desc: "Work completed & closed" },
];

const SEVERITY_BADGES: Record<Severity, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", text: "text-emerald-700", label: "Low Priority" },
  medium: { bg: "bg-amber-50 border-amber-200 text-amber-700", text: "text-amber-700", label: "Medium Priority" },
  high: { bg: "bg-orange-50 border-orange-200 text-orange-700", text: "text-orange-700", label: "High Priority" },
  critical: { bg: "bg-rose-50 border-rose-200 text-rose-700", text: "text-rose-700", label: "Critical Safety Risk" },
};

export default function TrackPage({
  params,
}: {
  params: Promise<{ ticketNo: string }>;
}) {
  const resolvedParams = use(params);
  const ticketNo = resolvedParams.ticketNo;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadTicket() {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/tickets/${ticketNo}`);
      const json = await res.json();
      if (json.ok && json.data) {
        setTicket(json.data);
        setError(null);
      } else {
        setError(json.message || "Ticket not found");
      }
    } catch {
      setError("Failed to fetch ticket status. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function fetchTicketData() {
      try {
        const res = await fetch(`/api/tickets/${ticketNo}`);
        const json = await res.json();
        if (!active) return;
        if (json.ok && json.data) {
          setTicket(json.data);
          setError(null);
        } else {
          setError(json.message || "Ticket not found");
        }
      } catch {
        if (active) setError("Failed to fetch ticket status. Check your connection.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchTicketData();
    return () => {
      active = false;
    };
  }, [ticketNo]);

  function copyLink() {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const getStepIndex = (s: Status) => {
    switch (s) {
      case "open": return 0;
      case "in_review": return 1;
      case "in_progress": return 2;
      case "resolved": return 3;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Retrieving live municipal record for {ticketNo}…</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-surface py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">Ticket Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">
            We couldn&apos;t find a record for <span className="font-mono font-bold text-ink">{ticketNo}</span>. Please verify the ticket code or submit a new report.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back Home
            </Link>
            <Link
              href="/report"
              className="px-5 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 shadow-xs"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const CategoryIcon = CATEGORY_ICONS[ticket.category] || CircleHelp;
  const currentStepIdx = getStepIndex(ticket.status);
  const severityBadge = SEVERITY_BADGES[ticket.severity] || SEVERITY_BADGES.medium;

  return (
    <div className="min-h-screen bg-surface py-8 md:py-12">
      <div className="max-w-[880px] mx-auto px-4 md:px-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadTicket()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
              {copied ? "Link Copied!" : "Share Link"}
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xs mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 border border-brand-200 tracking-wider">
                  {ticket.ticket_no}
                </span>
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${severityBadge.bg}`}>
                  {severityBadge.label}
                </span>
                {ticket.near_sensitive_site && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    🏫 Near School / Hospital
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-black text-ink tracking-tight">
                {ticket.title}
              </h1>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400 font-medium">Priority Score</div>
              <div className="text-2xl md:text-3xl font-black text-brand-800 font-mono">
                {ticket.priority_score}<span className="text-sm text-gray-400 font-normal">/100</span>
              </div>
            </div>
          </div>

          {/* Community Endorsement Banner */}
          {ticket.reports_count > 1 && (
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Community Escalation Active: Reported by {ticket.reports_count} Citizens
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Our spatial AI deduplicator grouped repeated neighbor reports for this exact issue, boosting municipal priority.
                </p>
              </div>
            </div>
          )}

          {/* Progress Timeline Stepper */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATUS_STEPS.map((st, i) => {
                const isPassed = currentStepIdx > i;
                const isCurrent = currentStepIdx === i;
                return (
                  <div key={st.id} className="relative">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isPassed
                            ? "bg-brand-700 text-white"
                            : isCurrent
                            ? "bg-brand-600 text-white ring-4 ring-brand-100"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isPassed ? <Check size={14} /> : i + 1}
                      </div>
                      <span
                        className={`text-xs font-bold tracking-tight ${
                          isCurrent
                            ? "text-brand-800"
                            : isPassed
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 pl-9 leading-relaxed">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Content: Verification Proof & Location Map */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Column: Image & AI Work-Order Text */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-600" />
              AI Triage &amp; Work-Order Analysis
            </h2>

            {/* Photo preview */}
            {ticket.image_url && (
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 aspect-video bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ticket.image_url}
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Structured description */}
            <div className="bg-gray-50/70 rounded-2xl p-4 text-xs text-gray-700 leading-relaxed space-y-2 border border-gray-100">
              <div className="font-semibold text-gray-900">Department Work Order:</div>
              <p>{ticket.formal_description}</p>
            </div>

            {/* Department info */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <CategoryIcon size={14} className="text-brand-600" />
                {CATEGORY_LABELS[ticket.category]}
              </span>
              <span className="font-mono text-gray-400">
                {new Date(ticket.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Right Column: Location & Live Map */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <MapPin size={16} className="text-brand-600" />
              Geographic Location
            </h2>

            <div className="text-xs text-gray-600 flex items-center gap-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <MapPin size={14} className="text-rose-500 flex-shrink-0" />
              <span className="font-medium truncate">
                {ticket.address_text || `${ticket.lat.toFixed(4)}, ${ticket.lng.toFixed(4)}`}
              </span>
            </div>

            <TrackMap
              lat={ticket.lat}
              lng={ticket.lng}
              ticketNo={ticket.ticket_no}
              severity={ticket.severity}
            />

            <div className="bg-brand-50/60 rounded-2xl p-4 border border-brand-100 text-xs text-brand-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Clock size={13} />
                Municipal SLA Estimate:
              </div>
              <p className="text-[11px] text-brand-700">
                Target resolution within {ticket.severity === "critical" ? "24 hours" : "48 hours"}. Assigned to Ward field division.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <div>
            <p className="text-sm font-bold text-ink">Have more information or an update?</p>
            <p className="text-xs text-gray-500">Neighbors reporting from nearby are automatically merged into this ticket.</p>
          </div>
          <Link
            href="/report"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-all text-center shadow-xs"
          >
            Report Another Issue
          </Link>
        </div>
      </div>
    </div>
  );
}

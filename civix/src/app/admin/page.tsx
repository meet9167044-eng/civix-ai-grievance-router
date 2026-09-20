"use client";
// app/admin/page.tsx — Admin console with Kanban Board, Map View, filters, and real-time polling

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  LayoutDashboard,
  Map as MapIcon,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListFilter,
  ArrowLeft,
} from "lucide-react";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import { TicketDrawer } from "@/components/admin/TicketDrawer";
import type { Ticket, Status, Category, Severity } from "@/lib/types";

// Dynamic import for Leaflet map component with ssr: false
const AdminMapView = dynamic(
  () => import("@/components/admin/AdminMapView"),
  { ssr: false, loading: () => <div className="h-[600px] w-full bg-gray-100 rounded-2xl animate-pulse" /> }
);

const CATEGORY_CHIPS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "roads", label: "Roads" },
  { id: "sanitation", label: "Sanitation" },
  { id: "electrical", label: "Electrical" },
  { id: "water", label: "Water" },
  { id: "public_spaces", label: "Parks" },
  { id: "other", label: "Other" },
];

const SEVERITY_CHIPS: { id: Severity | "all"; label: string }[] = [
  { id: "all", label: "All Severities" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"board" | "map">("board");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [selectedMapTicket, setSelectedMapTicket] = useState<Ticket | null>(null);

  const fetchTickets = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/tickets");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setTickets(json.data);
      }
    } catch (err) {
      console.error("[admin] Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-refresh every 10 seconds (Phase 7 rule)
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/tickets");
        const json = await res.json();
        if (active && json.ok && Array.isArray(json.data)) {
          setTickets(json.data);
        }
      } catch (err) {
        console.error("[admin] Failed to load tickets:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();

    const interval = setInterval(() => {
      void fetchTickets(false);
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [fetchTickets]);

  // Handle optimistic status change
  async function handleStatusChange(ticketId: string, newStatus: Status) {
    // 1. Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    // 2. Call API
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error("[admin] Failed to update ticket status");
        fetchTickets();
      }
    } catch {
      fetchTickets();
    }
  }

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (severityFilter !== "all" && t.severity !== severityFilter) return false;
    return true;
  });

  // KPI stats
  const totalCount = tickets.length;
  const criticalCount = tickets.filter((t) => t.severity === "critical" || t.severity === "high").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress" || t.status === "in_review").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Citizen Portal</span>
          </Link>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="font-bold text-ink text-base md:text-lg">
              Civix <span className="font-normal text-gray-500">Municipal Console</span>
            </h1>
          </div>
        </div>

        {/* Tab switcher & refresh */}
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setTab("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                tab === "board"
                  ? "bg-white text-ink shadow-xs"
                  : "text-gray-500 hover:text-ink"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setTab("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                tab === "map"
                  ? "bg-white text-ink shadow-xs"
                  : "text-gray-500 hover:text-ink"
              }`}
            >
              <MapIcon size={14} />
              <span>Map View</span>
            </button>
          </div>

          <button
            onClick={() => fetchTickets(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
            title="Refresh tickets"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-brand-600" : ""} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                #
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-ink font-mono">{totalCount}</div>
            <div className="text-[11px] text-gray-400 mt-1">All tickets in system</div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Critical / High</span>
              <AlertTriangle size={18} />
            </div>
            <div className="text-2xl md:text-3xl font-black text-amber-600 font-mono">{criticalCount}</div>
            <div className="text-[11px] text-gray-400 mt-1">Priority score &gt; 60</div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
              <Clock size={18} />
            </div>
            <div className="text-2xl md:text-3xl font-black text-purple-600 font-mono">{inProgressCount}</div>
            <div className="text-[11px] text-gray-400 mt-1">Active field operations</div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 size={18} />
            </div>
            <div className="text-2xl md:text-3xl font-black text-emerald-600 font-mono">{resolvedCount}</div>
            <div className="text-[11px] text-gray-400 mt-1">Successfully closed</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider pr-2 border-r border-gray-200">
            <ListFilter size={14} />
            <span>Filters</span>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setCategoryFilter(chip.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  categoryFilter === chip.id
                    ? "bg-brand-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-200 hidden md:block" />

          {/* Severity Chips */}
          <div className="flex flex-wrap gap-1.5">
            {SEVERITY_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSeverityFilter(chip.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  severityFilter === chip.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {tab === "board" ? (
          <KanbanBoard
            tickets={filteredTickets}
            loading={loading}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
            <AdminMapView
              tickets={filteredTickets}
              onSelectTicket={(t) => setSelectedMapTicket(t)}
            />
          </div>
        )}
      </main>

      {/* Map Drawer */}
      <TicketDrawer
        ticket={selectedMapTicket}
        onClose={() => setSelectedMapTicket(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

// app/admin/page.tsx — Admin dashboard (full implementation in Phase 7)

import Link from "next/link";
import { LayoutDashboard, Ticket, Map } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-brand-950 text-white flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-brand-300">⬡</span>
            Civix
          </div>
        </div>
        <nav className="p-3 flex-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: true },
            { icon: Ticket, label: "All Tickets", href: "/admin/tickets", active: false },
            { icon: Map, label: "Map View", href: "/admin/map", active: false },
          ].map(({ icon: Icon, label, href, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-11 px-3 rounded-lg mb-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 justify-between">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Municipal Portal</span>
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 bg-surface p-6">
          <h1 className="text-2xl font-bold text-ink mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Overview of civic reports and their status.</p>
          <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-black/5 p-8 text-center">
            <p className="text-gray-500">Dashboard with stats, Kanban and map will be built in Phases 7 &amp; 8.</p>
            <Link
              href="/admin/tickets"
              className="inline-flex items-center gap-2 mt-4 h-11 px-5 rounded-[var(--radius-control)] bg-brand-700 text-white font-semibold hover:bg-brand-800 transition-colors"
            >
              <Ticket size={18} />
              View All Tickets
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

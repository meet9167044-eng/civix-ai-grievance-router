// app/track/[ticketNo]/page.tsx — Ticket tracking page stub (Phase 8)

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ ticketNo: string }>;
}) {
  const { ticketNo } = await params;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-ink mb-2">Track Your Report</h1>
        <p className="text-gray-600 mb-8">
          Here&apos;s the latest update on your ticket.
        </p>
        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-black/5 p-8 text-center">
          <p className="text-brand-700 font-bold text-lg mb-2">{ticketNo}</p>
          <p className="text-gray-500">Full ticket tracking view coming in Phase 8.</p>
        </div>
      </div>
    </div>
  );
}

// app/page.tsx — Civix landing page

import Link from "next/link";
import { Zap, Target, Landmark, BarChart3, Play, ArrowRight, Leaf, LayoutDashboard } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Quick Reporting",
    sub: "Report in under a minute",
  },
  {
    icon: Target,
    title: "AI-Powered",
    sub: "Automatic classification",
  },
  {
    icon: Landmark,
    title: "Right Department",
    sub: "Routed to the right team",
  },
  {
    icon: BarChart3,
    title: "Transparent",
    sub: "Track progress in real time",
  },
];

const steps = [
  {
    n: "01",
    title: "Snap and describe",
    desc: "Take a photo and add a voice note or text description of the issue.",
  },
  {
    n: "02",
    title: "AI sorts and routes",
    desc: "Our AI classifies the issue, assigns severity, and routes it to the correct department.",
  },
  {
    n: "03",
    title: "Track it to resolved",
    desc: "Follow your ticket as it moves from open to in-progress to resolved.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 pt-16 pb-20 lg:pt-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full px-4 py-1.5 mb-8 border border-brand-100">
              <Leaf size={14} className="fill-brand-600 text-brand-600" />
              Tech for a Better Tomorrow
            </div>
            <h1 className="text-[40px] md:text-[56px] font-extrabold text-ink leading-tight tracking-[-0.02em] mb-6">
              A Cleaner, Safer,
              <br />
              Smarter Tomorrow
              <br />
            <span className="text-brand-600">Starts With You.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-[52ch]">
              Civix helps you report civic issues in minutes. Upload a photo,
              add a brief description or voice note, and we&apos;ll route it to the
              right department using AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-control)] bg-brand-700 text-white font-semibold hover:bg-brand-800 active:scale-[.98] transition-all shadow-sm"
              >
                Report an Issue
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-control)] border border-brand-600 text-brand-700 font-semibold bg-white hover:bg-brand-50 active:scale-[.98] transition-all"
              >
                <LayoutDashboard size={18} />
                Admin Console
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 h-12 px-5 rounded-[var(--radius-control)] text-gray-600 font-medium hover:text-gray-900 transition-all"
              >
                <Play size={16} className="fill-gray-500 text-gray-500" />
                See How It Works
              </a>
            </div>
          </div>

          {/* Right — hero image placeholder */}
          <div className="relative hidden lg:block">
            <div className="absolute -left-6 top-4 w-[calc(100%+24px)] h-[90%] bg-brand-50 rounded-[24px] -z-10" />
            <div className="relative w-full aspect-[5/4] rounded-[24px] overflow-hidden shadow-2xl border border-brand-100/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-city.jpg"
                alt="Civix clean smart city infrastructure"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating quote card */}
            <div className="absolute -left-8 bottom-12 bg-white rounded-2xl shadow-lg p-5 max-w-[200px] border border-gray-100">
              <p className="text-ink font-bold italic text-xl leading-snug">
                &ldquo;Real People<br />Real Issues<br />Real Change&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Feature row */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] border border-black/5">
              <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                <Icon size={26} className="text-brand-600" />
              </div>
              <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
              <p className="text-sm text-brand-600">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote strip */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 mb-20">
        <div className="bg-brand-50 rounded-[var(--radius-card)] border border-brand-100 py-10 flex flex-col items-center gap-3 text-center">
          <Leaf size={32} className="text-brand-500 fill-brand-400" />
          <p className="text-2xl font-bold text-ink">
            Stronger Cities. Happier Communities.
          </p>
          <p className="text-brand-600 font-semibold">— Civix</p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-ink mb-3">How It Works</h2>
          <p className="text-gray-600 max-w-[48ch] mx-auto">
            Three simple steps to get your civic issue noticed and resolved.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="bg-white rounded-[var(--radius-card)] p-7 shadow-[var(--shadow-card)] border border-black/5">
              <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-5">
                <span className="text-brand-600 font-bold text-lg">{n}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t border-gray-100 bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-ink font-bold">
            <Leaf size={20} className="text-brand-600 fill-brand-600" />
            Civix
          </div>
          <p className="text-sm text-gray-500">
            Built for HACKDAY 1.0 — Tech for a Better Tomorrow
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#about" className="hover:text-brand-700 transition-colors">About</a>
            <a href="#contact" id="contact" className="hover:text-brand-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

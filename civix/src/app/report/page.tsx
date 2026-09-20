"use client";
// app/report/page.tsx — 3-step citizen report flow (DESIGN.md 5.2)

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { PhotoCapture } from "@/components/report/PhotoCapture";
import { VoiceInput } from "@/components/report/VoiceInput";
import { ResultCard } from "@/components/report/ResultCard";
import type { Ticket } from "@/lib/types";

// Load LocationPicker client-only
const LocationPicker = dynamic(
  () => import("@/components/report/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false }
);

type Step = 1 | 2 | 3;

const SUBMIT_MESSAGES = [
  "Uploading photo…",
  "Analyzing the issue…",
  "Checking for nearby reports…",
];

interface FormErrors {
  photo?: string;
  description?: string;
  location?: string;
}

// ── Stepper ───────────────────────────────────────────────────────────────────
const stepLabels = ["Add Details", "Review", "Submitted"];

function Stepper({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {stepLabels.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done || active
                    ? "bg-brand-600 text-white"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium ${
                  active ? "text-brand-700" : done ? "text-brand-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 ${
                  step > n ? "bg-brand-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 component ─────────────────────────────────────────────────────────
interface Step1Props {
  description: string;
  errors: FormErrors;
  apiError: string | null;
  setPhoto: (f: File | null) => void;
  setDescription: (d: string) => void;
  handleLocation: (lat: number, lng: number, addr: string) => void;
  handleVoiceTranscript: (t: string) => void;
  goToReview: () => void;
}

function Step1({
  description,
  errors,
  apiError,
  setPhoto,
  setDescription,
  handleLocation,
  handleVoiceTranscript,
  goToReview,
}: Step1Props) {
  return (
    <>
      {apiError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[var(--radius-control)] text-sm text-red-700">
          {apiError}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <PhotoCapture onFile={setPhoto} error={errors.photo} />

        {/* Description card */}
        <div className="bg-white rounded-[var(--radius-card)] p-5 md:p-6 shadow-[var(--shadow-card)] border border-black/5">
          <h3 className="text-base font-semibold text-ink mb-1">
            2. Describe the Issue <span className="text-red-500">*</span>
          </h3>
          <div className="mt-3 relative">
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={5}
              placeholder="Describe what you see in as much detail as possible…"
              className="w-full min-h-[132px] border border-gray-200 rounded-[var(--radius-control)] px-3.5 py-3 text-sm text-ink placeholder:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none transition-all"
              aria-label="Issue description"
            />
            <span className="absolute bottom-3 right-3 text-xs text-gray-400">
              {description.length}/500
            </span>
          </div>
          <div className="mt-3">
            <VoiceInput onTranscript={handleVoiceTranscript} />
          </div>
          {errors.description && (
            <p className="text-sm text-red-600 mt-2">{errors.description}</p>
          )}
        </div>

        <LocationPicker onLocation={handleLocation} error={errors.location} />

        {/* Category hint card */}
        <div className="bg-white rounded-[var(--radius-card)] p-5 md:p-6 shadow-[var(--shadow-card)] border border-black/5">
          <h3 className="text-base font-semibold text-ink mb-1">
            4. Category{" "}
            <span className="text-gray-400 text-sm font-normal">(Optional)</span>
          </h3>
          <div className="mt-3">
            <select
              className="w-full h-12 border border-gray-200 rounded-[var(--radius-control)] px-3.5 text-sm text-ink bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              defaultValue="auto"
              aria-label="Category hint"
            >
              <option value="auto">Auto-detect (AI will classify)</option>
              <option value="roads">Roads</option>
              <option value="sanitation">Sanitation</option>
              <option value="electrical">Electrical</option>
              <option value="water">Water</option>
              <option value="public_spaces">Parks &amp; Public Spaces</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sticky submit bar */}
      <div className="sticky bottom-0 sm:static bg-surface sm:bg-transparent pt-4 pb-4">
        <button
          onClick={goToReview}
          className="w-full h-12 rounded-[var(--radius-control)] bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 hover:bg-brand-800 active:scale-[.98] shadow-sm hover:shadow transition-all"
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>
    </>
  );
}

// ── Step 2 component ─────────────────────────────────────────────────────────
interface Step2Props {
  photo: File | null;
  description: string;
  lat: number;
  lng: number;
  addressText: string;
  submitting: boolean;
  submitMsgIdx: number;
  apiError: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

function Step2({
  photo,
  description,
  lat,
  lng,
  addressText,
  submitting,
  submitMsgIdx,
  apiError,
  onBack,
  onSubmit,
}: Step2Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-black/5 overflow-hidden mb-4">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={URL.createObjectURL(photo)}
            alt="Photo of the reported issue"
            className="w-full max-h-64 object-cover"
          />
        )}
        <div className="p-6 space-y-3 text-sm">
          <p className="text-ink leading-relaxed">{description}</p>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-medium">Location:</span>
            <span className="text-ink">{addressText || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-medium">Category:</span>
            <span className="text-ink">Auto-detect</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center mb-4">
        Our AI will analyze your photo after you submit.
      </p>

      {apiError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[var(--radius-control)] text-sm text-red-700 flex items-start justify-between gap-3">
          <span>{apiError}</span>
          <button
            onClick={onSubmit}
            className="text-brand-700 font-semibold whitespace-nowrap hover:text-brand-800"
          >
            Try again
          </button>
        </div>
      )}

      {submitting && (
        <div className="mb-4 text-center text-sm text-brand-700 font-medium flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          {SUBMIT_MESSAGES[submitMsgIdx]}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 h-12 rounded-[var(--radius-control)] border border-brand-600 text-brand-700 font-semibold flex items-center justify-center gap-2 hover:bg-brand-50 disabled:opacity-40 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 h-12 rounded-[var(--radius-control)] bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 hover:bg-brand-800 active:scale-[.98] disabled:opacity-60 transition-all"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {submitting ? "Submitting…" : "Submit report"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const [step, setStep] = useState<Step>(1);

  // Form data
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState<number>(19.076);
  const [lng, setLng] = useState<number>(72.8777);
  const [addressText, setAddressText] = useState("");

  // State
  const [submitting, setSubmitting] = useState(false);
  const [submitMsgIdx, setSubmitMsgIdx] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    ticket: Ticket;
    merged: boolean;
    previousPriorityScore?: number;
  } | null>(null);

  const handleLocation = useCallback(
    (newLat: number, newLng: number, addr: string) => {
      setLat(newLat);
      setLng(newLng);
      setAddressText(addr);
    },
    []
  );

  function handleVoiceTranscript(text: string) {
    setDescription((prev) => (prev ? prev + " " + text : text).slice(0, 500));
  }

  function validateStep1(): boolean {
    const errs: FormErrors = {};
    if (!photo) errs.photo = "Please add a photo so we can see the issue.";
    if (!description.trim())
      errs.description = "Please describe what you see.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goToReview() {
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setApiError(null);

    const interval = setInterval(
      () => setSubmitMsgIdx((i) => (i + 1) % SUBMIT_MESSAGES.length),
      1500
    );

    try {
      const fd = new FormData();
      fd.append("image", photo!);
      fd.append("description", description);
      fd.append("lat", String(lat));
      fd.append("lng", String(lng));
      if (addressText) fd.append("address_text", addressText);

      const res = await fetch("/api/reports", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        if (json.error === "not_civic_issue") {
          setApiError(
            "This photo doesn't show a public issue. Retake it or choose another photo."
          );
          setStep(1);
        } else {
          setApiError(
            json.message || "Couldn't send your report. Check your connection and try again."
          );
        }
        return;
      }

      if (typeof window !== "undefined" && json.data?.ticket_no) {
        try {
          const myTickets = JSON.parse(localStorage.getItem("civix_my_tickets") || "[]");
          if (!myTickets.includes(json.data.ticket_no)) {
            myTickets.unshift(json.data.ticket_no);
            localStorage.setItem("civix_my_tickets", JSON.stringify(myTickets.slice(0, 20)));
            window.dispatchEvent(new Event("civix_my_tickets_change"));
          }
        } catch {
          // ignore storage error
        }
      }

      setResult({
        ticket: json.data,
        merged: json.merged,
        previousPriorityScore: json.previous_priority_score,
      });
      setStep(3);
    } catch {
      setApiError("Couldn't send your report. Check your connection and try again.");
    } finally {
      clearInterval(interval);
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(1);
    setPhoto(null);
    setDescription("");
    setErrors({});
    setApiError(null);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {step < 3 && (
          <>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-700 mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-ink mb-2">Report a Civic Issue</h1>
            <p className="text-gray-600 mb-8">
              Let us know what&apos;s going on. Our AI will analyze and route it to the right department.
            </p>
            <Stepper step={step} />
          </>
        )}

        {step === 1 && (
          <Step1
            description={description}
            errors={errors}
            apiError={apiError}
            setPhoto={setPhoto}
            setDescription={setDescription}
            handleLocation={handleLocation}
            handleVoiceTranscript={handleVoiceTranscript}
            goToReview={goToReview}
          />
        )}
        {step === 2 && (
          <Step2
            photo={photo}
            description={description}
            lat={lat}
            lng={lng}
            addressText={addressText}
            submitting={submitting}
            submitMsgIdx={submitMsgIdx}
            apiError={apiError}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
          />
        )}
        {step === 3 && result && (
          <ResultCard
            ticket={result.ticket}
            merged={result.merged}
            previousPriorityScore={result.previousPriorityScore}
            onReportAnother={resetForm}
          />
        )}
      </div>
    </div>
  );
}

"use client";
// components/report/VoiceInput.tsx — Web Speech API mic button
// Appends transcript to textarea; hides itself if unsupported.

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

// Web Speech API type augmentation (not in TS lib by default)
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (SR) {
      const recog = new SR();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-IN";
      recog.onresult = (event: { results: SpeechRecognitionResultList }) => {
        const text = Array.from(event.results)
          .map((r) => (r as SpeechRecognitionResult)[0].transcript)
          .join(" ");
        onTranscript(text);
        setListening(false);
      };
      recog.onend = () => setListening(false);
      recog.onerror = () => setListening(false);
      recogRef.current = recog;
      // Defer setState to avoid synchronous setState in effect
      setTimeout(() => setSupported(true), 0);
    }
  }, [onTranscript]);

  if (!supported) {
    return (
      <p className="text-xs text-gray-400 mt-2">
        Voice input is not supported in this browser. Use text instead.
      </p>
    );
  }

  function toggle() {
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
    } else {
      recogRef.current?.start();
      setListening(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-control)] text-sm font-semibold transition-all ${
        listening
          ? "bg-red-50 text-red-600 border border-red-200"
          : "bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100"
      }`}
      aria-label={listening ? "Tap to stop recording" : "Record voice instead"}
    >
      {listening ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <MicOff size={16} />
          Listening… tap to stop
        </>
      ) : (
        <>
          <Mic size={16} />
          Record Voice Instead
        </>
      )}
    </button>
  );
}

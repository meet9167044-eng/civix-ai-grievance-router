"use client";
// components/report/PhotoCapture.tsx — photo upload with client-side compression

import { useRef, useState, useCallback } from "react";
import { ImagePlus, X } from "lucide-react";

interface PhotoCaptureProps {
  onFile: (file: File | null) => void;
  error?: string;
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1280;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
            type: "image/jpeg",
          });
          console.info(
            `[compress] ${(file.size / 1024).toFixed(0)} KB → ${(compressed.size / 1024).toFixed(0)} KB`
          );
          resolve(compressed);
        },
        "image/jpeg",
        0.8
      );
    };
    img.src = url;
  });
}

export function PhotoCapture({ onFile, error }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (raw: File) => {
      const compressed = await compressImage(raw);
      const previewUrl = URL.createObjectURL(compressed);
      setPreview(previewUrl);
      onFile(compressed);
    },
    [onFile]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) processFile(f);
  }

  function removePhoto() {
    setPreview(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-5 md:p-6 shadow-[var(--shadow-card)] border border-black/5">
      <h3 className="text-base font-semibold text-ink mb-1">
        1. Upload a Photo <span className="text-red-500">*</span>
      </h3>

      {preview ? (
        <div className="mt-3 flex items-start gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Photo of the reported issue"
              className="w-full h-full object-cover rounded-[10px]"
            />
            <button
              onClick={removePhoto}
              aria-label="Remove photo"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors"
            >
              <X size={12} className="text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Photo ready. You can remove it and choose another.</p>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-3 border-2 border-dashed rounded-[var(--radius-control)] p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
            ${dragging ? "border-brand-400 bg-brand-100" : "border-brand-200 bg-brand-50/40 hover:border-brand-400 hover:bg-brand-50"}`}
        >
          <ImagePlus size={32} className="text-brand-400" />
          <p className="text-sm text-gray-600 text-center">
            Drag and drop an image here or <span className="text-brand-700 font-semibold">click to upload</span>
          </p>
          <p className="text-xs text-gray-400">JPG, PNG up to 10 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        id="photo-input"
        aria-label="Upload photo"
      />

      <p className="text-xs text-gray-400 mt-3">
        Please avoid capturing people&apos;s faces or vehicle plates.
      </p>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

"use client";
// components/report/LocationPicker.tsx — Geolocation + Leaflet map preview with draggable pin
// Loaded lazily via next/dynamic (ssr: false) in the report page.

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";

const DEFAULT_LAT = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || "19.0760");
const DEFAULT_LNG = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || "72.8777");

interface LocationPickerProps {
  onLocation: (lat: number, lng: number, addressText: string) => void;
  error?: string;
}

// Leaflet map loaded only on client
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
    const json = await res.json();
    return (json.display_name as string) ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function LocationPicker({ onLocation, error }: LocationPickerProps) {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [denied, setDenied] = useState(false);

  const updateLocation = useCallback(
    async (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      const addr = await reverseGeocode(newLat, newLng);
      setAddress(addr);
      onLocation(newLat, newLng, addr);
    },
    [onLocation]
  );

  useEffect(() => {
    // Auto-request geolocation on mount
    if (!navigator.geolocation) {
      // Defer so we don't setState synchronously in effect
      const t = setTimeout(() => updateLocation(DEFAULT_LAT, DEFAULT_LNG), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLoading(false);
        setDenied(true);
        updateLocation(DEFAULT_LAT, DEFAULT_LNG);
      },
      { timeout: 8000 }
    );
  }, [updateLocation]);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        setDenied(false);
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLoading(false);
        setDenied(true);
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-card)] p-5 md:p-6 shadow-[var(--shadow-card)] border border-black/5">
      <h3 className="text-base font-semibold text-ink mb-1">
        3. Location <span className="text-red-500">*</span>
      </h3>

      {/* Location input row */}
      <div className="mt-3 flex items-center gap-2 h-12 border border-gray-200 rounded-[var(--radius-control)] px-3.5 bg-white focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
        <MapPin size={18} className="text-gray-400 flex-shrink-0" />
        <span className="text-sm text-ink flex-1 truncate">
          {loading ? "Detecting location…" : (address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)}
        </span>
        <button
          type="button"
          onClick={handleLocate}
          aria-label="Use my current location"
          className="p-1.5 rounded-lg hover:bg-brand-50 transition-colors"
        >
          {loading ? (
            <Loader2 size={16} className="text-brand-500 animate-spin" />
          ) : (
            <LocateFixed size={16} className="text-brand-600" />
          )}
        </button>
      </div>

      {denied && (
        <p className="text-xs text-amber-600 mt-2">
          Location is off. Drag the pin on the map to where the issue is.
        </p>
      )}

      {/* Adjust pin toggle */}
      <button
        type="button"
        onClick={() => setShowMap(!showMap)}
        className="mt-3 text-sm text-brand-700 font-semibold hover:text-brand-800 transition-colors"
      >
        {showMap ? "Hide map" : "Adjust pin on map"}
      </button>

      {showMap && (
        <div className="mt-3 h-52 rounded-[var(--radius-control)] overflow-hidden border border-gray-100">
          <LeafletMap
            lat={lat}
            lng={lng}
            onMove={(newLat, newLng) => updateLocation(newLat, newLng)}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

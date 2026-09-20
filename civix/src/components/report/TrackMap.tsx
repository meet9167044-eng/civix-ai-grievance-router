"use client";
// components/report/TrackMap.tsx — Leaflet map for ticket tracking

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Severity } from "@/lib/types";

interface TrackMapProps {
  lat: number;
  lng: number;
  ticketNo: string;
  severity: Severity;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#16a34a",
  medium: "#d97706",
  high: "#ea580c",
  critical: "#dc2626",
};

export default function TrackMap({ lat, lng, ticketNo, severity }: TrackMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    const color = SEVERITY_COLORS[severity] || "#dc2626";
    const customIcon = L.divIcon({
      html: `<div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 900;
        font-size: 13px;
      ">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "",
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    marker.bindPopup(`<b>${ticketNo}</b><br>Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, ticketNo, severity]);

  return <div ref={containerRef} className="w-full h-[260px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner" />;
}

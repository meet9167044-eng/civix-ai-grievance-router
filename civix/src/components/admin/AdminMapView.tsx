"use client";
// components/admin/AdminMapView.tsx — Leaflet map view for admin dashboard (Phase 8)

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Ticket, Severity } from "@/lib/types";

interface AdminMapViewProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#16a34a",
  medium: "#d97706",
  high: "#ea580c",
  critical: "#dc2626",
};

export default function AdminMapView({ tickets, onSelectTicket }: AdminMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const defaultLat = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || "19.0760");
  const defaultLng = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || "72.8777");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersRef.current = layerGroup;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    tickets.forEach((t) => {
      const color = SEVERITY_COLORS[t.severity] || "#4b5563";
      const icon = L.divIcon({
        html: `<div style="
          width: 24px;
          height: 24px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 10px;
        ">${t.reports_count > 1 ? t.reports_count : ""}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: "",
      });

      const marker = L.marker([t.lat, t.lng], { icon });

      const popupContent = document.createElement("div");
      popupContent.className = "p-1";
      popupContent.innerHTML = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
            <span style="font-family: monospace; font-weight: bold; color: #6b7280;">${t.ticket_no}</span>
            <span style="background: ${color}; color: white; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${t.severity}</span>
          </div>
          <div style="font-weight: bold; color: #111827; margin-bottom: 6px;">${t.title}</div>
          <div style="color: #4b5563; font-size: 11px; margin-bottom: 8px;">
            Priority: <b>${t.priority_score}/100</b> | Reports: <b>${t.reports_count}</b>
          </div>
          <button id="inspect-btn-${t.id}" style="
            width: 100%;
            background: #176B3D;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
          ">Inspect Ticket</button>
        </div>
      `;

      const btn = popupContent.querySelector(`#inspect-btn-${t.id}`);
      if (btn) {
        btn.addEventListener("click", () => onSelectTicket(t));
      }

      marker.bindPopup(popupContent);
      markersRef.current?.addLayer(marker);
    });

    if (tickets.length > 0) {
      const bounds = L.latLngBounds(tickets.map((t) => [t.lat, t.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [tickets, onSelectTicket]);

  return <div ref={containerRef} className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-gray-200" />;
}

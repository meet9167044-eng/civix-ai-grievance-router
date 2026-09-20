"use client";
// components/report/LeafletMap.tsx — Leaflet map with draggable marker
// Must only be used via next/dynamic with ssr:false.

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface LeafletMapProps {
  lat: number;
  lng: number;
  onMove: (lat: number, lng: number) => void;
}

// Custom divIcon to avoid broken default marker images in Next.js
function createMarkerIcon() {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;background:#176B3D;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: "",
  });
}

export default function LeafletMap({ lat, lng, onMove }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: createMarkerIcon(),
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onMove(pos.lat, pos.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when lat/lng changes externally
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  return <div ref={containerRef} className="w-full h-full" />;
}

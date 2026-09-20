// data/pois.ts — Points of interest (schools, hospitals) for priority scoring
// Full set of POIs defined in Phase 5.

import { haversineMeters } from "@/lib/geo";

interface POI {
  name: string;
  lat: number;
  lng: number;
}

// 4-6 fictional sensitive sites near the demo center (Mumbai as default).
// Update these when the actual demo city is confirmed.
export const POIS: POI[] = [
  { name: "Sunrise Primary School",    lat: 19.0780, lng: 72.8770 },
  { name: "City General Hospital",     lat: 19.0748, lng: 72.8800 },
  { name: "Marine Drive School",       lat: 19.0720, lng: 72.8760 },
  { name: "St. Xavier's Mission Hospital", lat: 19.0795, lng: 72.8810 },
];

export function isNearSensitiveSite(lat: number, lng: number): boolean {
  return POIS.some((poi) => haversineMeters({ lat, lng }, poi) <= 200);
}

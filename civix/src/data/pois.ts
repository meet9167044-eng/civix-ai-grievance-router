// data/pois.ts — Points of interest (schools, hospitals) for priority scoring
// Tickets within 200m of a sensitive site receive +10 priority boost.

import { haversineMeters } from "@/lib/geo";

export interface POI {
  name: string;
  lat: number;
  lng: number;
  type?: "school" | "hospital" | "transit";
}

// 6 fictional sensitive sites near the demo center (Mumbai as default).
export const POIS: POI[] = [
  { name: "Sunrise Primary School", lat: 19.0780, lng: 72.8770, type: "school" },
  { name: "City General Hospital", lat: 19.0748, lng: 72.8800, type: "hospital" },
  { name: "Marine Drive School", lat: 19.0720, lng: 72.8760, type: "school" },
  { name: "St. Xavier's Mission Hospital", lat: 19.0795, lng: 72.8810, type: "hospital" },
  { name: "Metro Children's Clinic", lat: 19.0752, lng: 72.8755, type: "hospital" },
  { name: "Civic Model High School", lat: 19.0735, lng: 72.8792, type: "school" },
];

/**
 * Returns true if the coordinates are within 200m of any sensitive site.
 */
export function isNearSensitiveSite(lat: number, lng: number): boolean {
  return POIS.some((poi) => haversineMeters({ lat, lng }, poi) <= 200);
}

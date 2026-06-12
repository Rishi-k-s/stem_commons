/**
 * ─────────────────────────────────────────────────────────────
 *  RESOURCE TYPES & HELPERS
 *  Data now comes from the backend API (see src/lib/api.ts).
 *  This module holds only shared types, canonical lookup lists,
 *  and pure helper functions.
 * ─────────────────────────────────────────────────────────────
 */

export type ResourceType = "Makerspace" | "ATAL Lab" | "Vendor";

export type ResourceStatus =
  | "Working"
  | "Planned"
  | "Temporarily Closed"
  | "Permanently Closed";

export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  city: string;
  state: string;
  status: ResourceStatus;
  description: string;
  address: string;
  contact: string;
  phone: string;
  website: string;
  facilities: string[];
  lat: number;
  lng: number;
}

export const RESOURCE_TYPES: ResourceType[] = [
  "Makerspace",
  "ATAL Lab",
  "Vendor",
];

export const RESOURCE_STATUSES: ResourceStatus[] = [
  "Working",
  "Planned",
  "Temporarily Closed",
  "Permanently Closed",
];

/** Canonical facility categories used for filtering. */
export const ALL_FACILITIES: string[] = [
  "3D Printing",
  "CNC Machines",
  "Computer Lab",
  "Electronics Lab",
  "Laser Cutting",
  "Metal Workshop",
  "PCB Fabrication",
  "Robotics",
  "Testing Equipment",
  "VR/AR Equipment",
  "Wood Workshop",
];

/** Indian states + union territories, alphabetically sorted. */
export const ALL_STATES: string[] = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/** Maps a resource status to a Badge variant. */
export function statusVariant(
  status: ResourceStatus
): "success" | "warning" | "error" | "info" | "neutral" {
  switch (status) {
    case "Working":
      return "success";
    case "Planned":
      return "info";
    case "Temporarily Closed":
      return "warning";
    case "Permanently Closed":
      return "error";
    default:
      return "neutral";
  }
}

/** Maps a resource status to a hex color for map markers / dots. */
export function statusColor(status: ResourceStatus): string {
  switch (status) {
    case "Working":
      return "#15803d"; // green
    case "Planned":
      return "#2563eb"; // blue
    case "Temporarily Closed":
      return "#d97706"; // orange
    case "Permanently Closed":
      return "#b91c1c"; // red
    default:
      return "#6b7280"; // gray
  }
}

/** Great-circle distance in kilometres between two lat/lng points. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Resources nearest to the given one, sorted by distance.
 * Prefers the same type; falls back to any type if too few same-type matches.
 * @param resource the reference resource
 * @param all      the full pool of resources to search within
 * @param limit    maximum results to return
 */
export function nearbyResources(
  resource: Resource,
  all: Resource[],
  limit = 6
): Array<Resource & { distanceKm: number }> {
  const withDist = all
    .filter((r) => r.id !== resource.id)
    .map((r) => ({ ...r, distanceKm: distanceKm(resource.lat, resource.lng, r.lat, r.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const sameType = withDist.filter((r) => r.type === resource.type);
  const pool = sameType.length >= limit ? sameType : withDist;
  return pool.slice(0, limit);
}

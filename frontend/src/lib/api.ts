/**
 * ─────────────────────────────────────────────────────────────
 *  API CLIENT — talks to the STEM Commons FastAPI backend.
 *  The backend resource shape matches the frontend `Resource` type.
 * ─────────────────────────────────────────────────────────────
 */
import type {
  Resource,
  ResourceStatus,
  ResourceType,
} from "../data/resources";
import { authHeader, ApiError } from "./auth";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000/api/v1";

interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** Raw resource as returned by the backend. */
interface ApiResource {
  id: number;
  name: string;
  type: string;
  status: string;
  description: string | null;
  city: string;
  state: string;
  address: string | null;
  phone: string | null;
  contact: string | null;
  website: string | null;
  facilities: string[];
  lat: number;
  lng: number;
}

function toResource(r: ApiResource): Resource {
  return {
    id: r.id,
    name: r.name,
    type: r.type as ResourceType,
    status: r.status as ResourceStatus,
    description: r.description ?? "",
    city: r.city,
    state: r.state,
    address: r.address ?? "",
    contact: r.contact ?? "",
    phone: r.phone ?? "",
    website: r.website ?? "",
    facilities: r.facilities ?? [],
    lat: r.lat,
    lng: r.lng,
  };
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Fetch all resources (the backend paginates; we request a large page so the
 * map and list can filter/sort client-side as before).
 */
export async function fetchResources(limit = 500): Promise<Resource[]> {
  const page = await getJSON<Page<ApiResource>>(`/resources?limit=${limit}`);
  return page.data.map(toResource);
}

/** Fetch a single resource by id. Returns null on 404. */
export async function fetchResource(id: number): Promise<Resource | null> {
  try {
    const r = await getJSON<ApiResource>(`/resources/${id}`);
    return toResource(r);
  } catch {
    return null;
  }
}

/* ── Admin mutations (require a Bearer token) ────────────────── */

/** Payload accepted by create/update. lat/lng required on create. */
export interface ResourceInput {
  name: string;
  type: string;
  status: string;
  description?: string;
  city: string;
  state: string;
  address?: string;
  phone?: string;
  contact?: string;
  website?: string;
  facilities?: string[];
  lat: number;
  lng: number;
}

async function mutate<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown
): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      if (typeof j?.detail === "string") detail = j.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return null;
  return (await res.json()) as T;
}

export async function createResource(input: ResourceInput): Promise<Resource> {
  const r = await mutate<ApiResource>("/resources", "POST", input);
  return toResource(r as ApiResource);
}

export async function updateResource(
  id: number,
  input: ResourceInput
): Promise<Resource> {
  const r = await mutate<ApiResource>(`/resources/${id}`, "PUT", input);
  return toResource(r as ApiResource);
}

export async function deleteResource(id: number): Promise<void> {
  await mutate<null>(`/resources/${id}`, "DELETE");
}

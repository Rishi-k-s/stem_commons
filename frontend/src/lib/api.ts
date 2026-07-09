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
  is_verified?: boolean;
  created_at?: string | null;
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
    isVerified: r.is_verified ?? false,
    createdAt: r.created_at ?? undefined,
  };
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchResources(
  limit = 500,
  verified?: boolean
): Promise<Resource[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (verified !== undefined) params.set("verified", String(verified));
  const page = await getJSON<Page<ApiResource>>(`/resources?${params}`);
  return page.data.map(toResource);
}

export interface ResourcePage {
  data: Resource[];
  total: number;
  pages: number;
  page: number;
}

export async function fetchResourcesPage(
  page = 1,
  limit = 50,
  q?: string,
  verified?: boolean
): Promise<ResourcePage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set("q", q);
  if (verified !== undefined) params.set("verified", String(verified));
  const result = await getJSON<Page<ApiResource>>(`/resources?${params}`);
  return { data: result.data.map(toResource), total: result.total, pages: result.pages, page: result.page };
}

/** Fetch resources awaiting admin review (unverified). */
export async function fetchPendingResources(limit = 500): Promise<Resource[]> {
  return fetchResources(limit, false);
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
  method: "POST" | "PUT" | "PATCH" | "DELETE",
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

/** POST to a public (unauthenticated) endpoint, surfacing API errors. */
async function postPublic<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

/** Approve a pending submission (admin only). */
export async function verifyResource(id: number): Promise<Resource> {
  const r = await mutate<ApiResource>(`/resources/${id}/verify`, "POST");
  return toResource(r as ApiResource);
}

/** Revoke verification, moving a resource back to pending (admin only). */
export async function unverifyResource(id: number): Promise<Resource> {
  const r = await mutate<ApiResource>(`/resources/${id}/unverify`, "POST");
  return toResource(r as ApiResource);
}

/* ── Public submission (no auth) ─────────────────────────────── */

export interface ResourceSubmission {
  name: string;
  type: string;
  description?: string;
  facilities?: string[];
  website?: string;
  city: string;
  state: string;
  address?: string;
  lat: number;
  lng: number;
  poc_name: string;
  designation: string;
  email: string;
  phone?: string;
  submitted_by: string;
}

/** Submit a new resource for review. Created as unverified. */
export async function submitResource(
  input: ResourceSubmission
): Promise<Resource> {
  const res = await fetch(`${API_BASE}/resources/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
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
  return toResource((await res.json()) as ApiResource);
}

/* ── Claims (admin) ──────────────────────────────────────────── */

export interface Claim {
  id: number;
  resource_id: number;
  resource_name: string | null;
  claimer_name: string;
  claimer_email: string;
  claimer_phone: string | null;
  role: string | null;
  message: string | null;
  status: string;
  created_at: string | null;
  // Returned only by the approve action.
  owner_email?: string | null;
  owner_temp_password?: string | null;
  owner_account_existed?: boolean | null;
}

export async function fetchClaims(status?: string): Promise<Claim[]> {
  const qs = status ? `?status_=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${API_BASE}/claims${qs}`, { headers: { ...authHeader() } });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as Claim[];
}

export async function approveClaim(id: number): Promise<Claim> {
  return (await mutate<Claim>(`/claims/${id}/approve`, "PATCH")) as Claim;
}

export async function rejectClaim(id: number): Promise<Claim> {
  return (await mutate<Claim>(`/claims/${id}/reject`, "PATCH")) as Claim;
}

/** Public claim submission (no auth). */
export interface ClaimSubmission {
  claimer_name: string;
  claimer_email: string;
  claimer_phone?: string;
  role?: string;
  message?: string;
}

export async function submitClaim(
  resourceId: number,
  input: ClaimSubmission
): Promise<void> {
  await postPublic(`/resources/${resourceId}/claim`, input);
}

/* ── Reports (admin) ─────────────────────────────────────────── */

export interface Report {
  id: number;
  resource_id: number;
  resource_name: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  issue_type: string;
  description: string;
  status: string;
  created_at: string | null;
}

export async function fetchReports(status?: string): Promise<Report[]> {
  const qs = status ? `?status_=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${API_BASE}/reports${qs}`, { headers: { ...authHeader() } });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as Report[];
}

export async function setReportStatus(id: number, status: string): Promise<Report> {
  return (await mutate<Report>(`/reports/${id}/status`, "PATCH", { status })) as Report;
}

/** Public report submission (no auth). */
export interface ReportSubmission {
  reporter_name?: string;
  reporter_email?: string;
  issue_type: string;
  description: string;
}

export async function submitReport(
  resourceId: number,
  input: ReportSubmission
): Promise<void> {
  await postPublic(`/resources/${resourceId}/report`, input);
}

/* ── Public stats (landing page) ────────────────────────────── */

export interface PublicStats {
  total: number;
  by_type: Record<string, number>;
  states_count: number;
}

export async function fetchPublicStats(): Promise<PublicStats> {
  return getJSON<PublicStats>("/resources/stats");
}

/* ── Admin analytics, bulk ops & CSV export ──────────────────── */

export interface AnalyticsOverview {
  resources: {
    total: number;
    verified: number;
    pending: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_state: Record<string, number>;
  };
  claims: { total: number; pending: number };
  reports: { total: number; open: number };
}

export async function fetchAnalytics(): Promise<AnalyticsOverview> {
  const res = await fetch(`${API_BASE}/admin/analytics/overview`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as AnalyticsOverview;
}

export async function bulkVerifyResources(ids: number[]): Promise<number> {
  const r = await mutate<{ updated: number }>(
    "/admin/resources/bulk-verify",
    "POST",
    { ids }
  );
  return r?.updated ?? 0;
}

export async function bulkDeleteResources(ids: number[]): Promise<number> {
  const r = await mutate<{ deleted: number }>(
    "/admin/resources/bulk-delete",
    "POST",
    { ids }
  );
  return r?.deleted ?? 0;
}

/** Download the resource directory as a CSV file (triggers a browser save). */
export async function exportResourcesCsv(): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/export/resources`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resources.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ── Admin user management ───────────────────────────────────── */

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export async function fetchAdminUsers(role?: string): Promise<AdminUser[]> {
  const qs = role ? `?role=${encodeURIComponent(role)}` : "";
  const res = await fetch(`${API_BASE}/admin/users${qs}`, { headers: { ...authHeader() } });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as AdminUser[];
}

export async function updateUserRole(id: number, role: string): Promise<AdminUser> {
  return (await mutate<AdminUser>(`/admin/users/${id}/role`, "PATCH", { role })) as AdminUser;
}

export async function updateUserActive(id: number, is_active: boolean): Promise<AdminUser> {
  return (await mutate<AdminUser>(`/admin/users/${id}/active`, "PATCH", { is_active })) as AdminUser;
}

export interface ActivityLogEntry {
  id: number;
  admin_id: number | null;
  admin_username: string;
  action: string;
  target_type: string | null;
  target_id: number | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export async function fetchActivityLog(limit = 50, action?: string): Promise<ActivityLogEntry[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (action) params.set("action", action);
  const res = await fetch(`${API_BASE}/admin/activity?${params}`, { headers: { ...authHeader() } });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as ActivityLogEntry[];
}

export async function fetchRecentSubmissions(limit = 20, pendingOnly = true): Promise<Resource[]> {
  const params = new URLSearchParams({ limit: String(limit), pending_only: String(pendingOnly) });
  const res = await fetch(`${API_BASE}/admin/resources/recent?${params}`, { headers: { ...authHeader() } });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return ((await res.json()) as ApiResource[]).map(toResource);
}

/* ── Owner (facility) self-service ───────────────────────────── */

/** Resources owned by the currently authenticated owner/admin. */
export async function fetchMyResources(): Promise<Resource[]> {
  const res = await fetch(`${API_BASE}/owner/resources`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return ((await res.json()) as ApiResource[]).map(toResource);
}

/** Update a resource the current user owns. */
export async function ownerUpdateResource(
  id: number,
  input: ResourceInput
): Promise<Resource> {
  const r = await mutate<ApiResource>(`/owner/resources/${id}`, "PUT", input);
  return toResource(r as ApiResource);
}

/** Change the current user's password. */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await mutate<null>("/owner/change-password", "POST", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

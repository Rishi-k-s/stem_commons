/**
 * ─────────────────────────────────────────────────────────────
 *  AUTH API + token storage
 *  Talks to the FastAPI /auth endpoints and persists the access
 *  token. Token is kept in localStorage (standard SPA tradeoff);
 *  it is sent as a Bearer header on authenticated requests.
 * ─────────────────────────────────────────────────────────────
 */

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000/api/v1";

const TOKEN_KEY = "stem_commons_token";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/* ── Token storage ───────────────────────────────────────────── */

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore storage failures (e.g. private mode) */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Authorization header for the current token, or empty object. */
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── API calls ───────────────────────────────────────────────── */

/** Thrown when an API call fails; carries the HTTP status. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    /* fall through */
  }
  return res.statusText || "Request failed";
}

/** Logs in with email + password and stores the returned token. */
export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new ApiError(res.status, await readError(res));
  }
  const data = (await res.json()) as TokenResponse;
  setToken(data.access_token);
}

/** Fetches the currently authenticated user; null if not authenticated. */
export async function fetchMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...authHeader() },
  });
  if (res.status === 401) {
    clearToken();
    return null;
  }
  if (!res.ok) {
    throw new ApiError(res.status, await readError(res));
  }
  return (await res.json()) as AuthUser;
}

export function logout(): void {
  clearToken();
}

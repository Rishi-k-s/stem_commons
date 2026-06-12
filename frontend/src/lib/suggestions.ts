/**
 * ─────────────────────────────────────────────────────────────
 *  SEARCH SUGGESTIONS ENGINE
 *  Builds an autocomplete index from the resources pool (names,
 *  cities, states, types, facilities) and ranks predictions with
 *  Google-style word-by-word prefix matching.
 * ─────────────────────────────────────────────────────────────
 */

import { fetchResources } from "./api";
import { ALL_FACILITIES, ALL_STATES, RESOURCE_TYPES, type Resource } from "../data/resources";

export type SuggestionKind = "name" | "city" | "state" | "type" | "facility";

export interface Suggestion {
  /** The text inserted into the search box when chosen. */
  value: string;
  /** A short label describing what the suggestion represents. */
  kind: SuggestionKind;
}

/** Builds a de-duplicated pool of suggestions from a list of resources. */
export function buildSuggestionPool(resources: Resource[]): Suggestion[] {
  const seen = new Set<string>();
  const pool: Suggestion[] = [];

  const add = (value: string, kind: SuggestionKind) => {
    const v = value?.trim();
    if (!v) return;
    const key = `${kind}::${v.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    pool.push({ value: v, kind });
  };

  for (const r of resources) {
    add(r.name, "name");
    add(r.city, "city");
    add(r.state, "state");
    for (const f of r.facilities) add(f, "facility");
  }

  // Canonical lists guarantee coverage even before data loads / for sparse data.
  for (const t of RESOURCE_TYPES) add(t, "type");
  for (const s of ALL_STATES) add(s, "state");
  for (const f of ALL_FACILITIES) add(f, "facility");

  return pool;
}

/** Priority used to break ties between suggestions of equal match quality. */
const KIND_PRIORITY: Record<SuggestionKind, number> = {
  name: 0,
  city: 1,
  state: 2,
  type: 3,
  facility: 4,
};

/**
 * Scores a candidate against the query. Lower is better; `null` = no match.
 *  0 → the whole value begins with the query
 *  1 → a word inside the value begins with the query
 *  2 → the value contains the query somewhere
 */
function matchScore(value: string, query: string): number | null {
  const v = value.toLowerCase();
  if (v.startsWith(query)) return 0;
  const words = v.split(/[\s,/&-]+/);
  if (words.some((w) => w.startsWith(query))) return 1;
  if (v.includes(query)) return 2;
  return null;
}

/**
 * Returns the best-ranked suggestions for a query using word-by-word
 * prefix matching, capped at `limit`.
 */
export function querySuggestions(
  pool: Suggestion[],
  rawQuery: string,
  limit = 8
): Suggestion[] {
  const query = rawQuery.trim().toLowerCase();
  if (query.length < 1) return [];

  const scored: Array<{ s: Suggestion; score: number }> = [];
  for (const s of pool) {
    const score = matchScore(s.value, query);
    if (score === null) continue;
    // Skip a suggestion that is identical to what's already typed.
    if (s.value.toLowerCase() === query) continue;
    scored.push({ s, score });
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    const kp = KIND_PRIORITY[a.s.kind] - KIND_PRIORITY[b.s.kind];
    if (kp !== 0) return kp;
    return a.s.value.localeCompare(b.s.value);
  });

  return scored.slice(0, limit).map((x) => x.s);
}

/* ── Cached pool ─────────────────────────────────────────────── */

let poolPromise: Promise<Suggestion[]> | null = null;

/**
 * Fetches resources once (module-cached) and returns the suggestion pool.
 * Subsequent callers reuse the in-flight / resolved promise.
 */
export function getSuggestionPool(): Promise<Suggestion[]> {
  if (!poolPromise) {
    poolPromise = fetchResources(500, true)
      .then(buildSuggestionPool)
      .catch(() => buildSuggestionPool([])); // fall back to canonical lists
  }
  return poolPromise;
}

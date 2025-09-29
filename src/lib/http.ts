"use client";

import { API_BASE } from "../config";

type Query = Record<string, string | number | boolean | undefined | null>;

export type ApiOptions = RequestInit & {
  query?: Query;
};

/** Build `?key=value` from a flat object */
function toQuery(query?: Query) {
  if (!query) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, String(v));
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Unified fetch wrapper:
 * - prefixes API_BASE
 * - sends cookies (credentials: include)
 * - auto-JSON headers for object bodies
 * - throws Error with nice message on non-2xx
 */
export async function apiFetch<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}${toQuery(opts.query)}`;

  const isJsonBody =
    opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData);

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers || {}),
  };

  const init: RequestInit = {
    method: opts.method ?? "GET",
    credentials: "include", // send cookies for session
    headers,
    cache: "no-store",
    body: isJsonBody ? JSON.stringify(opts.body) : (opts.body as any),
  };

  const res = await fetch(url, init);

  // Try to parse JSON; if it fails we still continue
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    // Extract a useful message (Nest often returns { message } or { errors })
    const message =
      data?.message ??
      (data?.errors ? JSON.stringify(data.errors) : null) ??
      res.statusText ??
      "Request failed";
    const err = new Error(typeof message === "string" ? message : JSON.stringify(message));
    // @ts-expect-error attach status for UI checks if needed
    err.status = res.status;
    throw err;
  }

  return data as T;
}

/** Convenience: POST /auth/logout and clear session on server */
export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}

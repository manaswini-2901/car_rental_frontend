'use client';

import { API_BASE } from '../config';

export type SessionUser = {
  id: number;
  email: string;
  role: 'User' | 'Admin';
};

export async function getSession(): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;        // <- important: 401/404 => null
    return (await res.json()) as SessionUser;
  } catch {
    return null;
  }
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Car = {
  id: number;
  brand: string;
  model: string;
  pricePerDay: number;
  available: boolean;
  description?: string;
};

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Simple date fields
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiFetch(`/cars/${id}`);
        if (alive) setCar(data);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load car.");
      }
    })();
    return () => { alive = false; };
  }, [id]);

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!car) return;

    setLoading(true);
    setErr(null);
    try {
      await apiFetch("/bookings", {
        method: "POST",
        body: {
          carId: car.id,
          startDate,
          endDate,
        },
      });

      // on success go to “My bookings”
      router.push("/bookings");
    } catch (e: any) {
      // If not logged in, backend returns 401; send to login
      if (e?.status === 401) {
        router.push(`/login?next=/cars/${car.id}`);
      } else {
        setErr(e?.message || "Booking failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (err) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p style={{ color: "crimson" }}>{err}</p>
        <p className="mt-4">
          <Link href="/cars">Back to cars</Link>
        </p>
      </main>
    );
  }

  if (!car) {
    return <main className="max-w-5xl mx-auto p-6">Loading…</main>;
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <p className="mb-4"><Link href="/cars">← Back to cars</Link></p>

      <h1 className="text-2xl font-semibold mb-2">
        {car.brand} {car.model}
      </h1>
      <p className="mb-1">${car.pricePerDay}/day</p>
      <p className="mb-4">{car.description || "No description"}</p>

      {!car.available ? (
        <p style={{ color: "crimson" }}>This car is currently unavailable.</p>
      ) : (
        <form onSubmit={submitBooking} className="space-y-3">
          <div className="flex gap-3">
            <label className="flex items-center gap-2">
              Start:
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded"
                required
              />
            </label>

            <label className="flex items-center gap-2">
              End:
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded"
                required
              />
            </label>
          </div>

          <button
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? "Booking…" : "Book this car"}
          </button>
        </form>
      )}
    </main>
  );
}

import { API_BASE } from '../../../config';

// 👇 override RequestInit.body so we can pass plain objects safely
type Options = Omit<RequestInit, 'body'> & {
  query?: Record<string, any>;
  body?: any;                 // allow objects (we'll JSON.stringify inside)
};

function toQuery(query?: Record<string, any>) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function apiFetch<T = any>(path: string, opts: Options = {}): Promise<T> {
  const url = `${API_BASE}${path}${toQuery(opts.query)}`;

  const isPlainObject =
    opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData);

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(isPlainObject ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers || {}),
  };

  const init: RequestInit = {
    method: opts.method ?? 'GET',
    credentials: 'include',
    headers,
    body: isPlainObject ? JSON.stringify(opts.body) : (opts.body as any),
    cache: 'no-store',
  };

  const res = await fetch(url, init);
  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const message = data?.message || res.statusText || 'Request failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data as T;
}

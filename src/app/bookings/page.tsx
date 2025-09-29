"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/http";

type BookingStatus = "Confirmed" | "Cancelled";

type Booking = {
  id: number;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;   // ISO yyyy-mm-dd
  status: BookingStatus;
  car?: {
    brand: string;
    model: string;
  };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>("/bookings");
      // Accept common shapes (array or wrapped)
      const list: Booking[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setBookings(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelBooking(id: number) {
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b)),
      );
    } catch (e: any) {
      alert(e?.message || "Cancel failed");
    }
  }

  async function deleteBooking(id: number) {
    try {
      await apiFetch(`/bookings/${id}`, { method: "DELETE" });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="mb-4">Loading…</p>}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border px-4 py-2">Car</th>
              <th className="border px-4 py-2">Start</th>
              <th className="border px-4 py-2">End</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  {b.car ? `${b.car.brand} ${b.car.model}` : "—"}
                </td>
                <td className="border px-4 py-2">{b.startDate}</td>
                <td className="border px-4 py-2">{b.endDate}</td>
                <td className="border px-4 py-2">{b.status}</td>
                <td className="border px-4 py-2">
                  {b.status === "Confirmed" ? (
                    <button
                      className="text-blue-600 hover:underline font-bold px-3 py-1"
                      onClick={() => cancelBooking(b.id)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="text-gray-400 hover:text-red-600 hover:underline font-bold px-3 py-1"
                      onClick={() => deleteBooking(b.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {!loading && bookings.length === 0 && (
              <tr>
                <td className="border px-4 py-6 text-center" colSpan={5}>
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/http";

type Booking = {
  id: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "Confirmed" | "Cancelled";
  user: { email: string };
  car: { brand: string; model: string };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch("/bookings"); // admin sees all
      setBookings(data.data || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id: number) {
    try {
      await apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
      );
    } catch (e: any) {
      alert("Cancel failed: " + e.message);
    }
  }

  async function deleteBooking(id: number) {
    try {
      await apiFetch(`/bookings/${id}`, { method: "DELETE" });
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin • Manage Bookings</h1>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">When</th>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Car</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="border px-2 py-1">
                {b.startDate} → {b.endDate}
              </td>
              <td className="border px-2 py-1">{b.user?.email}</td>
              <td className="border px-2 py-1">
                {b.car?.brand} {b.car?.model}
              </td>
              <td className="border px-2 py-1">${b.totalPrice}</td>
              <td className="border px-2 py-1">{b.status}</td>
              <td className="border px-2 py-1">
                {b.status === "Cancelled" ? (
                  <button
                    className="text-red-600"
                    onClick={() => deleteBooking(b.id)}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    className="text-blue-600"
                    onClick={() => cancelBooking(b.id)}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}

          {bookings.length === 0 && !loading && (
            <tr>
              <td colSpan={6} className="border px-2 py-4 text-center">
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

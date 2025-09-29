"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/http";
import Link from "next/link";


type Car = {
  id: number;
  brand: string;
  model: string;
  pricePerDay: number;
  available: boolean;
  description?: string | null;
};

export default function CarsPage() {
  // Helper to update filters and reset page
  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
    setPage(1);
  } 
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    q: "",
    brand: "",
    min: "",
    max: "",
    available: "",
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.q) params.append("q", filters.q);
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.min) params.append("min", filters.min);
    if (filters.max) params.append("max", filters.max);
    if (filters.available) params.append("available", filters.available);
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));
    apiFetch(`/cars?${params.toString()}`)
      .then((data) => {
        // Defensive: ensure data is an array
        if (Array.isArray(data)) {
          setCars(data);
          setTotal(0);
        } else if (data && Array.isArray(data.data)) {
          setCars(data.data);
          setTotal(data.total || 0);
        } else {
          setCars([]);
          setTotal(0);
        }
      })
      .catch((err) => setError(err?.message || "Failed to load cars"))
      .finally(() => setLoading(false));
  }, [filters, page]);

  return (
    <div className="p-6 flex flex-col items-center">
  <h2 className="text-2xl font-bold mb-2 text-center">WELCOME</h2>
      <h1 className="text-xl font-bold mb-4 text-center">Available Cars</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-4xl">
        <input
          type="text"
          placeholder="Search (brand/model/description)"
          value={filters.q}
          onChange={e => updateFilters({ q: e.target.value })}
          className="border p-2 rounded w-40 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Brand"
          value={filters.brand}
          onChange={e => updateFilters({ brand: e.target.value })}
          className="border p-2 rounded w-40 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Min Price"
          value={filters.min}
          onChange={e => updateFilters({ min: e.target.value })}
          className="border p-2 rounded w-40 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Max Price"
          value={filters.max}
          onChange={e => updateFilters({ max: e.target.value })}
          className="border p-2 rounded w-40 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            setFilters({ q: "", brand: "", min: "", max: "", available: "" });
            setPage(1);
          }}
          className="ml-12 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Clear
        </button>
      </div>

  {/* Cars Table */}
  <div className="overflow-x-auto mt-4 w-full max-w-4xl flex justify-center">
        {loading ? (
          <div className="text-center py-8">Loading cars…</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-8">No cars found.</div>
        ) : (
          <table className="min-w-full border-collapse border rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border px-4 py-2">Car</th>
                <th className="border px-4 py-2">Price / Day</th>
                <th className="border px-4 py-2">Availability</th>
                <th className="border px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, idx) => (
                <tr key={car.id} className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                  <td className="border px-4 py-2 font-semibold text-blue-700">
                    <Link href={`/cars/${car.id}`}>{car.brand} {car.model}</Link>
                  </td>
                  <td className="border px-4 py-2">${car.pricePerDay}</td>
                  <td className="border px-4 py-2">
                    {car.available ? (
                      <span className="text-green-600 font-bold" style={{ color: '#16a34a' }}>Available</span>
                    ) : (
                      <span className="text-red-600 font-bold">Unavailable</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">{car.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm">
          {cars.length ? (
            <>Showing {(page - 1) * pageSize + 1}–{(page - 1) * pageSize + cars.length} of {total}</>
          ) : "No cars found"}
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded border disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 rounded border disabled:opacity-50"
            disabled={page >= Math.ceil(total / pageSize) || cars.length === 0}
            onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


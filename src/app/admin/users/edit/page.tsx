"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../../lib/http";

export default function EditUserPage() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("id");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "User"
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await apiFetch(`/admin/users/${userId}`);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          email: data.email || "",
          role: data.role || "User"
        });
      } catch {
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Validate phone number
    if (!/^[0-9]+$/.test(form.phone)) {
      setError("Phone number must be numeric");
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.push("/admin/users");
    } catch (err: any) {
      setError(err?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit User</h1>
      <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-6 bg-white rounded-2xl shadow-xl p-8">
        <input
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
          className="border rounded px-3 py-2"
        />
        <select
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value as 'User' | 'Admin' }))}
          className="border rounded px-3 py-2"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        {error && <div className="text-red-600 text-center font-semibold mt-2">{error}</div>}
        <div className="flex gap-4 mt-4 justify-center">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            {loading ? "Updating..." : "Update"}
          </button>
          <button type="button" className="px-6 py-2 bg-gray-300 rounded-lg font-semibold" onClick={() => router.push("/admin/users")}>Cancel</button>
        </div>
      </form>
    </main>
  );
}

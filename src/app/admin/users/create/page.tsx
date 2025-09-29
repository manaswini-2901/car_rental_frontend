"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/http";

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "User",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      router.push("/admin/users");
    } catch (err: any) {
      setError(err?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New User</h1>
      <form onSubmit={handleCreate} className="grid grid-cols-1 gap-6 bg-white rounded-2xl shadow-xl p-8">
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
          className="border rounded px-3 py-2 bg-blue-50 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          minLength={8}
          className="border rounded px-3 py-2"
        />
        {error && <div className="text-red-600 text-center font-semibold mt-2">{error}</div>}
        <div className="flex gap-4 mt-4 justify-center">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
            {loading ? "Creating..." : "Create"}
          </button>
          <button type="button" className="px-6 py-2 bg-gray-300 rounded-lg font-semibold" onClick={() => router.push("/admin/users")}>Cancel</button>
        </div>
      </form>
    </main>
  );
}

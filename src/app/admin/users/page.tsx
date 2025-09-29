"use client";


import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/http";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "User" | "Admin";
  status?: string;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 10;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<{ firstName: string; lastName: string; phone: string; email: string; role: "User" | "Admin" }>({ firstName: "", lastName: "", phone: "", email: "", role: "User" });
  const [creating, setCreating] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  async function fetchUsers(pageNum: number): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/admin/users", { query: { page: pageNum, limit: pageSize } });
      if (Array.isArray(data?.data)) {
        setUsers(data.data);
        setTotalPages(data.pages || 1);
        setTotalUsers(data.total || data.data.length);
        if (typeof data.page === 'number') setPage(data.page);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (err) {
      setError("Failed to fetch users");
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number): Promise<void> {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
  fetchUsers(page);
    } catch {
      alert("Failed to delete user");
    }
  }

  async function handleEdit(user: User): Promise<void> {
    setEditingUser(user);
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email,
        role: user.role,
      });
  }

  async function handleUpdate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await apiFetch(`/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditingUser(null);
  fetchUsers(page);
    } catch {
      alert("Failed to update user");
    }
  }

  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setCreateError(null);
    try {
      await apiFetch(`/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setCreating(false);
      setForm({ firstName: "", lastName: "", phone: "", email: "", role: "User" });
      fetchUsers(page);
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create user");
    }
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <a
            href="/admin/users/create"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            New User
          </a>
        </div>
        <table className="w-full border rounded shadow mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id} className="border-b">
                <td className="py-2 px-4">{user.firstName} {user.lastName}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.phone || "-"}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4">
                  <span className="px-3 py-1 rounded bg-green-100 text-green-700 text-sm font-semibold">
                    {user.status || "Active"}
                  </span>
                </td>
                <td className="py-2 px-4 space-x-4">
                  <a
                    href={`/admin/users/edit?id=${user.id}`}
                    className="text-yellow-700 hover:underline font-semibold text-base"
                    style={{ background: 'none', border: 'none' }}
                  >
                    Edit
                  </a>
                  <a
                    href="#"
                    className="text-blue-700 hover:underline font-bold text-base"
                    style={{ background: 'none', border: 'none' }}
                    onClick={e => { e.preventDefault(); handleDelete(user.id); }}
                  >
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center gap-2 mt-2">
          {page > 1 && (
            <button
              className="px-4 py-2 border"
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
          )}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 border font-semibold ${page === i + 1 ? 'text-blue-700 font-bold underline' : 'text-gray-800'}`}
              onClick={() => setPage(i + 1)}
              disabled={page === i + 1}
              style={{ background: 'none', borderRadius: 0 }}
            >
              {i + 1}
            </button>
          ))}
          {page < totalPages && (
            <button
              className="px-4 py-2 border"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          )}
        </div>
        {editingUser && (
          <form onSubmit={handleUpdate} className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-xl shadow">
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
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
            <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setEditingUser(null)}>Cancel</button>
          </form>
        )}
        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </main>
  );
}

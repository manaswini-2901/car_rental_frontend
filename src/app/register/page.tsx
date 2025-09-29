"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/http";

type FieldErrors = Record<string, string>;

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      await apiFetch("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, email, password }),
      });
      router.push("/login");
    } catch (err: any) {
      // Backend may send { errors: { firstName: "...", ... } } or message
      let msg = "Registration failed";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.errors && typeof parsed.errors === "object") {
          setFieldErrors(parsed.errors as FieldErrors);
          msg = null as any; // suppress top error if we have field ones
        } else if (parsed?.message) {
          msg = String(parsed.message);
        }
      } catch {
        // err.message is plain text
        msg = err.message || msg;
      }
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-lg border bg-white px-6 py-7">
          <h1 className="text-3xl font-bold text-center mb-6">Create account</h1>

          {error && (
            <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
              {error}
            </p>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Taylor"
                required
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Johnson"
                required
              />
              {fieldErrors.lastName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="(555) 123-4567"
                required
              />
              {fieldErrors.phone && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="you@example.com"
                required
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Create a strong password"
                required
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5">
            Already have an account?{" "}
            <Link className="text-blue-600 hover:underline" href="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

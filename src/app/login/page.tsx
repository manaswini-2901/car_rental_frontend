"use client";

import { useState } from "react";
import { useSession } from "../components/SessionProvider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../lib/http";

export default function LoginPage() {
  const { refresh } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/cars";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      router.push(next);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f6fa] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-8 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Login</h1>
          {error ? (
            <p className="mb-6 text-base text-red-600 text-center font-medium">{error}</p>
          ) : null}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-gray-700" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-gray-700" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#2563eb] py-3 text-lg font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-60 transition shadow-md"
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>
          <p className="mt-6 text-center text-base text-gray-700">
            Don’t have an account?{' '}
            <Link href="/register" className="text-[#2563eb] hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

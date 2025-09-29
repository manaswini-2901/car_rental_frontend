"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "../../lib/http"; // components -> lib

type SessionUser = { id: number; email: string; role?: "User" | "Admin" };

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await apiFetch<SessionUser>("/auth/profile");
        if (alive) setUser(me);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="border-b bg-white">
      <div style={{ width: "100%", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", zIndex: 10 }}>
        <nav
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px",
            minHeight: "80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "56px" }}>
            {!(pathname === "/login" || pathname === "/register") && (
              <Link href="/cars" style={{ fontWeight: 700, fontSize: "22px", color: "#1a237e", textDecoration: "none", letterSpacing: "0.5px" }}>
                Cars
              </Link>
            )}
            {user ? (
              <>
                <Link href="/bookings" style={{ fontWeight: 700, fontSize: "22px", color: "#1a237e", textDecoration: "none", letterSpacing: "0.5px" }}>
                  My bookings
                </Link>
              </>
            ) : null}
            {user?.role === "Admin" && (
              <>
                <Link
                  href="/admin/bookings"
                  style={{ fontWeight: 700, fontSize: "22px", color: "#1a237e", textDecoration: "none", letterSpacing: "0.5px" }}
                >
                  Manage bookings
                </Link>
                <Link
                  href="/admin/users"
                  style={{ fontWeight: 700, fontSize: "22px", color: "#1a237e", textDecoration: "none", letterSpacing: "0.5px" }}
                >
                  Manage users
                </Link>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {loading ? null : user ? (
              <button
                onClick={handleLogout}
                style={{
                  padding: "12px 36px",
                  fontSize: "18px",
                  fontWeight: 700,
                  background: "#e3f2fd",
                  color: "#1565c0",
                  border: "1px solid #90caf9",
                  borderRadius: "10px",
                  cursor: "pointer",
                  marginLeft: "40px",
                  transition: "background 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#bbdefb")}
                onMouseOut={e => (e.currentTarget.style.background = "#e3f2fd")}
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" style={{ fontWeight: 700, fontSize: "22px", color: "#1a237e", textDecoration: "none", letterSpacing: "0.5px" }}>
                  Login
                </Link>
                <Link href="/register" style={{ fontWeight: 700, fontSize: "22px", color: "#1a237e", textDecoration: "none", letterSpacing: "0.5px" }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

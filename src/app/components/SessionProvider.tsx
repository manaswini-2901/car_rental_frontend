"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "../../lib/session";

type Session = {
  user: { id: number; email: string; role: string } | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<Session>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session["user"]>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await getSession();
      setUser(data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, refresh }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

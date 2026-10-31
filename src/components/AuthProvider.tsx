"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  /** Re-fetch the current user from /api/auth/me. */
  refresh: () => Promise<void>;
  /** Remove the local user after logout. */
  clear: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  clear: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.getMe();
      setUser(user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { user } = await api.getMe();
        if (active) setUser(user ?? null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const clear = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, clear }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

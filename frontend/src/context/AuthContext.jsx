/**
 * AuthContext.jsx — Real authentication connected to backend API
 * Fixes:
 *   1. Mock login/register replaced with real API calls
 *   2. JWT tokens stored & attached to all requests (authFetch)
 *   3. Auto token refresh on 401 (expired access token)
 *   4. scansRemaining, FREE_DAILY_LIMIT, upgradeToPremium, downgradePlan exposed
 *   5. No API keys or secrets in frontend
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const FREE_DAILY_LIMIT = 5;

function getTokens() {
  try {
    return {
      accessToken:  localStorage.getItem("cg_access"),
      refreshToken: localStorage.getItem("cg_refresh"),
    };
  } catch { return { accessToken: null, refreshToken: null }; }
}
function saveTokens(access, refresh) {
  try {
    if (access)  localStorage.setItem("cg_access",  access);
    if (refresh) localStorage.setItem("cg_refresh", refresh);
  } catch {}
}
function clearTokens() {
  try {
    localStorage.removeItem("cg_access");
    localStorage.removeItem("cg_refresh");
    localStorage.removeItem("cg_user");
    sessionStorage.removeItem("cg_seen");
    sessionStorage.removeItem("cg_chat_seen");
  } catch {}
}

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [authError, setAuthError] = useState(null);
  const refreshing  = useRef(false);

  // ── Boot: restore session from stored tokens ──────────────────────────
  useEffect(() => {
    async function restore() {
      const { accessToken, refreshToken } = getTokens();
      if (!refreshToken) { setLoading(false); return; }
      try {
        // Try refresh to get a fresh access token & user data
        const res = await fetch(`${API}/api/auth/refresh`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ refreshToken }),
        });
        if (res.ok) {
          const data = await res.json();
          saveTokens(data.accessToken, data.refreshToken);
          // Merge stored UI settings and preserved language
          try {
            const ui   = JSON.parse(localStorage.getItem("cg_ui") || "{}");
            const lang = localStorage.getItem("cropguard_lang");
            const merged = { ...data.user, ...ui, ...(lang ? { language: lang } : {}) };
            localStorage.setItem("cg_user", JSON.stringify(merged));
            setUser(merged);
          } catch { setUser(data.user); }
        } else {
          clearTokens();
        }
      } catch {
        // Network offline — use cached user
        try {
          const stored = localStorage.getItem("cg_user");
          if (stored && accessToken) setUser(JSON.parse(stored));
        } catch {}
      }
      setLoading(false);
    }
    restore();
  }, []);

  // ── authFetch: authenticated fetch with auto token refresh ─────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const { accessToken } = getTokens();

    const makeRequest = (token) => fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    let res = await makeRequest(accessToken);

    // Auto-refresh on 401
    if (res.status === 401 && !refreshing.current) {
      refreshing.current = true;
      try {
        const { refreshToken } = getTokens();
        if (!refreshToken) { setUser(null); clearTokens(); return res; }

        const rfRes = await fetch(`${API}/api/auth/refresh`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ refreshToken }),
        });
        if (rfRes.ok) {
          const data = await rfRes.json();
          saveTokens(data.accessToken, data.refreshToken);
          setUser(u => ({ ...u, ...data.user }));
          res = await makeRequest(data.accessToken);
        } else {
          setUser(null); clearTokens();
        }
      } finally {
        refreshing.current = false;
      }
    }
    return res;
  }, []);

  // ── login ──────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setAuthError(null);
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Login failed."); return null; }
      saveTokens(data.accessToken, data.refreshToken);
      try {
        const ui   = JSON.parse(localStorage.getItem("cg_ui") || "{}");
        const lang = localStorage.getItem("cropguard_lang");
        const merged = { ...data.user, ...ui, ...(lang ? { language: lang } : {}) };
        localStorage.setItem("cg_user", JSON.stringify(merged));
        setUser(merged);
        return merged;
      } catch {
        localStorage.setItem("cg_user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
    } catch {
      setAuthError("Network error. Please check your connection.");
      return null;
    }
  }, []);

  // ── register ───────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, institution, language }) => {
    setAuthError(null);
    try {
      const res  = await fetch(`${API}/api/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, institution, language }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Registration failed."); return null; }
      saveTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("cg_user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch {
      setAuthError("Network error. Please check your connection.");
      return null;
    }
  }, []);

  // ── logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const { refreshToken } = getTokens();
    try {
      await fetch(`${API}/api/auth/logout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      });
    } catch {}
    clearTokens();
    setUser(null);
  }, []);

  // ── reloadUser: re-fetch from /api/auth/me ─────────────────────────────
  const reloadUser = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/auth/me`);
      if (res.ok) {
        const data = await res.json();
        try {
          const ui   = JSON.parse(localStorage.getItem("cg_ui") || "{}");
          const lang = localStorage.getItem("cropguard_lang");
          const merged = { ...data, ...ui, ...(lang ? { language: lang } : {}) };
          localStorage.setItem("cg_user", JSON.stringify(merged));
          setUser(merged);
        } catch {
          localStorage.setItem("cg_user", JSON.stringify(data));
          setUser(data);
        }
      }
    } catch {}
  }, [authFetch]);

  // ── upgradeToPremium ───────────────────────────────────────────────────
  const upgradeToPremium = useCallback(async (plan = "premium") => {
    try {
      const res  = await authFetch(`${API}/api/auth/upgrade`, {
        method: "POST",
        body:   JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data.accessToken, null);
        setUser(u => ({ ...u, ...data.user }));
        return true;
      }
      return false;
    } catch { return false; }
  }, [authFetch]);

  // ── downgradePlan ──────────────────────────────────────────────────────
  const downgradePlan = useCallback(async () => {
    try {
      const res  = await authFetch(`${API}/api/auth/downgrade`, { method: "POST", body: "{}" });
      const data = await res.json();
      if (res.ok) {
        saveTokens(data.accessToken, null);
        setUser(u => ({ ...u, ...data.user }));
        return true;
      }
      return false;
    } catch { return false; }
  }, [authFetch]);

  // ── Computed values ────────────────────────────────────────────────────
  const isPremium      = user?.plan !== "free" && user?.plan != null;
  const scansRemaining = isPremium ? null : Math.max(0, FREE_DAILY_LIMIT - (user?.scans_today || 0));
  const canScan        = isPremium || (scansRemaining == null ? true : scansRemaining > 0);

  return (
    <AuthContext.Provider value={{
      user, loading, authError, setAuthError,
      login, register, logout, reloadUser, authFetch,
      isPremium, canScan,
      scansRemaining,
      FREE_DAILY_LIMIT,
      upgradeToPremium,
      downgradePlan,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

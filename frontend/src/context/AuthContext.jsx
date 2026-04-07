// src/context/AuthContext.jsx
// Handles: register, login, logout, token refresh, plan state
// Access token lives in memory (secure), refresh token in localStorage

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const FREE_DAILY_LIMIT = 5;

export function AuthProvider({ children }) {
  const [user,         setUser]         = useState(null);   // server user object
  const [accessToken,  setAccessToken]  = useState(null);   // in memory only
  const [loading,      setLoading]      = useState(true);   // initial auth check
  const [authError,    setAuthError]    = useState(null);
  const refreshTimer   = useRef(null);

  // ── Helpers ───────────────────────────────────────────────
  function getRefreshToken() {
    return localStorage.getItem("cg_rt");
  }
  function saveRefreshToken(token) {
    localStorage.setItem("cg_rt", token);
  }
  function clearRefreshToken() {
    localStorage.removeItem("cg_rt");
  }

  // ── Auth'd fetch helper ────────────────────────────────────
  // Automatically attaches Bearer token. Components should use this
  // instead of raw fetch() for all /api/ calls.
  // authFetch — attaches Bearer token to every API request
  // Simple version: no circular dependency on refresh
  // Token is 24h so expiry during a session is very unlikely
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
    // FormData: let browser set Content-Type with boundary
    if (options.body instanceof FormData) delete headers["Content-Type"];
    return fetch(url, { ...options, headers });
  }, [accessToken]);

  // ── Refresh access token ───────────────────────────────────
  const refresh = useCallback(async () => {
    const rt = getRefreshToken();
    if (!rt) { setLoading(false); return false; }

    try {
      const res  = await fetch(`${API}/api/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) {
        clearRefreshToken();
        setUser(null); setAccessToken(null);
        setLoading(false);
        return false;
      }
      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      saveRefreshToken(data.refreshToken); // rotated
      scheduleRefresh(data.accessToken);
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }, []);

  // ── Schedule token refresh 1 minute before expiry ─────────
  function scheduleRefresh(token) {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    try {
      const payload  = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = (payload.exp * 1000) - Date.now() - 60_000; // 1min early
      if (expiresIn > 0) {
        refreshTimer.current = setTimeout(refresh, expiresIn);
      }
    } catch {}
  }

  // ── Initial auth check on app load ─────────────────────────
  useEffect(() => {
    refresh();
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, []);

  // ── Register ───────────────────────────────────────────────
  async function register({ name, email, password, institution, language }) {
    setAuthError(null);
    const res  = await fetch(`${API}/api/auth/register`, {
      method:  "POST",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ name, email, password, institution, language }),
    });
    const data = await res.json();
    if (!res.ok) { setAuthError(data.error); return false; }
    setUser(data.user);
    setAccessToken(data.accessToken);
    saveRefreshToken(data.refreshToken);
    scheduleRefresh(data.accessToken);
    return true;
  }

  // ── Login ──────────────────────────────────────────────────
  async function login({ email, password }) {
    setAuthError(null);
    const res  = await fetch(`${API}/api/auth/login`, {
      method:  "POST",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setAuthError(data.error); return false; }
    setUser(data.user);
    setAccessToken(data.accessToken);
    saveRefreshToken(data.refreshToken);
    scheduleRefresh(data.accessToken);
    return true;
  }

  // ── Logout ─────────────────────────────────────────────────
  async function logout() {
    const rt = getRefreshToken();
    fetch(`${API}/api/auth/logout`, {
      method:  "POST",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({ refreshToken: rt }),
    }).catch(() => {});
    clearRefreshToken();
    setUser(null); setAccessToken(null);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }

  // ── Update profile ─────────────────────────────────────────
  async function updateProfile(patch) {
    const res  = await authFetch(`${API}/api/auth/me`, {
      method: "PUT",
      body:   JSON.stringify(patch),
    });
    const data = await res.json();
    if (res.ok) setUser(data);
    return res.ok;
  }

  // ── Upgrade plan ───────────────────────────────────────────
  async function upgradeToPremium() {
    const res  = await authFetch(`${API}/api/auth/upgrade`, {
      method: "POST",
      body:   JSON.stringify({ plan:"premium" }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setAccessToken(data.accessToken); // new token with plan
      scheduleRefresh(data.accessToken);
    }
    return res.ok;
  }

  async function downgradePlan() {
    const res  = await authFetch(`${API}/api/auth/downgrade`, { method:"POST" });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setAccessToken(data.accessToken);
      scheduleRefresh(data.accessToken);
    }
    return res.ok;
  }

  // ── Refresh local user from server ────────────────────────
  async function reloadUser() {
    if (!accessToken) return;
    const res = await authFetch(`${API}/api/auth/me`);
    if (res.ok) setUser(await res.json());
  }

  // ── Derived values ────────────────────────────────────────
  const isPremium      = user?.plan !== "free" && !!user;
  const scansRemaining = user
    ? (isPremium ? Infinity : Math.max(0, user.scans_remaining ?? FREE_DAILY_LIMIT))
    : 0;
  const canScan = user ? (isPremium || scansRemaining > 0) : false;

  return (
    <Ctx.Provider value={{
      user, loading, authError, accessToken,
      isPremium, scansRemaining, canScan, FREE_DAILY_LIMIT,
      login, register, logout, updateProfile,
      upgradeToPremium, downgradePlan, reloadUser,
      authFetch,
      setAuthError,
    }}>
      {children}
    </Ctx.Provider>
  );
}

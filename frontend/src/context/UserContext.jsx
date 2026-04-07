// src/context/UserContext.jsx
// Manages: user profile, plan (free/premium), scan quota, per-user storage
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const Ctx = createContext(null);
export const useUser = () => useContext(Ctx);

const FREE_DAILY_SCANS = 5;
const FREE_MAX_FARMS   = 2;

// Fake auth — replace with real JWT/OAuth for production
const DEFAULT_USER = {
  id:          "local_user",
  name:        "Researcher",
  institution: "Mekelle Institute of Technology",
  plan:        "free",     // "free" | "premium" | "enterprise"
  email:       "",
  joinedAt:    new Date().toISOString(),
};

function todayKey() {
  return new Date().toISOString().slice(0,10);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return { ...DEFAULT_USER, ...JSON.parse(localStorage.getItem("cg_user") || "{}") }; }
    catch { return DEFAULT_USER; }
  });

  // Scan quota
  const [scansToday, setScansToday] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("cg_quota") || "{}");
      return s.date === todayKey() ? (s.count || 0) : 0;
    } catch { return 0; }
  });

  // Persist user
  useEffect(() => {
    localStorage.setItem("cg_user", JSON.stringify(user));
    document.documentElement.setAttribute("data-theme",    user.theme    || "dark");
    document.documentElement.setAttribute("data-fontsize", user.fontSize || "medium");
  }, [user]);

  // Persist quota
  useEffect(() => {
    localStorage.setItem("cg_quota", JSON.stringify({ date: todayKey(), count: scansToday }));
  }, [scansToday]);

  const isPremium       = user.plan !== "free";
  const scansRemaining  = isPremium ? Infinity : Math.max(0, FREE_DAILY_SCANS - scansToday);
  const canScan         = isPremium || scansToday < FREE_DAILY_SCANS;
  const maxFarms        = isPremium ? 10 : FREE_MAX_FARMS;

  function updateUser(patch) {
    setUser(p => ({ ...p, ...patch }));
  }

  // Per-user history key
  const historyKey = `cg_history_${user.id}`;
  const farmsKey   = `cg_farms_${user.id}`;

  function recordScan() {
    setScansToday(n => n + 1);
  }

  // Upgrade (stub — wire to payment in production)
  function upgradeToPremium() {
    setUser(p => ({ ...p, plan: "premium" }));
  }

  function downgradeToFree() {
    setUser(p => ({ ...p, plan: "free" }));
  }

  // Per-user farms (isolated by user id)
  function getFarms() {
    try { return JSON.parse(localStorage.getItem(farmsKey) || "[]"); } catch { return []; }
  }
  function saveFarms(farms) {
    localStorage.setItem(farmsKey, JSON.stringify(farms));
  }

  return (
    <Ctx.Provider value={{
      user, updateUser,
      isPremium, canScan, scansRemaining, scansToday,
      maxFarms, FREE_DAILY_SCANS,
      recordScan, upgradeToPremium, downgradeToFree,
      historyKey, farmsKey, getFarms, saveFarms,
    }}>
      {children}
    </Ctx.Provider>
  );
}

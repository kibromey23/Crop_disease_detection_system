// src/App.jsx — CropGuard AI v11
// Fixes: lazy loading, memoized settings, light default theme, i18n topbar date
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { AuthProvider, useAuth }  from "./context/AuthContext";
import { useT }                   from "./i18n";
import { ToastProvider }          from "./components/Toast";
import Sidebar      from "./components/Sidebar";
import SplashScreen from "./components/SplashScreen";
import AlertsPanel  from "./components/AlertsPanel";
import AuthPage     from "./pages/AuthPage";
import "./App.css";

// ── Lazy-load every page — code splitting (critical perf fix) ──
const AIChat        = lazy(() => import("./components/AIChat"));
import ChatBubble from "./components/ChatBubble";
const ResultCard    = lazy(() => import("./components/ResultCard"));
const DetectPage    = lazy(() => import("./pages/DetectPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const HistoryPage   = lazy(() => import("./pages/HistoryPage"));
const EncyclopediaPage = lazy(() => import("./pages/EncyclopediaPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const FarmPage      = lazy(() => import("./pages/FarmPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const SettingsPage  = lazy(() => import("./pages/SettingsPage"));
const PricingPage   = lazy(() => import("./pages/PricingPage"));

const PAGE_TITLE_KEY = {
  dashboard:"nav_dashboard", detect:"nav_detect",
  history:"nav_history",    encyclopedia:"nav_encyclopedia",
  analytics:"nav_analytics", farm:"nav_farm",
  community:"nav_community", bookmarks:"nav_bookmarks",
  pricing:"upgrade_cta",     settings:"nav_settings",
};

// Simple page-level spinner
function PageLoader() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"40vh", flexDirection:"column", gap:12 }}>
      <div className="spinner"/>
    </div>
  );
}

function AppShell() {
  const { user, loading, logout, isPremium, canScan, reloadUser, authFetch } = useAuth();

  // ── useMemo: settings object only rebuilds when user actually changes ──
  const settings = useMemo(() => ({
    theme:       user?.theme       || "light",   // DEFAULT = LIGHT
    language:    user?.language    || "en",
    fontSize:    user?.fontSize    || "medium",
    confidence:  user?.confidence  || 70,
    autoSave:    user?.autoSave    !== false,
    showTop3:    user?.showTop3    !== false,
    userName:    user?.name        || "Researcher",
    institution: user?.institution || "Mekelle Institute of Technology",
    plan:        user?.plan        || "free",
  }), [user]);

  const t = useT(settings);

  const setSettings = useCallback(async (patch) => {
    const resolved = typeof patch === "function" ? patch(settings) : patch;
    const ui = {
      theme:      resolved.theme,
      fontSize:   resolved.fontSize,
      confidence: resolved.confidence,
      autoSave:   resolved.autoSave,
      showTop3:   resolved.showTop3,
    };
    localStorage.setItem("cg_ui", JSON.stringify(ui));
    document.documentElement.setAttribute("data-theme",    resolved.theme);
    document.documentElement.setAttribute("data-fontsize", resolved.fontSize);
    // Persist profile fields to server
    await authFetch(
      `${import.meta.env.VITE_API_URL||"http://localhost:3001"}/api/auth/me`,
      { method:"PUT", body: JSON.stringify({
          name: resolved.userName, institution: resolved.institution,
          language: resolved.language,
      })}
    ).catch(() => {});
    reloadUser();
  }, [settings, authFetch, reloadUser]);

  const [splash,     setSplash]     = useState(() => !sessionStorage.getItem("cg_seen"));
  const [page,       setPage]       = useState("dashboard");
  const [result,     setResult]     = useState(null);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showChat,   setShowChat]   = useState(false);
  const [chatOpened,  setChatOpened]  = useState(() => !!sessionStorage.getItem("cg_chat_seen"));
  const [isOffline,  setIsOffline]  = useState(!navigator.onLine);

  // Apply theme/font on mount from localStorage (instant, no flash)
  useEffect(() => {
    try {
      const ui = JSON.parse(localStorage.getItem("cg_ui") || "{}");
      document.documentElement.setAttribute("data-theme",
        ui.theme || "light");  // DEFAULT LIGHT
      document.documentElement.setAttribute("data-fontsize",
        ui.fontSize || "medium");
    } catch {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  // Apply theme whenever settings change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme",    settings.theme);
    document.documentElement.setAttribute("data-fontsize", settings.fontSize);
  }, [settings.theme, settings.fontSize]);

  // Responsive: close menu on resize
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Online/offline
  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const nav = useCallback((p) => {
    setPage(p); setResult(null); setMenuOpen(false);
  }, []);

  const handleResult = useCallback((data) => {
    reloadUser();
    setResult(data);
  }, [reloadUser]);

  // Localised date string
  const dateStr = useMemo(() => {
    // Map app language to correct BCP-47 locale for date formatting
    const localeMap = { en:"en-GB", am:"am-ET", ti:"ti-ET" };
    const locale = localeMap[settings.language] || "en-GB";
    try {
      return new Date().toLocaleDateString(locale, {
        weekday:"long", day:"numeric", month:"long", year:"numeric"
      });
    } catch {
      // Fallback if locale not supported by the browser
      return new Date().toLocaleDateString("en-GB", {
        weekday:"long", day:"numeric", month:"long", year:"numeric"
      });
    }
  }, [settings.language]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"var(--bg0)",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <div className="spinner"/>
        <div style={{ color:"var(--text3)", fontSize:13 }}>Loading CropGuard AI…</div>
      </div>
    </div>
  );

  if (!user) return <AuthPage/>;

  const pageTitle = t(PAGE_TITLE_KEY[page] || "nav_dashboard");

  return (
    <>
      {splash && <SplashScreen onDone={() => {
        sessionStorage.setItem("cg_seen", "1");
        setSplash(false);
      }}/>}

      <div className="app-shell" style={{ opacity:splash?0:1, transition:"opacity .45s ease" }}>
        {menuOpen && <div className="nav-overlay show" onClick={() => setMenuOpen(false)}/>}
        {showAlerts && <AlertsPanel onClose={() => setShowAlerts(false)} t={t}/>}

        <Sidebar page={page} nav={nav} t={t} menuOpen={menuOpen}/>

        <div className="app-content">
          {isOffline && (
            <div className="offline-bar">
              <span>📴</span>
              <span><strong>{t("offline_banner").split("—")[0]}</strong> — {t("offline_banner").split("—")[1]}</span>
            </div>
          )}

          <header className="topbar">
            <div style={{ display:"flex", alignItems:"center", gap:11 }}>
              <button className="menu-btn" onClick={() => setMenuOpen(p => !p)}
                aria-label="Toggle navigation">
                {menuOpen ? "✕" : "☰"}
              </button>
              <div className="topbar-left">
                <div className="topbar-title">{pageTitle}</div>
                <div className="topbar-date">{dateStr}</div>
              </div>
            </div>
            <div className="topbar-right">
              <button className="btn btn-primary btn-sm" onClick={() => nav("detect")}>
                ⊕ {t("btn_new_scan")}
              </button>
              <button className="topbar-bell" onClick={() => setShowAlerts(p => !p)}
                aria-label={t("alerts_title")}>
                🔔<span className="bell-dot"/>
              </button>
              <div className="status-pill">
                <span className="status-dot"/>{t("model_online")}
              </div>
              <div className="topbar-avatar" onClick={() => nav("settings")}
                title={t("nav_settings")} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && nav("settings")}>
                {settings.userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="main-area">
            <Suspense fallback={<PageLoader/>}>
              {page==="dashboard"    && <DashboardPage    nav={nav} settings={settings} t={t}/>}
              {page==="detect"       && !result && <DetectPage    onResult={handleResult} settings={settings} t={t} canScan={canScan}/>}
              {page==="detect"       &&  result && <ResultCard    result={result} onReset={() => setResult(null)} settings={settings} t={t}/>}
              {page==="history"      && <HistoryPage      settings={settings} t={t} nav={nav}/>}
              {page==="encyclopedia" && <EncyclopediaPage settings={settings} t={t}/>}
              {page==="analytics"    && <AnalyticsPage    settings={settings} t={t}/>}
              {page==="farm"         && <FarmPage         nav={nav} t={t}/>}
              {page==="community"    && <CommunityPage    nav={nav} t={t}/>}
              {page==="bookmarks"    && <BookmarksPage    nav={nav} t={t}/>}
              {page==="pricing"      && <PricingPage      t={t}/>}
              {page==="settings"     && <SettingsPage     settings={settings} setSettings={setSettings} t={t} onLogout={logout}/>}
            </Suspense>
          </main>
        </div>

        {/* ── AI Assistant ── */}
        {!showChat && (
          <ChatBubble
            lang={settings.language}
            hasBeenOpened={chatOpened}
            onClick={() => {
              setShowChat(true);
              setChatOpened(true);
              sessionStorage.setItem("cg_chat_seen", "1");
            }}
          />
        )}
        {showChat && (
          <Suspense fallback={null}>
            <AIChat t={t} onClose={() => setShowChat(false)} settings={settings}/>
          </Suspense>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppShell/>
      </AuthProvider>
    </ToastProvider>
  );
}

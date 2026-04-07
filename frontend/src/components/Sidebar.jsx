// src/components/Sidebar.jsx v10.1 — profile card + logout at bottom
import { useState } from "react";
import { LogoFull } from "./Logo";
import WeatherWidget from "./WeatherWidget";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

const NAV = [
  { section:"nav_main", items:[
    { id:"dashboard",    icon:"◈", key:"nav_dashboard"                    },
    { id:"detect",       icon:"⊕", key:"nav_detect",      badge:"new"     },
    { id:"history",      icon:"◷", key:"nav_history"                      },
    { id:"encyclopedia", icon:"◉", key:"nav_encyclopedia"                 },
    { id:"farm",         icon:"🌾",key:"nav_farm"                         },
  ]},
  { section:"nav_system", items:[
    { id:"analytics",  icon:"◫", key:"nav_analytics"                      },
    { id:"community",  icon:"👥",key:"nav_community", badge:"new"         },
    { id:"bookmarks",  icon:"🔖",key:"nav_bookmarks"                      },
    { id:"pricing",    icon:"⭐",key:"upgrade_cta",   badge:"gold"        },
  ]},
  { section:"nav_tools", items:[
    { id:"settings",   icon:"⚙", key:"nav_settings" },
  ]},
];

const PREMIUM_PAGES = new Set(["analytics"]);

export default function Sidebar({ page, nav, t, menuOpen }) {
  const {
    isPremium, scansRemaining,
    FREE_DAILY_LIMIT: FREE_DAILY_SCANS,
    user, logout,
  } = useAuth();

  const bookmarkCount = (() => {
    try { return JSON.parse(localStorage.getItem("cg_bookmarks")||"[]").length; } catch { return 0; }
  })();

  const scansPct  = isPremium ? 100 : Math.round(((scansRemaining ?? 0) / FREE_DAILY_SCANS) * 100);
  const scansFill = scansPct > 50 ? "" : scansPct > 20 ? "warning" : "danger";

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  async function handleLogout() {
    setShowLogoutModal(true);
  }

  return (
    <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-glow"/>

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-row"><LogoFull height={34}/></div>
        <div className="sidebar-tag">Plant Disease Detection</div>
      </div>

      {/* Plan badge */}
      <div
        className={`sidebar-plan-badge ${!isPremium ? "sidebar-plan-free" : ""}`}
        onClick={() => nav("pricing")}
      >
        <span style={{ fontSize:14 }}>{isPremium ? "⭐" : "🌱"}</span>
        <span>{isPremium ? t("user_premium_plan") : t("user_free_plan")}</span>
        {!isPremium && (
          <span style={{ marginLeft:"auto", fontSize:10, color:"var(--gold)", fontWeight:700 }}>
            {t("go_premium")}
          </span>
        )}
      </div>

      {/* Scan quota bar (free only) */}
      {!isPremium && (
        <div className="sidebar-scans-left">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:10.5, color:"var(--text3)" }}>
            <span>{t("user_scans_remaining").replace("{n}", scansRemaining ?? 0)}</span>
            <span>{scansRemaining ?? 0}/{FREE_DAILY_SCANS}</span>
          </div>
          <div className="scans-bar">
            <div className={`scans-fill ${scansFill}`} style={{ width:`${scansPct}%` }}/>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section">{t(section)}</div>
            {items.map(({ id, icon, key, badge }) => {
              const isLocked = PREMIUM_PAGES.has(id) && !isPremium;
              const isActive = page === id;
              const count    = id === "bookmarks" ? bookmarkCount : 0;
              return (
                <button
                  key={id}
                  className={`nav-item ${isActive?"active":""} ${isLocked?"locked":""}`}
                  onClick={() => isLocked ? nav("pricing") : nav(id)}
                  title={isLocked ? t("premium_feature") : ""}
                >
                  <span className="nav-icon">{icon}</span>
                  {t(key)}
                  {isLocked && <span className="nav-badge nav-badge-lock">⭐</span>}
                  {!isLocked && badge === "new" && <span className="nav-badge nav-badge-new">NEW</span>}
                  {!isLocked && badge === "gold" && !isPremium && <span className="nav-badge nav-badge-lock">⭐</span>}
                  {count > 0 && !isLocked && <span className="nav-badge nav-badge-count">{count}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Weather widget */}
      <div style={{ padding:"0 10px 8px", flexShrink:0 }}>
        <WeatherWidget t={t}/>
      </div>

      {/* ── Profile card + logout ─────────────────────────── */}
      <div className="sidebar-profile">
        {/* Avatar + name + plan */}
        <button className="sidebar-profile-card" onClick={() => nav("settings")}>
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">
              {user?.name || "Researcher"}
            </div>
            <div className="sidebar-profile-meta">
              {isPremium ? "⭐ Premium" : "🌱 Free plan"}
            </div>
          </div>
          <span style={{ fontSize:12, color:"var(--text3)", flexShrink:0 }}>⚙</span>
        </button>

        {/* Logout button */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <span style={{ fontSize:14 }}>→</span>
          <span>{t("sign_out")}</span>
        </button>
      </div>

      {showLogoutModal && (
        <ConfirmModal
          title="Sign out?"
          message="You will be signed out from this device. Your data is safely stored on the server."
          confirmLabel="Sign out"
          cancelLabel="Cancel"
          danger={false}
          onConfirm={async () => { setShowLogoutModal(false); await logout(); }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </aside>
  );
}

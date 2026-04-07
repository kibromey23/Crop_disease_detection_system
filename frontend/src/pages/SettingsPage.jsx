// src/pages/SettingsPage.jsx v10.3 — in-app confirm modal, no window.confirm
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function SettingsPage({ settings, setSettings, t, onLogout }) {
  const [tab,      setTab]      = useState("appearance");
  const [saving,   setSaving]   = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showSess, setShowSess] = useState(false);

  // Modal state — { title, message, confirmLabel, danger, onConfirm }
  const [modal, setModal] = useState(null);
  function confirm(opts) {
    return new Promise(resolve => {
      setModal({
        ...opts,
        onConfirm: () => { setModal(null); resolve(true);  },
        onCancel:  () => { setModal(null); resolve(false); },
      });
    });
  }

  const {
    user, isPremium, upgradeToPremium,
    downgradePlan, logout, authFetch,
    scansRemaining, FREE_DAILY_LIMIT,
  } = useAuth();
  const toast = useToast();

  function upd(k, v) { setSettings(p => ({...p, [k]:v})); }
  function save() { toast(t("btn_saved"), "success"); }

  async function saveProfile() {
    setSaving(true);
    const res = await authFetch(`${API}/api/auth/me`, {
      method: "PUT",
      body: JSON.stringify({
        name:        settings.userName,
        institution: settings.institution,
        language:    settings.language,
      }),
    });
    setSaving(false);
    if (res.ok) toast(t("btn_saved"), "success");
    else        toast("Could not save. Try again.", "error");
  }

  async function handleUpgrade() {
    const ok = await upgradeToPremium();
    if (ok) toast("🎉 Upgraded to Premium!", "success");
  }
  async function handleDowngrade() {
    const yes = await confirm({
      title: "Downgrade to Free?",
      message: "You will lose Premium features including unlimited scans, AI insights, and smart recommendations.",
      confirmLabel: "Yes, downgrade",
      danger: true,
    });
    if (!yes) return;
    await downgradePlan();
    toast("Downgraded to Free plan", "info");
  }

  async function handleLogout() {
    const yes = await confirm({
      title: "Sign out?",
      message: "You will be signed out from this device. Your data is safely stored on the server.",
      confirmLabel: "Sign out",
      danger: false,
    });
    if (!yes) return;
    await logout();
  }
  async function handleLogoutAll() {
    const yes = await confirm({
      title: "Sign out from all devices?",
      message: "This will end all active sessions on every device. You will need to sign in again.",
      confirmLabel: "Sign out all",
      danger: true,
    });
    if (!yes) return;
    await authFetch(`${API}/api/auth/logout-all`, { method:"POST" });
    toast("Signed out from all devices", "info");
    await logout();
  }
  async function loadSessions() {
    const res  = await authFetch(`${API}/api/auth/sessions`);
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
    setShowSess(true);
  }

  // Merged tabs: profile+account → "profile"
  const tabs = [
    { id:"appearance", lbl:t("tab_appearance"), icon:"🎨" },
    { id:"detection",  lbl:t("tab_detection"),  icon:"🔬" },
    { id:"profile",    lbl:t("tab_profile"),    icon:"👤" },
    { id:"about",      lbl:t("tab_about"),      icon:"ℹ"  },
  ];

  const scansPct = isPremium ? 100 : Math.round(((scansRemaining??0) / FREE_DAILY_LIMIT) * 100);

  return (
    <div className="page-anim">
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:10 }}>
        <p style={{ fontSize:13,color:"var(--text2)" }}>{t("settings_sub")}</p>
        <button className="btn btn-primary" onClick={save}>{t("btn_save")}</button>
      </div>

      <div className="settings-layout">
        {/* Side nav */}
        <div className="settings-nav">
          {tabs.map(tb => (
            <button key={tb.id} className={`snav-item ${tab===tb.id?"active":""}`}
              onClick={() => setTab(tb.id)}>
              {tb.icon} {tb.lbl}
            </button>
          ))}
          {/* Logout button at bottom of settings nav */}
          <button
            onClick={handleLogout}
            style={{
              marginTop:"auto", padding:"9px 12px", borderRadius:8,
              border:"1px solid transparent", background:"none",
              cursor:"pointer", width:"100%", textAlign:"left",
              fontFamily:"var(--fb)", fontSize:12.5, fontWeight:500,
              color:"var(--text3)", transition:"all var(--ease)",
              display:"flex", alignItems:"center", gap:8,
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--red-bg)";e.currentTarget.style.borderColor="rgba(240,82,82,.18)";e.currentTarget.style.color="var(--red-text)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor="transparent";e.currentTarget.style.color="var(--text3)";}}
          >
            → {t("sign_out")}
          </button>
        </div>

        <div className="settings-cards">

          {/* ── Appearance ───────────────────────────────── */}
          {tab==="appearance" && <>
            <div className="settings-card">
              <div className="settings-card-title">{t("theme_title")}</div>
              <div className="settings-card-desc">{t("theme_desc")}</div>
              <div className="theme-grid">
                {[["light","○",t("theme_light")],["dark","◑",t("theme_dark")]].map(([val,ico,lbl])=>(
                  <button key={val} className={`theme-btn ${settings.theme===val?"active":""}`}
                    onClick={()=>upd("theme",val)}>
                    <span>{ico}</span>{lbl}
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-card">
              <div className="settings-card-title">{t("fontsize_title")}</div>
              <div className="settings-card-desc">{t("fontsize_desc")}</div>
              <div style={{ display:"flex",gap:8 }}>
                {[["small",t("fs_small")],["medium",t("fs_medium")],["large",t("fs_large")]].map(([val,lbl])=>(
                  <button key={val} className={`btn ${settings.fontSize===val?"btn-primary":"btn-secondary"}`}
                    style={{flex:1}} onClick={()=>upd("fontSize",val)}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="settings-card">
              <div className="settings-card-title">{t("language_title")}</div>
              <div className="settings-card-desc">{t("language_desc")}</div>
              <select className="form-select" value={settings.language}
                onChange={e=>upd("language",e.target.value)}>
                <option value="en">🌐 English</option>
                <option value="am">🇪🇹 አማርኛ (Amharic)</option>
                <option value="ti">🇪🇹 ትግርኛ (Tigrinya)</option>
              </select>
            </div>
          </>}

          {/* ── Detection ────────────────────────────────── */}
          {tab==="detection" && <>
            <div className="settings-card">
              <div className="settings-card-title">{t("conf_title")}</div>
              <div className="settings-card-desc">{t("conf_desc")}</div>
              <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8 }}>
                <input type="range" min={30} max={95} step={5} className="form-range"
                  value={settings.confidence} onChange={e=>upd("confidence",Number(e.target.value))} style={{flex:1}}/>
                <span style={{ fontFamily:"var(--fh)",fontSize:22,fontWeight:800,color:"var(--green)",minWidth:52 }}>
                  {settings.confidence}%
                </span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:10.5,color:"var(--text3)" }}>
                <span>{t("conf_more")}</span><span>{t("conf_precise")}</span>
              </div>
            </div>
            {[
              { k:"showTop3", title:t("top3_title"),     desc:t("top3_desc") },
              { k:"autoSave", title:t("autosave_title"), desc:t("autosave_desc") },
            ].map(({k,title,desc}) => (
              <div className="settings-card" key={k}>
                <div className="toggle-row">
                  <div>
                    <div className="settings-card-title" style={{marginBottom:2}}>{title}</div>
                    <div style={{fontSize:11.5,color:"var(--text3)"}}>{desc}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={!!settings[k]}
                      onChange={e=>upd(k,e.target.checked)}/>
                    <span className="toggle-track"/>
                  </label>
                </div>
              </div>
            ))}
          </>}

          {/* ── Profile + Account (merged) ────────────────── */}
          {tab==="profile" && <>
            {/* Profile card preview */}
            <div className="settings-card" style={{ display:"flex",alignItems:"center",gap:16,padding:"20px 22px" }}>
              <div style={{
                width:56,height:56,borderRadius:14,
                background:"var(--green-dim)",color:"var(--green)",
                fontFamily:"var(--fh)",fontSize:24,fontWeight:800,
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,border:"2px solid var(--green-dim)",
              }}>
                {settings.userName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:"var(--fh)",fontSize:17,fontWeight:700,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {settings.userName}
                </div>
                <div style={{ fontSize:12,color:"var(--text3)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {user?.email}
                </div>
                <div style={{ marginTop:6,display:"flex",gap:6,flexWrap:"wrap" }}>
                  <span className={`badge ${isPremium?"badge-gold":"badge-green"}`}>
                    {isPremium?"⭐ Premium":"🌱 Free plan"}
                  </span>
                  <span className="badge badge-blue" style={{fontSize:10}}>{settings.institution}</span>
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="settings-card">
              <div className="settings-card-title">{t("name_title")}</div>
              <div className="settings-card-desc">{t("name_desc")}</div>
              <input className="form-input" value={settings.userName}
                onChange={e=>upd("userName",e.target.value)} placeholder={t("name_placeholder")}/>
            </div>
            <div className="settings-card">
              <div className="settings-card-title">{t("inst_title")}</div>
              <div className="settings-card-desc">{t("inst_desc")}</div>
              <input className="form-input" value={settings.institution}
                onChange={e=>upd("institution",e.target.value)} placeholder={t("inst_placeholder")}/>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end" }}>
              <button className="btn btn-primary" disabled={saving} onClick={saveProfile}>
                {saving?"Saving…":"Save profile"}
              </button>
            </div>

            {/* ─ Plan & quota ─ */}
            <div className="settings-card" style={{ background:isPremium?"var(--gold-bg)":"var(--bg2)", borderColor:isPremium?"rgba(245,197,66,.3)":"var(--border)" }}>
              <div className="settings-card-title">{t("plan_current")}</div>
              <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:isPremium?14:10 }}>
                <span style={{ fontSize:28 }}>{isPremium?"⭐":"🌱"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--fh)",fontSize:18,fontWeight:800,color:"var(--text1)" }}>
                    {t(`plan_${user?.plan||"free"}`)}
                  </div>
                  <div style={{ fontSize:12,color:"var(--text3)",marginTop:1 }}>
                    {isPremium
                      ? (user?.plan_expires_at ? `Expires ${new Date(user.plan_expires_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}` : "Active")
                      : t(`plan_${user?.plan||"free"}_desc`)}
                  </div>
                </div>
                {!isPremium
                  ? <button className="btn btn-gold btn-sm" onClick={handleUpgrade}>⭐ {t("go_premium")}</button>
                  : <button className="btn btn-ghost btn-sm" onClick={handleDowngrade} style={{color:"var(--text3)",fontSize:11}}>Downgrade</button>
                }
              </div>
              {/* Scan quota bar (free only) */}
              {!isPremium && (
                <div style={{ marginTop:4 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)",marginBottom:5 }}>
                    <span>Daily scans</span>
                    <span>{FREE_DAILY_LIMIT-(scansRemaining??0)}/{FREE_DAILY_LIMIT} used</span>
                  </div>
                  <div className="scans-bar" style={{ height:5 }}>
                    <div className={`scans-fill ${scansPct<30?"danger":scansPct<60?"warning":""}`}
                      style={{ width:`${100-scansPct}%` }}/>
                  </div>
                  <div style={{ fontSize:10,color:"var(--text3)",marginTop:4 }}>Resets at midnight</div>
                </div>
              )}
            </div>

            {/* Feature list */}
            <div className="settings-card">
              <div className="settings-card-title">Features on your plan</div>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {[
                  {feat:t("feat_unlimited_scans"), ok:isPremium},
                  {feat:t("feat_ai_insights"),     ok:isPremium},
                  {feat:t("feat_smart_rec"),        ok:isPremium},
                  {feat:t("feat_risk_score"),       ok:isPremium},
                  {feat:t("feat_multi_farm"),       ok:isPremium},
                  {feat:t("feat_offline"),          ok:isPremium},
                  {feat:t("feat_export"),           ok:isPremium},
                  {feat:t("feat_support"),          ok:isPremium},
                ].map(({feat,ok})=>(
                  <div key={feat} style={{ display:"flex",alignItems:"center",gap:9,fontSize:12.5 }}>
                    <span style={{ color:ok?"var(--green)":"var(--text3)",fontSize:14 }}>{ok?"✓":"—"}</span>
                    <span style={{ color:ok?"var(--text1)":"var(--text3)" }}>{feat}</span>
                  </div>
                ))}
              </div>
              {!isPremium && (
                <button className="btn btn-gold btn-full" style={{ marginTop:14 }} onClick={()=>window.nav?.("pricing")}>
                  ⭐ See all Premium features →
                </button>
              )}
            </div>

            {/* Account info */}
            <div className="settings-card">
              <div className="settings-card-title">Account info</div>
              {[
                ["Email",        user?.email || "—"],
                ["Member since", user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : "—"],
                ["User ID",      user?.id ? `#${user.id}` : "—"],
              ].map(([lbl,val]) => (
                <div key={lbl} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13 }}>
                  <span style={{ color:"var(--text3)" }}>{lbl}</span>
                  <span style={{ color:"var(--text1)",fontWeight:500 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Security */}
            <div className="settings-card">
              <div className="settings-card-title">Security</div>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                <button className="btn btn-secondary btn-full" onClick={loadSessions}>
                  📱 View active sessions
                </button>
                <button className="btn btn-danger btn-full" onClick={handleLogoutAll}>
                  → Sign out from all devices
                </button>
              </div>
              {showSess && sessions.length > 0 && (
                <div style={{ marginTop:12,display:"flex",flexDirection:"column",gap:6 }}>
                  {sessions.map(s => (
                    <div key={s.id} style={{ display:"flex",justifyContent:"space-between",padding:"8px 11px",background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border)",fontSize:12 }}>
                      <span style={{ color:"var(--text2)" }}>{s.device_info || "Unknown device"}</span>
                      <span style={{ color:"var(--text3)" }}>
                        {new Date(s.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>}

          {/* ── About ────────────────────────────────────── */}
          {tab==="about" && <>
            <div className="settings-card">
              <div className="settings-card-title">{t("about_title")}</div>
              <div className="settings-card-desc">{t("about_desc")}</div>
              {[
                [t("lbl_version"),"1.0.0"],
                [t("lbl_model"),"MobileNetV2 + Transfer Learning"],
                [t("lbl_dataset"),"PlantVillage (14 crops, 38 classes)"],
                [t("lbl_crops"),"Apple, Corn, Tomato, Grape + 10 more"],
                [t("lbl_inst"),"Mekelle Institute of Technology"],
                [t("lbl_submitted"),"Ins Gorge"],
                [t("lbl_year"),"2026"],
                [t("lbl_frontend"),"React 18 + Vite"],
                [t("lbl_backend"),"Node.js + Express + PostgreSQL"],
                [t("lbl_ai_server"),"Python + TensorFlow + FastAPI"],
              ].map(([lbl,val])=>(
                <div key={lbl} style={{ display:"flex",justifyContent:"space-between",fontSize:12.5,padding:"7px 0",borderBottom:"1px solid var(--border)" }}>
                  <span style={{ color:"var(--text3)" }}>{lbl}</span>
                  <span style={{ color:"var(--text1)",fontWeight:500,textAlign:"right",maxWidth:"55%" }}>{val}</span>
                </div>
              ))}
            </div>
            <div className="settings-card">
              <div className="settings-card-title">{t("team_title")}</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginTop:6 }}>
                {["Niema Kedir","Halefom Hailu","Guesh Teklu","Hadush Tsigabu","Kibrom Getachew","Solomon G/cherkos","G/zgher Destalem"].map(n=>(
                  <span key={n} className="badge badge-green">{n}</span>
                ))}
              </div>
            </div>
          </>}

        </div>
      </div>
      {modal && <ConfirmModal {...modal}/>}
    </div>
  );
}

// src/pages/ProfilePage.jsx — Dedicated user profile page
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ProfilePage({ nav, t }) {
  const { user, updateProfile, upgradeToPremium, downgradePlan, logout, isPremium, scansRemaining, FREE_DAILY_LIMIT, authFetch } = useAuth();
  const toast  = useToast();
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({
    name:        user?.name        || "",
    institution: user?.institution || "",
    language:    user?.language    || "en",
  });
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);

  async function saveProfile() {
    setSaving(true);
    const ok = await updateProfile(form);
    setSaving(false);
    if (ok) { toast("Profile updated", "success"); setEditing(false); }
    else    { toast("Could not save. Try again.", "error"); }
  }

  async function loadSessions() {
    const res  = await authFetch(`${API}/api/auth/sessions`);
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
    setShowSessions(true);
  }

  async function handleLogoutAll() {
    if (!window.confirm("Sign out from all devices?")) return;
    await authFetch(`${API}/api/auth/logout-all`, { method:"POST" });
    toast("Signed out from all devices", "info");
    await logout();
  }

  async function handleUpgrade() {
    const ok = await upgradeToPremium();
    if (ok) toast("🎉 Upgraded to Premium!", "success");
  }

  async function handleDowngrade() {
    if (!window.confirm("Downgrade to Free plan? You will lose Premium features.")) return;
    const ok = await downgradePlan();
    if (ok) toast("Downgraded to Free plan", "info");
  }

  const scansPct = isPremium ? 100 : Math.round(((scansRemaining??0)/FREE_DAILY_LIMIT)*100);

  const inputStyle = {
    width:"100%", background:"var(--bg2)", border:"1px solid var(--border)",
    borderRadius:"var(--r)", padding:"9px 12px", color:"var(--text1)",
    fontFamily:"var(--fb)", fontSize:13.5, outline:"none",
    transition:"border-color var(--ease)",
  };

  return (
    <div className="page-anim" style={{ maxWidth:600 }}>

      {/* Header card */}
      <div style={{
        background:"var(--bg1)", border:"1px solid var(--border)",
        borderRadius:20, padding:28, marginBottom:16,
        display:"flex", alignItems:"center", gap:18, position:"relative", overflow:"hidden",
      }}>
        {/* bg glow */}
        <div style={{ position:"absolute",top:-40,right:-40,width:200,height:200,background:"radial-gradient(circle,var(--green-glow2),transparent 70%)",pointerEvents:"none" }}/>
        
        {/* Avatar */}
        <div style={{
          width:64, height:64, borderRadius:16,
          background:"var(--green-dim)", color:"var(--green)",
          fontFamily:"var(--fh)", fontSize:28, fontWeight:800,
          display:"flex", alignItems:"center", justifyContent:"center",
          border:"2px solid var(--green-dim)", flexShrink:0, zIndex:1,
        }}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div style={{ flex:1, zIndex:1 }}>
          <div style={{ fontFamily:"var(--fh)", fontSize:20, fontWeight:800, color:"var(--text1)", marginBottom:3 }}>
            {user?.name || "Researcher"}
          </div>
          <div style={{ fontSize:12.5, color:"var(--text3)", marginBottom:6 }}>
            {user?.email}
          </div>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            <span className={`badge ${isPremium ? "badge-gold" : "badge-green"}`}>
              {isPremium ? "⭐ Premium" : "🌱 Free plan"}
            </span>
            <span className="badge badge-blue">{user?.institution}</span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p=>!p)}>
          {editing ? "Cancel" : "✏ Edit"}
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:16,padding:22,marginBottom:16,animation:"fadeUp .2s ease" }}>
          <div style={{ fontFamily:"var(--fh)",fontSize:14,fontWeight:700,color:"var(--text1)",marginBottom:16 }}>Edit profile</div>
          {[
            { key:"name",        label:"Full name",    ph:"Your name" },
            { key:"institution", label:"Institution",  ph:"Your institution" },
          ].map(({ key,label,ph }) => (
            <div key={key} style={{ marginBottom:13 }}>
              <label style={{ fontSize:11,fontWeight:700,color:"var(--text2)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5,display:"block" }}>{label}</label>
              <input style={inputStyle} value={form[key]}
                onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                placeholder={ph}/>
            </div>
          ))}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11,fontWeight:700,color:"var(--text2)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5,display:"block" }}>Language</label>
            <select style={{ ...inputStyle, appearance:"none", cursor:"pointer" }}
              value={form.language} onChange={e=>setForm(p=>({...p,language:e.target.value}))}>
              <option value="en">🌐 English</option>
              <option value="am">🇪🇹 አማርኛ (Amharic)</option>
              <option value="ti">🇪🇹 ትግርኛ (Tigrinya)</option>
            </select>
          </div>
          <div style={{ display:"flex",gap:9 }}>
            <button className="btn btn-ghost btn-full" onClick={()=>setEditing(false)}>Cancel</button>
            <button className="btn btn-primary btn-full" disabled={saving} onClick={saveProfile}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {/* Plan & quota */}
      <div style={{ background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:16,padding:22,marginBottom:16 }}>
        <div style={{ fontFamily:"var(--fh)",fontSize:14,fontWeight:700,color:"var(--text1)",marginBottom:14 }}>
          Subscription plan
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:isPremium?"var(--gold-bg)":"var(--bg2)",border:`1px solid ${isPremium?"rgba(245,197,66,.25)":"var(--border)"}`,borderRadius:12,marginBottom:14 }}>
          <span style={{ fontSize:26 }}>{isPremium?"⭐":"🌱"}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--fh)",fontSize:16,fontWeight:800,color:"var(--text1)" }}>
              {isPremium?"Premium":"Free plan"}
            </div>
            <div style={{ fontSize:12,color:"var(--text3)",marginTop:2 }}>
              {isPremium
                ? `Expires: ${user?.plan_expires_at ? new Date(user.plan_expires_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : "Never"}`
                : `${t("user_scans_remaining").replace("{n}", scansRemaining??0)} today`}
            </div>
          </div>
          {!isPremium ? (
            <button className="btn btn-gold btn-sm" onClick={handleUpgrade}>⭐ Upgrade</button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={handleDowngrade} style={{color:"var(--text3)",fontSize:11}}>
              Downgrade
            </button>
          )}
        </div>

        {/* Scan usage bar */}
        {!isPremium && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:11.5,color:"var(--text2)",marginBottom:6 }}>
              <span>Daily scans used</span>
              <span style={{ fontWeight:600 }}>{FREE_DAILY_LIMIT-(scansRemaining??0)}/{FREE_DAILY_LIMIT}</span>
            </div>
            <div className="scans-bar" style={{ height:6 }}>
              <div className={`scans-fill ${scansPct<50?"":""}${scansPct>80?"danger":scansPct>60?"warning":""}`}
                style={{ width:`${100-scansPct}%` }}/>
            </div>
            <div style={{ fontSize:10.5,color:"var(--text3)",marginTop:5 }}>Resets at midnight</div>
          </div>
        )}
      </div>

      {/* Account info */}
      <div style={{ background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:16,padding:22,marginBottom:16 }}>
        <div style={{ fontFamily:"var(--fh)",fontSize:14,fontWeight:700,color:"var(--text1)",marginBottom:14 }}>Account</div>
        {[
          ["Email",        user?.email],
          ["Member since", user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : "—"],
          ["User ID",      `#${user?.id}`],
        ].map(([label,val]) => (
          <div key={label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13 }}>
            <span style={{ color:"var(--text3)" }}>{label}</span>
            <span style={{ color:"var(--text1)",fontWeight:500 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Security / sessions */}
      <div style={{ background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:16,padding:22,marginBottom:16 }}>
        <div style={{ fontFamily:"var(--fh)",fontSize:14,fontWeight:700,color:"var(--text1)",marginBottom:14 }}>Security</div>
        <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
          <button className="btn btn-secondary btn-full" onClick={loadSessions}>
            📱 View active sessions
          </button>
          <button className="btn btn-danger btn-full" onClick={handleLogoutAll}>
            → Sign out from all devices
          </button>
        </div>

        {showSessions && sessions.length > 0 && (
          <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:7 }}>
            <div style={{ fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4 }}>Active sessions</div>
            {sessions.map(s => (
              <div key={s.id} style={{ display:"flex",justifyContent:"space-between",padding:"9px 12px",background:"var(--bg2)",borderRadius:9,border:"1px solid var(--border)",fontSize:12 }}>
                <span style={{ color:"var(--text2)" }}>{s.device_info || "Unknown device"}</span>
                <span style={{ color:"var(--text3)" }}>
                  {new Date(s.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button className="btn btn-danger btn-full btn-lg" onClick={async () => {
        if (!window.confirm("Sign out of CropGuard AI?")) return;
        await logout();
      }}>
        → Sign out
      </button>
    </div>
  );
}

// src/pages/AuthPage.jsx v2 — Full i18n, show/hide password, no personal placeholders
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogoFull } from "../components/Logo";
import { useT } from "../i18n";

export default function AuthPage() {
  const { login, register, authError, setAuthError } = useAuth();
  const [mode,     setMode]     = useState("login");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [lang,     setLang]     = useState("en");

  const t = useT({ language: lang });

  const [form, setForm] = useState({
    name:"", email:"", password:"", confirm:"",
    institution:"", language:"en",
  });

  function upd(k) {
    return e => { setForm(p => ({...p, [k]:e.target.value})); setAuthError(null); };
  }

  function handleLangChange(e) {
    setLang(e.target.value);
    setForm(p => ({...p, language: e.target.value}));
    setAuthError(null);
  }

  function pwStrength(pw) {
    if (!pw) return { score:0, label:"", color:"" };
    let s = 0;
    if (pw.length >= 8)           s++;
    if (pw.length >= 12)          s++;
    if (/[A-Z]/.test(pw))         s++;
    if (/[0-9]/.test(pw))         s++;
    if (/[^A-Za-z0-9]/.test(pw))  s++;
    const lvl = [
      { label:t("auth_pw_too_short"), color:"var(--red-text)"   },
      { label:t("auth_pw_weak"),      color:"var(--red-text)"   },
      { label:t("auth_pw_fair"),      color:"var(--amber-text)" },
      { label:t("auth_pw_good"),      color:"var(--amber-text)" },
      { label:t("auth_pw_strong"),    color:"var(--green)"      },
      { label:t("auth_pw_very_strong"),color:"var(--green)"     },
    ];
    return { score:s, ...lvl[Math.min(s, 5)] };
  }

  const strength     = mode === "register" ? pwStrength(form.password) : null;
  const confirmMatch = mode === "register" && form.confirm
    ? form.password === form.confirm : null;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    if (mode === "register") {
      if (!form.name.trim())                                              { setAuthError(t("auth_no_name"));     setLoading(false); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))               { setAuthError(t("auth_bad_email"));   setLoading(false); return; }
      if (form.password.length < 8)                                      { setAuthError(t("auth_pw_min"));      setLoading(false); return; }
      if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) { setAuthError(t("auth_pw_rules"));    setLoading(false); return; }
      if (form.password !== form.confirm)                                 { setAuthError(t("auth_pw_mismatch")); setLoading(false); return; }
      await register({ name:form.name, email:form.email, password:form.password, institution:form.institution, language:form.language });
    } else {
      await login({ email:form.email, password:form.password });
    }
    setLoading(false);
  }

  const inp = {
    width:"100%", background:"var(--bg2)", border:"1px solid var(--border)",
    borderRadius:"var(--r)", padding:"10px 13px", color:"var(--text1)",
    fontFamily:"var(--fb)", fontSize:14, outline:"none",
    transition:"border-color var(--ease)", marginTop:6,
  };
  const lbl = {
    fontSize:11.5, fontWeight:700, color:"var(--text2)",
    textTransform:"uppercase", letterSpacing:".06em", display:"block",
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg0)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:16, fontFamily:"var(--fb)" }}>

      <div style={{ position:"fixed", top:"18%", left:"50%", transform:"translateX(-50%)",
        width:400, height:400,
        background:"radial-gradient(circle,rgba(62,207,106,.08),transparent 70%)",
        pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>

        {/* Language selector — visible before login */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
          <select value={lang} onChange={handleLangChange} style={{
            background:"var(--bg1)", border:"1px solid var(--border)",
            borderRadius:8, padding:"5px 10px", color:"var(--text2)",
            fontFamily:"var(--fb)", fontSize:12, cursor:"pointer", outline:"none" }}>
            <option value="en">🌐 English</option>
            <option value="am">🇪🇹 አማርኛ</option>
            <option value="ti">🇪🇹 ትግርኛ</option>
          </select>
        </div>

        {/* Logo */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, marginBottom:24 }}>
          <LogoFull height={44}/>
          <div style={{ fontSize:11, color:"var(--text3)", letterSpacing:".08em", textTransform:"uppercase" }}>
            {t("auth_subtitle")}
          </div>
        </div>

        {/* Card */}
        <div style={{ background:"var(--bg1)", border:"1px solid var(--border)",
          borderRadius:20, padding:28, boxShadow:"var(--shadow-lg)" }}>

          {/* Mode toggle */}
          <div style={{ display:"flex", background:"var(--bg2)", borderRadius:10,
            padding:3, marginBottom:22, gap:3 }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setAuthError(null); setShowPw(false); setShowConf(false); }}
                style={{ flex:1, padding:"9px", borderRadius:8, border:"none",
                  cursor:"pointer", fontFamily:"var(--fb)", fontSize:13.5, fontWeight:600,
                  background:mode===m?"var(--bg1)":"transparent",
                  color:mode===m?"var(--text1)":"var(--text3)",
                  boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.18)":"none",
                  transition:"all .15s" }}>
                {m === "login" ? t("auth_sign_in") : t("auth_create_account")}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {mode === "register" && (<>
              {/* Full name — no example person name as placeholder */}
              <div>
                <label style={lbl}>{t("auth_full_name")}</label>
                <input style={inp} type="text" required autoComplete="name"
                  placeholder={t("auth_full_name")}
                  value={form.name} onChange={upd("name")}/>
              </div>
              {/* Institution */}
              <div>
                <label style={lbl}>{t("auth_institution")}</label>
                <input style={inp} type="text" autoComplete="organization"
                  placeholder={t("auth_institution")}
                  value={form.institution} onChange={upd("institution")}/>
              </div>
              {/* Language preference */}
              <div>
                <label style={lbl}>{t("auth_language")}</label>
                <select style={inp} value={form.language}
                  onChange={e => { upd("language")(e); setLang(e.target.value); }}>
                  <option value="en">🌐 English</option>
                  <option value="am">🇪🇹 አማርኛ (Amharic)</option>
                  <option value="ti">🇪🇹 ትግርኛ (Tigrinya)</option>
                </select>
              </div>
            </>)}

            {/* Email */}
            <div>
              <label style={lbl}>{t("auth_email")}</label>
              <input style={inp} type="email" required autoComplete="email"
                placeholder={t("auth_your_email")}
                value={form.email} onChange={upd("email")}/>
            </div>

            {/* Password + show/hide */}
            <div>
              <label style={lbl}>{t("auth_password")}</label>
              <div style={{ position:"relative" }}>
                <input style={{...inp, paddingRight:58}}
                  type={showPw?"text":"password"} required
                  placeholder={mode==="register" ? t("auth_pw_placeholder") : t("auth_your_password")}
                  value={form.password} onChange={upd("password")}
                  autoComplete={mode==="login"?"current-password":"new-password"}/>
                <button type="button" onClick={() => setShowPw(p=>!p)}
                  style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer",
                    color:"var(--green)", fontSize:12, fontWeight:700,
                    fontFamily:"var(--fb)", padding:"4px 6px" }}>
                  {showPw ? t("pw_hide") : t("pw_show")}
                </button>
              </div>

              {/* Strength bar — register only */}
              {mode === "register" && form.password && (
                <div style={{ marginTop:7 }}>
                  <div style={{ display:"flex", gap:3, marginBottom:3 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex:1, height:4, borderRadius:2,
                        background: i <= strength.score ? strength.color : "var(--bg4)",
                        transition:"background .22s" }}/>
                    ))}
                  </div>
                  <div style={{ fontSize:11.5, color:strength.color, fontWeight:500 }}>
                    {strength.label}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password + show/hide + match indicator */}
            {mode === "register" && (
              <div>
                <label style={lbl}>{t("auth_confirm_pw")}</label>
                <div style={{ position:"relative" }}>
                  <input style={{
                    ...inp, paddingRight:58,
                    borderColor: confirmMatch === null ? "var(--border)"
                      : confirmMatch ? "var(--green)" : "var(--red-text)",
                    marginTop:6,
                  }} type={showConf?"text":"password"} required
                    placeholder={t("auth_confirm_ph")}
                    value={form.confirm} onChange={upd("confirm")}
                    autoComplete="new-password"/>
                  <button type="button" onClick={() => setShowConf(p=>!p)}
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer",
                      color:"var(--green)", fontSize:12, fontWeight:700,
                      fontFamily:"var(--fb)", padding:"4px 6px" }}>
                    {showConf ? t("pw_hide") : t("pw_show")}
                  </button>
                </div>
                {confirmMatch !== null && (
                  <div style={{ fontSize:11.5, marginTop:5, fontWeight:500,
                    color: confirmMatch ? "var(--green)" : "var(--red-text)" }}>
                    {confirmMatch ? t("auth_pw_match") : "✗ " + t("auth_pw_mismatch")}
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {authError && (
              <div style={{ padding:"10px 13px", background:"var(--red-bg)",
                border:"1px solid rgba(240,82,82,.2)", borderRadius:"var(--r)",
                fontSize:13, color:"var(--red-text)", lineHeight:1.55 }}>
                {authError}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"13px", borderRadius:"var(--r)", border:"none",
              background: loading ? "var(--bg4)" : "var(--green)",
              color: loading ? "var(--text3)" : "var(--text-on-green)",
              fontFamily:"var(--fh)", fontSize:15, fontWeight:800,
              cursor:loading?"not-allowed":"pointer", transition:"all .18s", marginTop:4 }}>
              {loading ? t("auth_please_wait")
                : mode === "login" ? `${t("auth_sign_in")} →`
                : `${t("auth_create_account")} →`}
            </button>
          </form>

          {/* Free plan note */}
          {mode === "register" && (
            <div style={{ marginTop:16, padding:"11px 14px",
              background:"var(--green-glow)", border:"1px solid var(--green-dim)",
              borderRadius:"var(--r)", fontSize:12, color:"var(--text2)", lineHeight:1.65 }}>
              🌱 {t("auth_free_plan_note")}
            </div>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:16, fontSize:11.5, color:"var(--text3)" }}>
          CropGuard AI · Mekelle Institute of Technology · 2026
        </div>
      </div>
    </div>
  );
}

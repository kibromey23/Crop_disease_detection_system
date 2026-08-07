// src/components/ResultCard.jsx v10 — fully localised
import { useState, useEffect, useMemo } from "react";
import { useToast } from "./Toast";
import ExplainPanel       from "./ExplainPanel";
import FeedbackPanel      from "./FeedbackPanel";
import SmartRecommendation from "./SmartRecommendation";
import RiskScorePanel     from "./RiskScorePanel";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const SCIENTIFIC = {
  "Apple_scab":"Venturia inaequalis","Apple_Black_rot":"Botryosphaeria obtusa",
  "Apple_Cedar_apple_rust":"Gymnosporangium juniperi-virginianae",
  "Tomato_Late_blight":"Phytophthora infestans","Tomato_Early_blight":"Alternaria solani",
  "Tomato_Bacterial_spot":"Xanthomonas vesicatoria","Tomato_Leaf_Mold":"Fulvia fulva",
  "Tomato_Septoria_leaf_spot":"Septoria lycopersici","Tomato_Spider_mites":"Tetranychus urticae",
  "Tomato_Target_Spot":"Corynespora cassiicola","Tomato_mosaic_virus":"Tomato mosaic virus",
  "Tomato_Yellow_Leaf_Curl_Virus":"TYLCV (Begomovirus)",
  "Corn_Common_rust":"Puccinia sorghi","Corn_Northern_Leaf_Blight":"Exserohilum turcicum",
  "Grape_Black_rot":"Guignardia bidwellii","Grape_Esca":"Phaeomoniella chlamydospora",
  "Orange_Haunglongbing":"Candidatus Liberibacter","Potato_Early_blight":"Alternaria solani",
  "Potato_Late_blight":"Phytophthora infestans",
};

function getTKey(name) {
  const n = name.toLowerCase();
  if (n.includes("blight"))  return "blight";
  if (n.includes("rust"))    return "rust";
  if (n.includes("mildew"))  return "mildew";
  if (n.includes("spot") || n.includes("septoria")) return "spot";
  if (n.includes("mold"))    return "mold";
  if (n.includes("virus") || n.includes("mosaic") || n.includes("curl")) return "virus";
  return "default";
}

export default function ResultCard({ result, onReset, settings, t }) {
  const toast = useToast();
  const [tab,         setTab]        = useState("overview");
  const [bookmarked,  setBookmarked] = useState(false);
  const [showFeedback,setShowFeedback] = useState(false);
  const [scanHistory, setScanHistory]  = useState([]);

  const {
    image_url, disease, disease_friendly, confidence_pct,
    recommendation, urgency, disease_type, top3, created_at,
  } = result;

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("cg_scan_history") || "[]");
      setScanHistory(h);
    } catch {}
  }, []);

  const TABS = useMemo(() => [
    { id:"overview",  label: t("tab_overview")  },
    { id:"explain",   label: t("tab_explain")   },
    { id:"smart",     label: t("tab_smart")     },
    { id:"risk",      label: t("tab_risk")      },
    { id:"treatment", label: t("tab_treatment") },
    { id:"steps",     label: t("tab_steps")     },
  ], [t]);

  const isHealthy = disease.toLowerCase().includes("healthy");
  const confColor = confidence_pct > 80 ? "var(--green)" : confidence_pct > 55 ? "var(--amber)" : "var(--red)";
  const parts     = disease.split("___");
  const crop      = parts[0]?.replace(/_/g, " ") || t("unknown_crop");
  const name      = disease_friendly || (parts[1] || disease).replace(/_/g, " ");
  const scientific = SCIENTIFIC[parts[1]] || null;
  const tKey      = getTKey(name);

  const sevLabel = isHealthy ? null
    : confidence_pct > 80 ? t("severity_high")
    : confidence_pct > 55 ? t("severity_medium")
    : t("severity_low");
  const sevBadge = confidence_pct > 80 ? "badge-red" : confidence_pct > 55 ? "badge-amber" : "badge-green";

  const causeType = (() => {
    const n = name.toLowerCase();
    if (n.includes("virus") || n.includes("mosaic") || n.includes("curl"))
      return { label: t("cause_viral"),      icon:"🦠", color:"var(--purple)" };
    if (n.includes("bacterial"))
      return { label: t("cause_bacterial"),  icon:"🔬", color:"var(--red)" };
    if (n.includes("mite") || n.includes("spider"))
      return { label: t("cause_pest"),       icon:"🕷", color:"var(--amber)" };
    return   { label: t("cause_fungal"),     icon:"🍄", color:"var(--blue)" };
  })();

  function bookmark() {
    const saved = JSON.parse(localStorage.getItem("cg_bookmarks") || "[]");
    if (!bookmarked) {
      saved.push({ disease, recommendation, crop, name, date: new Date().toISOString() });
      localStorage.setItem("cg_bookmarks", JSON.stringify(saved));
      toast(t("notif_plan_saved"), "success");
    } else {
      localStorage.setItem("cg_bookmarks", JSON.stringify(saved.filter(s => s.disease !== disease)));
      toast(t("notif_deleted"), "info");
    }
    setBookmarked(p => !p);
  }

  async function share() {
    const text = `CropGuard AI — ${name}\n${t("confidence_score")}: ${confidence_pct.toFixed(1)}%\n${recommendation}`;
    if (navigator.share) {
      navigator.share({ title:"CropGuard AI", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      toast(t("notif_copied"), "success");
    }
  }

  function exportReport() {
    const c = [
      `CROPGUARD AI — ${new Date(created_at).toLocaleString("en-GB")}`,
      "=".repeat(40), "",
      `Crop: ${crop}  |  Disease: ${name}`,
      scientific ? `Scientific: ${scientific}` : "",
      `Confidence: ${confidence_pct.toFixed(1)}%  |  Severity: ${sevLabel || "N/A"}  |  Cause: ${causeType.label}`,
      "", "RECOMMENDATION", "-".repeat(36), recommendation,
      "", t("lbl_organic"), "-".repeat(36), t(`organic_${tKey}`),
      "", t("lbl_chemical"), "-".repeat(36), t(`chemical_${tKey}`),
      "", t("tab_steps"), "-".repeat(36),
      `1. ${t("step1")}`, `2. ${t("step2")}`, `3. ${t("step3")}`, `4. ${t("step4")}`, `5. ${t("step5")}`,
      "", "DISCLAIMER", "-".repeat(36), t("disclaimer"),
      "", "Mekelle Institute of Technology — CropGuard AI v1.0 — 2026",
    ].filter(l => l !== null).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([c], { type:"text/plain" }));
    a.download = `CropGuard_${crop}_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    toast(t("notif_exported"), "success");
  }

  return (
    <div className="result-wrap">
      {/* Header */}
      <div className="result-header">
        <h2>{t("analysis_complete")}</h2>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button className="btn btn-ghost btn-sm" onClick={bookmark}
            style={{ color: bookmarked ? "var(--amber)" : "" }}>
            {bookmarked ? t("btn_bookmarked") : t("btn_bookmark")}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={exportReport}>↓ {t("btn_report")}</button>
          <button className="btn btn-ghost btn-sm" onClick={share}>{t("btn_share")}</button>
          <button className="btn btn-ghost btn-sm"
            onClick={() => setShowFeedback(p => !p)}
            style={{ color:"var(--blue)" }}>
            {showFeedback ? t("feedback_btn_close") : t("feedback_btn_open")}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onReset}>
            ← {t("btn_new_scan2")}
          </button>
        </div>
      </div>

      {/* Main image + info */}
      <div className="result-main">
        <div className="result-img">
          <img src={`${API}${image_url}`} alt="leaf"/>
          <div className="result-img-overlay">
            <span style={{
              display:"inline-flex", alignItems:"center", gap:6,
              padding:"6px 14px", borderRadius:99, fontSize:12.5, fontWeight:700,
              letterSpacing:".02em",
              background: isHealthy ? "rgba(34,197,94,0.92)" : "rgba(239,68,68,0.92)",
              color:"#fff",
              boxShadow: isHealthy
                ? "0 0 0 2px rgba(34,197,94,0.4)"
                : "0 0 0 2px rgba(239,68,68,0.4)",
              backdropFilter:"blur(4px)",
            }}>
              {isHealthy ? "✓" : "●"}&nbsp;{isHealthy ? t("healthy_label").replace("✓","").trim() : t("disease_label").replace("⚠","").trim()}
            </span>
            <div style={{ fontSize:10.5, color:"rgba(255,255,255,.75)", marginTop:6, fontWeight:500 }}>
              {t("diagnosed_at")} {new Date(created_at).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}
            </div>
          </div>
        </div>

        <div className="result-body">
          <div className="result-crop">{crop}</div>
          <div className="result-name">{name}</div>
          {scientific && (
            <div style={{ fontSize:12, color:"var(--text3)", fontStyle:"italic", marginBottom:10 }}>
              ({scientific})
            </div>
          )}
          <div style={{ display:"flex", gap:7, marginBottom:14, flexWrap:"wrap" }}>
            {!isHealthy && sevLabel && <span className={`badge ${sevBadge}`}>{sevLabel}</span>}
            <span className="badge" style={{
              background: causeType.color + "18",
              color: causeType.color,
              border: `1px solid ${causeType.color}30`,
            }}>
              {causeType.icon} {causeType.label}
            </span>
            <span className="badge badge-blue">MobileNetV2</span>
          </div>

          <div className="conf-row">
            <span>{t("confidence_score")}</span>
            <span style={{ color:confColor, fontWeight:700 }}>{confidence_pct.toFixed(1)}%</span>
          </div>
          <div className="conf-bar">
            <div className="conf-fill" style={{ width:`${confidence_pct}%`, background:confColor }}/>
          </div>

          {/* Tab strip */}
          <div style={{
            display:"flex", gap:2, background:"var(--bg3)", borderRadius:9,
            padding:3, marginBottom:12, overflowX:"auto", flexWrap:"nowrap",
          }}>
            {TABS.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex:"0 0 auto", padding:"6px 11px", borderRadius:7, border:"none", cursor:"pointer",
                fontFamily:"var(--fb)", fontSize:12, fontWeight:600, whiteSpace:"nowrap",
                background: tab === id ? "var(--bg1)" : "transparent",
                color:      tab === id ? "var(--text1)" : "var(--text3)",
                boxShadow:  tab === id ? "0 1px 4px rgba(0,0,0,.25)" : "none",
                transition:"all .15s",
              }}>{label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex:1, overflowY:"auto" }}>

            {tab === "overview" && (
              <div>
                <div className="result-rec">
                  <div className="rec-label">{t("recommended_action")}</div>
                  <div className="rec-text">{recommendation}</div>
                </div>
                {settings.showTop3 && top3?.length > 0 && (
                  <div>
                    <div className="top3-title">{t("alt_predictions")}</div>
                    {top3.map((item, i) => (
                      <div className="top3-item" key={i}>
                        <div className="top3-name">
                          {item.disease.replace(/___/g, "·").replace(/_/g, " ")}
                        </div>
                        <div className="top3-bar">
                          <div className="top3-fill" style={{ width:`${item.confidence_pct}%` }}/>
                        </div>
                        <div className="top3-pct">{item.confidence_pct.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "explain" && (
              <ExplainPanel
                disease={disease} confidence_pct={confidence_pct}
                top3={top3} isHealthy={isHealthy}
              />
            )}
            {tab === "smart" && (
              <SmartRecommendation
                disease={disease} confidence_pct={confidence_pct} settings={settings}
              />
            )}
            {tab === "risk" && (
              <RiskScorePanel
                disease={disease} confidence_pct={confidence_pct} scanHistory={scanHistory}
              />
            )}

            {tab === "treatment" && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{
                  background:"var(--green-glow)", border:"1px solid var(--green-dim)",
                  borderRadius:10, padding:"12px 14px",
                }}>
                  <div style={{
                    fontSize:10, fontWeight:700, letterSpacing:".09em",
                    color:"var(--green)", textTransform:"uppercase", marginBottom:6,
                  }}>
                    {t("lbl_organic")}
                  </div>
                  <div style={{ fontSize:12.5, color:"var(--text1)", lineHeight:1.65 }}>
                    {t(`organic_${tKey}`)}
                  </div>
                </div>
                <div style={{
                  background:"var(--blue-bg)", border:"1px solid rgba(96,165,250,.2)",
                  borderRadius:10, padding:"12px 14px",
                }}>
                  <div style={{
                    fontSize:10, fontWeight:700, letterSpacing:".09em",
                    color:"var(--blue)", textTransform:"uppercase", marginBottom:6,
                  }}>
                    {t("lbl_chemical")}
                  </div>
                  <div style={{ fontSize:12.5, color:"var(--text1)", lineHeight:1.65 }}>
                    {t(`chemical_${tKey}`)}
                  </div>
                </div>
                <div style={{ fontSize:11, color:"var(--text3)", lineHeight:1.5 }}>
                  {t("lbl_chemical_warning")}
                </div>
              </div>
            )}

            {tab === "steps" && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { n:1, icon:"🔒", key:"step1" },
                  { n:2, icon:"💊", key:"step2" },
                  { n:3, icon:"🗑", key:"step3" },
                  { n:4, icon:"📅", key:"step4" },
                  { n:5, icon:"👨‍🌾", key:"step5" },
                ].map(({ n, icon, key }) => (
                  <div key={n} style={{
                    display:"flex", gap:10, alignItems:"flex-start",
                    padding:"9px 12px", background:"var(--bg2)",
                    borderRadius:9, border:"1px solid var(--border)",
                  }}>
                    <div style={{
                      width:24, height:24, borderRadius:"50%",
                      background:"var(--green-glow2)", border:"1px solid var(--green-dim)",
                      color:"var(--green)", fontSize:11, fontWeight:800,
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                    }}>{n}</div>
                    <div style={{ fontSize:12.5, color:"var(--text1)", paddingTop:2, lineHeight:1.55 }}>
                      {icon} {t(key)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="disclaimer-box">ⓘ {t("disclaimer")}</div>

      {showFeedback && (
        <FeedbackPanel
          disease={disease}
          scanId={result.id || Date.now()}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}

// src/components/AlertsPanel.jsx v2 — Full i18n (EN/AM/TI)
import { useState } from "react";

export default function AlertsPanel({ onClose, t }) {
  const SAMPLE = [
    { id:1, type:"outbreak", icon:"🦠", titleKey:"alert1_title", bodyKey:"alert1_body", time:"2h", urgent:true  },
    { id:2, type:"reminder", icon:"💊", titleKey:"alert2_title", bodyKey:"alert2_body", time:"1d", urgent:false },
    { id:3, type:"scan",     icon:"📅", titleKey:"alert3_title", bodyKey:"alert3_body", time:"2d", urgent:false },
    { id:4, type:"weather",  icon:"🌧", titleKey:"alert4_title", bodyKey:"alert4_body", time:"3d", urgent:true  },
    { id:5, type:"tip",      icon:"💡", titleKey:"alert5_title", bodyKey:"alert5_body", time:"4d", urgent:false },
  ];

  const [alerts, setAlerts] = useState(SAMPLE);
  const [filter, setFilter] = useState("all");

  const dismiss  = (id) => setAlerts(p => p.filter(a => a.id !== id));
  const clearAll = ()    => setAlerts([]);

  const filtered = filter === "all"    ? alerts
    : filter === "urgent"              ? alerts.filter(a => a.urgent)
    : alerts.filter(a => a.type === filter);

  const urgentCount = alerts.filter(a => a.urgent).length;

  const FILTERS = [
    ["all",      t("alerts_filter_all")],
    ["urgent",   t("alerts_filter_urgent")],
    ["outbreak", t("alerts_filter_outbreak")],
    ["reminder", t("alerts_filter_reminder")],
    ["weather",  t("alerts_filter_weather")],
  ];

  const urgentBg  = { high:"var(--red-bg)",    medium:"var(--amber-bg)", low:"var(--green-glow)" };
  const urgentBdr = { high:"rgba(240,82,82,.18)", medium:"rgba(245,166,35,.18)", low:"var(--green-dim)" };

  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:360,
      background:"var(--bg1)", borderLeft:"1px solid var(--border)",
      zIndex:500, display:"flex", flexDirection:"column",
      boxShadow:"-4px 0 24px rgba(0,0,0,.3)",
      animation:"slideLeft .25s cubic-bezier(.4,0,.2,1)" }}>

      {/* Header */}
      <div style={{ padding:"18px 18px 12px", borderBottom:"1px solid var(--border)",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div>
          <div style={{ fontFamily:"var(--fh)", fontSize:16, fontWeight:700, color:"var(--text1)",
            display:"flex", alignItems:"center", gap:8 }}>
            {t("alerts_title")}
            {urgentCount > 0 && (
              <span style={{ fontSize:10, fontWeight:700, background:"var(--red-text)",
                color:"#fff", padding:"2px 7px", borderRadius:20 }}>
                {t("alerts_urgent_badge").replace("{n}", urgentCount)}
              </span>
            )}
          </div>
          <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>
            {t("alerts_unread_sub").replace("{n}", alerts.length)}
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {alerts.length > 0 && (
            <button onClick={clearAll} style={{ fontSize:12, color:"var(--text3)",
              background:"none", border:"none", cursor:"pointer", fontFamily:"var(--fb)" }}>
              {t("alerts_clear")}
            </button>
          )}
          <button onClick={onClose} style={{ fontSize:20, color:"var(--text3)",
            background:"none", border:"none", cursor:"pointer", lineHeight:1 }}>✕</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:4, padding:"10px 14px",
        borderBottom:"1px solid var(--border)", overflowX:"auto",
        scrollbarWidth:"none", flexShrink:0 }}>
        {FILTERS.map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding:"5px 11px", borderRadius:20, border:"none", cursor:"pointer",
            fontSize:12, fontWeight:600, whiteSpace:"nowrap",
            background: filter===v ? "var(--green)" : "var(--bg3)",
            color:       filter===v ? "var(--text-on-green)" : "var(--text2)",
            transition:"all .15s", fontFamily:"var(--fb)",
          }}>{l}</button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ flex:1, overflowY:"auto", padding:"10px 12px",
        display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 20px" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🔔</div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--text2)", marginBottom:4 }}>
              {t("alerts_empty")}
            </div>
            <div style={{ fontSize:12, color:"var(--text3)" }}>{t("alerts_empty_sub")}</div>
          </div>
        ) : (
          filtered.map(a => (
            <div key={a.id} style={{
              background: a.urgent ? "var(--red-bg)" : "var(--bg2)",
              border: `1px solid ${a.urgent ? "rgba(240,82,82,.2)" : "var(--border)"}`,
              borderRadius:12, padding:"12px 14px",
              display:"flex", gap:10, alignItems:"flex-start",
            }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{a.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"var(--text1)", marginBottom:3 }}>
                  {t(a.titleKey)}
                </div>
                <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.55 }}>
                  {t(a.bodyKey)}
                </div>
                <div style={{ fontSize:10.5, color:"var(--text3)", marginTop:5 }}>
                  {a.time === "2h" ? "2h ago"
                   : a.time === "1d" ? "1d ago"
                   : a.time === "2d" ? "2d ago"
                   : a.time === "3d" ? "3d ago" : "4d ago"}
                </div>
              </div>
              <button onClick={() => dismiss(a.id)} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"var(--text3)", fontSize:14, flexShrink:0, padding:"2px 4px",
              }}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

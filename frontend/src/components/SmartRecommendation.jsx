// src/components/SmartRecommendation.jsx
// Smart Recommendation Engine — adaptive by crop type, growth stage, severity (#3)

const STAGE_STRATEGIES = {
  Seedling:   { prefer:"organic", escalate:false, note:"Seedlings are fragile — avoid strong chemicals. Organic options are safer at this stage." },
  Vegetative: { prefer:"organic", escalate:true,  note:"Early vegetative stage — start organic. Escalate to chemical only if disease spreads beyond 25% of canopy." },
  Flowering:  { prefer:"organic", escalate:true,  note:"Flowering stage — minimise chemical applications to protect pollinators. Target treatment to evenings." },
  Fruiting:   { prefer:"chemical",escalate:false,  note:"Fruiting stage — chemical may be necessary but observe pre-harvest intervals carefully." },
  Harvest:    { prefer:"none",    escalate:false,  note:"Near harvest — avoid all chemical applications. Harvest healthy portions first." },
  Dormant:    { prefer:"chemical",escalate:false,  note:"Dormant season — ideal time for preventive chemical treatment and pruning." },
};

const SEVERITY_ACTIONS = {
  high:   { urgency:"Immediate (within 24h)", escalation:"chemical", priority:1, label:"🔴 Critical" },
  medium: { urgency:"Soon (within 3 days)",   escalation:"organic first, then chemical if no improvement in 5 days", priority:2, label:"🟡 Moderate" },
  low:    { urgency:"This week",              escalation:"organic only", priority:3, label:"🟢 Low" },
};

const CROP_NOTES = {
  Tomato:     "Tomatoes are susceptible to a wide range of diseases. Monitor twice weekly during humid periods.",
  Corn:       "Corn diseases spread rapidly. Scout the entire field when symptoms are first detected.",
  Apple:      "Apple diseases require preventive spray programmes starting from bud break.",
  Grape:      "Grapes are especially vulnerable to fungal diseases. Canopy management is key.",
  Potato:     "Late Blight in potato can destroy an entire crop in days. Act immediately.",
  Pepper:     "Bacterial diseases in pepper spread via water splash — avoid overhead irrigation.",
  Peach:      "Peach bacterial spot — use resistant varieties for future planting.",
  Strawberry: "Strawberry diseases are often linked to poor drainage and air circulation.",
  Squash:     "Powdery mildew on squash responds well to organic treatments applied early.",
  Orange:     "Citrus greening has no cure — focus on prevention and vector control.",
  default:    "Follow integrated pest management practices for best long-term results.",
};

function getSeverity(confidence_pct) {
  if (confidence_pct > 80) return "high";
  if (confidence_pct > 55) return "medium";
  return "low";
}

export default function SmartRecommendation({ disease, confidence_pct, settings }) {
  const name    = (disease.split("___")[1] || disease).replace(/_/g, " ");
  const cropKey = disease.split("___")[0]?.replace(/_/g," ") || "Unknown";
  const sev     = getSeverity(confidence_pct);
  const isHealthy = disease.toLowerCase().includes("healthy");

  // Get farm growth stage from localStorage
  const farms = JSON.parse(localStorage.getItem("cg_farms") || "[]");
  const matchedFarm = farms.find(f => f.crop && name.toLowerCase().includes(f.crop.toLowerCase()) || f.crop === cropKey);
  const stage   = matchedFarm?.stage || null;
  const stageStrategy = stage ? STAGE_STRATEGIES[stage] : null;
  const sevAction = SEVERITY_ACTIONS[sev];
  const cropNote  = CROP_NOTES[cropKey] || CROP_NOTES.default;

  if (isHealthy) return (
    <div style={{ padding:"14px 16px", background:"var(--green-glow)", border:"1px solid var(--green-dim)", borderRadius:12 }}>
      <div style={{ fontFamily:"var(--fh)", fontSize:14, fontWeight:700, color:"var(--green)", marginBottom:6 }}>
        ✅ No action required
      </div>
      <div style={{ fontSize:13, color:"var(--text1)", lineHeight:1.65 }}>
        This crop appears healthy. Continue regular monitoring every 3–5 days during high-risk periods.
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* Priority & urgency header */}
      <div style={{ display:"flex", gap:10, alignItems:"center", padding:"12px 15px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12 }}>
        <div style={{ fontSize:24 }}>{sevAction.label.split(" ")[0]}</div>
        <div>
          <div style={{ fontFamily:"var(--fh)", fontSize:14, fontWeight:700, color:"var(--text1)" }}>
            {sevAction.label.split(" ").slice(1).join(" ")} Severity
          </div>
          <div style={{ fontSize:12, color:"var(--text3)" }}>
            ⏱ Act: <strong style={{ color:"var(--text2)" }}>{sevAction.urgency}</strong>
          </div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:10, color:"var(--text3)" }}>Priority</div>
          <div style={{ fontFamily:"var(--fh)", fontSize:22, fontWeight:800, color:sev==="high"?"var(--red)":sev==="medium"?"var(--amber)":"var(--green)" }}>
            #{sevAction.priority}
          </div>
        </div>
      </div>

      {/* Stage-aware strategy */}
      {stageStrategy ? (
        <div style={{ padding:"13px 15px", background:"var(--blue-bg)", border:"1px solid rgba(96,165,250,.2)", borderRadius:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:15 }}>🌱</span>
            <div style={{ fontFamily:"var(--fh)", fontSize:13, fontWeight:700, color:"var(--blue)" }}>
              Stage-aware: {stage}
            </div>
          </div>
          <div style={{ fontSize:13, color:"var(--text1)", lineHeight:1.65 }}>{stageStrategy.note}</div>
          <div style={{ marginTop:8, fontSize:12, color:"var(--blue)" }}>
            Recommended approach: <strong>{stageStrategy.prefer === "organic" ? "🌿 Start organic" : stageStrategy.prefer === "chemical" ? "⚗ Chemical treatment" : "⛔ Avoid treatment near harvest"}</strong>
          </div>
        </div>
      ) : (
        <div style={{ padding:"11px 14px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, fontSize:12.5, color:"var(--text2)" }}>
          💡 <strong>Tip:</strong> Add this crop to your Farm Manager with its growth stage for more personalised treatment recommendations.
        </div>
      )}

      {/* Escalation path */}
      <div style={{ padding:"13px 15px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12 }}>
        <div style={{ fontFamily:"var(--fh)", fontSize:13, fontWeight:700, color:"var(--text1)", marginBottom:10 }}>
          📋 Treatment escalation path
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sev !== "high" ? (
            <>
              <Step n={1} icon="🌿" label="Start organic" desc="Apply neem oil or copper-based organic fungicide. Monitor for 5 days." active />
              <Step n={2} icon="⚗" label="Escalate if needed" desc={`If no improvement after 5 days, switch to ${sevAction.escalation}.`} />
              <Step n={3} icon="👨‍🌾" label="Consult expert" desc="If symptoms worsen despite treatment, contact your agricultural extension officer." />
            </>
          ) : (
            <>
              <Step n={1} icon="🚨" label="Immediate chemical treatment" desc="Severity is high — organic options may be too slow. Apply chemical fungicide within 24h." active />
              <Step n={2} icon="🔒" label="Isolate and remove" desc="Remove and bag all severely infected plant material immediately." />
              <Step n={3} icon="📅" label="Follow-up scan in 7 days" desc="Rescan to verify treatment effectiveness." />
              <Step n={4} icon="👨‍🌾" label="Notify extension office" desc="High-severity outbreaks should be reported for regional tracking." />
            </>
          )}
        </div>
      </div>

      {/* Crop-specific note */}
      <div style={{ padding:"11px 14px", background:"var(--amber-bg)", border:"1px solid rgba(245,166,35,.18)", borderRadius:10, fontSize:12.5, color:"var(--text1)", lineHeight:1.6 }}>
        🌾 <strong>{cropKey} note:</strong> {cropNote}
      </div>
    </div>
  );
}

function Step({ n, icon, label, desc, active }) {
  return (
    <div style={{
      display:"flex", gap:10, alignItems:"flex-start", padding:"9px 12px",
      background: active ? "var(--green-glow)" : "var(--bg3)",
      border: active ? "1px solid var(--green-dim)" : "1px solid var(--border)",
      borderRadius:9, transition:"all .2s",
    }}>
      <div style={{
        width:24, height:24, borderRadius:"50%",
        background: active ? "var(--green)" : "var(--bg4)",
        color: active ? "#040d06" : "var(--text3)",
        fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      }}>{n}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12.5, fontWeight:600, color: active ? "var(--green)" : "var(--text1)", marginBottom:2 }}>
          {icon} {label}
        </div>
        <div style={{ fontSize:11.5, color:"var(--text3)", lineHeight:1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

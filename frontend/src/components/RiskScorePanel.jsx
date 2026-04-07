// src/components/RiskScorePanel.jsx
// Decision Support: Risk score, yield impact prediction, priority ranking (#6)

const YIELD_IMPACT = {
  blight:   { min:20, max:80, note:"Blights can cause catastrophic yield loss if untreated." },
  rust:     { min:10, max:40, note:"Rust diseases reduce grain/fruit quality and quantity." },
  mildew:   { min:5,  max:25, note:"Powdery mildew affects photosynthesis and fruit quality." },
  spot:     { min:5,  max:30, note:"Leaf spots reduce photosynthetic area." },
  mold:     { min:10, max:35, note:"Leaf mold significantly reduces fruit set and quality." },
  virus:    { min:30, max:100, note:"Viral diseases have no cure and can devastate entire crops." },
  default:  { min:5,  max:25, note:"Disease impact varies — early treatment minimises losses." },
};

function getYieldKey(name) {
  const n = name.toLowerCase();
  if (n.includes("blight"))               return "blight";
  if (n.includes("rust"))                 return "rust";
  if (n.includes("mildew"))              return "mildew";
  if (n.includes("spot")||n.includes("septoria")) return "spot";
  if (n.includes("mold"))                return "mold";
  if (n.includes("virus")||n.includes("mosaic")||n.includes("curl")) return "virus";
  return "default";
}

export default function RiskScorePanel({ disease, confidence_pct, scanHistory = [] }) {
  const name = (disease.split("___")[1] || disease).replace(/_/g, " ");
  const isHealthy = disease.toLowerCase().includes("healthy");
  const yKey = getYieldKey(name);
  const impact = YIELD_IMPACT[yKey];

  // Compute risk score 0–100
  const severityScore  = confidence_pct;  // high confidence = likely severe
  const spreadScore    = Math.min(scanHistory.filter(r => r.disease === disease).length * 15, 40); // repeated detections
  const riskScore      = Math.round(Math.min((severityScore * 0.6) + (spreadScore * 1), 100));
  const riskLabel      = riskScore >= 75 ? "Critical" : riskScore >= 50 ? "Moderate" : riskScore >= 25 ? "Low" : "Minimal";
  const riskColor      = riskScore >= 75 ? "var(--red)" : riskScore >= 50 ? "var(--amber)" : "var(--green)";

  // Estimated yield loss if untreated
  const yieldLossMin   = isHealthy ? 0 : Math.round(impact.min * (confidence_pct / 100));
  const yieldLossMax   = isHealthy ? 0 : Math.round(impact.max * (confidence_pct / 100));

  // Priority vs other scans
  const recentDiseased = scanHistory.filter(r => !r.disease.toLowerCase().includes("healthy")).slice(0, 5);
  const rank           = recentDiseased.findIndex(r => r.disease === disease) + 1 || 1;
  const isMostUrgent   = rank === 1 && !isHealthy;

  if (isHealthy) return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      <ScoreCard label="Crop Risk Score" value="LOW" sub="No disease detected" color="var(--green)" bg="var(--green-glow)"/>
      <ScoreCard label="Yield Impact" value="~0%" sub="No projected loss" color="var(--green)" bg="var(--green-glow)"/>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Score cards row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        <ScoreCard label="Risk Score" value={`${riskScore}/100`} sub={riskLabel} color={riskColor} bg={riskColor+"10"}/>
        <ScoreCard label="Yield Loss (if untreated)" value={`${yieldLossMin}–${yieldLossMax}%`} sub="Estimated range" color="var(--red)" bg="var(--red-bg)"/>
        <ScoreCard label="Treatment Priority" value={isMostUrgent ? "#1" : `#${rank}`} sub={isMostUrgent?"Treat this first":"Treat in order"} color="var(--amber)" bg="var(--amber-bg)"/>
      </div>

      {/* Risk gauge */}
      <div style={{ padding:"14px 16px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--text2)", marginBottom:8 }}>
          <span>Crop Health Risk</span>
          <span style={{ fontWeight:700, color:riskColor }}>{riskLabel} ({riskScore}/100)</span>
        </div>
        {/* Segmented gauge */}
        <div style={{ display:"flex", gap:2, height:10, borderRadius:6, overflow:"hidden" }}>
          {["var(--green)","var(--blue)","var(--amber)","var(--red)"].map((c,i) => (
            <div key={i} style={{ flex:1, background: riskScore > i*25 ? c : "var(--bg4)", transition:"background .5s" }}/>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:9.5, color:"var(--text3)", marginTop:5 }}>
          {["Minimal","Low","Moderate","Critical"].map(l => <span key={l}>{l}</span>)}
        </div>
      </div>

      {/* Yield impact */}
      <div style={{ padding:"13px 15px", background:"var(--red-bg)", border:"1px solid rgba(240,82,82,.18)", borderRadius:12 }}>
        <div style={{ fontFamily:"var(--fh)", fontSize:13, fontWeight:700, color:"var(--red)", marginBottom:6 }}>
          📉 Projected yield impact if untreated
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, marginBottom:8 }}>
          <div style={{ fontFamily:"var(--fh)", fontSize:32, fontWeight:800, color:"var(--red)", lineHeight:1 }}>
            {yieldLossMin}–{yieldLossMax}%
          </div>
          <div style={{ fontSize:12, color:"var(--text2)", paddingBottom:4 }}>potential loss</div>
        </div>
        <div style={{ fontSize:12.5, color:"var(--text2)", lineHeight:1.6 }}>{impact.note}</div>
        <div style={{ marginTop:10, padding:"8px 10px", background:"rgba(255,255,255,.05)", borderRadius:8, fontSize:12, color:"var(--text2)" }}>
          💡 <strong>With early treatment:</strong> Yield loss can be reduced to approximately {Math.round(yieldLossMin * 0.2)}–{Math.round(yieldLossMin * 0.4)}% through prompt intervention.
        </div>
      </div>

      {/* Spread factor */}
      {spreadScore > 0 && (
        <div style={{ padding:"11px 14px", background:"var(--amber-bg)", border:"1px solid rgba(245,166,35,.18)", borderRadius:10, fontSize:12.5, color:"var(--text1)", lineHeight:1.6 }}>
          🔁 <strong>Repeat detection:</strong> This disease has appeared in {Math.round(spreadScore/15)} recent scan(s). Indicates active disease pressure in your field — widen your scouting area.
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value, sub, color, bg }) {
  return (
    <div style={{ padding:"13px 14px", background:bg, border:`1px solid ${color}25`, borderRadius:12 }}>
      <div style={{ fontSize:10, color:"var(--text3)", fontWeight:600, letterSpacing:".07em", textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"var(--fh)", fontSize:20, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:11, color:"var(--text3)" }}>{sub}</div>
    </div>
  );
}

// src/components/ExplainPanel.jsx
// Trust & Explainability Layer — "Why this result?"
// Gives farmers human-readable reasoning, not just AI numbers

const VISUAL_CUES = {
  blight:   ["Dark lesions with concentric rings", "Yellow halo around spots", "Starts on lower older leaves", "Rapid spread in humid conditions"],
  rust:     ["Orange-brown powdery pustules", "Scattered across leaf surface", "Pustules break open releasing spores", "Yellow chlorotic areas around pustules"],
  mildew:   ["White powdery coating on leaves", "Affects young growth first", "Leaves curl and distort", "Powdery residue visible on touch"],
  spot:     ["Small circular lesions", "Dark border with lighter centre", "Multiple spots per leaf", "Yellow halo surrounding spots"],
  mold:     ["Yellow patches on upper surface", "Olive-green mould on underside", "Requires high humidity", "Starts on older leaves"],
  virus:    ["Mosaic light/dark green pattern", "Leaf distortion and curling", "Stunted plant growth", "Yellowing of young leaves"],
  mites:    ["Tiny yellow stippling pattern", "Fine webbing on underside", "Bronzing and drying of leaves", "Premature leaf drop"],
  default:  ["Pattern detected in leaf texture", "Colour deviation from healthy tissue", "Structural leaf damage visible", "Distribution matches known disease patterns"],
};

const CONFIDENCE_EXPLAIN = {
  high:   { label:"Very High Confidence", color:"var(--green)", bar:95, text:"The AI found strong visual evidence. Multiple disease markers clearly visible and consistent with known patterns." },
  good:   { label:"High Confidence",      color:"var(--green)", bar:82, text:"Clear visual evidence detected. Dominant features match this disease well. Minor ambiguity in secondary markers." },
  medium: { label:"Moderate Confidence",  color:"var(--amber)", bar:65, text:"Partial evidence detected. Some markers are present but image quality or early-stage symptoms create some uncertainty." },
  low:    { label:"Low Confidence",       color:"var(--red)",   bar:40, text:"Limited evidence. The model detected possible signs but strongly recommends a clearer photograph or expert consultation." },
};

const MODEL_STEPS = [
  { icon:"🔲", label:"Leaf segmentation",   desc:"Model isolated the leaf from background" },
  { icon:"🎨", label:"Colour analysis",      desc:"Detected abnormal pigmentation patterns" },
  { icon:"🔍", label:"Texture analysis",     desc:"Analysed lesion shape, size and distribution" },
  { icon:"📊", label:"Pattern matching",     desc:"Compared against 54,305 training images" },
  { icon:"🧠", label:"Classification",       desc:"Ranked 38 possible disease classes" },
];

function getVisualCues(name) {
  const n = name.toLowerCase();
  if (n.includes("blight"))              return VISUAL_CUES.blight;
  if (n.includes("rust"))                return VISUAL_CUES.rust;
  if (n.includes("mildew"))              return VISUAL_CUES.mildew;
  if (n.includes("spot")||n.includes("septoria")) return VISUAL_CUES.spot;
  if (n.includes("mold")||n.includes("mould"))    return VISUAL_CUES.mold;
  if (n.includes("virus")||n.includes("mosaic")||n.includes("curl")) return VISUAL_CUES.virus;
  if (n.includes("mite")||n.includes("spider"))   return VISUAL_CUES.mites;
  return VISUAL_CUES.default;
}

function getConfidenceLevel(pct) {
  if (pct >= 90) return CONFIDENCE_EXPLAIN.high;
  if (pct >= 75) return CONFIDENCE_EXPLAIN.good;
  if (pct >= 55) return CONFIDENCE_EXPLAIN.medium;
  return CONFIDENCE_EXPLAIN.low;
}

export default function ExplainPanel({ disease, confidence_pct, top3, isHealthy }) {
  const name      = (disease.split("___")[1] || disease).replace(/_/g, " ");
  const cues      = getVisualCues(name);
  const confLevel = getConfidenceLevel(confidence_pct);
  const margin    = top3?.length >= 2 ? confidence_pct - top3[1]?.confidence_pct : confidence_pct;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, animation:"fadeUp .3s ease" }}>

      {/* Confidence explanation */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 18px" }}>
        <div style={{ fontFamily:"var(--fh)", fontSize:13, fontWeight:700, color:"var(--text1)", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
          🎯 Confidence explained
        </div>

        {/* Visual confidence meter */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ flex:1, height:10, background:"var(--bg4)", borderRadius:5, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:5, background:confLevel.color,
              width:`${confidence_pct}%`, transition:"width 1.4s cubic-bezier(.4,0,.2,1)",
            }}/>
          </div>
          <span style={{ fontFamily:"var(--fh)", fontSize:18, fontWeight:800, color:confLevel.color, minWidth:52 }}>
            {confidence_pct.toFixed(1)}%
          </span>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text3)", marginBottom:12 }}>
          {[0,25,50,75,100].map(v => <span key={v}>{v}%</span>)}
        </div>

        <div style={{ background: confLevel.color + "12", border:`1px solid ${confLevel.color}25`, borderRadius:10, padding:"10px 13px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:confLevel.color, marginBottom:4 }}>{confLevel.label}</div>
          <div style={{ fontSize:12.5, color:"var(--text1)", lineHeight:1.6 }}>{confLevel.text}</div>
        </div>

        {margin > 0 && (
          <div style={{ marginTop:10, fontSize:12, color:"var(--text2)", lineHeight:1.55 }}>
            📊 <strong>{margin.toFixed(1)}% margin</strong> over the second-best match
            {margin > 20 ? " — strong differentiation from alternatives." : " — consider taking a clearer photo to increase certainty."}
          </div>
        )}
      </div>

      {/* Visual evidence — what the AI saw */}
      {!isHealthy && (
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 18px" }}>
          <div style={{ fontFamily:"var(--fh)", fontSize:13, fontWeight:700, color:"var(--text1)", marginBottom:12 }}>
            🔬 What the AI detected in this leaf
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {cues.map((cue, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 11px", background:"var(--bg3)", borderRadius:8, border:"1px solid var(--border)" }}>
                <div style={{ width:20, height:20, borderRadius:5, background:"var(--green-glow2)", border:"1px solid var(--green-dim)", color:"var(--green)", fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                  {i+1}
                </div>
                <span style={{ fontSize:13, color:"var(--text1)", lineHeight:1.55 }}>{cue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How the model works — 5-step process */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 18px" }}>
        <div style={{ fontFamily:"var(--fh)", fontSize:13, fontWeight:700, color:"var(--text1)", marginBottom:12 }}>
          ⚙ How the AI reached this result
        </div>
        <div style={{ position:"relative" }}>
          {/* Connecting line */}
          <div style={{ position:"absolute", left:14, top:20, bottom:20, width:1, background:"var(--border2)", zIndex:0 }}/>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {MODEL_STEPS.map(({ icon, label, desc }, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", position:"relative", zIndex:1 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--bg3)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>
                  {icon}
                </div>
                <div style={{ paddingTop:4 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"var(--text1)" }}>{label}</div>
                  <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:2 }}>{desc}</div>
                </div>
                <div style={{ marginLeft:"auto", fontSize:10, color:"var(--green)", fontWeight:700, paddingTop:6, flexShrink:0 }}>
                  Step {i+1}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop:14, padding:"10px 12px", background:"var(--blue-bg)", border:"1px solid rgba(96,165,250,.2)", borderRadius:9, fontSize:11.5, color:"var(--text2)", lineHeight:1.6 }}>
          🏋 Model trained on <strong>54,305 leaf images</strong> across 14 crops and 38 disease classes using MobileNetV2 transfer learning. Accuracy target: ≥85%.
        </div>
      </div>

      {/* Limitations notice */}
      <div style={{ padding:"11px 14px", background:"var(--amber-bg)", border:"1px solid rgba(245,166,35,.18)", borderRadius:10, fontSize:12, color:"var(--text2)", lineHeight:1.6 }}>
        ⚠ <strong>Limitations:</strong> AI accuracy depends on photo quality, lighting and crop growth stage. Early-stage diseases may produce lower confidence. Always confirm severe diagnoses with an agricultural extension officer.
      </div>
    </div>
  );
}

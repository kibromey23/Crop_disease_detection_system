// src/components/DiseaseEncyclopedia.jsx
// Searchable disease reference — detail opens inline below clicked card

import { useState, useRef, useEffect } from "react";

const DISEASES = [
  { name:"Wheat Leaf Rust",        crop:"Wheat",   cropIcon:"🌾", severity:"High",   type:"Fungal",    scientific:"Puccinia triticina",         symptom:"Orange-brown powdery pustules on upper leaf surface. Leaves turn yellow and dry.", treatment:"Apply Tebuconazole or Propiconazole fungicide. Remove and destroy infected plants. Use resistant varieties.", prevention:"Plant resistant varieties. Avoid dense planting. Monitor during warm humid weather." },
  { name:"Wheat Stem Rust",        crop:"Wheat",   cropIcon:"🌾", severity:"High",   type:"Fungal",    scientific:"Puccinia graminis",           symptom:"Dark red-brown pustules on stems and leaves. Severely weakens stems causing lodging.", treatment:"Spray Propiconazole fungicide at first sign. Use certified resistant seed.", prevention:"Use resistant varieties. Avoid late planting. Remove volunteer wheat plants." },
  { name:"Wheat Yellow Rust",      crop:"Wheat",   cropIcon:"🌾", severity:"Medium", type:"Fungal",    scientific:"Puccinia striiformis",        symptom:"Yellow-orange pustules in stripes along leaves. Leaves turn pale yellow.", treatment:"Apply Trifloxystrobin or Propiconazole early. Avoid excess nitrogen fertilizer.", prevention:"Plant resistant varieties. Monitor fields regularly in cool wet weather." },
  { name:"Northern Leaf Blight",   crop:"Maize",   cropIcon:"🌽", severity:"High",   type:"Fungal",    scientific:"Exserohilum turcicum",        symptom:"Long cigar-shaped gray-green to tan lesions (5–15 cm) on leaves with wavy edges.", treatment:"Apply Mancozeb or Azoxystrobin fungicide. Remove infected crop residue after harvest.", prevention:"Practice crop rotation. Use resistant hybrids. Bury infected residue." },
  { name:"Gray Leaf Spot",         crop:"Maize",   cropIcon:"🌽", severity:"Medium", type:"Fungal",    scientific:"Cercospora zeae-maydis",      symptom:"Rectangular gray to tan lesions with yellow borders running parallel to leaf veins.", treatment:"Use resistant hybrids. Apply Azoxystrobin or Propiconazole at early signs.", prevention:"Rotate crops. Ensure good plant spacing. Bury crop residue after harvest." },
  { name:"Common Rust",            crop:"Maize",   cropIcon:"🌽", severity:"Medium", type:"Fungal",    scientific:"Puccinia sorghi",             symptom:"Small powdery brick-red pustules on both sides of leaves. Turn dark brown with age.", treatment:"Apply Mancozeb or Chlorothalonil if severe. Plant resistant hybrids.", prevention:"Monitor during cool wet periods. Plant early-maturing resistant varieties." },
  { name:"Sorghum Anthracnose",    crop:"Sorghum", cropIcon:"🌿", severity:"High",   type:"Fungal",    scientific:"Colletotrichum sublineolum",  symptom:"Red or tan oval spots on leaves and stalks. Spots have dark red borders. Stalk rot in severe cases.", treatment:"Use certified disease-free seed. Apply Chlorothalonil. Destroy infected residue.", prevention:"Use resistant varieties. Rotate crops. Avoid dense planting." },
  { name:"Sorghum Downy Mildew",   crop:"Sorghum", cropIcon:"🌿", severity:"High",   type:"Fungal",    scientific:"Peronosclerospora sorghi",    symptom:"White downy growth on underside of leaves. Leaves turn yellow and plant is stunted.", treatment:"Treat seed with Metalaxyl before planting. Remove and destroy all infected plants.", prevention:"Use resistant varieties. Treat seed. Avoid fields with previous downy mildew." },
  { name:"Teff Leaf Spot",         crop:"Teff",    cropIcon:"🌱", severity:"Low",    type:"Fungal",    scientific:"Various fungal species",      symptom:"Small brown circular spots on leaves. Spots may have yellow halos. Mild defoliation.", treatment:"Improve plant spacing for airflow. Apply copper-based fungicide if severe.", prevention:"Avoid overhead irrigation. Use well-drained soil. Rotate crops." },
  { name:"Tomato Early Blight",    crop:"Tomato",  cropIcon:"🍅", severity:"Medium", type:"Fungal",    scientific:"Alternaria solani",           symptom:"Dark brown spots with concentric target-like rings on lower leaves. Yellow halo around spots.", treatment:"Apply Chlorothalonil or Mancozeb. Remove lower infected leaves. Stake plants for air circulation.", prevention:"Rotate crops. Mulch around base to prevent soil splash. Avoid overhead watering." },
  { name:"Tomato Late Blight",     crop:"Tomato",  cropIcon:"🍅", severity:"High",   type:"Fungal",    scientific:"Phytophthora infestans",      symptom:"Water-soaked gray-green lesions that turn brown fast. White mold on leaf undersides. Fruit rots.", treatment:"Apply Mancozeb or Cymoxanil IMMEDIATELY — spreads extremely fast. Remove all infected parts.", prevention:"Avoid wetting foliage. Use resistant varieties. Ensure good ventilation." },
  { name:"Tomato Bacterial Spot",  crop:"Tomato",  cropIcon:"🍅", severity:"Medium", type:"Bacterial", scientific:"Xanthomonas vesicatoria",     symptom:"Small dark water-soaked spots on leaves and fruit. Spots become brown with yellow halos.", treatment:"Apply copper-based bactericide. Remove infected stems and leaves. Avoid overhead irrigation.", prevention:"Use disease-free transplants. Avoid working with plants when wet. Rotate crops." },
  { name:"Tomato Leaf Mold",       crop:"Tomato",  cropIcon:"🍅", severity:"Medium", type:"Fungal",    scientific:"Fulvia fulva",                symptom:"Yellow patches on upper leaf surface. Olive-green to brown fuzzy mold on leaf underside.", treatment:"Improve ventilation. Apply Chlorothalonil or copper fungicide. Avoid wetting leaves.", prevention:"Space plants well. Keep humidity below 85%. Use resistant varieties." },
  { name:"Septoria Leaf Spot",     crop:"Tomato",  cropIcon:"🍅", severity:"Medium", type:"Fungal",    scientific:"Septoria lycopersici",        symptom:"Many small circular spots with dark borders and light gray centers. Tiny black dots inside spots.", treatment:"Apply Chlorothalonil or Mancozeb. Remove and destroy infected leaves.", prevention:"Mulch soil surface. Avoid overhead irrigation. Rotate crops annually." },
  { name:"Spider Mites",           crop:"Tomato",  cropIcon:"🍅", severity:"Medium", type:"Pest",      scientific:"Tetranychus urticae",         symptom:"Tiny yellow or white speckles on leaves. Fine webbing on leaf undersides. Leaves dry and curl.", treatment:"Apply Abamectin or Bifenazate miticide. Use neem oil as organic option. Increase humidity.", prevention:"Keep plants well-watered. Introduce predatory mites. Avoid dusty conditions." },
  { name:"Yellow Leaf Curl Virus", crop:"Tomato",  cropIcon:"🍅", severity:"High",   type:"Viral",     scientific:"TYLCV (Begomovirus)",         symptom:"Upward curling and yellowing of leaves. Stunted growth. Flowers drop without fruiting.", treatment:"No cure. Remove and destroy infected plants immediately. Control whiteflies with insecticides or sticky traps.", prevention:"Use TYLCV-resistant varieties. Install insect-proof mesh. Monitor for whiteflies." },
  { name:"Tomato Mosaic Virus",    crop:"Tomato",  cropIcon:"🍅", severity:"High",   type:"Viral",     scientific:"Tomato mosaic virus (ToMV)",  symptom:"Mottled light and dark green mosaic pattern on leaves. Distorted fern-like new growth.", treatment:"No cure. Remove infected plants. Disinfect tools with 10% bleach solution.", prevention:"Use resistant varieties. Wash hands before handling. Use certified disease-free transplants." },
  { name:"Tomato Target Spot",     crop:"Tomato",  cropIcon:"🍅", severity:"Medium", type:"Fungal",    scientific:"Corynespora cassiicola",      symptom:"Brown circular spots with concentric rings on leaves and fruit. Premature leaf drop.", treatment:"Apply Chlorothalonil or Azoxystrobin. Remove heavily infected leaves.", prevention:"Improve air circulation through staking. Avoid overhead irrigation." },
  { name:"Potato Early Blight",    crop:"Potato",  cropIcon:"🥔", severity:"Medium", type:"Fungal",    scientific:"Alternaria solani",           symptom:"Brown spots with yellow halo and target ring pattern on older lower leaves.", treatment:"Spray Chlorothalonil or Mancozeb. Ensure good drainage and adequate potassium.", prevention:"Rotate crops. Mulch to reduce soil splash. Avoid drought stress." },
  { name:"Potato Late Blight",     crop:"Potato",  cropIcon:"🥔", severity:"High",   type:"Fungal",    scientific:"Phytophthora infestans",      symptom:"Dark water-soaked lesions on leaves. White mold on underside. Tubers develop brown rot.", treatment:"Apply Mancozeb or Cymoxanil immediately. Remove all infected plant material.", prevention:"Use certified seed potatoes. Avoid overhead irrigation. Scout fields regularly." },
];

const SEVERITY_COLOR = { High:"badge-red", Medium:"badge-amber", Low:"badge-green" };

const TYPE_STYLE = {
  Fungal:    { bg:"#f0fdf4", color:"#15803d", border:"#bbf7d0", leftBorder:"#86efac" },
  Bacterial: { bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe", leftBorder:"#93c5fd" },
  Viral:     { bg:"#fdf4ff", color:"#7e22ce", border:"#e9d5ff", leftBorder:"#d8b4fe" },
  Pest:      { bg:"#fff7ed", color:"#c2410c", border:"#fed7aa", leftBorder:"#fdba74" },
};

export default function DiseaseEncyclopedia({ t }) {
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);
  const [cropFilter, setCropFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const detailRef = useRef(null);

  const crops = ["all", ...new Set(DISEASES.map(d => d.crop))];
  const types = ["all", "Fungal", "Bacterial", "Viral", "Pest"];

  const filtered = DISEASES.filter(d =>
    (cropFilter === "all" || d.crop === cropFilter) &&
    (typeFilter === "all" || d.type === typeFilter) &&
    (
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.symptom.toLowerCase().includes(search.toLowerCase()) ||
      d.crop.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Scroll the detail panel into view after it opens
  useEffect(() => {
    if (selected && detailRef.current) {
      setTimeout(() => {
        detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [selected]);

  function selectDisease(d) {
    setSelected(prev => prev?.name === d.name ? null : d);
  }

  return (
    <div>
      {/* ── Search + filter bar ──────────────────────────── */}
      <div style={{ display:"flex", gap:9, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, position:"relative" }}>
          <span style={{
            position:"absolute", left:11, top:"50%",
            transform:"translateY(-50%)", color:"var(--text3)",
            fontSize:15, pointerEvents:"none",
          }}>🔍</span>
          <input
            placeholder="Search diseases or symptoms…"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); }}
            style={{
              width:"100%", paddingLeft:34, paddingRight:12,
              paddingTop:9, paddingBottom:9,
              background:"var(--bg1)", border:"1px solid var(--border)",
              borderRadius:"var(--r)", color:"var(--text1)",
              fontSize:13, outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        <select value={cropFilter}
          onChange={e => { setCropFilter(e.target.value); setSelected(null); }}
          style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"8px 12px", color:"var(--text1)", fontSize:13, cursor:"pointer" }}>
          {crops.map(c => <option key={c} value={c}>{c === "all" ? "All crops" : c}</option>)}
        </select>

        <select value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setSelected(null); }}
          style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"8px 12px", color:"var(--text1)", fontSize:13, cursor:"pointer" }}>
          {types.map(tp => <option key={tp} value={tp}>{tp === "all" ? "All types" : tp}</option>)}
        </select>
      </div>

      {/* ── Result count ─────────────────────────────────── */}
      <div style={{ fontSize:12, color:"var(--text3)", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
        <span>{filtered.length} disease{filtered.length !== 1 ? "s" : ""} found</span>
        {(cropFilter !== "all" || typeFilter !== "all" || search) && (
          <button onClick={() => { setSearch(""); setCropFilter("all"); setTypeFilter("all"); setSelected(null); }}
            style={{ background:"none", border:"none", color:"var(--green)", fontSize:12, cursor:"pointer", fontWeight:600 }}>
            Clear filters ✕
          </button>
        )}
      </div>

      {/* ── Disease list — detail opens INLINE below each card ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 20px", color:"var(--text3)", fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
            No diseases found. Try a different search or filter.
          </div>
        )}

        {filtered.map(d => {
          const isOpen    = selected?.name === d.name;
          const ts        = TYPE_STYLE[d.type] || TYPE_STYLE.Fungal;

          return (
            <div key={d.name}>
              {/* ── Card row ─────────────────────────────── */}
              <div
                onClick={() => selectDisease(d)}
                style={{
                  background:   isOpen ? "var(--green-glow)" : "var(--bg1)",
                  border:       `1px solid ${isOpen ? "var(--green)" : "var(--border)"}`,
                  borderLeft:   `4px solid ${isOpen ? "var(--green)" : ts.leftBorder}`,
                  borderRadius: isOpen ? "var(--r) var(--r) 0 0" : "var(--r)",
                  padding:      "13px 16px",
                  cursor:       "pointer",
                  transition:   "all .15s ease",
                  userSelect:   "none",
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                  {/* Left: icon + name + meta */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>{d.cropIcon}</span>
                      <span style={{
                        fontWeight:700, fontSize:14,
                        color: isOpen ? "var(--green)" : "var(--text1)",
                      }}>
                        {d.name}
                      </span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color:"var(--text3)" }}>{d.crop}</span>
                      <span style={{ fontSize:11, color:"var(--text3)" }}>·</span>
                      <span style={{
                        fontSize:11, fontWeight:600, padding:"2px 8px",
                        borderRadius:20, background:ts.bg, color:ts.color,
                        border:`1px solid ${ts.border}`,
                      }}>
                        {d.type}
                      </span>
                    </div>
                    {/* Symptom preview — only when closed */}
                    {!isOpen && (
                      <div style={{
                        fontSize:12, color:"var(--text3)", marginTop:5, lineHeight:1.4,
                        display:"-webkit-box", WebkitLineClamp:1,
                        WebkitBoxOrient:"vertical", overflow:"hidden",
                      }}>
                        {d.symptom}
                      </div>
                    )}
                  </div>

                  {/* Right: severity + chevron */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    <span className={`badge ${SEVERITY_COLOR[d.severity]}`} style={{ fontSize:11 }}>
                      {d.severity}
                    </span>
                    <span style={{
                      fontSize:13, color:"var(--text3)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition:"transform .2s ease",
                      display:"inline-block",
                    }}>
                      ▾
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Detail panel — opens directly below the card ── */}
              {isOpen && (
                <div
                  ref={detailRef}
                  style={{
                    background:   "var(--bg1)",
                    border:       "1px solid var(--green)",
                    borderTop:    "none",
                    borderLeft:   "4px solid var(--green)",
                    borderRadius: "0 0 var(--r) var(--r)",
                    padding:      "18px 18px 20px",
                    animation:    "fadeUp .2s ease",
                  }}>

                  {/* Scientific name */}
                  <div style={{
                    fontSize:12, color:"var(--text3)", fontStyle:"italic",
                    marginBottom:14, paddingBottom:12,
                    borderBottom:"1px solid var(--border)",
                  }}>
                    {d.scientific}
                  </div>

                  {/* Symptoms */}
                  <InfoBlock
                    icon="🔍"
                    label="Symptoms"
                    value={d.symptom}
                    labelColor="var(--blue)"
                  />

                  {/* Treatment */}
                  <InfoBlock
                    icon="✅"
                    label="Treatment"
                    value={d.treatment}
                    labelColor="var(--amber-text)"
                    bg="var(--amber-bg)"
                    border="rgba(217,119,6,.2)"
                  />

                  {/* Prevention */}
                  <InfoBlock
                    icon="🛡️"
                    label="Prevention"
                    value={d.prevention}
                    labelColor="var(--green)"
                    bg="var(--green-glow)"
                    border="var(--green-dim)"
                    last
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reusable detail block ──────────────────────────────────────────────────
function InfoBlock({ icon, label, value, labelColor, bg, border, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <div style={{
        display:"flex", alignItems:"center", gap:6,
        fontSize:11, fontWeight:700, color: labelColor || "var(--text3)",
        textTransform:"uppercase", letterSpacing:".06em", marginBottom:6,
      }}>
        <span>{icon}</span> {label}
      </div>
      <div style={{
        fontSize:13, color:"var(--text1)", lineHeight:1.6,
        background:   bg     || "transparent",
        border:       border ? `1px solid ${border}` : "none",
        borderRadius: bg     ? 10 : 0,
        padding:      bg     ? "11px 14px" : 0,
      }}>
        {value}
      </div>
    </div>
  );
}

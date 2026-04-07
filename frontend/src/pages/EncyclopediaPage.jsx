// src/pages/EncyclopediaPage.jsx — Disease Guide
// Uses existing CSS classes from App.css + i18n keys from i18n.js
// Layout: fixed-height two-column — list left scrolls, detail right scrolls independently

import { useState, useMemo } from "react";

// ── Disease database ──────────────────────────────────────────────────────
const DISEASES = [
  { id:"apple_scab",        crop:"Apple",      icon:"🍎", name:"Apple Scab",             severity:"Medium", type:"Fungal",
    scientific:"Venturia inaequalis",
    symptoms:"Olive-green to brown scab-like lesions on leaves and fruit. Leaves curl and drop early.",
    cause:"Fungal spores spread by rain during cool, wet spring weather.",
    treatment:"Apply Captan or Mancozeb at green tip stage. Remove fallen infected leaves. Prune for air circulation.",
    prevention:"Plant resistant varieties. Rake and destroy fallen leaves in autumn. Avoid overhead irrigation." },
  { id:"apple_blackrot",    crop:"Apple",      icon:"🍎", name:"Apple Black Rot",         severity:"High",   type:"Fungal",
    scientific:"Botryosphaeria obtusa",
    symptoms:"Brown leaf lesions with purple borders. Fruit rots and turns black. Cankers on branches.",
    cause:"Fungal infection entering through wounds after hail or insect damage.",
    treatment:"Prune infected cankers and mummified fruit. Apply Captan or Thiophanate-methyl. Remove all infected material.",
    prevention:"Avoid wounding trees. Remove dead wood promptly. Keep orchard clean of mummified fruit." },
  { id:"apple_rust",        crop:"Apple",      icon:"🍎", name:"Cedar Apple Rust",        severity:"Medium", type:"Fungal",
    scientific:"Gymnosporangium juniperi-virginianae",
    symptoms:"Bright orange-yellow spots on upper leaf surface. Small tubes growing on leaf undersides.",
    cause:"Requires both apple and cedar/juniper trees to complete its life cycle.",
    treatment:"Apply myclobutanil or propiconazole fungicide from pink bud stage.",
    prevention:"Plant rust-resistant apple varieties. Avoid planting near juniper or cedar trees." },
  { id:"corn_gls",          crop:"Maize",      icon:"🌽", name:"Gray Leaf Spot",          severity:"High",   type:"Fungal",
    scientific:"Cercospora zeae-maydis",
    symptoms:"Rectangular gray to tan lesions with yellow borders running parallel to leaf veins.",
    cause:"Fungal spores thrive in warm, humid conditions with heavy dew. Worsened by dense planting.",
    treatment:"Apply Azoxystrobin or Propiconazole at early signs. Use resistant hybrids.",
    prevention:"Rotate crops. Bury crop residue after harvest. Ensure good plant spacing." },
  { id:"corn_rust",         crop:"Maize",      icon:"🌽", name:"Common Rust",             severity:"Medium", type:"Fungal",
    scientific:"Puccinia sorghi",
    symptoms:"Small powdery brick-red pustules on both sides of leaves. Pustules turn dark brown with age.",
    cause:"Wind-blown spores. Favoured by cool, moist conditions.",
    treatment:"Apply Mancozeb or Chlorothalonil if infection is severe. Plant resistant hybrids.",
    prevention:"Plant early-maturing resistant varieties. Monitor fields during cool wet periods." },
  { id:"corn_nlb",          crop:"Maize",      icon:"🌽", name:"Northern Leaf Blight",    severity:"High",   type:"Fungal",
    scientific:"Exserohilum turcicum",
    symptoms:"Long cigar-shaped gray-green to tan lesions (5–15 cm) on leaves with wavy edges.",
    cause:"Fungal infection in cool, moist weather. Spreads from infected crop residue.",
    treatment:"Apply Mancozeb or Azoxystrobin. Remove infected crop residue after harvest.",
    prevention:"Practice crop rotation. Use resistant hybrids. Bury infected residue." },
  { id:"grape_blackrot",    crop:"Grape",      icon:"🍇", name:"Grape Black Rot",         severity:"High",   type:"Fungal",
    scientific:"Guignardia bidwellii",
    symptoms:"Tan lesions with dark borders on leaves. Berries shrivel into hard black mummies.",
    cause:"Fungal spores released during wet weather from infected mummies and canes.",
    treatment:"Apply Mancozeb or Myclobutanil from bud break through harvest. Remove mummies.",
    prevention:"Remove mummified berries. Ensure good canopy management and air flow." },
  { id:"grape_esca",        crop:"Grape",      icon:"🍇", name:"Grape Esca",              severity:"High",   type:"Fungal",
    scientific:"Phaeomoniella chlamydospora",
    symptoms:"Tiger-stripe pattern of yellow and brown on leaves. Sudden vine collapse in summer.",
    cause:"Fungal complex entering through pruning wounds.",
    treatment:"No effective cure. Remove and destroy severely infected vines. Protect pruning wounds with fungicide paste.",
    prevention:"Prune during dry weather. Apply wound sealant immediately after pruning." },
  { id:"grape_leafblight",  crop:"Grape",      icon:"🍇", name:"Grape Leaf Blight",       severity:"Medium", type:"Fungal",
    scientific:"Isariopsis clavispora",
    symptoms:"Brown irregular spots on leaves. Leaves dry up and fall early, affecting yield.",
    cause:"Fungal infection in wet, humid conditions with poor air circulation.",
    treatment:"Apply copper-based fungicide or Mancozeb. Remove infected leaves promptly.",
    prevention:"Improve air circulation through canopy management. Avoid wetting foliage." },
  { id:"tomato_bacterial",  crop:"Tomato",     icon:"🍅", name:"Bacterial Spot",          severity:"Medium", type:"Bacterial",
    scientific:"Xanthomonas vesicatoria",
    symptoms:"Small water-soaked spots turning brown with yellow halos on leaves. Scabby spots on fruit.",
    cause:"Bacterial infection spread by rain splash and contaminated tools or transplants.",
    treatment:"Apply copper-based bactericide. Remove infected leaves. Avoid overhead irrigation.",
    prevention:"Use certified disease-free transplants. Avoid working with wet plants." },
  { id:"tomato_early",      crop:"Tomato",     icon:"🍅", name:"Early Blight",            severity:"Medium", type:"Fungal",
    scientific:"Alternaria solani",
    symptoms:"Dark brown target-ring spots on lower leaves. Yellow halo surrounds spots. Leaves drop early.",
    cause:"Soil-borne fungus splashed onto leaves by rain. Worse in warm, wet weather.",
    treatment:"Apply Chlorothalonil or Mancozeb. Remove lower infected leaves. Stake plants for air circulation.",
    prevention:"Rotate crops. Mulch around base to prevent soil splash. Avoid overhead watering." },
  { id:"tomato_late",       crop:"Tomato",     icon:"🍅", name:"Late Blight",             severity:"High",   type:"Fungal",
    scientific:"Phytophthora infestans",
    symptoms:"Water-soaked gray-green lesions turning brown. White mold on leaf undersides. Fruit rots rapidly.",
    cause:"Spreads extremely fast in cool, wet, humid conditions. Can destroy a crop within days.",
    treatment:"⚠️ Act immediately — apply Mancozeb or Cymoxanil. Remove all infected plant parts.",
    prevention:"Avoid wetting foliage. Use resistant varieties. Ensure good ventilation." },
  { id:"tomato_leafmold",   crop:"Tomato",     icon:"🍅", name:"Leaf Mold",               severity:"Medium", type:"Fungal",
    scientific:"Fulvia fulva",
    symptoms:"Yellow patches on upper leaf surface. Olive-green fuzzy mold on leaf underside.",
    cause:"High humidity and poor air circulation. Very common in greenhouses.",
    treatment:"Improve ventilation. Apply Chlorothalonil or copper fungicide. Avoid wetting leaves.",
    prevention:"Space plants well. Use resistant varieties. Keep humidity below 85%." },
  { id:"tomato_septoria",   crop:"Tomato",     icon:"🍅", name:"Septoria Leaf Spot",      severity:"Medium", type:"Fungal",
    scientific:"Septoria lycopersici",
    symptoms:"Many small circular spots with dark borders and light gray centers. Tiny black dots inside spots.",
    cause:"Fungal spores splashed from soil. Spreads rapidly in warm, wet weather.",
    treatment:"Apply Chlorothalonil or Mancozeb. Remove and destroy infected leaves.",
    prevention:"Mulch soil surface. Avoid overhead irrigation. Rotate crops annually." },
  { id:"tomato_mites",      crop:"Tomato",     icon:"🍅", name:"Spider Mites",            severity:"Medium", type:"Pest",
    scientific:"Tetranychus urticae",
    symptoms:"Tiny yellow or white speckles on leaves. Fine webbing on leaf undersides. Leaves dry and curl.",
    cause:"Hot, dry conditions. Dust and drought stress increase infestations significantly.",
    treatment:"Apply Abamectin or Bifenazate miticide. Use neem oil as an organic option. Increase humidity.",
    prevention:"Keep plants well-watered. Introduce predatory mites. Avoid dusty conditions." },
  { id:"tomato_target",     crop:"Tomato",     icon:"🍅", name:"Target Spot",             severity:"Medium", type:"Fungal",
    scientific:"Corynespora cassiicola",
    symptoms:"Brown circular spots with concentric rings on leaves and fruit. Premature leaf drop.",
    cause:"Fungal infection in warm, humid conditions with prolonged leaf wetness.",
    treatment:"Apply Chlorothalonil or Azoxystrobin. Remove heavily infected leaves.",
    prevention:"Improve air circulation through staking and pruning. Avoid overhead irrigation." },
  { id:"tomato_ylcv",       crop:"Tomato",     icon:"🍅", name:"Yellow Leaf Curl Virus",  severity:"High",   type:"Viral",
    scientific:"TYLCV (Begomovirus)",
    symptoms:"Upward curling and yellowing of leaves. Stunted growth. Flowers drop without fruiting.",
    cause:"Transmitted by whiteflies. Cannot spread plant-to-plant without the insect vector.",
    treatment:"No cure. Remove and destroy infected plants immediately. Control whitefly with sticky traps.",
    prevention:"Use TYLCV-resistant varieties. Install insect-proof mesh. Monitor for whiteflies regularly." },
  { id:"tomato_mosaic",     crop:"Tomato",     icon:"🍅", name:"Tomato Mosaic Virus",     severity:"High",   type:"Viral",
    scientific:"Tomato mosaic virus (ToMV)",
    symptoms:"Mottled light and dark green mosaic pattern on leaves. Distorted, fern-like new growth.",
    cause:"Highly contagious virus spread by touch, tools, and infected transplants.",
    treatment:"No cure. Remove infected plants. Disinfect tools with 10% bleach solution.",
    prevention:"Use resistant varieties. Wash hands before handling plants. Use certified transplants." },
  { id:"potato_early",      crop:"Potato",     icon:"🥔", name:"Early Blight",            severity:"Medium", type:"Fungal",
    scientific:"Alternaria solani",
    symptoms:"Dark brown target-ring spots on older lower leaves. Yellow tissue surrounds spots.",
    cause:"Soil-borne fungus splashed onto leaves. Worse in warm, wet weather.",
    treatment:"Apply Chlorothalonil or Mancozeb. Remove infected lower leaves. Ensure adequate potassium.",
    prevention:"Rotate crops. Mulch to reduce soil splash. Avoid drought stress." },
  { id:"potato_late",       crop:"Potato",     icon:"🥔", name:"Late Blight",             severity:"High",   type:"Fungal",
    scientific:"Phytophthora infestans",
    symptoms:"Water-soaked lesions on leaves and stems turning brown-black. White mold in humid conditions.",
    cause:"Spreads extremely rapidly in cool, wet weather. The same pathogen that caused the Irish Famine.",
    treatment:"⚠️ Apply Mancozeb or Cymoxanil immediately. Remove all infected material.",
    prevention:"Avoid overhead irrigation. Use resistant varieties. Scout fields regularly." },
  { id:"wheat_leaf_rust",   crop:"Wheat",      icon:"🌾", name:"Leaf Rust",               severity:"High",   type:"Fungal",
    scientific:"Puccinia triticina",
    symptoms:"Small round orange-brown pustules on upper leaf surface. Leaves yellow and die early.",
    cause:"Wind-blown spores. Favoured by moderate temperatures and high humidity.",
    treatment:"Apply Propiconazole or Tebuconazole at first signs. Use certified clean seed.",
    prevention:"Plant resistant varieties. Monitor fields from tillering stage onwards." },
  { id:"wheat_stem_rust",   crop:"Wheat",      icon:"🌾", name:"Stem Rust",               severity:"High",   type:"Fungal",
    scientific:"Puccinia graminis",
    symptoms:"Brick-red elongated pustules on stems and leaves. Stems weaken and break easily.",
    cause:"Wind-blown spores. Warm, humid conditions. Can travel thousands of kilometers.",
    treatment:"Apply Propiconazole or Trifloxystrobin immediately. Quarantine affected fields.",
    prevention:"Use Ug99-resistant varieties. Early sowing to avoid peak rust season." },
  { id:"wheat_yellow_rust", crop:"Wheat",      icon:"🌾", name:"Yellow (Stripe) Rust",    severity:"High",   type:"Fungal",
    scientific:"Puccinia striiformis",
    symptoms:"Yellow pustules arranged in stripes along leaf veins. Leaves turn yellow then die.",
    cause:"Cool temperatures (10–15°C) and high humidity. Spreads rapidly in highland areas.",
    treatment:"Apply Propiconazole or Tebuconazole at first signs. Early treatment is critical.",
    prevention:"Plant resistant varieties. Monitor highland fields closely in cool seasons." },
  { id:"orange_hlb",        crop:"Orange",     icon:"🍊", name:"Citrus Greening (HLB)",   severity:"High",   type:"Bacterial",
    scientific:"Candidatus Liberibacter",
    symptoms:"Yellow mottling of leaves. Fruit stays partially green. Small, bitter, lopsided fruit.",
    cause:"Transmitted by the Asian citrus psyllid insect. No cure once infected.",
    treatment:"No cure. Remove and destroy infected trees immediately to prevent spread.",
    prevention:"Control psyllid vector with insecticides. Plant certified disease-free trees only." },
  { id:"peach_bacterial",   crop:"Peach",      icon:"🍑", name:"Bacterial Spot",          severity:"Medium", type:"Bacterial",
    scientific:"Xanthomonas arboricola",
    symptoms:"Small water-soaked spots on leaves turning brown with yellow halos. Lesions on fruit surface.",
    cause:"Bacterial infection spread by rain splash. Worse in warm, wet, windy conditions.",
    treatment:"Apply copper-based bactericide in autumn and spring. Avoid overhead irrigation.",
    prevention:"Choose resistant varieties. Remove infected twigs during dry weather." },
  { id:"strawberry_scorch", crop:"Strawberry", icon:"🍓", name:"Leaf Scorch",             severity:"Medium", type:"Fungal",
    scientific:"Diplocarpon earlianum",
    symptoms:"Small dark purple spots on upper leaf surface. Spots enlarge, leaves turn brown and die.",
    cause:"Fungal infection. Favoured by warm, moist conditions and overhead irrigation.",
    treatment:"Apply Captan or Myclobutanil. Remove infected leaves. Ensure good drainage.",
    prevention:"Avoid overhead irrigation. Ensure good air circulation. Remove old leaves after harvest." },
];

// ── Severity colour mapping using CSS vars from App.css ──────────────────
const SEV_STYLE = {
  High:   { badge:"badge-red",    boxClass:"enc-box amber" },
  Medium: { badge:"badge-amber",  boxClass:"enc-box amber" },
  Low:    { badge:"badge-green",  boxClass:"enc-box green" },
};

const TYPE_COLOR = {
  Fungal:    "var(--purple-text)",
  Bacterial: "var(--blue-text)",
  Viral:     "var(--red-text)",
  Pest:      "var(--amber-text)",
};

const CROPS = ["All", ...Array.from(new Set(DISEASES.map(d => d.crop))).sort()];

export default function EncyclopediaPage({ t }) {
  const [search,     setSearch]  = useState("");
  const [cropFilter, setCrop]    = useState("All");
  const [sevFilter,  setSev]     = useState("All");
  const [selected,   setSelected]= useState(DISEASES[0]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DISEASES.filter(d => {
      const matchSearch = !q ||
        d.name.toLowerCase().includes(q)       ||
        d.crop.toLowerCase().includes(q)       ||
        d.scientific.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q);
      const matchCrop = cropFilter === "All" || d.crop === cropFilter;
      const matchSev  = sevFilter  === "All" || d.severity === sevFilter;
      return matchSearch && matchCrop && matchSev;
    });
  }, [search, cropFilter, sevFilter]);

  return (
    <div className="page-anim" style={{
      display:             "grid",
      gridTemplateColumns: "300px 1fr",
      gap:                 14,
      height:              "calc(100vh - 130px)",
      overflow:            "hidden",
    }}>

      {/* ── LEFT: filters + scrollable list ──────────────────────── */}
      <div style={{ display:"flex", flexDirection:"column", gap:9, overflow:"hidden" }}>

        {/* Title */}
        <div>
          <div className="topbar-title">{t("enc_title")}</div>
          <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{t("enc_sub")}</div>
        </div>

        {/* Search — uses existing search-wrap CSS */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("enc_search")}/>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
          {/* Crop dropdown — uses form-select */}
          <select
            className="form-select"
            value={cropFilter}
            onChange={e => setCrop(e.target.value)}
            style={{ flex:1, minWidth:80, fontSize:11.5, padding:"6px 28px 6px 10px" }}>
            <option value="All">{t("all_crops")}</option>
            {CROPS.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Severity pills */}
          {["All", "High", "Medium", "Low"].map(s => {
            const isActive = sevFilter === s;
            const cls      = s === "All" ? "badge-green" : SEV_STYLE[s]?.badge || "badge-green";
            return (
              <button
                key={s}
                onClick={() => setSev(s)}
                className={`badge ${isActive ? cls : ""}`}
                style={{
                  cursor:      "pointer",
                  border:      isActive ? undefined : "1px solid var(--border)",
                  background:  isActive ? undefined : "var(--bg3)",
                  color:       isActive ? undefined : "var(--text3)",
                  fontSize:    11,
                  padding:     "4px 11px",
                }}>
                {s === "All" ? t("filter_all").split(" ")[0] : t(`enc_${s.toLowerCase()}`) || s}
              </button>
            );
          })}
        </div>

        {/* Count */}
        <div style={{ fontSize:11, color:"var(--text3)", flexShrink:0 }}>
          {filtered.length === 0
            ? t("no_disease_found")
            : `${filtered.length} ${filtered.length === 1 ? "disease" : "diseases"}`}
        </div>

        {/* Scrollable list — uses enc-item CSS */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:5, paddingRight:3 }}>
          {filtered.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className={`enc-item${selected?.id === d.id ? " active" : ""}`}
              style={{ width:"100%", textAlign:"left", border:"1px solid",
                       borderColor: selected?.id === d.id ? "var(--green)" : "var(--border)",
                       display:"flex", alignItems:"center", justifyContent:"space-between",
                       gap:8, flexShrink:0, background:"none", cursor:"pointer",
                       fontFamily:"var(--fb)" }}>

              <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:1 }}>
                <span style={{ fontSize:17, flexShrink:0 }}>{d.icon}</span>
                <div style={{ minWidth:0 }}>
                  {/* ✅ Clean readable disease name */}
                  <div className="enc-name" style={{
                    color: selected?.id === d.id ? "var(--green)" : "var(--text1)",
                  }}>
                    {d.name}
                  </div>
                  {/* ✅ Clean crop · type */}
                  <div className="enc-meta">
                    {d.crop}
                    <span style={{ margin:"0 4px", opacity:.35 }}>·</span>
                    <span style={{ color: TYPE_COLOR[d.type] || "var(--text3)" }}>{d.type}</span>
                  </div>
                </div>
              </div>

              {/* Severity badge using existing .badge classes */}
              <span className={`badge ${SEV_STYLE[d.severity]?.badge || "badge-green"}`}
                style={{ fontSize:10, padding:"2px 8px", flexShrink:0 }}>
                {t(`enc_${d.severity.toLowerCase()}`) || d.severity}
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state" style={{ paddingTop:30 }}>
              <span className="empty-icon">🔬</span>
              <div className="empty-title">{t("no_disease_found")}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: detail panel — uses enc-detail CSS ────────────── */}
      {selected ? (
        <div className="enc-detail" style={{
          top:       76,
          overflowY: "auto",
          maxHeight: "calc(100vh - 130px)",
          display:   "flex",
          flexDirection: "column",
          gap: 12,
        }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:13 }}>
            <span style={{ fontSize:40, lineHeight:1, flexShrink:0 }}>{selected.icon}</span>
            <div>
              {/* ✅ Clean disease name */}
              <div className="enc-detail-title">{selected.name}</div>
              {/* Scientific name */}
              <div style={{ fontSize:11.5, color:"var(--text3)", fontStyle:"italic", marginBottom:10 }}>
                {selected.scientific}
              </div>
              {/* Tag row */}
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                <span className={`badge ${SEV_STYLE[selected.severity]?.badge || "badge-green"}`}>
                  {t(`enc_${selected.severity.toLowerCase()}`)} {t("severity").toLowerCase()}
                </span>
                <span className="badge badge-blue" style={{ color: TYPE_COLOR[selected.type] }}>
                  {selected.type}
                </span>
                <span className="badge" style={{
                  background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text3)" }}>
                  {selected.crop}
                </span>
              </div>
            </div>
          </div>

          <div style={{ height:1, background:"var(--border)", flexShrink:0 }}/>

          {/* Symptoms */}
          <div className="enc-section">
            <div className="enc-section-label" style={{ color:"var(--blue-text)" }}>
              🔍 {t("symptoms")}
            </div>
            <div className="enc-section-value">{selected.symptoms}</div>
          </div>

          {/* Cause */}
          <div className="enc-box amber">
            <div className="enc-box-label">⚠️ {t("cause")}</div>
            <div className="enc-section-value">{selected.cause}</div>
          </div>

          {/* Treatment */}
          <div className="enc-box green">
            <div className="enc-box-label">✅ {t("treatment")}</div>
            <div className="enc-section-value">{selected.treatment}</div>
          </div>

          {/* Prevention */}
          <div className="enc-section">
            <div className="enc-section-label" style={{ color:"var(--purple-text)" }}>
              🛡️ {t("prevention")}
            </div>
            <div className="enc-section-value">{selected.prevention}</div>
          </div>
        </div>
      ) : (
        <div className="enc-detail" style={{ display:"flex", alignItems:"center",
          justifyContent:"center", flexDirection:"column", gap:10, top:76 }}>
          <div className="empty-state">
            <span className="empty-icon">🌿</span>
            <div className="empty-title">{t("enc_search")}</div>
            <div className="empty-sub">Click any disease from the list to view details</div>
          </div>
        </div>
      )}
    </div>
  );
}

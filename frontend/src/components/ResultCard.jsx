// src/components/ResultCard.jsx v9 — Full feature set
import { useState, useEffect } from "react";
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
const ORGANIC = {
  blight:"Copper hydroxide 3g/L · Neem oil 5mL/L every 7 days",
  rust:"Sulphur dust 3g/L · Potassium bicarbonate 5g/L · Neem oil 5mL/L",
  mildew:"Potassium bicarbonate 5g/L · Baking soda 4g/L + neem oil 5mL/L",
  spot:"Copper oxychloride 3g/L · Bordeaux mixture 1%",
  mold:"Neem oil 5mL/L · Trichoderma biopesticide per label",
  virus:"No organic cure. Remove plants. Control vectors with neem oil.",
  default:"Copper-based fungicide 3g/L · Neem oil 5mL/L preventively",
};
const CHEMICAL = {
  blight:"Mancozeb 2.5g/L OR Cymoxanil+Mancozeb 2g/L · Repeat every 5–7 days",
  rust:"Tebuconazole 1mL/L OR Propiconazole 1mL/L · 2–3 apps, 14 days apart",
  mildew:"Trifloxystrobin 0.5g/L OR Myclobutanil 1g/L · At first sign",
  spot:"Chlorothalonil 2g/L OR Azoxystrobin 1mL/L · Weekly",
  mold:"Chlorothalonil 2g/L · Ventilate. Apply every 7 days.",
  virus:"No chemical cure. Remove plants. Imidacloprid 0.5mL/L for vectors.",
  default:"Mancozeb 2.5g/L OR copper fungicide 3g/L · Follow label",
};
function getTKey(name){const n=name.toLowerCase();if(n.includes("blight"))return"blight";if(n.includes("rust"))return"rust";if(n.includes("mildew"))return"mildew";if(n.includes("spot")||n.includes("septoria"))return"spot";if(n.includes("mold"))return"mold";if(n.includes("virus")||n.includes("mosaic")||n.includes("curl"))return"virus";return"default";}

const TABS = [
  {id:"overview",  label:"Overview"},
  {id:"explain",   label:"Why this?"},
  {id:"smart",     label:"Smart plan"},
  {id:"risk",      label:"Risk & impact"},
  {id:"treatment", label:"Treatment"},
  {id:"steps",     label:"Next steps"},
];

export default function ResultCard({ result, onReset, settings, t }) {
  const toast = useToast();
  const [tab,        setTab]        = useState("overview");
  const [bookmarked, setBookmarked] = useState(false);
  const [showFeedback,setShowFeedback]=useState(false);
  const [scanHistory, setScanHistory]= useState([]);
  const { image_url, disease, confidence_pct, recommendation, top3, created_at } = result;

  useEffect(()=>{
    try{const h=JSON.parse(localStorage.getItem("cg_scan_history")||"[]");setScanHistory(h);}catch{}
  },[]);

  const isHealthy = disease.toLowerCase().includes("healthy");
  const confColor = confidence_pct>80?"var(--green)":confidence_pct>55?"var(--amber)":"var(--red)";
  const parts     = disease.split("___");
  const crop      = parts[0]?.replace(/_/g," ") || "Unknown";
  const name      = (parts[1]||disease).replace(/_/g," ");
  const scientific= SCIENTIFIC[parts[1]] || null;
  const tKey      = getTKey(name);
  const sevLabel  = isHealthy?null:confidence_pct>80?"🔴 Severe":confidence_pct>55?"🟡 Moderate":"🟢 Mild";
  const sevBadge  = confidence_pct>80?"badge-red":confidence_pct>55?"badge-amber":"badge-green";
  const causeType = (()=>{const n=name.toLowerCase();if(n.includes("virus")||n.includes("mosaic")||n.includes("curl"))return{label:"Viral",icon:"🦠",color:"var(--purple)"};if(n.includes("bacterial"))return{label:"Bacterial",icon:"🔬",color:"var(--red)"};if(n.includes("mite")||n.includes("spider"))return{label:"Pest",icon:"🕷",color:"var(--amber)"};return{label:"Fungal",icon:"🍄",color:"var(--blue)"};})();

  function bookmark(){
    const saved=JSON.parse(localStorage.getItem("cg_bookmarks")||"[]");
    if(!bookmarked){saved.push({disease,recommendation,crop,name,date:new Date().toISOString()});localStorage.setItem("cg_bookmarks",JSON.stringify(saved));toast("Treatment plan saved","success");}
    else{localStorage.setItem("cg_bookmarks",JSON.stringify(saved.filter(s=>s.disease!==disease)));toast("Bookmark removed","info");}
    setBookmarked(p=>!p);
  }
  async function share(){const text=`CropGuard AI — ${name}\nConfidence: ${confidence_pct.toFixed(1)}%\n${recommendation}`;if(navigator.share){navigator.share({title:"CropGuard AI",text}).catch(()=>{});}else{await navigator.clipboard.writeText(text).catch(()=>{});toast(t("notif_copied"),"success");}}
  function exportReport(){
    const c=[`CROPGUARD AI REPORT — ${new Date(created_at).toLocaleString("en-GB")}`,"=".repeat(40),"",`Crop: ${crop}  |  Disease: ${name}`,scientific?`Scientific: ${scientific}`:"",`Confidence: ${confidence_pct.toFixed(1)}%  |  Severity: ${sevLabel||"N/A"}  |  Cause: ${causeType.label}`,"","RECOMMENDATION","-".repeat(36),recommendation,"","ORGANIC TREATMENT","-".repeat(36),ORGANIC[tKey],"","CHEMICAL TREATMENT","-".repeat(36),CHEMICAL[tKey],"","NEXT STEPS","-".repeat(36),"1. Isolate infected plants","2. Apply treatment within 24h","3. Remove infected material","4. Re-scan in 7 days","5. Consult extension officer if no improvement","","DISCLAIMER","-".repeat(36),"AI-assisted diagnosis. Confirm severe cases with an agricultural expert.","","Mekelle Institute of Technology — CropGuard AI v1.0 — 2026"].filter(l=>l!==null).join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([c],{type:"text/plain"}));a.download=`CropGuard_${crop}_${new Date().toISOString().slice(0,10)}.txt`;a.click();toast("Report downloaded","success");
  }

  return (
    <div className="result-wrap">
      {/* Header */}
      <div className="result-header">
        <h2>{t("analysis_complete")}</h2>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn btn-ghost btn-sm" onClick={bookmark} style={{color:bookmarked?"var(--amber)":""}}>
            {bookmarked?"🔖 Saved":"🔖 Save"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={exportReport}>↓ Report</button>
          <button className="btn btn-ghost btn-sm" onClick={share}>{t("btn_share")}</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setShowFeedback(p=>!p)} style={{color:"var(--blue)"}}>
            {showFeedback?"▲ Feedback":"👍 Feedback"}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onReset}>← {t("btn_new_scan2")}</button>
        </div>
      </div>

      {/* Main image + info */}
      <div className="result-main">
        <div className="result-img">
          <img src={`${API}${image_url}`} alt="leaf"/>
          <div className="result-img-overlay">
            <span className={`badge ${isHealthy?"badge-green":"badge-red"}`} style={{fontSize:12,padding:"5px 12px"}}>
              {isHealthy?t("healthy_label"):t("disease_label")}
            </span>
            <div style={{fontSize:10.5,color:"rgba(255,255,255,.5)",marginTop:5}}>
              {t("diagnosed_at")} {new Date(created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
            </div>
          </div>
        </div>
        <div className="result-body">
          <div className="result-crop">{crop}</div>
          <div className="result-name">{name}</div>
          {scientific&&<div style={{fontSize:12,color:"var(--text3)",fontStyle:"italic",marginBottom:10}}>({scientific})</div>}
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
            {!isHealthy&&sevLabel&&<span className={`badge ${sevBadge}`}>{sevLabel}</span>}
            <span className="badge" style={{background:causeType.color+"18",color:causeType.color,border:`1px solid ${causeType.color}30`}}>{causeType.icon} {causeType.label}</span>
            <span className="badge badge-blue">MobileNetV2</span>
          </div>
          <div className="conf-row"><span>{t("confidence_score")}</span><span style={{color:confColor,fontWeight:700}}>{confidence_pct.toFixed(1)}%</span></div>
          <div className="conf-bar"><div className="conf-fill" style={{width:`${confidence_pct}%`,background:confColor}}/></div>

          {/* Tab strip */}
          <div style={{display:"flex",gap:2,background:"var(--bg3)",borderRadius:9,padding:3,marginBottom:12,overflowX:"auto",flexWrap:"nowrap"}}>
            {TABS.map(({id,label})=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                flex:"0 0 auto",padding:"6px 11px",borderRadius:7,border:"none",cursor:"pointer",
                fontFamily:"var(--fb)",fontSize:12,fontWeight:600,whiteSpace:"nowrap",
                background:tab===id?"var(--bg1)":"transparent",
                color:tab===id?"var(--text1)":"var(--text3)",
                boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.25)":"none",
                transition:"all .15s",
              }}>{label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{flex:1,overflowY:"auto"}}>
            {tab==="overview"&&(
              <div>
                <div className="result-rec"><div className="rec-label">{t("recommended_action")}</div><div className="rec-text">{recommendation}</div></div>
                {settings.showTop3&&top3?.length>0&&(<div><div className="top3-title">{t("alt_predictions")}</div>{top3.map((item,i)=>(<div className="top3-item" key={i}><div className="top3-name">{item.disease.replace(/___/g,"·").replace(/_/g," ")}</div><div className="top3-bar"><div className="top3-fill" style={{width:`${item.confidence_pct}%`}}/></div><div className="top3-pct">{item.confidence_pct.toFixed(1)}%</div></div>))}</div>)}
              </div>
            )}
            {tab==="explain"&&<ExplainPanel disease={disease} confidence_pct={confidence_pct} top3={top3} isHealthy={isHealthy}/>}
            {tab==="smart"&&<SmartRecommendation disease={disease} confidence_pct={confidence_pct} settings={settings}/>}
            {tab==="risk"&&<RiskScorePanel disease={disease} confidence_pct={confidence_pct} scanHistory={scanHistory}/>}
            {tab==="treatment"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{background:"var(--green-glow)",border:"1px solid var(--green-dim)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:".09em",color:"var(--green)",textTransform:"uppercase",marginBottom:6}}>🌿 Organic / Natural</div>
                  <div style={{fontSize:12.5,color:"var(--text1)",lineHeight:1.65}}>{ORGANIC[tKey]}</div>
                </div>
                <div style={{background:"var(--blue-bg)",border:"1px solid rgba(96,165,250,.2)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:".09em",color:"var(--blue)",textTransform:"uppercase",marginBottom:6}}>⚗ Chemical (with dosage)</div>
                  <div style={{fontSize:12.5,color:"var(--text1)",lineHeight:1.65}}>{CHEMICAL[tKey]}</div>
                </div>
                <div style={{fontSize:11,color:"var(--text3)",lineHeight:1.5}}>⚠ Wear protective gloves and mask when applying chemicals. Follow label instructions.</div>
              </div>
            )}
            {tab==="steps"&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[
                  {n:1,icon:"🔒",step:"Isolate infected plants immediately to prevent spread"},
                  {n:2,icon:"💊",step:"Apply chosen treatment within 24 hours of diagnosis"},
                  {n:3,icon:"🗑",step:"Remove and bag all infected leaves, stems, or fruit"},
                  {n:4,icon:"📅",step:"Schedule a follow-up scan in 7 days to monitor progress"},
                  {n:5,icon:"👨‍🌾",step:"Consult your agricultural extension officer if disease persists"},
                ].map(({n,icon,step})=>(
                  <div key={n} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 12px",background:"var(--bg2)",borderRadius:9,border:"1px solid var(--border)"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:"var(--green-glow2)",border:"1px solid var(--green-dim)",color:"var(--green)",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{n}</div>
                    <div style={{fontSize:12.5,color:"var(--text1)",paddingTop:2,lineHeight:1.55}}>{icon} {step}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="disclaimer-box">ⓘ {t("disclaimer")}</div>

      {/* Feedback panel */}
      {showFeedback && (
        <FeedbackPanel disease={disease} scanId={result.id || Date.now()} onClose={()=>setShowFeedback(false)}/>
      )}
    </div>
  );
}

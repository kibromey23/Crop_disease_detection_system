// src/pages/AnalyticsPage.jsx  — Analytics + AI Insights + Location merged
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import LocationIntelligence from "../components/LocationIntelligence";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COLORS=["var(--green)","var(--amber)","var(--blue)","var(--purple)","#fb923c","#38bdf8","#f472b6","#34d399"];

export default function AnalyticsPage({ settings, t }) {
  const { authFetch } = useAuth();
  const [records, setRecords]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [tab,     setTab]      = useState("overview"); // overview | insights | trends

  useEffect(() => {
    let cancelled = false;
    authFetch(`${API}/api/history`)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setRecords(Array.isArray(d)?d:[]); setLoading(false); }})
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authFetch]);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/><div className="spinner-label">{t("loading")}</div></div>;
  if (!records.length) return (
    <div className="empty-state" style={{ paddingTop:80 }}>
      <span className="empty-icon">📊</span>
      <div className="empty-title">{t("no_analytics")}</div>
    </div>
  );

  const total    = records.length;
  const diseased = records.filter(r=>!r.disease.toLowerCase().includes("healthy")).length;
  const avgConf  = (records.reduce((s,r)=>s+Number(r.confidence),0)/total).toFixed(1);
  const highConf = records.filter(r=>Number(r.confidence)>=85).length;
  const lowConf  = records.filter(r=>Number(r.confidence)<60).length;
  const riskPct  = Math.round((diseased/total)*100);

  const dCounts={};
  records.filter(r=>!r.disease.toLowerCase().includes("healthy"))
    .forEach(r=>{ const n=r.disease.replace(/___/g," ").replace(/_/g," "); dCounts[n]=(dCounts[n]||0)+1; });
  const topD = Object.entries(dCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);

  // Monthly
  const monthly={};
  records.forEach(r=>{ const d=new Date(r.created_at); const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; monthly[k]=(monthly[k]||0)+1; });
  const months=Object.entries(monthly).sort().slice(-6); const maxM=Math.max(...months.map(([,v])=>v),1);

  // Buckets
  const buckets={"90-100%":0,"70-89%":0,"50-69%":0,"<50%":0};
  records.forEach(r=>{ const c=Number(r.confidence); if(c>=90)buckets["90-100%"]++;else if(c>=70)buckets["70-89%"]++;else if(c>=50)buckets["50-69%"]++;else buckets["<50%"]++; });

  // Week trend
  const recent5   = records.slice(0,5).filter(r=>!r.disease.toLowerCase().includes("healthy")).length;
  const previous5 = records.slice(5,10).filter(r=>!r.disease.toLowerCase().includes("healthy")).length;
  const trending  = records.length>=10 ? (recent5>previous5?"up":"down") : "neutral";

  const kpis = [
    { lbl:"Total Scans",   val:total,          clr:"var(--blue)",  bg:"var(--blue-bg)"  },
    { lbl:"Disease Rate",  val:`${riskPct}%`,  clr:"var(--red)",   bg:"var(--red-bg)"   },
    { lbl:"Avg Confidence",val:`${avgConf}%`,  clr:"var(--green)", bg:"var(--green-glow)"},
    { lbl:"Top Disease",   val:(topD[0]?.[0]||"—").split(" ").pop(), clr:"var(--amber)", bg:"var(--amber-bg)" },
  ];

  // AI recommendations
  const recs = [
    riskPct>50 && { icon:"⚠",  color:"var(--red)",   bg:"var(--red-bg)",   text:`High disease rate (${riskPct}%). Increase field scouting frequency and consider preventive fungicide.` },
    highConf/total<0.5 && { icon:"📷", color:"var(--amber)", bg:"var(--amber-bg)", text:"Many low-confidence scans. Improve photo quality — use natural daylight and fill the frame with the leaf." },
    topD[0] && { icon:"🔬", color:"var(--blue)",  bg:"var(--blue-bg)",  text:`Most common: ${topD[0][0]}. Focus monitoring on preventing further spread to adjacent plants.` },
    trending==="down" && total>=10 && { icon:"✅", color:"var(--green)", bg:"var(--green-glow)", text:"Disease rate is decreasing vs. previous 5 scans. Your treatment interventions appear to be working." },
    trending==="up"   && total>=10 && { icon:"📈", color:"var(--red)",   bg:"var(--red-bg)",    text:"Disease rate is rising vs. previous 5 scans. Consider immediate action on infected plants." },
    (total-diseased)>diseased && { icon:"🌱", color:"var(--green)", bg:"var(--green-glow)", text:`${Math.round(((total-diseased)/total)*100)}% of your crops are healthy. Maintain current management practices.` },
  ].filter(Boolean).slice(0,4);

  const circ = 2*Math.PI*40;
  const healthPct = Math.round(((total-diseased)/total)*100);

  return (
    <div className="page-anim">
      <p style={{ fontSize:13, color:"var(--text2)", marginBottom:20 }}>
        Intelligent analysis from your {total} scan{total!==1?"s":""}. Insights update automatically as you scan more.
      </p>

      {/* Sub-tabs */}
      <div style={{ display:"flex", gap:4, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r-lg)", padding:4, marginBottom:22, width:"fit-content" }}>
        {[["overview","Overview"],["insights","AI Insights"],["trends","Trends"],["location","📍 Location"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:"8px 18px", borderRadius:9, border:"none", cursor:"pointer",
            fontFamily:"var(--fb)", fontSize:13, fontWeight:600,
            background:tab===id?"var(--bg1)":"transparent",
            color:tab===id?"var(--text1)":"var(--text3)",
            boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.3)":"none",
            transition:"all var(--ease)",
          }}>{lbl}</button>
        ))}
      </div>

      {/* KPI row — always visible */}
      <div className="stat-grid" style={{ marginBottom:22 }}>
        {kpis.map(({lbl,val,clr,bg})=>(
          <div className="stat-card" key={lbl}>
            <div className="stat-lbl" style={{ marginBottom:8 }}>{lbl}</div>
            <div className="stat-val" style={{ color:clr, fontSize:22 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Overview */}
      {tab==="overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="card">
            <div className="card-title">Disease distribution</div>
            {topD.length===0?<div style={{fontSize:13,color:"var(--text3)"}}>No diseases detected yet</div>:(
              <div className="chart-bar-wrap">
                {topD.map(([name,count],i)=>(
                  <div className="chart-bar-row" key={name}>
                    <div className="chart-bar-label">{name}</div>
                    <div className="chart-bar-track"><div className="chart-bar-fill" style={{width:`${(count/topD[0][1])*100}%`,background:COLORS[i%COLORS.length],animationDelay:`${i*.08}s`}}/></div>
                    <div className="chart-bar-count">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
            <div className="card-title" style={{ alignSelf:"flex-start" }}>Healthy vs diseased</div>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="40" fill="none" stroke="var(--red-bg)" strokeWidth="15"/>
              <circle cx="60" cy="60" r="40" fill="none" stroke="var(--green)" strokeWidth="15"
                strokeDasharray={`${(healthPct/100)*circ} ${circ}`}
                strokeLinecap="butt" transform="rotate(-90 60 60)"
                style={{ transition:"stroke-dasharray 1.4s ease" }}/>
              <text x="60" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--green)" fontFamily="var(--fh)">{healthPct}%</text>
              <text x="60" y="70" textAnchor="middle" fontSize="10" fill="var(--text3)" fontFamily="var(--fb)">healthy</text>
            </svg>
            <div style={{ display:"flex", gap:16, fontSize:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:9,height:9,borderRadius:2,background:"var(--green)" }}/><span style={{color:"var(--text2)"}}>Healthy ({total-diseased})</span></div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ width:9,height:9,borderRadius:2,background:"var(--red)" }}/><span style={{color:"var(--text2)"}}>Diseased ({diseased})</span></div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Confidence levels</div>
            <div className="chart-bar-wrap">
              {Object.entries(buckets).map(([range,count],i)=>(
                <div className="chart-bar-row" key={range}>
                  <div className="chart-bar-label">{range}</div>
                  <div className="chart-bar-track"><div className="chart-bar-fill" style={{width:`${(count/(total||1))*100}%`,background:COLORS[i]}}/></div>
                  <div className="chart-bar-count">{count}</div>
                </div>
              ))}
            </div>
            {lowConf>0 && <div style={{marginTop:10,fontSize:11.5,color:"var(--text3)"}}>⚠ {lowConf} low-confidence scan{lowConf>1?"s":""} — retake in better lighting.</div>}
          </div>

          <div className="card">
            <div className="card-title">Monthly trend</div>
            {months.length===0?<div style={{fontSize:13,color:"var(--text3)"}}>Not enough data</div>:(
              <div className="col-chart">
                {months.map(([month,count])=>(
                  <div className="col" key={month}>
                    <div className="col-val">{count}</div>
                    <div className="col-bar" style={{height:`${(count/maxM)*94}px`,minHeight:4}}/>
                    <div className="col-lbl">{month.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {tab==="insights" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text1)", marginBottom:4 }}>AI-generated recommendations based on your data</div>
          {recs.length===0 ? (
            <div style={{ fontSize:13, color:"var(--text3)", padding:"20px 0" }}>Scan more leaves to generate AI recommendations.</div>
          ) : recs.map((rec,i)=>(
            <div key={i} style={{ background:rec.bg, border:`1px solid ${rec.color}22`, borderRadius:"var(--r-lg)", padding:"14px 18px", display:"flex", gap:12, alignItems:"flex-start", animation:`fadeUp .3s ease ${i*.08}s both` }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{rec.icon}</span>
              <span style={{ fontSize:13.5, color:"var(--text1)", lineHeight:1.65 }}>{rec.text}</span>
            </div>
          ))}
          <div className="card card-sm" style={{ marginTop:8 }}>
            <div className="card-title">Scan quality summary</div>
            {[
              { label:"High accuracy (≥85%)", count:highConf, color:"var(--green)" },
              { label:"Good (70–84%)",        count:records.filter(r=>Number(r.confidence)>=70&&Number(r.confidence)<85).length, color:"var(--blue)" },
              { label:"Fair (60–69%)",        count:records.filter(r=>Number(r.confidence)>=60&&Number(r.confidence)<70).length, color:"var(--amber)" },
              { label:"Low (<60%)",           count:lowConf, color:"var(--red)" },
            ].map(({label,count,color})=>(
              <div key={label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <div style={{ width:9,height:9,borderRadius:2,background:color,flexShrink:0 }}/>
                <div style={{ fontSize:12,color:"var(--text2)",flex:1 }}>{label}</div>
                <div style={{ fontSize:12,color:"var(--text3)",fontWeight:600 }}>{count}</div>
                <div style={{ width:80,height:4,background:"var(--bg4)",borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",background:color,borderRadius:2,width:`${(count/total)*100}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      {tab==="trends" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="card" style={{ gridColumn:"1/-1" }}>
            <div className="card-title">Monthly scan activity</div>
            {months.length===0?<div style={{fontSize:13,color:"var(--text3)"}}>Not enough data — scan across multiple months to see trends.</div>:(
              <div className="col-chart" style={{ height:140 }}>
                {months.map(([month,count])=>(
                  <div className="col" key={month}>
                    <div className="col-val">{count}</div>
                    <div className="col-bar" style={{height:`${(count/maxM)*122}px`,minHeight:4}}/>
                    <div className="col-lbl">{month}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <div className="card-title">Disease trend</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontFamily:"var(--fh)", fontSize:28, fontWeight:800, color:trending==="up"?"var(--red)":trending==="down"?"var(--green)":"var(--text2)" }}>
                {trending==="up"?"↑ Rising":trending==="down"?"↓ Falling":"– Stable"}
              </div>
              <div style={{ fontSize:12.5, color:"var(--text2)", lineHeight:1.6 }}>
                {records.length<10
                  ? "Need at least 10 scans to calculate trend. Keep scanning!"
                  : `Comparing last 5 scans to previous 5: ${recent5} vs ${previous5} diseased plants.`}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Health score over time</div>
            <div style={{ fontFamily:"var(--fh)", fontSize:42, fontWeight:800, color:healthPct>70?"var(--green)":healthPct>40?"var(--amber)":"var(--red)" }}>
              {healthPct}%
            </div>
            <div style={{ fontSize:12, color:"var(--text3)", marginTop:6 }}>
              {total-diseased} of {total} scans show healthy crops
            </div>
          </div>
        </div>
      )}

      {/* Location tab */}
      {tab==="location" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card">
            <div className="card-title">📍 Location & Weather Intelligence</div>
            <p style={{ fontSize:13, color:"var(--text2)", marginBottom:16, lineHeight:1.6 }}>
              Real-time weather conditions correlated with disease risk for your location.
              The AI uses temperature, humidity and wind data to predict which diseases are most likely.
            </p>
            <LocationIntelligence compact={false}/>
          </div>
        </div>
      )}
    </div>
  );
}

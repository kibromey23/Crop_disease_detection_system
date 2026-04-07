// src/pages/CommunityPage.jsx — Social / Community Layer (Phase 3, #5)
import { useState } from "react";

// Simulated community data (real version would pull from backend)
const COMMUNITY_REPORTS = [
  { id:1, user:"Farmer A", location:"Mekelle, Tigray",  crop:"Tomato",  disease:"Late Blight",          ago:"2h",  severity:"high",   treated:true,  treatment:"Mancozeb 2.5g/L",        success:true,  likes:14 },
  { id:2, user:"Farmer B", location:"Axum, Tigray",     crop:"Corn",    disease:"Common Rust",          ago:"5h",  severity:"medium", treated:true,  treatment:"Tebuconazole 1mL/L",      success:true,  likes:9  },
  { id:3, user:"Farmer C", location:"Adigrat, Tigray",  crop:"Potato",  disease:"Early Blight",         ago:"1d",  severity:"medium", treated:false, treatment:null,                      success:null,  likes:6  },
  { id:4, user:"Farmer D", location:"Adwa, Tigray",     crop:"Tomato",  disease:"Bacterial Spot",       ago:"1d",  severity:"low",    treated:true,  treatment:"Copper hydroxide 3g/L",   success:true,  likes:11 },
  { id:5, user:"Farmer E", location:"Wukro, Tigray",    crop:"Grape",   disease:"Black Rot",            ago:"2d",  severity:"high",   treated:true,  treatment:"Mancozeb + pruning",      success:false, likes:3  },
  { id:6, user:"Farmer F", location:"Mekelle, Tigray",  crop:"Pepper",  disease:"Bacterial Spot",       ago:"3d",  severity:"medium", treated:true,  treatment:"Copper bactericide",      success:true,  likes:7  },
  { id:7, user:"Farmer G", location:"Axum, Tigray",     crop:"Apple",   disease:"Apple Scab",           ago:"3d",  severity:"medium", treated:true,  treatment:"Captan 2g/L",             success:true,  likes:5  },
  { id:8, user:"Farmer H", location:"Mekelle, Tigray",  crop:"Tomato",  disease:"Leaf Mold",            ago:"4d",  severity:"low",    treated:true,  treatment:"Chlorothalonil 2g/L",     success:true,  likes:8  },
];

const EXPERT_TIPS = [
  { expert:"Dr. Teklu", role:"Plant Pathologist, MU", tip:"Late blight spreads within 48 hours in humid conditions. Never wait — apply Mancozeb the same day you spot symptoms.", crop:"Tomato", likes:42 },
  { expert:"Ato Halefom", role:"Agricultural Extension Officer", tip:"For rust diseases in wheat and corn: scout early mornings when dew is present — spores are most visible then.", crop:"Corn", likes:31 },
  { expert:"Dr. Niema", role:"Crop Scientist, MIT", tip:"Neem oil loses effectiveness after 8 hours in sunlight. Always apply in the evening for maximum coverage.", crop:"General", likes:58 },
];

const SEV_COLORS = { high:"var(--red)", medium:"var(--amber)", low:"var(--green)" };
const SEV_BG     = { high:"var(--red-bg)", medium:"var(--amber-bg)", low:"var(--green-glow)" };

export default function CommunityPage({ nav, t }) {
  const [filter, setFilter]   = useState("all");
  const [liked,  setLiked]    = useState(new Set());
  const [tab,    setTab]      = useState("feed"); // feed | insights | experts

  // Treatment success rate per disease
  const successRates = {};
  COMMUNITY_REPORTS.filter(r => r.treated && r.success !== null).forEach(r => {
    if (!successRates[r.disease]) successRates[r.disease] = { total:0, success:0 };
    successRates[r.disease].total++;
    if (r.success) successRates[r.disease].success++;
  });
  const rateList = Object.entries(successRates)
    .map(([disease, s]) => ({ disease, rate: Math.round((s.success/s.total)*100), total:s.total }))
    .sort((a,b) => b.rate - a.rate);

  const crops     = ["all", ...new Set(COMMUNITY_REPORTS.map(r => r.crop))];
  const filtered  = filter === "all" ? COMMUNITY_REPORTS : COMMUNITY_REPORTS.filter(r => r.crop === filter);

  function toggleLike(id) {
    setLiked(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  // Outbreak summary
  const diseaseCounts = {};
  COMMUNITY_REPORTS.forEach(r => { diseaseCounts[r.disease]=(diseaseCounts[r.disease]||0)+1; });
  const topOutbreak = Object.entries(diseaseCounts).sort((a,b)=>b[1]-a[1])[0];

  return (
    <div className="page-anim">
      <p style={{ fontSize:13, color:"var(--text2)", marginBottom:20, lineHeight:1.6 }}>
        See what diseases other farmers in Tigray are reporting. Share your results and learn from the community.
      </p>

      {/* Outbreak alert banner */}
      {topOutbreak && (
        <div style={{ padding:"13px 16px", background:"var(--red-bg)", border:"1px solid rgba(240,82,82,.2)", borderRadius:14, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22 }}>🚨</span>
          <div>
            <div style={{ fontFamily:"var(--fh)", fontSize:14, fontWeight:700, color:"var(--red)" }}>
              Active outbreak: {topOutbreak[0]}
            </div>
            <div style={{ fontSize:12.5, color:"var(--text2)", marginTop:2 }}>
              {topOutbreak[1]} farmers in Tigray have reported this disease in the last week. Monitor your crops closely.
            </div>
          </div>
          <button className="btn btn-danger btn-sm" style={{ marginLeft:"auto", flexShrink:0 }} onClick={() => nav("detect")}>
            Scan now
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:4, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:4, marginBottom:20 }}>
        {[["feed",t("community_tab_feed")],["insights",t("community_tab_success")],["experts",t("community_tab_experts")]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1, padding:"10px", borderRadius:10, border:tab===id?"1px solid var(--border2)":"1px solid transparent",
            background:tab===id?"var(--bg1)":"transparent", cursor:"pointer",
            fontFamily:"var(--fb)", fontSize:13, fontWeight:600,
            color:tab===id?"var(--text1)":"var(--text3)",
            boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.25)":"none",
            transition:"all .17s",
          }}>{lbl}</button>
        ))}
      </div>

      {/* Community Feed */}
      {tab==="feed" && (
        <div>
          {/* Crop filter chips */}
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
            {crops.map(c=>(
              <button key={c} onClick={()=>setFilter(c)} style={{
                padding:"5px 13px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600,
                background: filter===c?"var(--green)":"var(--bg3)",
                color: filter===c?"#040d06":"var(--text2)",
                transition:"all .15s",
              }}>{c==="all"?t("community_all_crops"):c}</button>
            ))}
            <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text3)", alignSelf:"center" }}>
              {filtered.length} reports
            </span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map(r => (
              <div key={r.id} style={{
                background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:14,
                padding:"14px 16px", transition:"border-color var(--ease)", animation:"fadeUp .3s ease",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{
                      width:36, height:36, borderRadius:10, background:"var(--green-glow2)",
                      border:"1px solid var(--green-dim)", display:"flex", alignItems:"center",
                      justifyContent:"center", fontFamily:"var(--fh)", fontSize:14,
                      fontWeight:800, color:"var(--green)", flexShrink:0,
                    }}>
                      {r.user.charAt(r.user.length-1)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text1)" }}>{r.user}</div>
                      <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>📍 {r.location} · {r.ago}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20,
                    background: SEV_BG[r.severity], color: SEV_COLORS[r.severity],
                    border:`1px solid ${SEV_COLORS[r.severity]}22`,
                  }}>
                    {r.severity.charAt(0).toUpperCase()+r.severity.slice(1)}
                  </span>
                </div>

                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
                  <span className="badge badge-blue" style={{ fontSize:10.5 }}>{r.crop}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:"var(--text1)" }}>{r.disease}</span>
                </div>

                {r.treated && (
                  <div style={{
                    padding:"9px 12px", borderRadius:10,
                    background: r.success ? "var(--green-glow)" : "var(--red-bg)",
                    border:`1px solid ${r.success?"var(--green-dim)":"rgba(240,82,82,.2)"}`,
                    fontSize:12.5, color:"var(--text1)", marginBottom:10,
                  }}>
                    {r.success ? "✅" : "❌"} Treatment: <strong>{r.treatment}</strong>
                    {" — "}{r.success ? t("community_worked") : t("community_failed")}
                  </div>
                )}
                {!r.treated && (
                  <div style={{ padding:"9px 12px", borderRadius:10, background:"var(--amber-bg)", border:"1px solid rgba(245,166,35,.2)", fontSize:12.5, color:"var(--text2)", marginBottom:10 }}>
                    ⏳ Treatment not yet applied — watching symptoms
                  </div>
                )}

                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <button onClick={()=>toggleLike(r.id)} style={{
                    display:"flex", alignItems:"center", gap:5, padding:"5px 10px",
                    borderRadius:20, border:"1px solid var(--border)", background:"var(--bg2)",
                    cursor:"pointer", fontSize:12, fontWeight:600,
                    color: liked.has(r.id) ? "var(--red)" : "var(--text3)",
                    transition:"all .15s",
                  }}>
                    {liked.has(r.id)?"❤":"🤍"} {r.likes + (liked.has(r.id)?1:0)}
                  </button>
                  <button onClick={()=>nav("encyclopedia")} style={{
                    fontSize:12, color:"var(--text3)", background:"none", border:"none", cursor:"pointer",
                  }}>
                    View disease info →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment Success Rates */}
      {tab==="insights" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card">
            <div className="card-title">Treatment success rates (community data)</div>
            <p style={{ fontSize:12.5, color:"var(--text2)", marginBottom:16, lineHeight:1.6 }}>
              Based on {COMMUNITY_REPORTS.filter(r=>r.treated).length} treatment reports from farmers in Tigray.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {rateList.map(({ disease, rate, total }) => (
                <div key={disease}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                    <span style={{ color:"var(--text1)", fontWeight:600 }}>{disease}</span>
                    <span style={{ color: rate>=80?"var(--green)":rate>=50?"var(--amber)":"var(--red)", fontWeight:700 }}>
                      {rate}% success ({total} report{total!==1?"s":""})
                    </span>
                  </div>
                  <div style={{ height:8, background:"var(--bg4)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:4, transition:"width 1s ease",
                      background: rate>=80?"var(--green)":rate>=50?"var(--amber)":"var(--red)",
                      width:`${rate}%`,
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most reported this week */}
          <div className="card">
            <div className="card-title">Most reported diseases this week</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {Object.entries(diseaseCounts).sort((a,b)=>b[1]-a[1]).map(([disease,count],i)=>(
                <div key={disease} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 12px", background:"var(--bg2)", borderRadius:9, border:"1px solid var(--border)" }}>
                  <div style={{ fontFamily:"var(--fh)", fontSize:18, fontWeight:800, color:i===0?"var(--red)":"var(--text3)", minWidth:28 }}>#{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--text1)" }}>{disease}</div>
                    <div style={{ fontSize:11, color:"var(--text3)" }}>{count} report{count!==1?"s":""} this week</div>
                  </div>
                  {i===0 && <span className="badge badge-red">Active outbreak</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expert Tips */}
      {tab==="experts" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ fontSize:13, color:"var(--text2)", marginBottom:4, lineHeight:1.6 }}>
            Verified tips from plant pathologists and agricultural extension officers in Ethiopia.
          </div>
          {EXPERT_TIPS.map((tip, i) => (
            <div key={i} style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:16, padding:"16px 18px", animation:`fadeUp .3s ease ${i*.1}s both` }}>
              <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{
                  width:44, height:44, borderRadius:12, background:"var(--blue-bg)",
                  border:"1px solid rgba(96,165,250,.2)", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:20, flexShrink:0,
                }}>👨‍🔬</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"var(--fh)", fontSize:14, fontWeight:700, color:"var(--text1)" }}>{tip.expert}</div>
                  <div style={{ fontSize:11.5, color:"var(--blue)", marginBottom:10 }}>{tip.role}</div>
                  <div style={{ fontSize:13.5, color:"var(--text1)", lineHeight:1.7, fontStyle:"italic" }}>
                    "{tip.tip}"
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12 }}>
                    <span className="badge badge-green" style={{ fontSize:10 }}>{tip.crop}</span>
                    <span style={{ fontSize:11.5, color:"var(--text3)" }}>❤ {tip.likes} farmers found this helpful</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

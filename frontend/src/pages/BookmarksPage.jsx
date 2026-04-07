// src/pages/BookmarksPage.jsx — Saved treatment plans + before/after comparison
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "../components/Toast";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function BookmarksPage({ nav, t }) {
  const { authFetch } = useAuth();
  const [bookmarks,   setBookmarks]   = useState([]);
  const [feedbackAll, setFeedbackAll] = useState([]);
  const [compareA,    setCompareA]    = useState(null);
  const [compareB,    setCompareB]    = useState(null);
  const [tab,         setTab]         = useState("saved"); // saved | feedback | compare
  const [history,     setHistory]     = useState([]);
  const toast = useToast();

  useEffect(() => {
    setBookmarks(JSON.parse(localStorage.getItem("cg_bookmarks") || "[]"));
    setFeedbackAll(JSON.parse(localStorage.getItem("cg_feedback") || "[]"));
    authFetch(`${API}/api/history`).then(r=>r.json()).then(d=>setHistory(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  function removeBookmark(disease) {
    const updated = bookmarks.filter(b => b.disease !== disease);
    setBookmarks(updated);
    localStorage.setItem("cg_bookmarks", JSON.stringify(updated));
    toast("Bookmark removed", "info");
  }

  function clearFeedback() {
    localStorage.removeItem("cg_feedback");
    setFeedbackAll([]);
    toast("Feedback history cleared", "info");
  }

  const RATING_STYLE = {
    correct: { icon:"👍", color:"var(--green)",  label:"Correct" },
    wrong:   { icon:"👎", color:"var(--red)",    label:"Incorrect" },
    unsure:  { icon:"🤔", color:"var(--amber)",  label:"Unsure"  },
  };

  return (
    <div className="page-anim">
      <p style={{ fontSize:13, color:"var(--text2)", marginBottom:20 }}>
        Your saved treatment plans, diagnosis feedback, and before/after scan comparisons.
      </p>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:4, marginBottom:22 }}>
        {[["saved",`Saved (${bookmarks.length})`],["feedback",`Feedback (${feedbackAll.length})`],["compare","Before / After"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            flex:1, padding:"10px", borderRadius:10, border:tab===id?"1px solid var(--border2)":"1px solid transparent",
            background:tab===id?"var(--bg1)":"transparent", cursor:"pointer",
            fontFamily:"var(--fb)", fontSize:13, fontWeight:600,
            color:tab===id?"var(--text1)":"var(--text3)",
            boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.25)":"none", transition:"all .17s",
          }}>{lbl}</button>
        ))}
      </div>

      {/* Saved treatment plans */}
      {tab==="saved" && (
        bookmarks.length===0 ? (
          <div className="empty-state" style={{paddingTop:48}}>
            <span className="empty-icon">🔖</span>
            <div className="empty-title">No saved plans yet</div>
            <div className="empty-sub">Tap "🔖 Save plan" on any diagnosis result to bookmark it here for quick reference.</div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={()=>nav("detect")}>Start scanning</button>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {bookmarks.map((b, i) => (
              <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:14,padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:11,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>{b.crop}</div>
                    <div style={{fontFamily:"var(--fh)",fontSize:16,fontWeight:700,color:"var(--text1)"}}>{b.name}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>Saved {new Date(b.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                  <button onClick={()=>removeBookmark(b.disease)} style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:16,padding:"2px 4px"}}>✕</button>
                </div>
                <div style={{background:"var(--amber-bg)",border:"1px solid rgba(245,166,35,.18)",borderRadius:10,padding:"11px 13px",fontSize:13,color:"var(--text1)",lineHeight:1.65}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--amber)",textTransform:"uppercase",letterSpacing:".09em",marginBottom:4}}>Recommended Treatment</div>
                  {b.recommendation}
                </div>
                <div style={{marginTop:10,display:"flex",gap:8}}>
                  <button className="btn btn-ghost btn-sm btn-full" onClick={()=>nav("encyclopedia")}>View disease guide →</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Feedback history */}
      {tab==="feedback" && (
        feedbackAll.length===0 ? (
          <div className="empty-state" style={{paddingTop:48}}>
            <span className="empty-icon">👍</span>
            <div className="empty-title">No feedback submitted yet</div>
            <div className="empty-sub">After a diagnosis, tap "👍 Feedback" to tell the AI if it was correct. Your feedback improves accuracy.</div>
          </div>
        ) : (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:13,color:"var(--text2)"}}>{feedbackAll.length} feedback item{feedbackAll.length!==1?"s":""} submitted</div>
              <button className="btn btn-danger btn-sm" onClick={clearFeedback}>Clear all</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {[...feedbackAll].reverse().map((fb, i) => {
                const rs = RATING_STYLE[fb.rating] || RATING_STYLE.unsure;
                return (
                  <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:12,alignItems:"flex-start"}}>
                    <span style={{fontSize:20,flexShrink:0}}>{rs.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:"var(--text1)",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {fb.disease.replace(/___/g," · ").replace(/_/g," ")}
                      </div>
                      {fb.note && <div style={{fontSize:12,color:"var(--text2)",marginTop:3,lineHeight:1.5}}>{fb.note}</div>}
                      {fb.treatment && (
                        <div style={{fontSize:11.5,color:fb.treatment==="worked"?"var(--green)":fb.treatment==="partial"?"var(--amber)":"var(--red)",marginTop:4,fontWeight:600}}>
                          Treatment: {fb.treatment==="worked"?"✅ Worked":fb.treatment==="partial"?"⚡ Partially":"❌ No improvement"}
                        </div>
                      )}
                      <div style={{fontSize:10.5,color:"var(--text3)",marginTop:4}}>{new Date(fb.ts).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:rs.color,background:rs.color+"15",padding:"3px 9px",borderRadius:20,flexShrink:0}}>{rs.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Before / After Comparison */}
      {tab==="compare" && (
        <div>
          <p style={{fontSize:13,color:"var(--text2)",marginBottom:18,lineHeight:1.6}}>
            Select two scans from your history to compare — track disease progression or verify treatment effectiveness.
          </p>
          {history.length < 2 ? (
            <div className="empty-state" style={{paddingTop:40}}>
              <span className="empty-icon">🔄</span>
              <div className="empty-title">Need at least 2 scans</div>
              <div className="empty-sub">Scan the same plant at different times to compare disease progression.</div>
              <button className="btn btn-primary" style={{marginTop:16}} onClick={()=>nav("detect")}>Start scanning</button>
            </div>
          ) : (
            <div>
              {/* Selector */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {[["Before (first scan)",compareA,setCompareA],["After (follow-up)",compareB,setCompareB]].map(([label,val,setter],idx)=>(
                  <div key={idx}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",letterSpacing:".07em",textTransform:"uppercase",marginBottom:8}}>{label}</div>
                    <select className="form-select" value={val?.id||""} onChange={e=>{const r=history.find(h=>h.id==e.target.value);setter(r||null);}}>
                      <option value="">Select a scan…</option>
                      {history.map(r=>(
                        <option key={r.id} value={r.id}>
                          {r.disease.replace(/___/g," · ").replace(/_/g," ")} — {new Date(r.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Comparison view */}
              {compareA && compareB && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,animation:"fadeUp .3s ease"}}>
                  {[compareA,compareB].map((scan,i)=>{
                    const conf = Number(scan.confidence);
                    const isH = scan.disease.toLowerCase().includes("healthy");
                    return (
                      <div key={i} style={{background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:14,overflow:"hidden"}}>
                        <div style={{position:"relative"}}>
                          <img loading="lazy" decoding="async" src={`${API}${scan.image_url}`} alt="" style={{width:"100%",height:160,objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>
                          <div style={{position:"absolute",top:10,left:10}}>
                            <span style={{background:i===0?"rgba(96,165,250,.9)":"rgba(62,207,106,.9)",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}>
                              {i===0?"BEFORE":"AFTER"}
                            </span>
                          </div>
                        </div>
                        <div style={{padding:"12px 14px"}}>
                          <div style={{fontSize:12.5,fontWeight:600,color:"var(--text1)",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {scan.disease.replace(/___/g," · ").replace(/_/g," ")}
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:"var(--text2)",marginBottom:6}}>
                            <span>Confidence</span>
                            <span style={{fontWeight:700,color:conf>80?"var(--green)":conf>55?"var(--amber)":"var(--red)"}}>{conf.toFixed(1)}%</span>
                          </div>
                          <div style={{height:5,background:"var(--bg4)",borderRadius:3,overflow:"hidden",marginBottom:8}}>
                            <div style={{height:"100%",background:conf>80?"var(--green)":conf>55?"var(--amber)":"var(--red)",borderRadius:3,width:`${conf}%`}}/>
                          </div>
                          <div style={{fontSize:10.5,color:"var(--text3)"}}>{new Date(scan.created_at).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Comparison summary */}
                  <div style={{gridColumn:"1/-1",padding:"14px 16px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:14}}>
                    <div style={{fontFamily:"var(--fh)",fontSize:14,fontWeight:700,color:"var(--text1)",marginBottom:10}}>Comparison summary</div>
                    {compareA.disease === compareB.disease ? (
                      <div>
                        <div style={{fontSize:13,color:"var(--green)",fontWeight:600,marginBottom:6}}>✅ Same disease detected in both scans</div>
                        <div style={{fontSize:12.5,color:"var(--text2)",lineHeight:1.6}}>
                          Confidence changed from <strong>{Number(compareA.confidence).toFixed(1)}%</strong> to <strong style={{color:Number(compareB.confidence)>Number(compareA.confidence)?"var(--red)":"var(--green)"}}>{Number(compareB.confidence).toFixed(1)}%</strong>.
                          {Number(compareB.confidence) < Number(compareA.confidence) ? " Disease pressure appears to be reducing — treatment may be working." : " Disease pressure appears to be increasing — review your treatment plan."}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize:13,color:"var(--amber)",fontWeight:600,marginBottom:6}}>🔄 Different diagnosis results</div>
                        <div style={{fontSize:12.5,color:"var(--text2)",lineHeight:1.6}}>
                          Earlier scan: <strong>{compareA.disease.replace(/___/g," ").replace(/_/g," ")}</strong><br/>
                          Later scan: <strong>{compareB.disease.replace(/___/g," ").replace(/_/g," ")}</strong><br/>
                          Disease may have evolved or treatment changed the presentation. Consult an extension officer for clarification.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

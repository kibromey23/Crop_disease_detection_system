// src/pages/HistoryPage.jsx v10 — uses authFetch for authenticated requests
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function HistoryPage({ settings, t, nav }) {
  const { authFetch } = useAuth();
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [sort,     setSort]     = useState("newest");
  const [selected, setSelected] = useState(new Set());
  const [view,     setView]     = useState("grid");
  const toast = useToast();
  const [modal, setModal] = useState(null);
  function confirm(opts) {
    return new Promise(resolve => {
      setModal({
        ...opts,
        onConfirm: () => { setModal(null); resolve(true); },
        onCancel:  () => { setModal(null); resolve(false); },
      });
    });
  }

  useEffect(() => {
    let cancelled = false;
    authFetch(`${API}/api/history`)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setRecords(Array.isArray(d)?d:[]); setLoading(false); }})
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authFetch]);

  async function deleteOne(id, e) {
    e.stopPropagation();
    const yes = await confirm({ title:"Delete this scan?", message:"This cannot be undone.", confirmLabel:"Delete", danger:true });
    if (!yes) return;
    await authFetch(`${API}/api/history/${id}`, { method:"DELETE" });
    setRecords(p => p.filter(r => r.id !== id));
    setSelected(p => { const n=new Set(p); n.delete(id); return n; });
    toast(t("notif_deleted"), "info");
  }

  async function deleteSelected() {
    const yes = await confirm({ title:`Delete ${selected.size} scan(s)?`, message:"All selected scans will be permanently removed.", confirmLabel:"Delete all", danger:true });
    if (!yes) return;
    await authFetch(`${API}/api/history`, {
      method:"DELETE",
      body: JSON.stringify({ ids:[...selected] }),
    });
    setRecords(p => p.filter(r => !selected.has(r.id)));
    setSelected(new Set());
    toast(`${selected.size} scans deleted`, "info");
  }

  function exportCSV() {
    const rows = ["id,disease,confidence,date",
      ...filtered.map(r => `${r.id},"${r.disease}",${r.confidence},${r.created_at}`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows],{type:"text/csv"}));
    a.download = `cropguard_history_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast(t("notif_exported"), "success");
  }

  function toggleSelect(id) {
    setSelected(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  let filtered = records
    .filter(r => r.disease.toLowerCase().includes(search.toLowerCase()))
    .filter(r => {
      if (filter==="healthy")  return r.disease.toLowerCase().includes("healthy");
      if (filter==="diseased") return !r.disease.toLowerCase().includes("healthy");
      if (filter==="highconf") return Number(r.confidence)>=85;
      return true;
    });
  if (sort==="oldest") filtered=[...filtered].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  if (sort==="conf")   filtered=[...filtered].sort((a,b)=>Number(b.confidence)-Number(a.confidence));

  if (loading) return <div className="spinner-wrap"><div className="spinner"/><div className="spinner-label">{t("loading")}</div></div>;

  return (
    <div className="page-anim">
      {/* Controls */}
      <div className="history-controls">
        <div className="search-wrap" style={{flex:1,minWidth:180}}>
          <span className="search-icon">⌕</span>
          <input placeholder={t("search_placeholder")} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="form-select" style={{width:155}} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">{t("filter_all")}</option>
          <option value="diseased">{t("filter_diseased")}</option>
          <option value="healthy">{t("filter_healthy")}</option>
          <option value="highconf">{t("filter_highconf")}</option>
        </select>
        <select className="form-select" style={{width:148}} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="newest">{t("sort_newest")}</option>
          <option value="oldest">{t("sort_oldest")}</option>
          <option value="conf">{t("sort_conf")}</option>
        </select>
        <div style={{display:"flex",gap:4,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:3}}>
          {["grid","list"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{
              padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",
              fontSize:13,fontWeight:600,
              background:view===v?"var(--bg1)":"transparent",
              color:view===v?"var(--text1)":"var(--text3)",transition:"all .15s"
            }}>{v==="grid"?"⊞":"☰"}</button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>{t("export_csv")}</button>
        {selected.size>0 && (
          <button className="btn btn-danger btn-sm" onClick={deleteSelected}>
            ✕ {t("bulk_delete").replace("{n}",selected.size)}
          </button>
        )}
        <span style={{fontSize:11.5,color:"var(--text3)",flexShrink:0,marginLeft:"auto"}}>
          {t("scans_count").replace("{n}",filtered.length).replace("{total}",records.length)}
        </span>
      </div>

      {filtered.length===0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌿</span>
          <div className="empty-title">{records.length===0?t("no_history_title"):t("no_results_title")}</div>
          <div className="empty-sub">{records.length===0?t("no_history_sub"):t("no_results_sub")}</div>
          {records.length===0&&<button className="btn btn-primary" style={{marginTop:16}} onClick={()=>nav("detect")}>{t("btn_new_scan")}</button>}
        </div>
      ) : view==="grid" ? (
        <div className="history-grid">
          {filtered.map(r=>{
            const isH=r.disease.toLowerCase().includes("healthy");
            const conf=Number(r.confidence);
            const isSel=selected.has(r.id);
            return (
              <div className="hcard" key={r.id} onClick={()=>toggleSelect(r.id)}
                style={{outline:isSel?"2px solid var(--green)":"none",outlineOffset:2}}>
                <div style={{position:"relative"}}>
                  <img loading="lazy" decoding="async" src={`${API}${r.image_url}`} alt={r.disease}
                    onError={e=>{e.target.style.background="var(--bg3)";e.target.src="";}}/>
                  <div style={{position:"absolute",top:7,left:7}}>
                    <span className={`badge ${isH?"badge-green":"badge-red"}`} style={{fontSize:9.5}}>
                      {isH?t("healthy_badge"):t("diseased_badge")}
                    </span>
                  </div>
                  {isSel&&<div style={{position:"absolute",top:7,right:7,width:18,height:18,borderRadius:4,background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"var(--text-on-green)",fontWeight:800}}>✓</div>}
                </div>
                <div className="hcard-body">
                  <div className="hcard-disease">{r.disease.replace(/___/g," · ").replace(/_/g," ")}</div>
                  <div className="hcard-meta">
                    {t("confidence_label")}: <span style={{color:conf>80?"var(--green)":conf>55?"var(--amber-text)":"var(--red-text)",fontWeight:600}}>{conf.toFixed(1)}%</span>
                  </div>
                  <div className="hcard-footer">
                    <div style={{fontSize:10,color:"var(--text3)"}}>
                      {new Date(r.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                    </div>
                    <button onClick={e=>deleteOne(r.id,e)} style={{fontSize:11,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",padding:0}}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtered.map(r=>{
            const isH=r.disease.toLowerCase().includes("healthy");
            const conf=Number(r.confidence);
            return (
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"var(--bg1)",border:"1px solid var(--border)",borderRadius:"var(--r)",transition:"border-color var(--ease)"}}>
                <img loading="lazy" decoding="async" src={`${API}${r.image_url}`} alt="" style={{width:44,height:44,objectFit:"cover",borderRadius:6,background:"var(--bg4)",flexShrink:0}}
                  onError={e=>{e.target.style.display="none";}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,color:"var(--text1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {r.disease.replace(/___/g," · ").replace(/_/g," ")}
                  </div>
                  <div style={{fontSize:11,color:"var(--text3)"}}>
                    {new Date(r.created_at).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
                <span className={`badge ${isH?"badge-green":"badge-red"}`}>{isH?t("healthy_badge"):t("diseased_badge")}</span>
                <span style={{fontSize:12.5,fontWeight:600,color:conf>80?"var(--green)":conf>55?"var(--amber-text)":"var(--red-text)",minWidth:42,textAlign:"right"}}>{conf.toFixed(1)}%</span>
                <button onClick={e=>deleteOne(r.id,e)} style={{fontSize:13,color:"var(--text3)",background:"none",border:"none",cursor:"pointer",padding:"2px 6px"}}>✕</button>
              </div>
            );
          })}
        </div>
      )}
      {modal && <ConfirmModal {...modal}/>}
    </div>
  );
}

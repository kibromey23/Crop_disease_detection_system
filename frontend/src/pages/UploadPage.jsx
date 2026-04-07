// src/pages/UploadPage.jsx
import { useState, useRef } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
export default function UploadPage({ onResult, settings, t }) {
  const [file,dragging,loading,error,progress,preview,setFile,setDragging,setLoading,setError,setProgress,setPreview] = (() => {
    const [file,setFile]=useState(null);
    const [dragging,setDragging]=useState(false);
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState(null);
    const [progress,setProgress]=useState(0);
    const [preview,setPreview]=useState(null);
    return [file,dragging,loading,error,progress,preview,setFile,setDragging,setLoading,setError,setProgress,setPreview];
  })();
  const inputRef = useRef();
  function handleFile(f) { if(!f||!f.type.startsWith("image/")) return; setFile(f); setPreview(URL.createObjectURL(f)); setError(null); }
  function onDrop(e) { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }
  async function submit() {
    if(!file) return;
    setLoading(true); setError(null); setProgress(0);
    const tick=setInterval(()=>setProgress(p=>Math.min(p+7,88)),200);
    const fd=new FormData(); fd.append("image",file);
    try {
      const res=await fetch(`${API}/api/predict`,{method:"POST",body:fd});
      const data=await res.json();
      clearInterval(tick); setProgress(100);
      if(!res.ok) throw new Error(data.error||"Prediction failed");
      setTimeout(()=>onResult(data),400);
    } catch(err) { clearInterval(tick); setError(err.message); setLoading(false); setProgress(0); }
  }
  const titleLines = t("upload_title").split("\n");
  return (
    <div className="page-anim">
      <div className="upload-hero">
        <h2>{titleLines.map((l,i)=><span key={i}>{l}{i<titleLines.length-1&&<br/>}</span>)}</h2>
        <p>{t("upload_sub")}</p>
      </div>
      <div className="upload-layout" style={{display:"grid",gridTemplateColumns:"1fr 310px",gap:16,alignItems:"start"}}>
        <div>
          {!file ? (
            <div className={`drop-zone ${dragging?"dragging":""}`}
              onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}
              onClick={()=>inputRef.current.click()}>
              <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
              <div className="drop-icon-wrap">📷</div>
              <div className="drop-title">{t("drop_title")}</div>
              <div className="drop-sub">{t("drop_sub")}</div>
              <div className="drop-chips">{["JPG","PNG","WebP","Max 10MB"].map(c=><span key={c} className="drop-chip">{c}</span>)}</div>
            </div>
          ) : (
            <div className="preview-card" style={{position:"relative",overflow:"hidden"}}>
              <img loading="lazy" decoding="async" src={preview} alt="preview" className="preview-img"/>
              {loading&&<div style={{position:"absolute",inset:0,background:"rgba(7,17,10,.7)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
                <div style={{width:44,height:44,border:"3px solid rgba(62,207,106,.3)",borderTop:"3px solid var(--green)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
                <div style={{color:"var(--green)",fontSize:13,fontWeight:600}}>{t("analysing")}</div>
              </div>}
              <div className="preview-meta">
                <div><div className="preview-name">{file.name}</div><div className="preview-size">{(file.size/1024/1024).toFixed(2)} MB</div></div>
                <span className="badge badge-green" style={{alignSelf:"flex-start"}}>{t("ready_label")}</span>
                {!loading&&<button className="preview-remove" onClick={()=>{setFile(null);setPreview(null);setProgress(0);}}>✕ {t("remove_image")}</button>}
              </div>
            </div>
          )}
          {loading&&<div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}}/></div>}
          {error&&<div style={{marginTop:10,padding:"10px 13px",background:"var(--red-bg)",border:"1px solid rgba(240,82,82,.2)",borderRadius:"var(--radius)",fontSize:13,color:"var(--red)"}}>{t("error_prefix")}{error}</div>}
          {!loading?(
            <button className="btn btn-primary btn-full btn-lg" style={{marginTop:12}} disabled={!file} onClick={submit}>
              {file?`⊕ ${t("btn_analyse")}`:t("btn_select")}
            </button>
          ):<div style={{marginTop:12,textAlign:"center",fontSize:11.5,color:"var(--text3)"}}>{t("running_model")}</div>}
          <div style={{marginTop:8,fontSize:11,color:"var(--text3)",textAlign:"center"}}>{t("upload_note")}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          <div className="card card-sm">
            <div className="card-title">{t("photo_tips")}</div>
            {[{icon:"☀",tk:"tip1"},{icon:"🔍",tk:"tip2"},{icon:"🍃",tk:"tip3"},{icon:"📐",tk:"tip4"}].map(({icon,tk})=>(
              <div key={tk} style={{display:"flex",gap:9,alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontSize:15,flexShrink:0,marginTop:1}}>{icon}</span>
                <div><div style={{fontSize:12.5,fontWeight:600,color:"var(--text1)"}}>{t(`${tk}_title`)}</div><div style={{fontSize:11,color:"var(--text3)",marginTop:1}}>{t(`${tk}_desc`)}</div></div>
              </div>
            ))}
          </div>
          <div className="card card-sm" style={{background:"var(--green-glow)",borderColor:"var(--green-dim)"}}>
            <div className="card-title">{t("conf_threshold")}</div>
            <div style={{fontFamily:"var(--font-head)",fontSize:26,fontWeight:800,color:"var(--green)",lineHeight:1,marginBottom:4}}>{settings.confidence}%</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{t("conf_in_settings")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/DetectPage.jsx v10 — merged upload + camera, quota-aware, full i18n
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useOfflineQueue } from "../components/OfflineQueue";
import OfflineQueuePanel from "../components/OfflineQueue";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function DetectPage({ onResult, settings, t, canScan }) {
  const [tab, setTab] = useState("upload");
  const { isPremium, scansRemaining, authFetch, reloadUser } = useAuth();

  // Quota gate
  if (!canScan) return (
    <div className="page-anim">
      <div className="premium-gate" style={{ marginTop:40 }}>
        <div className="premium-gate-icon">📸</div>
        <div className="premium-gate-title">{t("user_scans_remaining").replace("{n}","0")}</div>
        <div className="premium-gate-sub">
          {t("upgrade_sub")}
        </div>
        <button className="btn btn-gold btn-lg" style={{ marginTop:8 }}
          onClick={() => { reloadUser(); }}>
          ⭐ {t("go_premium")}
        </button>
        <div style={{ fontSize:11.5, color:"var(--text3)", marginTop:8 }}>
          Quota resets at midnight
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-anim">
      <div className="detect-hero">
        <h2>{t("upload_title")}</h2>
        <p>{t("upload_sub")}</p>
        {!isPremium && (
          <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:8 }}>
            <span className="badge badge-amber">{t("user_scans_remaining").replace("{n}", scansRemaining)}</span>
            <span style={{ fontSize:11.5, color:"var(--text3)" }}>today</span>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="detect-tabs">
        <button className={`dtab ${tab==="upload"?"active":""}`} onClick={() => setTab("upload")}>
          <span className="dtab-icon">📁</span>
          <span>
            Upload image
            <span className="dtab-sub">{t("drop_sub")}</span>
          </span>
        </button>
        <button className={`dtab ${tab==="camera"?"active":""}`} onClick={() => setTab("camera")}>
          <span className="dtab-icon">📷</span>
          <span>
            {t("cam_live")} camera
            <span className="dtab-sub">Point &amp; scan in real time</span>
          </span>
        </button>
      </div>

      {tab === "upload"
        ? <UploadPanel onResult={onResult} settings={settings} t={t}/>
        : <CameraPanel onResult={onResult} settings={settings} t={t}/>
      }
    </div>
  );
}

/* ── Upload panel ─────────────────────────────────────── */
function UploadPanel({ onResult, settings, t }) {
  const { enqueue } = useOfflineQueue();
  const { authFetch } = useAuth();
  const toast       = useToast();
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [drag,     setDrag]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  function pickFile(f) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError(t("error_wrong_type")); return; }
    if (f.size > 10*1024*1024)        { setError(t("error_too_large"));  return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setError(null);
  }

  function onDrop(e) { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }

  async function analyse() {
    if (!file) return;
    if (!navigator.onLine) {
      await enqueue(file, {});
      toast(t("offline_queued"), "warning");
      return;
    }
    setLoading(true); setError(null); setProgress(0);
    const tick = setInterval(() => setProgress(p => Math.min(p+7, 88)), 200);
    const fd   = new FormData(); fd.append("image", file);
    try {
      const res  = await authFetch(`${API}/api/predict`, { method:"POST", body:fd });
      const data = await res.json();
      clearInterval(tick); setProgress(100);
      if (!res.ok) throw new Error(data.error || t("error_try_again"));
      setTimeout(() => onResult(data), 400);
    } catch(e) {
      clearInterval(tick); setError(e.message); setLoading(false); setProgress(0);
    }
  }

  return (
    <div className="detect-panel" style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:16, alignItems:"start" }}>
      <div>
        {!file ? (
          <div className={`drop-zone ${drag?"drag":""}`}
            onDragOver={e=>{e.preventDefault();setDrag(true);}}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current.click()}>
            <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
              onChange={e => pickFile(e.target.files[0])}/>
            <div className="drop-icon">📷</div>
            <div className="drop-title">{t("drop_title")}</div>
            <div className="drop-sub">{t("drop_sub")}</div>
            <div className="drop-chips">
              {["JPG","PNG","WebP","Max 10 MB"].map(c => <span key={c} className="chip">{c}</span>)}
            </div>
          </div>
        ) : (
          <div className="preview-card" style={{ position:"relative" }}>
            <img loading="lazy" decoding="async" src={preview} alt="preview" className="preview-img"/>
            {loading && (
              <div style={{ position:"absolute",inset:0,background:"rgba(6,16,10,.75)",backdropFilter:"blur(4px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12 }}>
                <div className="spinner" style={{ width:44,height:44,borderWidth:3 }}/>
                <div style={{ color:"var(--green)",fontSize:13,fontWeight:600 }}>{t("analysing")}</div>
              </div>
            )}
            <div className="preview-body">
              <div className="preview-name">{file.name}</div>
              <div className="preview-size">{(file.size/1024/1024).toFixed(2)} MB</div>
              <span className="badge badge-green" style={{ alignSelf:"flex-start" }}>{t("ready_label")}</span>
              {!loading && (
                <button className="preview-remove"
                  onClick={() => { setFile(null); setPreview(null); setError(null); }}>
                  ✕ {t("remove_image")}
                </button>
              )}
            </div>
          </div>
        )}

        {loading && <div className="prog-bar"><div className="prog-fill" style={{width:`${progress}%`}}/></div>}
        {error && (
          <div style={{ marginTop:10,padding:"10px 13px",background:"var(--red-bg)",border:"1px solid rgba(240,82,82,.2)",borderRadius:"var(--r)",fontSize:13,color:"var(--red-text)" }}>
            {t("error_prefix")}{error}
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" style={{ marginTop:12 }}
          disabled={!file || loading} onClick={analyse}>
          {file ? `⊕ ${t("btn_analyse")}` : t("btn_select")}
        </button>
        <div style={{ marginTop:7,fontSize:11,color:"var(--text3)",textAlign:"center" }}>
          {t("upload_note")}
        </div>
      </div>
      <TipsPanel t={t} settings={settings}/>
    </div>
  );
}

/* ── Camera panel ─────────────────────────────────────── */
const TIPS_KEYS = ["Hold 20–30 cm from the leaf","Let the leaf fill the frame","Use natural daylight","Focus on the most affected area","Keep camera parallel to the leaf"];

function CameraPanel({ onResult, settings, t }) {
  const { enqueue } = useOfflineQueue();
  const { authFetch } = useAuth();
  const toast       = useToast();
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const [ready,    setReady]    = useState(false);
  const [captured, setCaptured] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [progress, setProgress] = useState(0);
  const [devices,  setDevices]  = useState([]);
  const [camIdx,   setCamIdx]   = useState(0);
  const [tipIdx,   setTipIdx]   = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTipIdx(i => (i+1) % TIPS_KEYS.length), 3000);
    return () => clearInterval(iv);
  }, []);

  const startCamera = useCallback(async (deviceId) => {
    streamRef.current?.getTracks().forEach(tr => tr.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId:{ exact:deviceId }, width:1280, height:720 }
                        : { facingMode:"environment", width:1280, height:720 },
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setReady(true); setError(null); }
      const devs = await navigator.mediaDevices.enumerateDevices();
      setDevices(devs.filter(d => d.kind==="videoinput"));
    } catch { setError(t("cam_denied")); }
  }, []);

  useEffect(() => { startCamera(null); return () => streamRef.current?.getTracks().forEach(tr => tr.stop()); }, []);

  function capture() {
    const v=videoRef.current, c=canvasRef.current;
    c.width=v.videoWidth; c.height=v.videoHeight;
    c.getContext("2d").drawImage(v,0,0);
    setCaptured(c.toDataURL("image/jpeg",.92)); setScanning(false);
  }

  async function analyse() {
    if (!captured) return;
    if (!navigator.onLine) {
      const blob = await (await fetch(captured)).blob();
      await enqueue(new File([blob],"camera.jpg",{type:"image/jpeg"}), {});
      toast(t("offline_queued"), "warning"); return;
    }
    setLoading(true); setProgress(0);
    const tick = setInterval(() => setProgress(p => Math.min(p+6, 88)), 180);
    try {
      const blob = await (await fetch(captured)).blob();
      const fd   = new FormData(); fd.append("image", blob, "camera.jpg");
      const res  = await authFetch(`${API}/api/predict`, { method:"POST", body:fd });
      const data = await res.json();
      clearInterval(tick); setProgress(100);
      if (!res.ok) throw new Error(data.error || t("error_try_again"));
      setTimeout(() => onResult(data), 400);
    } catch(e) { clearInterval(tick); setError(e.message); setLoading(false); setProgress(0); }
  }

  if (!navigator.mediaDevices) return (
    <div className="detect-panel empty-state" style={{paddingTop:40}}>
      <span className="empty-icon">📷</span>
      <div className="empty-title">{t("cam_not_supported")}</div>
      <div className="empty-sub">{t("cam_not_supported_sub")}</div>
    </div>
  );

  return (
    <div className="detect-panel" style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:16, alignItems:"start" }}>
      <div>
        <div className="cam-view">
          <video ref={videoRef} style={{ display:captured?"none":"block" }} muted playsInline autoPlay/>
          {captured && <img loading="lazy" decoding="async" src={captured} alt="captured"/>}
          {!captured && ready && (
            <>
              <div className="cam-live-badge"><span className="cam-live-dot"/>{t("cam_live")}</div>
              <div className="cam-overlay">
                <div className="cam-corner tl"/><div className="cam-corner tr"/>
                <div className="cam-corner bl"/><div className="cam-corner br"/>
                {scanning && <div className="cam-scanline"/>}
                <div className="cam-reticle"/>
                <div className="cam-tip">{TIPS_KEYS[tipIdx]}</div>
              </div>
            </>
          )}
          {loading && (
            <div className="cam-loading">
              <div className="cam-spinner"/>
              <div style={{ color:"var(--green)",fontSize:13,fontWeight:600 }}>{t("analysing")}</div>
              <div style={{ width:150,height:3,background:"rgba(62,207,106,.15)",borderRadius:2 }}>
                <div style={{ height:"100%",background:"var(--green)",borderRadius:2,width:`${progress}%`,transition:"width .22s" }}/>
              </div>
            </div>
          )}
          {error && !loading && (
            <div style={{ position:"absolute",bottom:14,left:14,right:14,background:"var(--red-bg)",border:"1px solid rgba(240,82,82,.3)",borderRadius:8,padding:"9px 12px",fontSize:12,color:"var(--red-text)",textAlign:"center" }}>
              {error}
            </div>
          )}
        </div>
        {loading && <div className="prog-bar"><div className="prog-fill" style={{width:`${progress}%`}}/></div>}
        <div style={{ display:"flex",gap:9,marginTop:13,justifyContent:"center" }}>
          {!captured ? (
            <>
              {devices.length > 1 && (
                <button className="btn btn-ghost btn-sm" onClick={() => { const n=(camIdx+1)%devices.length; setCamIdx(n); startCamera(devices[n]?.deviceId); }}>
                  🔄 {t("cam_flip")}
                </button>
              )}
              <button className="btn btn-primary" style={{ flex:1,padding:"13px 20px",fontSize:15,borderRadius:50 }}
                disabled={!ready||scanning||loading}
                onClick={() => { setScanning(true); setTimeout(capture,700); }}>
                {scanning ? `📸 ${t("cam_capture")}` : `📷 ${t("cam_scan_btn")}`}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" style={{flex:1}}
                onClick={() => { setCaptured(null); setError(null); setProgress(0); }}>
                ↩ {t("cam_retake")}
              </button>
              <button className="btn btn-primary" style={{flex:2}} disabled={loading} onClick={analyse}>
                ⊕ {t("btn_analyse")}
              </button>
            </>
          )}
        </div>
        <canvas ref={canvasRef} style={{display:"none"}}/>
      </div>
      <TipsPanel t={t} settings={settings} camera/>
    </div>
  );
}

/* ── Shared tips sidebar ─────────────────────────────── */
function TipsPanel({ t, settings, camera }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
      <div className="card card-sm">
        <div className="card-title">{t("photo_tips")}</div>
        {[
          { icon:"☀", title:t("tip1_title"), desc:t("tip1_desc") },
          { icon:"🔍", title:t("tip2_title"), desc:t("tip2_desc") },
          { icon:"🍃", title:t("tip3_title"), desc:t("tip3_desc") },
          { icon:"📐", title:t("tip4_title"), desc:t("tip4_desc") },
        ].map(({ icon,title,desc }) => (
          <div key={title} style={{ display:"flex",gap:9,marginBottom:10,alignItems:"flex-start" }}>
            <span style={{ fontSize:14,flexShrink:0,marginTop:1 }}>{icon}</span>
            <div>
              <div style={{ fontSize:12,fontWeight:600,color:"var(--text1)" }}>{title}</div>
              <div style={{ fontSize:11,color:"var(--text3)",marginTop:1 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card card-sm" style={{ background:"var(--green-glow)",borderColor:"var(--green-dim)" }}>
        <div className="card-title">{t("conf_threshold")}</div>
        <div style={{ fontFamily:"var(--fh)",fontSize:26,fontWeight:800,color:"var(--green)",lineHeight:1,marginBottom:4 }}>
          {settings?.confidence || 70}%
        </div>
        <div style={{ fontSize:11,color:"var(--text3)" }}>{t("conf_in_settings")}</div>
      </div>
    </div>
  );
}

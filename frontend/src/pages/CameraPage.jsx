// src/pages/CameraPage.jsx
// UNIQUE FEATURE: Live camera with real-time scanning animation
// Farmer just points phone at leaf — no need to upload a file

import { useState, useRef, useEffect, useCallback } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function CameraPage({ onResult, settings, t }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const [ready,    setReady]    = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error,    setError]    = useState(null);
  const [captured, setCaptured] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [camIdx,   setCamIdx]   = useState(0);
  const [devices,  setDevices]  = useState([]);
  const [progress, setProgress] = useState(0);
  const [tipIdx,   setTipIdx]   = useState(0);

  const TIPS = [
    "Hold steady 20–30 cm from the leaf",
    "Make sure the leaf fills the frame",
    "Use natural light for best results",
    "Capture the most affected area",
  ];

  useEffect(() => {
    const interval = setInterval(() => setTipIdx(i => (i+1) % TIPS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  // Start camera
  const startCamera = useCallback(async (deviceId) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const constraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width:1280, height:720 }
          : { facingMode:"environment", width:1280, height:720 },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setReady(true); setError(null);
      }
      // List devices after permission granted
      const devs = await navigator.mediaDevices.enumerateDevices();
      setDevices(devs.filter(d => d.kind === "videoinput"));
    } catch (e) {
      setError("Camera access denied. Please allow camera permission and try again.");
    }
  }, []);

  useEffect(() => {
    startCamera(null);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // Capture frame
  function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    setScanning(false);
  }

  // Analyse captured frame
  async function analyse() {
    if (!captured) return;
    setLoading(true); setProgress(0);
    const tick = setInterval(() => setProgress(p => Math.min(p+6, 88)), 180);
    try {
      const blob = await (await fetch(captured)).blob();
      const fd = new FormData();
      fd.append("image", blob, "camera_capture.jpg");
      const res  = await fetch(`${API}/api/predict`, { method:"POST", body:fd });
      const data = await res.json();
      clearInterval(tick); setProgress(100);
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setTimeout(() => onResult(data), 400);
    } catch(e) {
      clearInterval(tick);
      setError(e.message);
      setLoading(false); setProgress(0);
    }
  }

  function retake() { setCaptured(null); setError(null); setScanning(false); setProgress(0); }

  function switchCamera() {
    const next = (camIdx + 1) % devices.length;
    setCamIdx(next);
    startCamera(devices[next]?.deviceId);
  }

  if (!navigator.mediaDevices) return (
    <div className="page-anim" style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📷</div>
      <div style={{ fontFamily:"var(--font-head)", fontSize:20, color:"var(--text1)", marginBottom:8 }}>
        Camera not supported
      </div>
      <div style={{ color:"var(--text2)", fontSize:14 }}>
        Your browser does not support camera access. Please use the Upload option instead.
      </div>
    </div>
  );

  return (
    <div className="page-anim">
      <div className="upload-hero">
        <h2>Live leaf scanner</h2>
        <p>Point your camera at a leaf and tap Scan. No file upload needed.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18, alignItems:"start" }}>
        {/* Camera viewport */}
        <div>
          <div style={{
            position:"relative", borderRadius:"var(--radius-xl)",
            overflow:"hidden", background:"#000",
            aspectRatio:"4/3", border:"1px solid var(--border)",
          }}>
            {/* Video feed */}
            <video
              ref={videoRef}
              style={{ width:"100%", height:"100%", objectFit:"cover", display: captured?"none":"block" }}
              muted playsInline autoPlay
            />

            {/* Captured still */}
            {captured && (
              <img loading="lazy" decoding="async" src={captured} alt="captured"
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
            )}

            {/* Scanning overlay */}
            {!captured && ready && (
              <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
                {/* Corner brackets */}
                {[
                  { top:20, left:20, borderTop:"3px solid #3ecf6a", borderLeft:"3px solid #3ecf6a" },
                  { top:20, right:20, borderTop:"3px solid #3ecf6a", borderRight:"3px solid #3ecf6a" },
                  { bottom:20, left:20, borderBottom:"3px solid #3ecf6a", borderLeft:"3px solid #3ecf6a" },
                  { bottom:20, right:20, borderBottom:"3px solid #3ecf6a", borderRight:"3px solid #3ecf6a" },
                ].map((s, i) => (
                  <div key={i} style={{ position:"absolute", width:36, height:36, borderRadius:2, ...s }}/>
                ))}

                {/* Scan line */}
                {scanning && (
                  <div style={{
                    position:"absolute", left:20, right:20, height:2,
                    background:"linear-gradient(90deg, transparent, #3ecf6a, transparent)",
                    animation:"scanLine 1.8s ease-in-out infinite",
                    boxShadow:"0 0 8px #3ecf6a",
                  }}/>
                )}

                {/* Center reticle */}
                <div style={{
                  position:"absolute", top:"50%", left:"50%",
                  transform:"translate(-50%,-50%)",
                  width:80, height:80,
                  border:"1px solid rgba(62,207,106,.5)",
                  borderRadius:"50%",
                }}>
                  <div style={{
                    position:"absolute", top:"50%", left:"50%",
                    transform:"translate(-50%,-50%)",
                    width:8, height:8, borderRadius:"50%",
                    background:"#3ecf6a", opacity:.8,
                  }}/>
                </div>

                {/* Tip text */}
                <div style={{
                  position:"absolute", bottom:20, left:20, right:20,
                  background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)",
                  borderRadius:8, padding:"8px 12px",
                  fontSize:12, color:"rgba(255,255,255,.85)", textAlign:"center",
                  transition:"opacity .3s",
                }}>
                  {TIPS[tipIdx]}
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {loading && (
              <div style={{
                position:"absolute", inset:0,
                background:"rgba(7,17,10,.75)", backdropFilter:"blur(4px)",
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:14,
              }}>
                <div style={{
                  width:56, height:56,
                  border:"3px solid rgba(62,207,106,.25)",
                  borderTop:"3px solid #3ecf6a",
                  borderRadius:"50%", animation:"spin .7s linear infinite",
                }}/>
                <div style={{ color:"#3ecf6a", fontSize:14, fontWeight:600 }}>Analysing…</div>
                <div style={{ width:160, height:3, background:"rgba(62,207,106,.15)", borderRadius:2 }}>
                  <div style={{
                    height:"100%", background:"#3ecf6a", borderRadius:2,
                    width:`${progress}%`, transition:"width .25s ease",
                  }}/>
                </div>
              </div>
            )}

            {error && !loading && (
              <div style={{
                position:"absolute", bottom:16, left:16, right:16,
                background:"var(--red-bg)", border:"1px solid rgba(240,82,82,.3)",
                borderRadius:8, padding:"10px 14px",
                fontSize:12, color:"var(--red)", textAlign:"center",
              }}>
                {error}
              </div>
            )}
          </div>

          {/* Progress bar */}
          {loading && (
            <div style={{ height:3, background:"var(--bg4)", borderRadius:2, marginTop:8, overflow:"hidden" }}>
              <div style={{ height:"100%", background:"#3ecf6a", borderRadius:2, width:`${progress}%`, transition:"width .25s ease" }}/>
            </div>
          )}

          {/* Controls */}
          <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"center" }}>
            {!captured ? (
              <>
                {devices.length > 1 && (
                  <button className="btn btn-ghost btn-sm" onClick={switchCamera} title="Switch camera">
                    🔄 Flip
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  style={{ flex:1, fontSize:16, padding:"14px 24px", borderRadius:50 }}
                  disabled={!ready || loading}
                  onClick={() => { setScanning(true); setTimeout(capture, 600); }}
                >
                  {scanning ? "📸 Capturing…" : "📷 Scan Leaf"}
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={retake} style={{ flex:1 }}>
                  ↩ Retake
                </button>
                <button className="btn btn-primary" onClick={analyse}
                  disabled={loading} style={{ flex:2 }}>
                  ⊕ Analyse this leaf
                </button>
              </>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display:"none" }}/>
        </div>

        {/* Right panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="card card-sm">
            <div className="card-title">How it works</div>
            {[
              { n:"1", text:"Point camera at an affected leaf" },
              { n:"2", text:"Tap Scan Leaf to capture" },
              { n:"3", text:"Tap Analyse to get diagnosis" },
              { n:"4", text:"See disease + treatment instantly" },
            ].map(({ n, text }) => (
              <div key={n} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                <div style={{
                  width:22, height:22, borderRadius:"50%",
                  background:"var(--green-glow2)", border:"1px solid var(--green-dim)",
                  color:"var(--green)", fontSize:11, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                }}>{n}</div>
                <div style={{ fontSize:13, color:"var(--text2)", paddingTop:2 }}>{text}</div>
              </div>
            ))}
          </div>

          <div className="card card-sm" style={{ background:"var(--green-glow)", borderColor:"var(--green-dim)" }}>
            <div className="card-title">Confidence threshold</div>
            <div style={{ fontFamily:"var(--font-head)", fontSize:26, fontWeight:800, color:"var(--green)", lineHeight:1, marginBottom:4 }}>
              {settings?.confidence || 70}%
            </div>
            <div style={{ fontSize:11, color:"var(--text3)" }}>Adjust in Settings → Detection</div>
          </div>

          <div className="card card-sm">
            <div className="card-title">Best practices</div>
            {[
              { icon:"☀", tip:"Shoot in natural daylight" },
              { icon:"🔍", tip:"Fill frame with the leaf" },
              { icon:"🍃", tip:"Focus on spotted/yellow areas" },
              { icon:"📐", tip:"Keep camera parallel to leaf" },
            ].map(({ icon, tip }) => (
              <div key={tip} style={{ display:"flex", gap:9, marginBottom:9, fontSize:12 }}>
                <span style={{ fontSize:14, flexShrink:0 }}>{icon}</span>
                <span style={{ color:"var(--text2)" }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top:20px; opacity:1; }
          100% { top:calc(100% - 20px); opacity:0; }
        }
      `}</style>
    </div>
  );
}

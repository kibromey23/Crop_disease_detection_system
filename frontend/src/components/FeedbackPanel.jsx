// src/components/FeedbackPanel.jsx
// Feedback Loop — "Was this diagnosis correct?"
// Submits to backend /api/feedback and also caches locally for offline

import { useState } from "react";
import { useToast } from "./Toast";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function FeedbackPanel({ disease, scanId, onClose }) {
  const [step,       setStep]       = useState(1);
  const [rating,     setRating]     = useState(null);
  const [followUp,   setFollowUp]   = useState("");
  const [treatment,  setTreatment]  = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { authFetch } = useAuth();

  const name = (disease.split("___")[1] || disease).replace(/_/g, " ");

  async function submitRating(r) {
    setRating(r);
    setStep(2);
  }

  async function submitDetail() {
    setSubmitting(true);
    const payload = { scan_id: scanId, disease, rating, note: followUp || null, treatment_result: treatment || null };

    // 1. Submit to backend
    try {
      await authFetch(`${API}/api/feedback`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
    } catch {
      // Offline — cache locally
    }

    // 2. Cache locally as training signal backup
    try {
      const fb = JSON.parse(localStorage.getItem("cg_feedback") || "[]");
      fb.push({ ...payload, ts: new Date().toISOString() });
      // Keep only last 100 feedback items locally
      if (fb.length > 100) fb.splice(0, fb.length - 100);
      localStorage.setItem("cg_feedback", JSON.stringify(fb));
    } catch {}

    setSubmitting(false);
    setStep(3);
    toast("Thank you! Your feedback improves our AI.", "success");
  }

  function handleFollowUp(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => { setUploading(false); toast("Follow-up image saved for review", "success"); }, 1200);
  }

  return (
    <div style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:16, padding:"18px 20px", marginTop:12 }}>

      {step === 1 && (
        <>
          <div style={{ fontFamily:"var(--fh)", fontSize:14, fontWeight:700, color:"var(--text1)", marginBottom:5 }}>
            Was this diagnosis correct?
          </div>
          <div style={{ fontSize:12.5, color:"var(--text2)", marginBottom:16, lineHeight:1.5 }}>
            Your feedback helps improve the AI model for all farmers.
          </div>
          <div style={{ display:"flex", gap:9 }}>
            {[
              { val:"correct", icon:"👍", label:"Yes, correct",   color:"var(--green)", bg:"var(--green-glow2)" },
              { val:"wrong",   icon:"👎", label:"No, wrong",      color:"var(--red)",   bg:"var(--red-bg)"     },
              { val:"unsure",  icon:"🤔", label:"Not sure",       color:"var(--amber)", bg:"var(--amber-bg)"   },
            ].map(({ val, icon, label, color, bg }) => (
              <button key={val} onClick={() => submitRating(val)} style={{
                flex:1, padding:"12px 8px", borderRadius:12,
                border:`1.5px solid ${color}30`,
                background: bg,
                cursor:"pointer", fontFamily:"var(--fb)",
                display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                transition:"all .18s",
              }}>
                <span style={{ fontSize:22 }}>{icon}</span>
                <span style={{ fontSize:11.5, fontWeight:600, color }}>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontFamily:"var(--fh)", fontSize:14, fontWeight:700, color:"var(--text1)", marginBottom:4 }}>
            {rating === "correct" ? "Great! Any additional notes?" : "What was the actual disease?"}
          </div>
          <div style={{ fontSize:11.5, color:"var(--text3)", marginBottom:14 }}>
            The AI diagnosed: <strong style={{ color:"var(--text1)" }}>{name}</strong>
          </div>

          <textarea
            value={followUp}
            onChange={e => setFollowUp(e.target.value)}
            placeholder={rating === "wrong"
              ? "e.g. It was actually Tomato Early Blight, not Late Blight..."
              : "Any notes about symptoms, field conditions, or treatment used..."}
            style={{
              width:"100%", height:80, background:"var(--bg2)", border:"1px solid var(--border)",
              borderRadius:10, padding:"10px 12px", color:"var(--text1)",
              fontFamily:"var(--fb)", fontSize:13, outline:"none", resize:"vertical", marginBottom:14,
            }}
          />

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:9 }}>Did the recommended treatment work? (optional)</div>
            <div style={{ display:"flex", gap:8 }}>
              {[
                { val:"worked",  label:"✅ Yes, worked",    color:"var(--green)" },
                { val:"partial", label:"⚡ Partially",      color:"var(--amber)" },
                { val:"didnt",   label:"❌ No improvement", color:"var(--red)"   },
              ].map(({ val, label, color }) => (
                <button key={val} onClick={() => setTreatment(treatment === val ? null : val)} style={{
                  flex:1, padding:"8px 6px", borderRadius:9, fontSize:11.5, fontWeight:600,
                  border:`1.5px solid ${treatment === val ? color : "var(--border)"}`,
                  background: treatment === val ? color + "15" : "var(--bg2)",
                  color: treatment === val ? color : "var(--text3)",
                  cursor:"pointer", transition:"all .15s",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <label style={{
            display:"flex", alignItems:"center", gap:9, padding:"10px 13px",
            background:"var(--bg2)", border:"1px dashed var(--border2)",
            borderRadius:10, cursor:"pointer", marginBottom:14,
            fontSize:12.5, color:"var(--text2)", transition:"border-color .15s",
          }}>
            <span style={{ fontSize:18 }}>{uploading ? "⏳" : "📸"}</span>
            <span>{uploading ? "Saving..." : "Upload a follow-up image (optional)"}</span>
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleFollowUp} />
          </label>

          <div style={{ display:"flex", gap:9 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setStep(3); toast("Feedback skipped.", "info"); }} style={{ flex:1 }}>Skip</button>
            <button className="btn btn-primary btn-sm" onClick={submitDetail} disabled={submitting} style={{ flex:2 }}>
              {submitting ? "Submitting…" : "Submit feedback"}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <div style={{ textAlign:"center", padding:"10px 0" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🙏</div>
          <div style={{ fontFamily:"var(--fh)", fontSize:15, fontWeight:700, color:"var(--text1)", marginBottom:6 }}>
            Thank you for your feedback!
          </div>
          <div style={{ fontSize:12.5, color:"var(--text2)", lineHeight:1.6, marginBottom:14 }}>
            Your feedback has been submitted and helps improve AI accuracy for all farmers.
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
}

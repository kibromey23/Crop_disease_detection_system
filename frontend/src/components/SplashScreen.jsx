// src/components/SplashScreen.jsx
import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = logo appears, 1 = text types, 2 = fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => onDone(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"#07110a",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      gap:24,
      opacity: phase === 2 ? 0 : 1,
      transition:"opacity .6s ease",
      pointerEvents:"none",
    }}>
      {/* Animated rings */}
      <div style={{ position:"relative", width:140, height:140 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position:"absolute", inset: i*14,
            borderRadius:"50%",
            border:`1.5px solid rgba(62,207,106,${0.5 - i*0.12})`,
            animation:`splashRing 2s ease-in-out ${i*0.3}s infinite`,
          }}/>
        ))}
        {/* Center logo */}
        <div style={{
          position:"absolute", inset:28,
          borderRadius:"50%",
          background:"rgba(62,207,106,.1)",
          border:"2px solid #3ecf6a",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"splashPulse 1.5s ease-in-out infinite",
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 5 L40 14 L40 30 Q40 40 24 45 Q8 40 8 30 L8 14 Z"
              stroke="#3ecf6a" strokeWidth="1.5" fill="rgba(62,207,106,.1)"/>
            <path d="M24 12 C27 15 32 19 32 24 C32 30 27 34 24 37 C21 34 16 30 16 24 C16 19 21 15 24 12 Z"
              stroke="#3ecf6a" strokeWidth="1.2" fill="rgba(62,207,106,.15)"/>
            <line x1="24" y1="12" x2="24" y2="37" stroke="#3ecf6a" strokeWidth="0.9"/>
            <circle cx="24" cy="24" r="2.5" fill="#3ecf6a"/>
          </svg>
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign:"center", opacity: phase >= 1 ? 1 : 0, transition:"opacity .5s ease" }}>
        <div style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:28, letterSpacing:"-.02em", color:"#e8f0e9",
          marginBottom:6,
        }}>
          Crop<span style={{ color:"#3ecf6a" }}>Guard</span> AI
        </div>
        <div style={{ fontSize:13, color:"#3d5c3d", letterSpacing:".12em", textTransform:"uppercase" }}>
          Plant Disease Detection
        </div>
        <div style={{ fontSize:11, color:"#1f3c1f", marginTop:16, letterSpacing:".06em" }}>
          Mekelle Institute of Technology · 2026
        </div>
      </div>

      {/* Loading bar */}
      <div style={{
        width:160, height:2, background:"rgba(62,207,106,.15)",
        borderRadius:1, overflow:"hidden",
        opacity: phase >= 1 ? 1 : 0, transition:"opacity .4s ease",
      }}>
        <div style={{
          height:"100%", background:"#3ecf6a", borderRadius:1,
          animation:"splashBar 2s ease-in-out forwards",
        }}/>
      </div>

      <style>{`
        @keyframes splashRing {
          0%,100% { transform:scale(1); opacity:.6; }
          50% { transform:scale(1.06); opacity:1; }
        }
        @keyframes splashPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(62,207,106,.3); }
          50% { box-shadow:0 0 0 12px rgba(62,207,106,0); }
        }
        @keyframes splashBar {
          0% { width:0%; }
          100% { width:100%; }
        }
      `}</style>
    </div>
  );
}

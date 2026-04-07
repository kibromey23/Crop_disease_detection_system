// src/components/Logo.jsx
// Matches crop.png: green shield, plant with leaves, magnifying glass, orange virus particles

export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a7d2c"/>
          <stop offset="100%" stopColor="#1b5e20"/>
        </linearGradient>
        <linearGradient id="skyBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#90caf9"/>
          <stop offset="55%" stopColor="#c8e6c9"/>
          <stop offset="100%" stopColor="#4caf50"/>
        </linearGradient>
        <linearGradient id="fieldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#81c784"/>
          <stop offset="100%" stopColor="#388e3c"/>
        </linearGradient>
        <linearGradient id="magRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eeeeee"/>
          <stop offset="50%" stopColor="#bdbdbd"/>
          <stop offset="100%" stopColor="#9e9e9e"/>
        </linearGradient>
        <linearGradient id="handleCol" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#66bb6a"/>
          <stop offset="100%" stopColor="#1b5e20"/>
        </linearGradient>
        <linearGradient id="diseasePatch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff176"/>
          <stop offset="100%" stopColor="#ffca28"/>
        </linearGradient>
        <clipPath id="sc">
          <path d="M60 12 L98 26 L98 66 Q98 91 60 104 Q22 91 22 66 L22 26 Z"/>
        </clipPath>
      </defs>

      {/* ── Outer shield ── */}
      <path d="M60 5 L104 21 L104 67 Q104 96 60 111 Q16 96 16 67 L16 21 Z"
        fill="url(#shieldFill)" stroke="#145214" strokeWidth="1.5"/>

      {/* ── White inner border ── */}
      <path d="M60 10 L100 25 L100 66 Q100 93 60 107 Q20 93 20 66 L20 25 Z"
        fill="white"/>

      {/* ── Scene background (sky + field) ── */}
      <path d="M60 12 L98 26 L98 66 Q98 91 60 104 Q22 91 22 66 L22 26 Z"
        fill="url(#skyBg)"/>

      {/* ── Rolling field ── */}
      <ellipse cx="60" cy="84" rx="40" ry="22" fill="url(#fieldFill)" clipPath="url(#sc)"/>

      {/* Field rays */}
      <line x1="60" y1="86" x2="22" y2="95" stroke="#2e7d32" strokeWidth="0.7" opacity="0.4" clipPath="url(#sc)"/>
      <line x1="60" y1="86" x2="30" y2="100" stroke="#2e7d32" strokeWidth="0.7" opacity="0.4" clipPath="url(#sc)"/>
      <line x1="60" y1="86" x2="45" y2="103" stroke="#2e7d32" strokeWidth="0.7" opacity="0.4" clipPath="url(#sc)"/>
      <line x1="60" y1="86" x2="75" y2="103" stroke="#2e7d32" strokeWidth="0.7" opacity="0.4" clipPath="url(#sc)"/>
      <line x1="60" y1="86" x2="90" y2="100" stroke="#2e7d32" strokeWidth="0.7" opacity="0.4" clipPath="url(#sc)"/>
      <line x1="60" y1="86" x2="98" y2="95" stroke="#2e7d32" strokeWidth="0.7" opacity="0.4" clipPath="url(#sc)"/>

      {/* ── Tree trunk ── */}
      <rect x="57" y="64" width="7" height="20" rx="2.5" fill="#6d4c41" clipPath="url(#sc)"/>

      {/* ── Leaves ── */}
      {/* Back-left leaf */}
      <path d="M58 64 Q40 52 33 32 Q50 36 61 56 Z"
        fill="#43a047" stroke="#2e7d32" strokeWidth="0.8" clipPath="url(#sc)"/>
      <path d="M58 64 Q46 52 35 33" stroke="#2e7d32" strokeWidth="0.5" fill="none" opacity="0.5" clipPath="url(#sc)"/>
      <path d="M51 58 Q47 53 44 47" stroke="#2e7d32" strokeWidth="0.4" fill="none" opacity="0.4" clipPath="url(#sc)"/>

      {/* Center tall leaf */}
      <path d="M60 64 Q53 42 55 16 Q67 28 67 52 Z"
        fill="#4caf50" stroke="#2e7d32" strokeWidth="0.8" clipPath="url(#sc)"/>
      <path d="M60 64 Q59 44 56 18" stroke="#2e7d32" strokeWidth="0.6" fill="none" opacity="0.5" clipPath="url(#sc)"/>
      <path d="M63 52 Q60 44 58 36" stroke="#2e7d32" strokeWidth="0.4" fill="none" opacity="0.4" clipPath="url(#sc)"/>

      {/* Right leaf */}
      <path d="M62 60 Q78 46 86 28 Q72 34 63 54 Z"
        fill="#66bb6a" stroke="#388e3c" strokeWidth="0.8" clipPath="url(#sc)"/>
      <path d="M62 60 Q74 48 84 30" stroke="#388e3c" strokeWidth="0.5" fill="none" opacity="0.5" clipPath="url(#sc)"/>

      {/* ── Magnifying glass handle ── */}
      <line x1="75" y1="75" x2="98" y2="98" stroke="#145214" strokeWidth="10" strokeLinecap="round"/>
      <line x1="75" y1="75" x2="98" y2="98" stroke="url(#handleCol)" strokeWidth="8" strokeLinecap="round"/>
      {/* Handle highlight */}
      <line x1="74" y1="75" x2="94" y2="95" stroke="#a5d6a7" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>

      {/* ── Magnifier glass circle ── */}
      {/* Outer thick ring */}
      <circle cx="62" cy="60" r="22" fill="none" stroke="#757575" strokeWidth="6"/>
      <circle cx="62" cy="60" r="22" fill="none" stroke="url(#magRing)" strokeWidth="5"/>
      {/* Inner thin ring */}
      <circle cx="62" cy="60" r="19" fill="none" stroke="#e0e0e0" strokeWidth="1"/>

      {/* Glass lens tint (yellowish through lens) */}
      <circle cx="62" cy="60" r="18.5" fill="#fffde7" opacity="0.7"/>

      {/* ── Diseased area through lens ── */}
      <ellipse cx="61" cy="63" rx="12" ry="8" fill="url(#diseasePatch)" opacity="0.75"/>
      <ellipse cx="61" cy="63" rx="8" ry="5" fill="#ffb300" opacity="0.6"/>

      {/* ── Virus / pathogen particles ── */}
      {/* Main large virus */}
      <circle cx="63" cy="62" r="6" fill="#e64a19"/>
      {/* Spikes on main virus */}
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={i}
            x1={63 + Math.cos(r) * 6}
            y1={62 + Math.sin(r) * 6}
            x2={63 + Math.cos(r) * 10}
            y2={62 + Math.sin(r) * 10}
            stroke="#bf360c" strokeWidth="1.2" strokeLinecap="round"
          />
        );
      })}
      {/* Spike tips */}
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return <circle key={i} cx={63 + Math.cos(r)*10.5} cy={62 + Math.sin(r)*10.5} r="1.5" fill="#bf360c"/>;
      })}

      {/* Medium virus top-right */}
      <circle cx="74" cy="51" r="4" fill="#f4511e"/>
      {[0,72,144,216,288].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return (
          <g key={i}>
            <line x1={74+Math.cos(r)*4} y1={51+Math.sin(r)*4} x2={74+Math.cos(r)*7.5} y2={51+Math.sin(r)*7.5} stroke="#d84315" strokeWidth="1" strokeLinecap="round"/>
            <circle cx={74+Math.cos(r)*8} cy={51+Math.sin(r)*8} r="1.2" fill="#d84315"/>
          </g>
        );
      })}

      {/* Small virus bottom */}
      <circle cx="70" cy="70" r="2.5" fill="#e65100"/>
      {[0,90,180,270].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return <line key={i} x1={70+Math.cos(r)*2.5} y1={70+Math.sin(r)*2.5} x2={70+Math.cos(r)*5} y2={70+Math.sin(r)*5} stroke="#bf360c" strokeWidth="0.9" strokeLinecap="round"/>;
      })}

      {/* Lens reflection highlight */}
      <path d="M48 49 Q53 44 59 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <circle cx="50" cy="52" r="1.5" fill="white" opacity="0.5"/>
    </svg>
  );
}

// Sidebar version with text beside it
export function LogoFull({ height = 34 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <Logo size={height} />
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize: height * 0.48, letterSpacing:"-.02em", color:"var(--text1)" }}>
          Crop<span style={{ color:"var(--green)" }}>Guard</span>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize: height * 0.24, letterSpacing:".06em", color:"var(--text3)", textTransform:"uppercase" }}>
          AI Detection
        </div>
      </div>
    </div>
  );
}

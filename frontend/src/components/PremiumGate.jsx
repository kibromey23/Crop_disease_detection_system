// src/components/PremiumGate.jsx
// Wraps any feature with a premium lock overlay
import { useAuth } from "../context/AuthContext";

export default function PremiumGate({ feature, t, children, compact = false }) {
  const { isPremium, upgradeToPremium } = useAuth();
  if (isPremium) return children;

  if (compact) return (
    <div style={{ position:"relative", cursor:"pointer" }}
      onClick={() => alert("Upgrade to Premium to unlock this feature.")}>
      <div style={{ filter:"blur(3px)", pointerEvents:"none", userSelect:"none" }}>
        {children}
      </div>
      <div style={{
        position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:6,
        background:"rgba(6,16,10,.72)", backdropFilter:"blur(2px)", borderRadius:12,
      }}>
        <span style={{ fontSize:20 }}>🔒</span>
        <span style={{ fontSize:11.5, color:"var(--gold)", fontWeight:700 }}>
          {t ? t("premium_feature") : "Premium feature"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="premium-gate">
      <div className="premium-gate-icon">🔒</div>
      <div className="premium-gate-title">{t ? t("premium_feature") : "Premium feature"}</div>
      <div className="premium-gate-sub">
        {feature || (t ? t("premium_locked") : "This feature requires a Premium plan")}
      </div>
      <button className="btn btn-gold btn-lg" style={{ marginTop:6 }}
        onClick={upgradeToPremium}>
        ⭐ {t ? t("go_premium") : "Go Premium →"}
      </button>
    </div>
  );
}

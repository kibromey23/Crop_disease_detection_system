// src/pages/PricingPage.jsx — Monetization / Upgrade page
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const PLANS = [
  {
    id:"free", icon:"🌱",
    feats:[
      { text:"5 scans per day", ok:true },
      { text:"Basic AI diagnosis", ok:true },
      { text:"Disease encyclopedia", ok:true },
      { text:"2 farms max", ok:true },
      { text:"Scan history (last 20)", ok:true },
      { text:"AI insights & trends", ok:false },
      { text:"Smart treatment plans", ok:false },
      { text:"Risk & yield scoring", ok:false },
      { text:"Location intelligence", ok:false },
      { text:"Export reports (PDF/CSV)", ok:false },
      { text:"Offline scan queue", ok:false },
      { text:"Community feed", ok:false },
      { text:"Priority support", ok:false },
    ],
  },
  {
    id:"premium", icon:"⭐", popular:true,
    feats:[
      { text:"Unlimited daily scans", ok:true },
      { text:"Advanced AI diagnosis", ok:true },
      { text:"Disease encyclopedia", ok:true },
      { text:"Up to 10 farms", ok:true },
      { text:"Full scan history (unlimited)", ok:true },
      { text:"AI insights & trends", ok:true },
      { text:"Smart treatment plans", ok:true },
      { text:"Risk & yield scoring", ok:true },
      { text:"Location intelligence", ok:true },
      { text:"Export reports (PDF/CSV)", ok:true },
      { text:"Offline scan queue", ok:true },
      { text:"Community feed access", ok:true },
      { text:"Priority email support", ok:true },
    ],
  },
  {
    id:"enterprise", icon:"🏢",
    feats:[
      { text:"Everything in Premium", ok:true },
      { text:"Unlimited farms & users", ok:true },
      { text:"Custom AI model training", ok:true },
      { text:"REST API access", ok:true },
      { text:"Team dashboard & reports", ok:true },
      { text:"Dedicated support manager", ok:true },
      { text:"On-site training", ok:true },
      { text:"White-label option", ok:true },
      { text:"SLA guarantee", ok:true },
    ],
  },
];

export default function PricingPage({ t }) {
  const { user, isPremium, upgradeToPremium, downgradePlan: downgradeToFree } = useAuth();
  const toast = useToast();

  function handleUpgrade(planId) {
    if (planId === "enterprise") {
      alert("Contact us at cropguard@mit.edu.et to get enterprise pricing for your organisation.");
      return;
    }
    if (planId === "premium") {
      upgradeToPremium();
      toast("🎉 Welcome to Premium! All features unlocked.", "success");
    }
    if (planId === "free") {
      downgradeToFree();
      toast("Downgraded to Free plan.", "info");
    }
  }

  const LABELS = {
    free:       { name:t("plan_free"),       price:t("plan_free_price"),  btn:"plan_current" },
    premium:    { name:t("plan_premium"),     price:t("plan_premium_price"), btn:"plan_upgrade" },
    enterprise: { name:t("plan_enterprise"),  price:t("plan_enterprise_price"), btn:"plan_upgrade" },
  };

  return (
    <div className="page-anim">
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontFamily:"var(--fh)", fontSize:26, fontWeight:800, color:"var(--text1)", marginBottom:8, letterSpacing:"-.02em" }}>
          {t("upgrade_cta")}
        </div>
        <div style={{ fontSize:13.5, color:"var(--text2)", maxWidth:500, margin:"0 auto", lineHeight:1.7 }}>
          {t("upgrade_sub")}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center", marginTop:14 }}>
          <span className="badge badge-green">Current plan:</span>
          <span className="badge badge-gold" style={{ fontSize:12 }}>
            {user.plan === "premium" ? "⭐ " : ""}{t(`plan_${user.plan}`)}
          </span>
        </div>
      </div>

      <div className="plans-grid">
        {PLANS.map((plan, i) => {
          const L = LABELS[plan.id];
          const isCurrent = user.plan === plan.id;
          const isUpgrade = plan.id === "premium" && user.plan === "free";
          return (
            <div key={plan.id}
              className={`plan-card ${plan.popular?"featured":""} ${isCurrent?"current":""}`}
              style={{ animation:`pricePop .4s ease ${i*.08}s both` }}>
              {plan.popular && (
                <div className="plan-popular-badge">{t("plan_most_popular")}</div>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:24 }}>{plan.icon}</span>
                <div className="plan-name">{L.name}</div>
              </div>
              <div>
                <div className="plan-price">{L.price}</div>
                {plan.id === "premium" && (
                  <div className="plan-price-sub">{t("plan_premium_desc").split("·")[0].trim()}</div>
                )}
              </div>
              <div className="plan-features">
                {plan.feats.map(({ text, ok }) => (
                  <div key={text} className={`plan-feat ${!ok?"locked":""}`}>
                    <span className="feat-check">{ok ? "✓" : "—"}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <button
                className={`btn btn-full ${isUpgrade?"btn-primary":isCurrent?"btn-gold":"btn-secondary"}`}
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent && plan.id !== "premium"}>
                {isCurrent
                  ? (plan.id === "premium" ? "✓ Current plan" : t("plan_current"))
                  : plan.id === "enterprise" ? "Contact us"
                  : plan.id === "free" ? "Downgrade"
                  : `⭐ ${t("plan_upgrade")} →`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature matrix */}
      <div className="card" style={{ marginTop:28 }}>
        <div className="card-title">What you get with each plan</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
            <thead>
              <tr>
                <th style={{ textAlign:"left", padding:"8px 12px", color:"var(--text3)", fontWeight:600, borderBottom:"1px solid var(--border)" }}>Feature</th>
                {["free","premium","enterprise"].map(p => (
                  <th key={p} style={{ textAlign:"center", padding:"8px 12px", color:user.plan===p?"var(--green)":"var(--text2)", fontWeight:700, borderBottom:"1px solid var(--border)", fontSize:13 }}>
                    {t(`plan_${p}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Daily scans",     "5 / day","Unlimited","Unlimited"],
                ["AI diagnosis",    "Basic","Advanced","Advanced"],
                ["Farms",           "2","10","Unlimited"],
                ["Scan history",    "Last 20","Unlimited","Unlimited"],
                ["AI insights",     "—","✓","✓"],
                ["Smart treatment", "—","✓","✓"],
                ["Risk scoring",    "—","✓","✓"],
                ["Export reports",  "—","✓","✓"],
                ["Offline queue",   "—","✓","✓"],
                ["API access",      "—","—","✓"],
                ["Custom model",    "—","—","✓"],
                ["Support",         "Community","Priority email","Dedicated manager"],
                ["Price",           "Free","$4.99/mo","Contact us"],
              ].map(([feat,...vals]) => (
                <tr key={feat} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"9px 12px", color:"var(--text2)" }}>{feat}</td>
                  {vals.map((v,i) => (
                    <td key={i} style={{ textAlign:"center", padding:"9px 12px",
                      color: v==="—"?"var(--text3)":v==="✓"?"var(--green)":"var(--text1)",
                      fontWeight: v==="✓"?"700":"400" }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// src/pages/DashboardPage.jsx v10
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ParticleField from "../components/ParticleField";
import LocationIntelligence from "../components/LocationIntelligence";
import OfflineQueuePanel from "../components/OfflineQueue";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const COLORS = ["var(--green)","var(--amber)","var(--blue)","var(--purple)","#fb923c","#38bdf8","#f472b6","#34d399"];

export default function DashboardPage({ nav, settings, t }) {
  const { user, isPremium, scansRemaining, FREE_DAILY_LIMIT: FREE_DAILY_SCANS, upgradeToPremium, authFetch } = useAuth();
  const [records, setRecords] = useState([]);
  const [statsData, setStatsData] = useState({}); // ✅ FIXED NAME
  const [loading, setLoading] = useState(true);
  const isOffline = !navigator.onLine;

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? "user_greeting_morning" : hour < 18 ? "user_greeting_afternoon" : "user_greeting_evening";
  const greeting = t(greetKey);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      authFetch(`${API}/api/history/stats`).then(r => r.json()).catch(() => null),
      authFetch(`${API}/api/history?limit=6`).then(r => r.json()).catch(() => []),
    ]).then(([statsData, recentData]) => {
      if (!cancelled) {
        setStatsData(statsData || {}); // ✅ FIXED
        setRecords(Array.isArray(recentData) ? recentData : []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [authFetch]);

  const total     = statsData.total     || 0; // ✅ FIXED
  const diseased  = statsData.diseased  || 0; // ✅ FIXED
  const healthy   = statsData.healthy   || 0; // ✅ FIXED
  const avgConf   = statsData.avg_confidence || 0; // ✅ FIXED
  const healthPct = total ? Math.round((healthy/total)*100) : 0;
  const circ      = 2*Math.PI*34;
  const topList   = (statsData.top_diseases || []).map(d => [d.disease, d.count]); // ✅ FIXED
  const maxCount  = topList[0]?.[1] || 1;

  const weekDays = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return d.toISOString().slice(0,10);
  });
  const dayCounts = weekDays.map(day => records.filter(r=>r.created_at?.slice(0,10)===day).length);
  const maxDay    = Math.max(...dayCounts,1);

  const stats = [
    { icon:"🔬", val:total,       lbl:t("stat_total"),      clr:"var(--blue)",  bg:"var(--blue-bg)",    delay:.00 },
    { icon:"⚠️", val:diseased,    lbl:t("stat_diseased"),   clr:"var(--red-text)", bg:"var(--red-bg)", delay:.07 },
    { icon:"✅", val:healthy,     lbl:t("stat_healthy"),    clr:"var(--green)", bg:"var(--green-glow)", delay:.14 },
    { icon:"🎯", val:avgConf+"%", lbl:t("stat_confidence"), clr:"var(--amber-text)", bg:"var(--amber-bg)", delay:.21 },
  ];
  const quickActions = [
    { icon:"⊕", lbl:t("action_scan"),     fn:()=>nav("detect")       },
    { icon:"◉", lbl:t("action_guide"),    fn:()=>nav("encyclopedia") },
    { icon:"◆", lbl:t("nav_analytics"),   fn:()=>nav("analytics")    },
    { icon:"◷", lbl:t("action_history"),  fn:()=>nav("history")      },
  ];

  const scansPct   = isPremium ? 100 : Math.round((scansRemaining/FREE_DAILY_SCANS)*100);
  const scansColor = scansPct > 50 ? "var(--green)" : scansPct > 20 ? "var(--amber-text)" : "var(--red-text)";

  return (
    <div className="page-anim">
      {/* Upgrade banner (free only) */}
      {!isPremium && (
        <div className="upgrade-banner" onClick={() => nav("pricing")}>
          <span style={{ fontSize:22 }}>⭐</span>
          <div className="upgrade-banner-text">
            <div className="upgrade-banner-title">{t("upgrade_cta")}</div>
            <div className="upgrade-banner-sub">{t("upgrade_sub")}</div>
            <div className="scans-bar" style={{ maxWidth:200 }}>
              <div className="scans-fill" style={{ width:`${scansPct}%`, background:scansColor }}/>
            </div>
          </div>
          <span style={{ fontSize:13, color:"var(--green)", fontWeight:700 }}>{t("go_premium")}</span>
        </div>
      )}

      {/* Welcome card */}
      <div className="welcome-card">
        <ParticleField count={12}/>
        <div style={{ flex:1, position:"relative", zIndex:1 }}>
          <div style={{ fontSize:12.5, color:"var(--text3)", marginBottom:3 }}>
            {greeting}, {user.name} 👋
          </div>
          <div className="welcome-title">{t("welcome_title")}</div>
          <div className="welcome-sub">{t("welcome_sub")}</div>
          <div className="welcome-actions">
            <button className="btn btn-primary btn-lg" onClick={() => nav("detect")}>
              ⊕ {t("btn_new_scan")}
            </button>
            <button className="btn btn-secondary" onClick={() => nav("encyclopedia")}>
              {t("btn_disease_guide")}
            </button>
            <button className="btn btn-ghost" onClick={() => nav("history")}>
              {t("btn_view_history")}
            </button>
          </div>
        </div>
        {/* Health ring */}
        <div style={{ position:"relative",width:96,height:96,flexShrink:0,zIndex:1 }}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="34" fill="none" stroke="var(--bg4)" strokeWidth="7"/>
            <circle cx="48" cy="48" r="34" fill="none" stroke="var(--green)" strokeWidth="7"
              strokeDasharray={`${(healthPct/100)*circ} ${circ}`}
              strokeLinecap="round" transform="rotate(-90 48 48)"
              style={{ transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}/>
          </svg>
          <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
            <span style={{ fontFamily:"var(--fh)",fontSize:19,fontWeight:800,color:"var(--green)",lineHeight:1 }}>{healthPct}%</span>
            <span style={{ fontSize:8,color:"var(--text3)",letterSpacing:".05em" }}>{t("health_rate")}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(({ icon,val,lbl,clr,bg,delay }) => (
          <div className="stat-card" key={lbl} style={{ animation:`fadeUp .4s ease ${delay}s both` }}>
            <div className="stat-icon" style={{ background:bg }}>{icon}</div>
            <div className="stat-val" style={{ color:clr }}>{val}</div>
            <div className="stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="quick-grid">
        {quickActions.map(({ icon,lbl,fn }) => (
          <button key={lbl} className="quick-btn" onClick={fn}>
            <span className="quick-icon">{icon}</span><span>{lbl}</span>
          </button>
        ))}
      </div>

      <div className="dash-grid">
        {/* Recent scans */}
        <div className="card">
          <div className="card-title">{t("recent_scans")}</div>
          {loading ? <div className="spinner-wrap" style={{minHeight:80}}><div className="spinner"/></div>
          : records.length === 0 ? (
            <div className="empty-state" style={{padding:"24px 0"}}>
              <span className="empty-icon">🌱</span>
              <div className="empty-title" style={{fontSize:13}}>{t("no_scans_yet")}</div>
              <button className="btn btn-primary btn-sm" style={{marginTop:10}} onClick={()=>nav("detect")}>
                {t("btn_new_scan")}
              </button>
            </div>
          ) : (
            <div className="recent-list">
              {records.slice(0,6).map(r => (
                <div className="recent-item" key={r.id} onClick={()=>nav("history")}>
                  <img loading="lazy" decoding="async" className="recent-thumb" src={`${API}${r.image_url}`} alt=""
                    onError={e=>{e.target.style.display="none"}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="recent-name">{r.disease.replace(/___/g," · ").replace(/_/g," ")}</div>
                    <div className="recent-time">
                      {new Date(r.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                  <span className={`badge ${Number(r.confidence)>80?"badge-green":Number(r.confidence)>55?"badge-amber":"badge-red"}`}>
                    {Number(r.confidence).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {/* 7-day chart */}
          <div className="card">
            <div className="card-title">7-day scan activity</div>
            <div className="col-chart">
              {dayCounts.map((count,i) => (
                <div className="col" key={i}>
                  <div className="col-val">{count||""}</div>
                  <div className="col-bar" style={{height:`${(count/maxDay)*88}px`,minHeight:4,animationDelay:`${i*.07}s`}}/>
                  <div className="col-lbl">{["Su","Mo","Tu","We","Th","Fr","Sa"][new Date(new Date().setDate(new Date().getDate()-(6-i))).getDay()]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Disease distribution */}
          {topList.length > 0 && (
            <div className="card">
              <div className="card-title">{t("disease_dist")}</div>
              <div className="chart-bar-wrap">
                {topList.map(([name,count],i) => (
                  <div className="chart-bar-row" key={name}>
                    <div className="chart-bar-label">{name.replace(/___/g,"·").replace(/_/g," ")}</div>
                    <div className="chart-bar-track">
                      <div className="chart-bar-fill" style={{width:`${(count/maxCount)*100}%`,background:COLORS[i%COLORS.length],animationDelay:`${i*.1}s`}}/>
                    </div>
                    <div className="chart-bar-count">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location + Seasonal tip */}
          <div className="card card-sm">
            <div className="card-title">📍 {t("tab_analytics_location")}</div>
            <LocationIntelligence compact={true}/>
          </div>

          <div className="card" style={{background:"var(--amber-bg)",borderColor:"rgba(245,166,35,.18)"}}>
            <div className="card-title" style={{color:"var(--amber-text)"}}>{t("seasonal_tip")}</div>
            <div style={{fontSize:12.5,color:"var(--text1)",lineHeight:1.65}}>{t("tip_text")}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop:16 }}>
        <OfflineQueuePanel isOffline={isOffline}/>
      </div>
    </div>
  );
}

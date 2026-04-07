// src/components/LocationIntelligence.jsx
// Location Intelligence — auto-detect location, weather-risk correlation (Phase 2, #2)

import { useState, useEffect } from "react";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Disease risk rules based on weather conditions
const RISK_RULES = [
  { condition: w => w.humidity >= 85 && w.temp > 15 && w.temp < 30,
    diseases: ["Late Blight","Early Blight","Septoria Leaf Spot"],
    level:"high", message:"Very high fungal risk — humidity above 85% with warm temperatures create ideal conditions for blight and mould.", icon:"🔴" },
  { condition: w => w.humidity >= 70 && w.humidity < 85,
    diseases: ["Powdery Mildew","Leaf Mold","Gray Leaf Spot"],
    level:"medium", message:"Moderate fungal risk — current humidity favours powdery mildew and leaf mould development.", icon:"🟡" },
  { condition: w => w.windspeed > 25,
    diseases: ["Rust","Septoria","Anthracnose"],
    level:"medium", message:"Elevated spore dispersal risk — high wind speeds can carry rust and blight spores across fields.", icon:"💨" },
  { condition: w => w.temp > 28 && w.humidity < 50,
    diseases: ["Spider Mites","Target Spot"],
    level:"medium", message:"Hot dry conditions favour spider mite outbreaks. Check leaf undersides carefully.", icon:"🌡" },
  { condition: w => w.humidity < 50,
    diseases: [],
    level:"low", message:"Low humidity reduces fungal risk. Monitor for pest activity instead.", icon:"🟢" },
];

function getRisk(weather) {
  for (const rule of RISK_RULES) {
    if (rule.condition(weather)) return rule;
  }
  return { level:"low", message:"Current conditions present low disease risk. Continue regular monitoring.", icon:"🟢", diseases:[] };
}

const RISK_COLORS = { high:"var(--red)", medium:"var(--amber)", low:"var(--green)" };
const RISK_BG     = { high:"var(--red-bg)", medium:"var(--amber-bg)", low:"var(--green-glow)" };
const RISK_BORDER = { high:"rgba(240,82,82,.2)", medium:"rgba(245,166,35,.2)", low:"var(--green-dim)" };

export default function LocationIntelligence({ compact = false }) {
  const [location,  setLocation]  = useState(null); // { lat, lon, name }
  const [weather,   setWeather]   = useState(null);
  const [risk,      setRisk]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [manual,    setManual]    = useState("");
  const [showManual,setShowManual]= useState(false);

  // Mekelle default coords
  const DEFAULT = { lat:13.4967, lon:39.4753, name:"Mekelle, Tigray" };

  useEffect(() => {
    const saved = localStorage.getItem("cg_location");
    if (saved) {
      setLocation(JSON.parse(saved));
    } else {
      fetchWeather(DEFAULT);
    }
  }, []);

  useEffect(() => {
    if (location) fetchWeather(location);
  }, [location]);

  async function fetchWeather(loc) {
    setLoading(true); setError(null);
    try {
      const url = `${WEATHER_API}?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weathercode&timezone=auto`;
      const res  = await fetch(url);
      const data = await res.json();
      const cur  = data.current;
      const w = {
        temp:      cur.temperature_2m,
        humidity:  cur.relative_humidity_2m,
        windspeed: cur.wind_speed_10m,
        precip:    cur.precipitation,
        code:      cur.weathercode,
      };
      setWeather(w);
      setRisk(getRisk(w));
    } catch {
      setError("Could not fetch weather data.");
    }
    setLoading(false);
  }

  function detectLocation() {
    setLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, name: "Your location" };
        setLocation(loc);
        localStorage.setItem("cg_location", JSON.stringify(loc));
      },
      () => { setError("Location access denied. Using Mekelle default."); fetchWeather(DEFAULT); setLoading(false); }
    );
  }

  function setManualLocation() {
    // Simple lookup for Tigray cities
    const CITIES = {
      mekelle:  { lat:13.4967, lon:39.4753, name:"Mekelle, Tigray" },
      axum:     { lat:14.1215, lon:38.7183, name:"Axum, Tigray"    },
      adwa:     { lat:14.1697, lon:38.9000, name:"Adwa, Tigray"    },
      adigrat:  { lat:14.2773, lon:39.4587, name:"Adigrat, Tigray" },
      wukro:    { lat:13.7833, lon:39.6000, name:"Wukro, Tigray"   },
      addis:    { lat:9.0300,  lon:38.7400, name:"Addis Ababa"     },
    };
    const key = manual.toLowerCase().trim().split(" ")[0];
    const city = CITIES[key] || DEFAULT;
    setLocation(city);
    localStorage.setItem("cg_location", JSON.stringify(city));
    setShowManual(false); setManual("");
  }

  if (compact && risk) {
    return (
      <div style={{
        display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
        background: RISK_BG[risk.level], border:`1px solid ${RISK_BORDER[risk.level]}`,
        borderRadius:10, cursor:"pointer",
      }} onClick={() => setShowManual(p => !p)}>
        <span style={{ fontSize:16 }}>{risk.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11.5, fontWeight:700, color:RISK_COLORS[risk.level] }}>
            {risk.level.charAt(0).toUpperCase()+risk.level.slice(1)} disease risk
          </div>
          <div style={{ fontSize:10.5, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {location?.name || DEFAULT.name} · {weather ? `${weather.humidity}% humidity` : "loading..."}
          </div>
        </div>
        <span style={{ fontSize:11, color:"var(--text3)" }}>📍</span>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Location selector */}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"9px 13px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10 }}>
          <span style={{ fontSize:14 }}>📍</span>
          <span style={{ fontSize:13, color:"var(--text1)", fontWeight:500 }}>
            {location?.name || DEFAULT.name}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={detectLocation} disabled={loading}>
          {loading ? "⏳" : "🎯 Auto-detect"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowManual(p=>!p)}>
          Change
        </button>
      </div>

      {showManual && (
        <div style={{ display:"flex", gap:8 }}>
          <input className="form-input" placeholder="e.g. Axum, Adigrat, Adwa, Wukro…" value={manual}
            onChange={e=>setManual(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setManualLocation()}
            style={{ flex:1 }}/>
          <button className="btn btn-primary btn-sm" onClick={setManualLocation}>Set</button>
        </div>
      )}

      {error && <div style={{ fontSize:12, color:"var(--red)" }}>{error}</div>}

      {/* Weather conditions */}
      {weather && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[
            { icon:"💧", label:"Humidity",    val:`${weather.humidity}%`,              color: weather.humidity>80?"var(--red)":weather.humidity>60?"var(--amber)":"var(--green)" },
            { icon:"🌡", label:"Temperature", val:`${Math.round(weather.temp)}°C`,    color:"var(--blue)" },
            { icon:"💨", label:"Wind",        val:`${Math.round(weather.windspeed)} km/h`, color:"var(--text2)" },
            { icon:"🌧", label:"Rainfall",    val:`${weather.precip} mm`,              color: weather.precip>5?"var(--amber)":"var(--text2)" },
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:"10px", textAlign:"center" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:"var(--fh)", fontSize:16, fontWeight:800, color }}>{val}</div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Risk assessment */}
      {risk && (
        <div style={{
          padding:"14px 16px", borderRadius:12,
          background: RISK_BG[risk.level], border:`1px solid ${RISK_BORDER[risk.level]}`,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:18 }}>{risk.icon}</span>
            <div style={{ fontFamily:"var(--fh)", fontSize:14, fontWeight:700, color:RISK_COLORS[risk.level] }}>
              {risk.level.charAt(0).toUpperCase()+risk.level.slice(1)} Disease Risk
            </div>
          </div>
          <div style={{ fontSize:13, color:"var(--text1)", lineHeight:1.65, marginBottom:8 }}>{risk.message}</div>
          {risk.diseases.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              <span style={{ fontSize:11, color:"var(--text3)" }}>Watch for:</span>
              {risk.diseases.map(d => (
                <span key={d} className="badge badge-red" style={{ fontSize:10 }}>{d}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weather-risk correlation tips */}
      {weather && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text3)", letterSpacing:".08em", textTransform:"uppercase" }}>
            Weather-Risk Correlations
          </div>
          {[
            { check: weather.humidity > 80, icon:"💧", text:`Humidity ${weather.humidity}% → Fungal disease risk is elevated`, color:"var(--red)" },
            { check: weather.humidity > 60 && weather.humidity <= 80, icon:"💧", text:`Humidity ${weather.humidity}% → Moderate fungal risk, monitor closely`, color:"var(--amber)" },
            { check: weather.temp > 25 && weather.humidity < 55, icon:"🌡", text:`Hot & dry conditions → Spider mite and pest pressure elevated`, color:"var(--amber)" },
            { check: weather.precip > 2, icon:"🌧", text:`Recent rainfall → Increases late blight and bacterial disease risk`, color:"var(--amber)" },
            { check: weather.windspeed > 20, icon:"💨", text:`High winds → Spores dispersing, widen your scouting area`, color:"var(--blue)" },
          ].filter(c => c.check).slice(0,3).map((tip, i) => (
            <div key={i} style={{ display:"flex", gap:8, padding:"8px 11px", background:"var(--bg2)", borderRadius:8, border:"1px solid var(--border)", fontSize:12, color:"var(--text2)", alignItems:"flex-start" }}>
              <span style={{ flexShrink:0 }}>{tip.icon}</span>
              <span style={{ lineHeight:1.55 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

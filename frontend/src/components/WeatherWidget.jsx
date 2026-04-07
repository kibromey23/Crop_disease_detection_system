// src/components/WeatherWidget.jsx
import { useState, useEffect } from "react";
const CODES = {0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Foggy",51:"Drizzle",53:"Drizzle",61:"Rain",63:"Rain",65:"Heavy rain",80:"Showers",95:"Thunderstorm"};
const ICONS = {0:"☀️",1:"🌤",2:"⛅",3:"☁️",45:"🌫",51:"🌦",53:"🌧",61:"🌧",63:"🌧",65:"⛈",80:"🌦",95:"⛈"};
export default function WeatherWidget({ t }) {
  const [w, setW] = useState(null);
  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=13.4967&longitude=39.4753&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=Africa%2FAddis_Ababa")
      .then(r=>r.json()).then(d=>setW(d.current)).catch(()=>{});
  },[]);
  if (!w) return null;
  return (
    <div className="weather-card">
      <div style={{fontSize:9.5,fontWeight:700,letterSpacing:".09em",color:"var(--text3)",textTransform:"uppercase",marginBottom:7}}>{t("weather_label")}</div>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <span style={{fontSize:20}}>{ICONS[w.weathercode]||"🌡"}</span>
        <div>
          <div style={{fontFamily:"var(--font-head)",fontSize:17,fontWeight:800,color:"var(--text1)",lineHeight:1}}>{Math.round(w.temperature_2m)}°C</div>
          <div style={{fontSize:10.5,color:"var(--text3)",marginTop:2}}>{CODES[w.weathercode]||"—"}</div>
          <div style={{fontSize:10,color:"var(--text3)",marginTop:1}}>💧{w.relative_humidity_2m}% · 💨{Math.round(w.wind_speed_10m)}km/h</div>
        </div>
      </div>
    </div>
  );
}

// src/components/Toast.jsx
import { useState, useCallback, createContext, useContext } from "react";
const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type="success", ms=3000) => {
    const id = Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), ms);
  },[]);
  const C = {
    success:{bg:"var(--green-glow2)",brd:"var(--green-dim)",clr:"var(--green)"},
    error:  {bg:"var(--red-bg)",    brd:"rgba(240,82,82,.3)", clr:"var(--red)"},
    info:   {bg:"var(--blue-bg)",   brd:"rgba(96,165,250,.3)",clr:"var(--blue)"},
    warning:{bg:"var(--amber-bg)",  brd:"rgba(245,166,35,.3)",clr:"var(--amber)"},
  };
  const IC = {success:"✓",error:"✕",info:"ℹ",warning:"⚠"};
  return (
    <Ctx.Provider value={show}>
      {children}
      <div style={{position:"fixed",bottom:20,right:20,display:"flex",flexDirection:"column",gap:8,zIndex:9999}}>
        {toasts.map(({id,msg,type})=>{
          const c=C[type]||C.success;
          return (
            <div key={id} style={{
              display:"flex",alignItems:"center",gap:10,padding:"11px 16px",
              background:c.bg,border:`1px solid ${c.brd}`,borderRadius:"var(--radius)",
              color:"var(--text1)",fontSize:13,fontFamily:"var(--font-body)",
              animation:"toastIn .25s ease",minWidth:210,
              boxShadow:"0 4px 20px rgba(0,0,0,.4)",
            }}>
              <span style={{color:c.clr,fontWeight:700,fontSize:15}}>{IC[type]}</span>{msg}
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

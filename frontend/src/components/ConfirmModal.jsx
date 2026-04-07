// src/components/ConfirmModal.jsx
// Beautiful in-app confirm dialog — replaces window.confirm() everywhere

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  danger       = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:800,
      background:"rgba(0,0,0,.55)", backdropFilter:"blur(3px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20, animation:"fadeIn .15s ease",
    }} onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"var(--bg1)", border:"1px solid var(--border)",
          borderRadius:18, padding:"26px 28px", width:"100%", maxWidth:360,
          boxShadow:"0 20px 60px rgba(0,0,0,.5)",
          animation:"slideUp .2s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Icon */}
        <div style={{
          width:46, height:46, borderRadius:12,
          background: danger ? "var(--red-bg)" : "var(--green-glow2)",
          border:`1px solid ${danger ? "rgba(240,82,82,.22)" : "var(--green-dim)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:20, margin:"0 0 16px",
        }}>
          {danger ? "⚠" : "?"}
        </div>

        {/* Text */}
        <div style={{
          fontFamily:"var(--fh)", fontSize:16, fontWeight:700,
          color:"var(--text1)", marginBottom:8,
        }}>
          {title}
        </div>
        {message && (
          <div style={{
            fontSize:13.5, color:"var(--text2)", lineHeight:1.65, marginBottom:22,
          }}>
            {message}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", gap:9 }}>
          <button
            onClick={onCancel}
            style={{
              flex:1, padding:"10px", borderRadius:10, border:"1px solid var(--border)",
              background:"var(--bg2)", color:"var(--text2)", cursor:"pointer",
              fontFamily:"var(--fb)", fontSize:13.5, fontWeight:600,
              transition:"all var(--ease)",
            }}
            onMouseEnter={e=>{e.currentTarget.style.background="var(--bg3)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="var(--bg2)";}}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex:1, padding:"10px", borderRadius:10, border:"none",
              background: danger ? "var(--red-text)" : "var(--green)",
              color: danger ? "#fff" : "var(--text-on-green)",
              cursor:"pointer", fontFamily:"var(--fb)", fontSize:13.5, fontWeight:700,
              transition:"all var(--ease)",
            }}
            onMouseEnter={e=>{e.currentTarget.style.opacity=".88";}}
            onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px) scale(.97); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
    </div>
  );
}

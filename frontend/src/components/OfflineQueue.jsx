// src/components/OfflineQueue.jsx
// Offline scan queue with retry when back online (#7)
// Also exports useOfflineQueue hook used by DetectPage

import { useState, useEffect, useCallback } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Hook ─────────────────────────────────────────────────────
export function useOfflineQueue() {
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cg_offline_queue") || "[]"); } catch { return []; }
  });

  const save = useCallback((q) => {
    setQueue(q);
    localStorage.setItem("cg_offline_queue", JSON.stringify(q));
  }, []);

  // Queue a scan for later
  const enqueue = useCallback((file, meta = {}) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const item = {
          id:        Date.now(),
          dataUrl:   reader.result,
          fileName:  file.name,
          fileSize:  file.size,
          queuedAt:  new Date().toISOString(),
          status:    "pending", // pending | uploading | done | failed
          meta,
        };
        const newQ = [...JSON.parse(localStorage.getItem("cg_offline_queue")||"[]"), item];
        localStorage.setItem("cg_offline_queue", JSON.stringify(newQ));
        setQueue(newQ);
        resolve(item);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Retry all pending items
  const retryAll = useCallback(async (onResult) => {
    const q = JSON.parse(localStorage.getItem("cg_offline_queue") || "[]");
    const pending = q.filter(item => item.status === "pending" || item.status === "failed");
    for (const item of pending) {
      // Mark uploading
      const updated = q.map(i => i.id === item.id ? { ...i, status:"uploading" } : i);
      save(updated);
      try {
        const res  = await fetch(item.dataUrl);
        const blob = await res.blob();
        const fd   = new FormData();
        fd.append("image", blob, item.fileName);
        const apiRes  = await fetch(`${API}/api/predict`, { method:"POST", body:fd });
        const data    = await apiRes.json();
        if (!apiRes.ok) throw new Error(data.error);
        const done = q.map(i => i.id === item.id ? { ...i, status:"done", result:data } : i);
        save(done);
        onResult?.(data);
      } catch {
        const failed = q.map(i => i.id === item.id ? { ...i, status:"failed" } : i);
        save(failed);
      }
    }
  }, [save]);

  const remove = useCallback((id) => {
    const q = JSON.parse(localStorage.getItem("cg_offline_queue") || "[]").filter(i => i.id !== id);
    save(q);
  }, [save]);

  const clearDone = useCallback(() => {
    const q = JSON.parse(localStorage.getItem("cg_offline_queue") || "[]").filter(i => i.status !== "done");
    save(q);
  }, [save]);

  // Auto-retry when back online
  useEffect(() => {
    const handler = () => {
      const q = JSON.parse(localStorage.getItem("cg_offline_queue") || "[]");
      if (q.some(i => i.status === "pending" || i.status === "failed")) {
        retryAll();
      }
    };
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, [retryAll]);

  return { queue, enqueue, retryAll, remove, clearDone };
}

// ── UI Panel ─────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:   { color:"var(--amber)", bg:"var(--amber-bg)", label:"⏳ Queued"    },
  uploading: { color:"var(--blue)",  bg:"var(--blue-bg)",  label:"📡 Sending…"  },
  done:      { color:"var(--green)", bg:"var(--green-glow)",label:"✅ Uploaded"  },
  failed:    { color:"var(--red)",   bg:"var(--red-bg)",   label:"❌ Failed"     },
};

export default function OfflineQueuePanel({ isOffline }) {
  const { queue, retryAll, remove, clearDone } = useOfflineQueue();
  const pending = queue.filter(i => i.status === "pending" || i.status === "failed").length;
  const done    = queue.filter(i => i.status === "done").length;

  if (queue.length === 0) return null;

  return (
    <div style={{
      padding:"14px 16px", background:"var(--bg2)", border:"1px solid var(--border)",
      borderRadius:14, display:"flex", flexDirection:"column", gap:12,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"var(--fh)", fontSize:13, fontWeight:700, color:"var(--text1)", display:"flex", alignItems:"center", gap:8 }}>
          📴 Offline scan queue
          <span style={{ fontSize:10, fontWeight:700, background:isOffline?"var(--red)":"var(--green)", color:"#fff", padding:"2px 7px", borderRadius:10 }}>
            {pending} pending
          </span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {done > 0 && <button className="btn btn-ghost btn-sm" onClick={clearDone}>Clear done</button>}
          {!isOffline && pending > 0 && (
            <button className="btn btn-primary btn-sm" onClick={()=>retryAll()}>↑ Sync now</button>
          )}
        </div>
      </div>

      {/* Sync status bar */}
      {!isOffline && pending > 0 && (
        <div style={{ padding:"8px 12px", background:"var(--green-glow)", border:"1px solid var(--green-dim)", borderRadius:9, fontSize:12, color:"var(--green)" }}>
          📡 You're back online — {pending} scan(s) ready to sync
        </div>
      )}

      {/* Queue items */}
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {queue.map(item => {
          const s = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
          return (
            <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"var(--bg3)", borderRadius:9, border:"1px solid var(--border)" }}>
              {item.dataUrl && (
                <img src={item.dataUrl} alt="" style={{ width:36, height:36, borderRadius:6, objectFit:"cover", flexShrink:0 }}/>
              )}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:"var(--text1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {item.fileName || "Scan image"}
                </div>
                <div style={{ fontSize:11, color:"var(--text3)" }}>
                  Queued {new Date(item.queuedAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:s.color, background:s.bg, padding:"3px 9px", borderRadius:20, flexShrink:0 }}>
                {s.label}
              </span>
              {(item.status === "done" || item.status === "failed") && (
                <button onClick={() => remove(item.id)} style={{ fontSize:13, color:"var(--text3)", background:"none", border:"none", cursor:"pointer", padding:"2px 4px" }}>✕</button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize:11, color:"var(--text3)", lineHeight:1.5 }}>
        💾 Scans are stored on your device and will automatically sync when internet is restored.
      </div>
    </div>
  );
}

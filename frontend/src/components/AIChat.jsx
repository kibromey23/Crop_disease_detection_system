// src/components/AIChat.jsx — CropGuard AI Assistant
// Full multilingual agricultural advisor with structured responses

import { useState, useRef, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Language detection from user input ────────────────────────────────────
// Detects script to auto-select language for the API hint.
// The model always overrides based on actual message content.
function detectLanguage(text) {
  // Ethiopic script covers both Amharic and Tigrinya
  const ethiopic = /[\u1200-\u137F]/;
  if (ethiopic.test(text)) {
    // Tigrinya-specific characters (rough heuristic)
    const tigrinya = /[ሃኃሄሕሆሇለሉሊላሌልሎሏ]/;
    return tigrinya.test(text) ? "ti" : "am";
  }
  return "en";
}

// ── Suggested starter questions ───────────────────────────────────────────
const SUGGESTIONS = {
  en: [
    "My maize leaves are turning yellow",
    "How do I treat tomato late blight?",
    "What fertilizer is best for teff?",
    "My wheat has rust spots",
  ],
  am: [
    "የበቆሎ ቅጠሌ ይቀላሉ",
    "የቲማቲም የዘገየ ቅርፊት በሽታ እንዴት ይታከማል?",
    "ለጤፍ የሚሻለው ማዳበሪያ ምንድነው?",
    "ስንዴዬ ዝገት አለበት",
  ],
  ti: [
    "ናይ ሽምብራ ቅጠሉ ቢጫ ይኸውን ኣሎ",
    "ናይ ቲማቲም ሕማም ብኸመይ ይፍወስ?",
    "ንጤፍ ዝሓሸ ፍሩቅ ኣየናይ እዩ?",
    "ሕርሻ ናይ ስርናይ ዝምቡዕ ኣለዎ",
  ],
};

// ── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  // Render assistant messages with basic formatting
  function renderContent(text) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Emoji section headers (🔍 Problem, ✅ Solutions, etc.)
      if (/^[🔍🌱✅🛡️⚠️💡]/.test(line)) {
        return (
          <div key={i} style={{ fontWeight: 700, color: "var(--green)",
            marginTop: i > 0 ? 10 : 0, marginBottom: 3, fontSize: 13 }}>
            {line}
          </div>
        );
      }
      // Numbered or bulleted list items
      if (/^[\d]+\.|^[-•]/.test(line.trim())) {
        return (
          <div key={i} style={{ paddingLeft: 14, marginBottom: 2,
            fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
            {line}
          </div>
        );
      }
      // Empty line → small gap
      if (!line.trim()) return <div key={i} style={{ height: 4 }}/>;
      // Normal text
      return (
        <div key={i} style={{ fontSize: 13, color: "var(--text1)",
          lineHeight: 1.55, marginBottom: 1 }}>
          {line}
        </div>
      );
    });
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
      alignItems: "flex-end",
      gap: 7,
    }}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--green)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, flexShrink: 0, marginBottom: 2,
        }}>
          🌿
        </div>
      )}

      <div style={{
        maxWidth: "82%",
        padding: isUser ? "9px 13px" : "11px 14px",
        borderRadius: 14,
        borderBottomRightRadius: isUser ? 3 : 14,
        borderBottomLeftRadius:  isUser ? 14 : 3,
        background:   isUser ? "var(--green)"  : "var(--bg2)",
        border:       isUser ? "none"           : "1px solid var(--border)",
      }}>
        {isUser
          ? <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{msg.content}</div>
          : renderContent(msg.content)
        }
        {/* Timestamp */}
        <div style={{ fontSize: 10, color: isUser ? "rgba(255,255,255,.55)" : "var(--text3)",
          textAlign: "right", marginTop: 5 }}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 7, marginBottom: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
        🌿
      </div>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 14, borderBottomLeftRadius: 3, padding: "11px 16px",
        display: "flex", gap: 5, alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: "var(--green)",
            animation: "pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── Main AIChat component ─────────────────────────────────────────────────
export default function AIChat({ t, onClose, settings }) {
  const lang      = settings?.language || "en";
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const [messages, setMessages] = useState([{
    role:    "assistant",
    content: lang === "am"
      ? "ሰላም! እኔ ሴጅ ነኝ፣ የ CropGuard AI የእርሻ አማካሪ። በሰብል በሽታዎች፣ ተባዮች፣ ማዳበሪያ እና ስለ እርሻ ጥያቄ ቢኖርዎ እዚህ ነኝ። ምን ልርዳዎ?"
      : lang === "ti"
      ? "ሰላም! ኣነ ሴጅ እየ፣ ናይ CropGuard AI ናይ ሕርሻ ምኽሪ ሃቢ። ብዛዕባ ሕማም ሕርሻ፣ ኣባ ጎሮ፣ ፍሩቅ ወይ ካሊእ ሕቶ ኣለካ? ሓግዘካ ኢየ።"
      : "Hello! I'm Sage, your CropGuard AI agricultural assistant. I can help with crop diseases, pests, soil health, fertilizers, irrigation, and farming best practices. What can I help you with today?",
    ts: Date.now(),
  }]);

  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    setShowSugg(false);
    setMessages(m => [...m, { role: "user", content: msg, ts: Date.now() }]);
    setLoading(true);

    // Detect language from actual typed text — override settings hint
    const detectedLang = detectLanguage(msg);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message:  msg,
          language: detectedLang,
          history:  messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data  = await res.json();
      const reply = res.ok
        ? (data.reply || "I could not generate a response. Please try again.")
        : (data.error || "Connection error. Please try again.");

      setMessages(m => [...m, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch {
      setMessages(m => [...m, {
        role: "assistant",
        content: "Connection error. Please check your internet and try again.",
        ts: Date.now(),
      }]);
    }
    setLoading(false);
  }, [input, loading, messages]);

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function clearChat() {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. How can I help you?",
      ts: Date.now(),
    }]);
    setShowSugg(true);
  }

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.en;

  return (
    <>
      {/* Pulse animation for typing dots */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: .3; transform: scale(.8); }
          40%            { opacity: 1;  transform: scale(1);  }
        }
      `}</style>

      <div style={{
        position: "fixed", bottom: 24, right: 24,
        width: "min(380px, calc(100vw - 32px))",
        height: "min(560px, calc(100vh - 80px))",
        background: "var(--bg1)", border: "1px solid var(--border)",
        borderRadius: 20, display: "flex", flexDirection: "column",
        zIndex: 500, boxShadow: "0 12px 48px rgba(0,0,0,.22)",
        overflow: "hidden",
      }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{
          padding: "13px 16px", background: "var(--green)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,.2)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              🌿
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
                CropGuard AI Assistant
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", marginTop: 1 }}>
                {loading ? "Thinking…" : "Online · EN / AM / TI"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={clearChat} title="Clear chat"
              style={{ background: "rgba(255,255,255,.15)", border: "none",
                color: "#fff", cursor: "pointer", borderRadius: 8,
                padding: "5px 9px", fontSize: 12, fontWeight: 600 }}>
              Clear
            </button>
            <button onClick={onClose} aria-label="Close"
              style={{ background: "rgba(255,255,255,.15)", border: "none",
                color: "#fff", cursor: "pointer", borderRadius: 8,
                padding: "5px 9px", fontSize: 16, lineHeight: 1 }}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "14px 12px",
          display: "flex", flexDirection: "column",
        }}>
          {messages.map((m, i) => <MessageBubble key={i} msg={m}/>)}
          {loading && <TypingIndicator/>}

          {/* Suggested questions */}
          {showSugg && messages.length <= 1 && !loading && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8,
                textAlign: "center", fontWeight: 600, textTransform: "uppercase",
                letterSpacing: ".05em" }}>
                {lang === "am" ? "ጥያቄ ሀሳቦች" : lang === "ti" ? "ሕቶታት" : "Try asking"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    style={{
                      background: "var(--bg2)", border: "1px solid var(--border)",
                      borderRadius: 10, padding: "8px 12px", fontSize: 12.5,
                      color: "var(--text2)", cursor: "pointer", textAlign: "left",
                      transition: "all .15s ease",
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = "var(--green)"; e.target.style.color = "var(--green)"; }}
                    onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text2)"; }}>
                    💬 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>

        {/* ── Input ────────────────────────────────────────────────────── */}
        <div style={{
          padding: "10px 12px", borderTop: "1px solid var(--border)",
          background: "var(--bg2)", flexShrink: 0,
        }}>
          {/* Language hint */}
          <div style={{ fontSize: 10.5, color: "var(--text3)", marginBottom: 6,
            textAlign: "center" }}>
            {lang === "am"
              ? "በአማርኛ፣ ትግርኛ ወይም እንግሊዝኛ ይጻፉ"
              : lang === "ti"
              ? "ብትግርኛ፣ አማርኛ ወይ እንግሊዘኛ ጽሓፍ"
              : "Type in English, Amharic (አማርኛ), or Tigrinya (ትግርኛ)"}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={
                lang === "am" ? "ጥያቄዎን ይጻፉ…"
                : lang === "ti" ? "ሕቶኻ ጽሓፍ…"
                : "Describe your crop problem…"
              }
              rows={1}
              style={{
                flex: 1, resize: "none", background: "var(--bg1)",
                border: "1px solid var(--border)", borderRadius: 12,
                padding: "9px 12px", color: "var(--text1)", fontSize: 13,
                outline: "none", lineHeight: 1.5, fontFamily: "var(--fb)",
                maxHeight: 80, overflowY: "auto",
              }}
              onInput={e => {
                // Auto-expand textarea
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: input.trim() && !loading ? "var(--green)" : "var(--border)",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                color: "#fff", fontSize: 16, display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "background .15s ease",
              }}>
              ↑
            </button>
          </div>

          <div style={{ fontSize: 10, color: "var(--text3)", textAlign: "center", marginTop: 6 }}>
            {lang === "am"
              ? "Enter ለመላክ · AI ሁልጊዜ ትክክል አይሆንም — ጥርጣሬ ካለ ባለሙያ ያማክሩ"
              : lang === "ti"
              ? "Enter ን ሰደድ · AI ኩሉ ጊዜ ቅኑዕ ኣይኮነን — ምስ ሙኩር ክትዘራረብ"
              : "Enter to send · AI may make mistakes — consult an expert for critical decisions"}
          </div>
        </div>
      </div>
    </>
  );
}

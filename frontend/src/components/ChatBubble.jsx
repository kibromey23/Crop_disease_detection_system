// src/components/ChatBubble.jsx
// Proactive AI assistant bubble — always visible, shows "Hey! Need help?" tooltip
// Eagerly imported in App.jsx (tiny file, no lazy loading needed)

import { useState, useEffect } from "react";

const BUBBLE_TEXT = {
  en: "Hey! Need help? 🌿",
  am: "ሰላም! ልረዳዎ? 🌿",
  ti: "ሰላም! ክሕግዘካ? 🌿",
};

const SUB_TEXT = {
  en: "Ask me about crop diseases",
  am: "ስለ ሰብል በሽታ ይጠይቁኝ",
  ti: "ብዛዕባ ሕማም ሕርሻ ሕተተኒ",
};

const LABEL_TEXT = {
  en: "Need help?",
  am: "ልረዳዎ?",
  ti: "ክሕግዘካ?",
};

export default function ChatBubble({ onClick, lang = "en", hasBeenOpened = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const text  = BUBBLE_TEXT[lang] || BUBBLE_TEXT.en;
  const sub   = SUB_TEXT[lang]    || SUB_TEXT.en;
  const label = LABEL_TEXT[lang]  || LABEL_TEXT.en;

  // Show proactive tooltip 4 seconds after mount — only if never opened
  useEffect(() => {
    if (hasBeenOpened) return;
    const t = setTimeout(() => setShowTooltip(true), 4000);
    return () => clearTimeout(t);
  }, [hasBeenOpened]);

  // Auto-dismiss tooltip after 8 seconds
  useEffect(() => {
    if (!showTooltip) return;
    const t = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(t);
  }, [showTooltip]);

  return (
    <>
      <style>{`
        @keyframes breathe {
          0%,100% { transform: scale(1);    opacity: .45; }
          50%      { transform: scale(1.18); opacity: .15; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px) scale(.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        @keyframes pulse-dot {
          0%,100% { transform: scale(1);   opacity: 1;  }
          50%      { transform: scale(1.4); opacity: .6; }
        }
        @keyframes wiggle {
          0%,100% { transform: rotate(0deg);   }
          20%      { transform: rotate(-12deg); }
          40%      { transform: rotate(12deg);  }
          60%      { transform: rotate(-8deg);  }
          80%      { transform: rotate(8deg);   }
        }
        @keyframes labelPop {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0);   }
        }
        .chat-pill:hover {
          box-shadow: 0 8px 32px rgba(22,163,74,.65) !important;
          transform: translateY(-2px) !important;
        }
        .chat-pill {
          transition: transform .2s ease, box-shadow .2s ease;
        }
      `}</style>

      <div style={{
        position:      "fixed",
        bottom:        24,
        right:         24,
        zIndex:        599,
        display:       "flex",
        flexDirection: "column",
        alignItems:    "flex-end",
        gap:           10,
      }}>

        {/* ── Tooltip bubble (auto-shows after 4s) ───────────────── */}
        {showTooltip && (
          <div
            onClick={onClick}
            style={{
              background:    "var(--bg1)",
              border:        "1.5px solid var(--green-dim)",
              borderRadius:  "16px 16px 4px 16px",
              padding:       "12px 16px 12px 20px",
              boxShadow:     "0 8px 32px rgba(22,163,74,.18), 0 2px 8px rgba(0,0,0,.10)",
              cursor:        "pointer",
              animation:     "fadeUp .35s cubic-bezier(.34,1.56,.64,1)",
              display:       "flex",
              flexDirection: "column",
              gap:           4,
              minWidth:      200,
              position:      "relative",
            }}>

            {/* Green left accent bar */}
            <div style={{
              position:     "absolute",
              left:         0,
              top:          12,
              bottom:       12,
              width:        3,
              borderRadius: "0 3px 3px 0",
              background:   "var(--green)",
            }}/>

            {/* Header row */}
            <div style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              gap:            10,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{
                  width:        8,
                  height:       8,
                  borderRadius: "50%",
                  background:   "var(--green)",
                  display:      "inline-block",
                  flexShrink:   0,
                  animation:    "pulse-dot 1.5s ease infinite",
                }}/>
                <span style={{
                  fontSize:   13.5,
                  fontWeight: 700,
                  color:      "var(--text1)",
                  lineHeight: 1.3,
                }}>
                  {text}
                </span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setShowTooltip(false); }}
                style={{
                  background:     "var(--bg2)",
                  border:         "1px solid var(--border)",
                  borderRadius:   "50%",
                  width:          20,
                  height:         20,
                  cursor:         "pointer",
                  fontSize:       10,
                  color:          "var(--text3)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  lineHeight:     1,
                }}>
                ✕
              </button>
            </div>

            {/* Subtitle */}
            <div style={{ fontSize:11.5, color:"var(--text3)", lineHeight:1.4 }}>
              {sub}
            </div>

            {/* Tail */}
            <div style={{
              position:   "absolute",
              bottom:     -8,
              right:      26,
              width:      14,
              height:     14,
              background: "var(--bg1)",
              border:     "1.5px solid var(--green-dim)",
              borderTop:  "none",
              borderLeft: "none",
              transform:  "rotate(45deg)",
            }}/>
          </div>
        )}

        {/* ── Pill button with icon + "Need help?" text ──────────── */}
        <button
          onClick={() => { onClick(); setShowTooltip(false); }}
          aria-label="Open AI assistant"
          className="chat-pill"
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            10,
            paddingLeft:    6,
            paddingRight:   18,
            height:         52,
            borderRadius:   100,
            background:     "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            border:         "2px solid rgba(255,255,255,.18)",
            cursor:         "pointer",
            boxShadow:      "0 4px 20px rgba(22,163,74,.45)",
            position:       "relative",
            animation:      showTooltip ? "wiggle 1.6s ease 1" : "none",
          }}>

          {/* Icon circle */}
          <div style={{
            width:          40,
            height:         40,
            borderRadius:   "50%",
            background:     "rgba(255,255,255,.18)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       22,
            flexShrink:     0,
          }}>
            🌿
          </div>

          {/* "Need help?" label */}
          <span style={{
            fontSize:       13.5,
            fontWeight:     700,
            color:          "#fff",
            whiteSpace:     "nowrap",
            letterSpacing:  ".01em",
            animation:      "labelPop .4s ease",
          }}>
            {label}
          </span>

          {/* Breathing attention ring — until first open */}
          {!hasBeenOpened && (
            <span style={{
              position:      "absolute",
              inset:         -6,
              borderRadius:  100,
              border:        "2px solid var(--green)",
              opacity:       .4,
              animation:     "breathe 2.2s ease-in-out infinite",
              pointerEvents: "none",
            }}/>
          )}

          {/* Red unread dot — until first open */}
          {!hasBeenOpened && (
            <span style={{
              position:     "absolute",
              top:          2,
              right:        2,
              width:        11,
              height:       11,
              borderRadius: "50%",
              background:   "#ef4444",
              border:       "2px solid var(--bg0)",
              animation:    "pulse-dot 2s ease infinite",
            }}/>
          )}
        </button>
      </div>
    </>
  );
}

/**
 * routes/chat.js — CropGuard AI — Sage AI assistant
 * Using Groq API (free tier) — https://console.groq.com
 *
 * POST /api/chat
 */

const express = require("express");

const router = express.Router();

const LANG_NAMES = { en: "English", am: "Amharic (አማርኛ)", ti: "Tigrinya (ትግርኛ)" };

function buildSystemPrompt(lang) {
  return `You are CropGuard AI Assistant (also called Sage), an intelligent agricultural advisor for CropGuard AI — a plant disease detection platform for farmers in Tigray, Ethiopia and surrounding regions.

LANGUAGE RULES:
1. Detect the language of the user's message automatically.
2. ALWAYS respond in the SAME language the user wrote.
3. If the user mixes languages, respond in the dominant language.
4. If unclear, respond in simple English.
The user's current app language is: ${LANG_NAMES[lang] || "English"} — use only as fallback.

YOUR ROLE:
- Help farmers diagnose and treat crop diseases and pest problems
- Provide evidence-based, practical treatment recommendations
- Explain disease causes, symptoms, and prevention
- Give guidance on soil health, fertilizers, irrigation, and farming practices
- Ask clarifying questions when information is incomplete

UNDERSTANDING USERS:
Interpret intent even if grammar is incorrect or sentences are partial.
- "my maize leaves turning yellow" → diagnose nutrient deficiency or disease
- "የበቆሎ ቅጠል ይቀላል" → Amharic — respond in Amharic
- "ሽንብራ ሕማም እንታይ እዩ?" → Tigrinya — respond in Tigrinya
If key information is missing, ask: Which crop? What symptoms? When did it start? How many plants?

RESPONSE STRUCTURE (for disease/pest problems):
1. Problem Understanding
2. Possible Causes (2-4 most likely)
3. Recommended Solutions (step-by-step)
4. Prevention Tips

For general questions answer directly without forcing this structure.
Keep responses under 150 words unless detail is specifically needed.

COVERED CROPS:
Teff, Wheat, Barley, Maize, Sorghum, Chickpea, Lentil, Tomato, Potato,
Onion, Pepper, Cabbage, Garlic, Apple, Blueberry, Cherry, Grape, Orange,
Peach, Bell Pepper, Raspberry, Soybean, Squash, Strawberry, Mango, Coffee

SAFETY RULES:
- Prefer organic solutions first
- Only recommend chemicals safe and legal in Ethiopia
- Always mention protective equipment (gloves, mask) for pesticides
- NEVER recommend DDT, Endosulfan, or Parathion
- If unsure, recommend the local agricultural extension officer (ጣቢያ ግብርና)
Safe chemicals: Mancozeb, Chlorothalonil, Copper hydroxide, Neem oil, Pyrethrin, Azoxystrobin

TONE: Clear, supportive, practical. Culturally aware for Tigray/Ethiopia.
Do NOT discuss topics unrelated to agriculture.`;
}

router.post("/", async (req, res) => {
  const { message, language = "en", history = [] } = req.body;

  if (!message || typeof message !== "string" || message.length > 1000) {
    return res.status(400).json({ error: "Invalid message." });
  }

  const messages = [
    ...history.slice(-6).map((m) => ({
      role:    m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 500),
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        max_tokens:  600,
        temperature: 0.4,
        messages: [
          { role: "system", content: buildSystemPrompt(language) },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("[chat] Groq error:", response.status, err.error?.message);
      return res.status(503).json({ error: "AI assistant is temporarily unavailable." });
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content
      || "I could not generate a response. Please try again.";

    return res.json({ reply });

  } catch (err) {
    console.error("[chat] fetch error:", err.message);
    return res.status(503).json({ error: "AI assistant is temporarily unavailable." });
  }
});

module.exports = router;

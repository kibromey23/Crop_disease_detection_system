/**
 * src/i18n/index.ts — Single i18n system for CropGuard AI
 *
 * i18n CONSOLIDATION FIX:
 *   Previously the app had two parallel translation systems:
 *     1. react-i18next (this file) — used by landing pages (Home, About, SignIn)
 *     2. Custom useT() hook from src/i18n.js — used by app shell pages (AppShell, DetectPage, etc.)
 *
 *   Both are now unified into react-i18next. All flat app keys from the old
 *   i18n.js are merged into en.json / am.json / ti.json. AppShell and all
 *   child pages now use useTranslation() from react-i18next directly.
 *   The old src/i18n.js is kept as a no-op stub for backward compatibility
 *   but should not be imported anywhere.
 *
 * JSON STRUCTURE FIX:
 *   The JSON files wrap all content under a "frontend" key (plus "components", "ml", etc.).
 *   Components call t("home.hero.badge"), t("loading"), t("nav_dashboard") etc. — not
 *   t("frontend.home.hero.badge"). This loader flattens the structure so every t() call
 *   resolves correctly:
 *     - Each frontend sub-section (home, nav, auth, ...) is kept as a named sub-key
 *       so that t("home.hero.badge") and t("nav.home") work.
 *     - All flat keys from every frontend sub-section are also hoisted to root so that
 *       bare keys like t("loading"), t("nav_dashboard"), t("offline_banner") work.
 *     - "components" and "ml" are preserved as namespaced sub-keys.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import am from "./am.json";
import ti from "./ti.json";

type JsonObj = Record<string, unknown>;

/**
 * Flatten a locale JSON file into the shape that all t() calls expect.
 *
 * Input shape:  { _meta, frontend: { app, nav, home, ... }, components, ml }
 * Output shape: {
 *   // every frontend sub-section kept as a named key (home, nav, app, auth, ...)
 *   home: { hero: { badge: "..." }, ... },
 *   nav:  { home: "Home", nav_dashboard: "Dashboard", ... },
 *   app:  { loading: "Loading…", ... },
 *   // flat keys from ALL frontend sub-sections hoisted to root
 *   loading: "Loading…",
 *   nav_dashboard: "Dashboard",
 *   offline_banner: "Offline mode…",
 *   // components and ml kept namespaced
 *   components: { aiChat: { ... }, ... },
 *   ml: { ... },
 * }
 */
function prepareTranslation(raw: JsonObj): JsonObj {
  const frontend = (raw.frontend as JsonObj) || {};
  const result: JsonObj = {};

  // 1. Keep each frontend sub-section as a named key (enables t("home.hero.badge"), t("nav.home"))
  for (const [sectionKey, sectionVal] of Object.entries(frontend)) {
    result[sectionKey] = sectionVal;
  }

  // 2. Hoist flat keys from every frontend sub-section to root
  //    (enables t("loading"), t("nav_dashboard"), t("offline_banner"), etc.)
  //    Earlier sections win on collision so "app" keys take priority.
  const SECTION_ORDER = [
    "app", "nav", "detect", "settings", "dashboard", "history",
    "farm", "bookmarks", "analytics", "pricing", "about",
    "contact", "notifications", "user", "footer", "treatment_labels",
    "auth", "home", "encyclopedia", "resultcard", "community",
  ];
  for (const section of SECTION_ORDER) {
    const data = frontend[section] as JsonObj | undefined;
    if (!data || typeof data !== "object") continue;
    for (const [k, v] of Object.entries(data)) {
      if (!(k in result)) result[k] = v;
    }
  }

  // 3. Add components and ml as namespaced sub-keys
  if (raw.components) result["components"] = raw.components;
  if (raw.ml)         result["ml"]         = raw.ml;

  return result;
}

// Restore last-used language from localStorage (set by AppShell when user changes language in Settings)
const savedLang = (() => {
  try { return localStorage.getItem("cropguard_lang") || "en"; }
  catch { return "en"; }
})();

const SUPPORTED = ["en", "am", "ti"];
const initialLang = SUPPORTED.includes(savedLang) ? savedLang : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: prepareTranslation(en as unknown as JsonObj) },
      am: { translation: prepareTranslation(am as unknown as JsonObj) },
      ti: { translation: prepareTranslation(ti as unknown as JsonObj) },
    },
    lng:         initialLang,
    fallbackLng: "en",
    interpolation: {
      // react already escapes by default
      escapeValue: false,
    },
    // Allow flat keys (e.g. t("nav_dashboard")) AND nested keys (e.g. t("nav.home"))
    // to coexist in the same namespace
    keySeparator:    ".",
    nsSeparator:     "::",
    returnNull:      false,
    returnEmptyString: false,
  });

export default i18n;

/**
 * src/i18n.js — DEPRECATED STUB
 *
 * This file previously contained a custom flat translation dictionary and a
 * useT() hook used by AppShell and all app-shell child pages.
 *
 * i18n CONSOLIDATION FIX (audit report §3.1):
 *   All flat translation keys from this file have been merged into the
 *   react-i18next JSON files at src/i18n/en.json, am.json, and ti.json.
 *   AppShell now uses useTranslation() from react-i18next directly.
 *   This file is intentionally left as a no-op stub so that any stale import
 *   causes a clear error instead of silently serving wrong translations.
 *
 * DO NOT IMPORT THIS FILE. Use react-i18next instead:
 *   import { useTranslation } from "react-i18next";
 *   const { t } = useTranslation();
 */

export const translations = {};

export function useT(_settings) {
  console.error(
    "[CropGuard] useT() from src/i18n.js is deprecated. " +
    "Use useTranslation() from react-i18next instead."
  );
  return (key) => key;
}

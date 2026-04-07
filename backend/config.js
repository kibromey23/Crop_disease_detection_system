/**
 * config.js — Shared constants
 * Single source of truth. Import everywhere instead of redefining.
 */
module.exports = {
  FREE_DAILY_LIMIT:  5,
  MAX_FILE_SIZE_MB:  10,
  MAX_FILE_SIZE:     10 * 1024 * 1024,
  SUPPORTED_LANGS:   ["en", "am", "ti"],
  PLANS:             ["free", "premium", "enterprise"],
};

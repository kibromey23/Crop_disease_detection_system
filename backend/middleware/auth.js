/**
 * middleware/auth.js
 *
 * Verifies the JWT access token on every protected request.
 * Attaches req.user = { id, email, name, plan } on success.
 *
 * Usage:
 *   const { requireAuth, optionalAuth } = require("../middleware/auth");
 *   router.get("/protected", requireAuth, handler);
 */

const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "cropguard_dev_secret_change_in_production";

/**
 * requireAuth — blocks the request if no valid token
 */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please sign in again.", expired: true });
    }
    return res.status(401).json({ error: "Invalid token. Please sign in again." });
  }
}

/**
 * optionalAuth — attaches user if token present, continues either way
 * Used for public endpoints that behave differently when logged in
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch {}
  }
  next();
}

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, plan: user.plan },
    SECRET,
    { expiresIn: "24h" }   // 24h — frontend auto-refreshes anyway
  );
}

function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId, type: "refresh" },
    SECRET,
    { expiresIn: "30d" }   // 30-day persistent session
  );
}

module.exports = { requireAuth, optionalAuth, signAccessToken, signRefreshToken };

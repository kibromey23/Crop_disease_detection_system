/**
 * routes/auth.js — Full authentication flow
 *
 * POST /api/auth/register     — create account
 * POST /api/auth/login        — sign in, get tokens
 * POST /api/auth/refresh      — exchange refresh token → new access token
 * POST /api/auth/logout       — revoke refresh token (this device)
 * POST /api/auth/logout-all   — revoke all refresh tokens (all devices)
 * GET  /api/auth/me           — get current user profile + plan
 * PUT  /api/auth/me           — update name, institution, language
 * POST /api/auth/upgrade      — upgrade plan (stub — wire to payment gateway)
 * POST /api/auth/downgrade    — downgrade to free
 */

const express  = require("express");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");
const { pool } = require("../db");
const { requireAuth, signAccessToken, signRefreshToken } = require("../middleware/auth");

const router = express.Router();

// ── Simple input validation ────────────────────────────────────────────
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const val = req.body?.[field];
      if (rules.required && (val === undefined || val === null || val === "")) {
        errors.push(`${field} is required.`);
        continue;
      }
      if (val !== undefined && val !== null && val !== "") {
        if (rules.type === "string" && typeof val !== "string")
          errors.push(`${field} must be a string.`);
        if (rules.maxLength && String(val).length > rules.maxLength)
          errors.push(`${field} must be ${rules.maxLength} characters or fewer.`);
        if (rules.minLength && String(val).length < rules.minLength)
          errors.push(`${field} must be at least ${rules.minLength} characters.`);
        if (rules.enum && !rules.enum.includes(val))
          errors.push(`${field} must be one of: ${rules.enum.join(", ")}.`);
        if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
          errors.push(`${field} must be a valid email address.`);
      }
    }
    if (errors.length) return res.status(400).json({ error: errors[0] });
    next();
  };
}

const { FREE_DAILY_LIMIT, SUPPORTED_LANGS, PLANS } = require("../config");

// ── Helper: hash a refresh token for storage ───────────────
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ── Helper: safe user object (never expose password) ───────
function safeUser(row) {
  return {
    id:          row.id,
    name:        row.name,
    email:       row.email,
    institution: row.institution,
    language:    row.language,
    plan:        row.plan,
    plan_expires_at: row.plan_expires_at,
    scans_today: row.scans_today,
    scans_date:  row.scans_date,
    created_at:  row.created_at,
  };
}

// ── POST /api/auth/register ────────────────────────────────
router.post("/register",
  validateBody({
    name:        { required:true,  type:"string", minLength:1,  maxLength:100  },
    email:       { required:true,  type:"string", email:true,   maxLength:254  },
    password:    { required:true,  type:"string", minLength:8,  maxLength:128  },
    institution: { required:false, type:"string", maxLength:200               },
    language:    { required:false, type:"string", enum:["en","am","ti"]       },
  }),
  async (req, res) => {
  const { name, email, password, institution, language } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, institution, language)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        (name || "Researcher").trim(),
        email.toLowerCase().trim(),
        hash,
        (institution || "Mekelle Institute of Technology").trim(),
        language || "en",
      ]
    );
    const user = rows[0];

    // Issue tokens immediately after register
    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id);
    const expires      = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, hashToken(refreshToken), req.headers["user-agent"] || "unknown", expires]
    );

    console.log(`[auth] ✓ Registered user id=${user.id} email="${user.email}"`);
    res.status(201).json({ user: safeUser(user), accessToken, refreshToken });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    console.error("[auth/register]", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/login ───────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "No account found with this email." });
    }
    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Reset quota if new day
    await pool.query(
      `UPDATE users SET scans_today=0, scans_date=CURRENT_DATE
       WHERE id=$1 AND scans_date < CURRENT_DATE`,
      [user.id]
    );

    const accessToken  = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id);
    const expires      = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, hashToken(refreshToken), req.headers["user-agent"] || "unknown", expires]
    );

    console.log(`[auth] ✓ Login user id=${user.id} email="${user.email}"`);
    res.json({ user: safeUser(user), accessToken, refreshToken });

  } catch (err) {
    console.error("[auth/login]", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── POST /api/auth/refresh ─────────────────────────────────
// Client sends its refresh token → gets a new short-lived access token
// This is how login persists across devices and browser restarts
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token required." });
  }

  const jwt = require("jsonwebtoken");
  const SECRET = process.env.JWT_SECRET || "cropguard_dev_secret_change_in_production";

  try {
    const payload = jwt.verify(refreshToken, SECRET);
    if (payload.type !== "refresh") throw new Error("Wrong token type");

    const hash = hashToken(refreshToken);
    const { rows } = await pool.query(
      `SELECT rt.*, u.* FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [hash]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Session expired or revoked. Please sign in again." });
    }

    const user        = rows[0];
    const accessToken = signAccessToken(user);
    const newRefresh  = signRefreshToken(user.id);
    const expires     = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Rotate refresh token (invalidate old, issue new)
    await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [hash]);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, device_info, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, hashToken(newRefresh), req.headers["user-agent"] || "unknown", expires]
    );

    res.json({ user: safeUser(user), accessToken, refreshToken: newRefresh });

  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await pool.query(
      "DELETE FROM refresh_tokens WHERE token_hash = $1",
      [hashToken(refreshToken)]
    ).catch(() => {});
  }
  res.json({ success: true });
});

// ── POST /api/auth/logout-all ──────────────────────────────
// Signs out all devices for this user
router.post("/logout-all", requireAuth, async (req, res) => {
  await pool.query(
    "DELETE FROM refresh_tokens WHERE user_id = $1",
    [req.user.id]
  );
  res.json({ success: true, message: "Signed out from all devices." });
});

// ── GET /api/auth/me ───────────────────────────────────────
router.get("/me", requireAuth, async (req, res) => {
  try {
    // Reset quota if new day
    await pool.query(
      `UPDATE users SET scans_today=0, scans_date=CURRENT_DATE
       WHERE id=$1 AND scans_date < CURRENT_DATE`,
      [req.user.id]
    );

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found." });

    const user      = rows[0];
    const isPremium = user.plan !== "free";
    res.json({
      ...safeUser(user),
      scans_remaining: isPremium ? null : Math.max(0, FREE_DAILY_LIMIT - user.scans_today),
      daily_limit:     isPremium ? null : FREE_DAILY_LIMIT,
      is_premium:      isPremium,
    });
  } catch (err) {
    console.error("[auth/me]", err.message);
    res.status(500).json({ error: "Could not load profile." });
  }
});

// ── PUT /api/auth/me ───────────────────────────────────────
router.put("/me", requireAuth,
  validateBody({
    name:        { required:false, type:"string", minLength:1,  maxLength:100  },
    institution: { required:false, type:"string", maxLength:200               },
    language:    { required:false, type:"string", enum:["en","am","ti"]       },
  }),
  async (req, res) => {
  const { name, institution, language } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET name=$1, institution=$2, language=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name || "Researcher", institution || "", language || "en", req.user.id]
    );
    res.json(safeUser(rows[0]));
  } catch (err) {
    console.error("[auth/put-me]", err.message);
    res.status(500).json({ error: "Could not update profile." });
  }
});

// ── POST /api/auth/upgrade ─────────────────────────────────
// In production: verify payment from Stripe/PayPal webhook then call this
// For demo: calling this directly upgrades the user immediately
router.post("/upgrade", requireAuth, async (req, res) => {
  const { plan = "premium", payment_reference } = req.body;
  const VALID = ["premium", "enterprise"];
  if (!VALID.includes(plan)) {
    return res.status(400).json({ error: "Invalid plan. Must be: premium or enterprise" });
  }

  // In production: verify payment_reference with your payment gateway here

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1-year subscription

  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET plan=$1, plan_expires_at=$2, updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [plan, expiresAt, req.user.id]
    );
    const user        = rows[0];
    const accessToken = signAccessToken(user); // Re-issue with new plan in token

    console.log(`[auth] ✓ Upgraded user id=${user.id} → ${plan}`);
    res.json({
      user:        safeUser(user),
      accessToken,
      message:     `Successfully upgraded to ${plan}. Enjoy!`,
    });
  } catch (err) {
    console.error("[auth/upgrade]", err.message);
    res.status(500).json({ error: "Upgrade failed." });
  }
});

// ── POST /api/auth/downgrade ───────────────────────────────
router.post("/downgrade", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET plan='free', plan_expires_at=NULL, updated_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.user.id]
    );
    const user        = rows[0];
    const accessToken = signAccessToken(user);
    res.json({ user: safeUser(user), accessToken });
  } catch (err) {
    res.status(500).json({ error: "Downgrade failed." });
  }
});

// ── GET /api/auth/sessions ─────────────────────────────────
// Shows all active login sessions (for "sign out other devices")
router.get("/sessions", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, device_info, created_at, expires_at
     FROM refresh_tokens
     WHERE user_id=$1 AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});


module.exports = router;

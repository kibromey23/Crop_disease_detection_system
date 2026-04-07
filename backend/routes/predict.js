/**
 * routes/predict.js
 * POST /api/predict
 *
 * Requires authentication.
 * Enforces daily scan quota for free plan users (5/day).
 * Saves prediction to database linked to user_id.
 */

const express   = require("express");
const multer    = require("multer");
const axios     = require("axios");
const FormData  = require("form-data");
const path      = require("path");
const fs        = require("fs");
const { pool, resetQuotaIfNewDay } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const { FREE_DAILY_LIMIT } = require("../config");
const AI_SERVER        = process.env.AI_SERVER_URL || "http://localhost:8000";
const COMPRESS         = process.env.IMAGE_COMPRESS !== "false";
const MAX_W            = Number(process.env.IMAGE_MAX_WIDTH) || 800;
const QUALITY          = Number(process.env.IMAGE_QUALITY)   || 85;

// Upload directory
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer — memory storage (compress before saving)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg","image/jpg","image/png","image/webp"].includes(file.mimetype))
      cb(null, true);
    else
      cb(new Error("Only JPG, PNG and WebP images are allowed."), false);
  },
});

// Save + optionally compress image
async function saveImage(buffer, originalName) {
  const ext      = path.extname(originalName).toLowerCase() || ".jpg";
  const base     = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
  const finalExt = COMPRESS ? ".jpg" : ext;
  const filename = `${base}${finalExt}`;
  const filepath = path.join(uploadDir, filename);

  if (COMPRESS) {
    try {
      const sharp = require("sharp");
      await sharp(buffer)
        .resize({ width: MAX_W, withoutEnlargement: true })
        .jpeg({ quality: QUALITY })
        .toFile(filepath);
    } catch {
      // sharp not available — save raw
      fs.writeFileSync(filepath, buffer);
    }
  } else {
    fs.writeFileSync(filepath, buffer);
  }
  return filename;
}

// POST /api/predict — protected
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided." });
  }

  const userId = req.user.id;
  let savedFilename = null;

  try {
    // 1. Atomic quota check + increment in a single UPDATE
    //    Prevents race conditions from concurrent requests
    const { rows: quotaRows } = await pool.query(`
      UPDATE users
      SET
        scans_today = CASE
          WHEN scans_date < CURRENT_DATE THEN 1       -- new day: reset to 1
          ELSE scans_today + 1                        -- same day: increment
        END,
        scans_date = CURRENT_DATE
      WHERE id = $1
        AND (
          plan != 'free'                              -- premium: always allow
          OR scans_date < CURRENT_DATE                -- new day: always allow first scan
          OR scans_today < $2                         -- free: within daily limit
        )
      RETURNING scans_today, plan
    `, [userId, FREE_DAILY_LIMIT]);

    if (!quotaRows.length) {
      // UPDATE matched no rows = quota exceeded OR user not found
      const { rows: checkRows } = await pool.query("SELECT id FROM users WHERE id=$1", [userId]);
      if (!checkRows.length) return res.status(401).json({ error: "User not found." });
      return res.status(429).json({
        error:           `Daily scan limit reached (${FREE_DAILY_LIMIT}/day on Free plan).`,
        limit_reached:   true,
        daily_limit:     FREE_DAILY_LIMIT,
        upgrade_message: "Upgrade to Premium for unlimited scans.",
      });
    }

    const { scans_today, plan } = quotaRows[0];
    const isPremium = plan !== "free";

    // 3. Save image
    savedFilename = await saveImage(req.file.buffer, req.file.originalname);
    const savedPath = path.join(uploadDir, savedFilename);

    // 4. Forward to Python AI server
    const form = new FormData();
    form.append("file", fs.createReadStream(savedPath), {
      filename:    savedFilename,
      contentType: "image/jpeg",
    });

    const aiRes = await axios.post(`${AI_SERVER}/predict`, form, {
      headers:        form.getHeaders(),
      timeout:        60_000,
      maxBodyLength:  Infinity,
    });

    const { disease, confidence_pct, recommendation, top3 } = aiRes.data;
    if (!disease || confidence_pct === undefined) {
      throw new Error("Invalid response from AI model server.");
    }

    // 5. Save to DB — linked to this user
    const { rows } = await pool.query(
      `INSERT INTO predictions
         (user_id, image_filename, disease, confidence, recommendation, top3)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, created_at`,
      [userId, savedFilename, disease, confidence_pct, recommendation, JSON.stringify(top3||[])]
    );

    const record = rows[0];
    console.log(`[predict] ✓ user=${userId} id=${record.id} disease="${disease}" conf=${confidence_pct}%`);

    return res.status(200).json({
      id:             record.id,
      image_url:      `/uploads/${savedFilename}`,
      disease,
      confidence_pct: Number(confidence_pct),
      recommendation,
      top3:           top3 || [],
      created_at:     record.created_at,
      // Let frontend know remaining quota
      scans_today:    scans_today + 1,
      scans_remaining: isPremium ? null : Math.max(0, FREE_DAILY_LIMIT - scans_today - 1),
    });

  } catch (err) {
    // Log the FULL error so we can debug from the backend terminal
    console.error("[predict] ✗ Error:", err.message);
    if (err.response) {
      console.error("[predict]   AI server status:", err.response.status);
      console.error("[predict]   AI server body:",   JSON.stringify(err.response.data));
    }
    if (err.code) console.error("[predict]   Error code:", err.code);

    // Clean up saved file on failure
    if (savedFilename) {
      const fp = path.join(uploadDir, savedFilename);
      if (fs.existsSync(fp)) fs.unlink(fp, ()=>{});
    }

    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({
        error: "AI model server is offline. Start it with: uvicorn serve:app --port 8000",
      });
    }
    if (err.response?.status === 400) {
      return res.status(400).json({
        error: err.response.data?.detail || "Image could not be processed.",
      });
    }
    if (err.response?.status === 500) {
      return res.status(500).json({
        error: err.response.data?.detail || "AI model error. Check uvicorn terminal.",
      });
    }
    return res.status(500).json({ error: err.message || "Prediction failed. Please try again." });
  }
});

module.exports = router;

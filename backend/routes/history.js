/**
 * routes/history.js — Per-user scan history
 *
 * All queries are scoped to req.user.id so each user
 * sees only their own scans, on any device.
 *
 * GET    /api/history          — list (filters, sort, pagination)
 * GET    /api/history/stats    — aggregated stats for dashboard
 * GET    /api/history/:id      — single scan
 * DELETE /api/history/:id      — delete one
 * DELETE /api/history          — bulk delete (body: {ids:[1,2,3]})
 */

const express  = require("express");
const path     = require("path");
const fs       = require("fs");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router    = express.Router();
const uploadDir = path.join(__dirname, "../uploads");

function withUrl(row) {
  return { ...row, image_url: `/uploads/${row.image_filename}` };
}
function delFile(filename) {
  if (!filename) return;
  const fp = path.join(uploadDir, filename);
  // Direct unlink — handle ENOENT instead of existsSync check (avoids TOCTOU race)
  fs.unlink(fp, err => {
    if (err && err.code !== "ENOENT") console.warn("[history] Could not delete:", filename, err.code);
  });
}

// GET /api/history/stats
router.get("/stats", requireAuth, async (req, res) => {
  const uid = req.user.id;
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                                     AS total,
        COUNT(*) FILTER (WHERE disease NOT ILIKE '%healthy%')        AS diseased,
        COUNT(*) FILTER (WHERE disease     ILIKE '%healthy%')        AS healthy,
        ROUND(AVG(confidence),1)                                     AS avg_confidence,
        COUNT(*) FILTER (WHERE confidence >= 85)                     AS high_conf,
        COUNT(*) FILTER (WHERE confidence <  60)                     AS low_conf,
        MAX(created_at)                                              AS last_scan_at
      FROM predictions WHERE user_id=$1`, [uid]);

    const { rows: top } = await pool.query(`
      SELECT disease, COUNT(*) AS count FROM predictions
      WHERE user_id=$1 AND disease NOT ILIKE '%healthy%'
      GROUP BY disease ORDER BY count DESC LIMIT 5`, [uid]);

    const { rows: monthly } = await pool.query(`
      SELECT TO_CHAR(DATE_TRUNC('month',created_at),'YYYY-MM') AS month,
             COUNT(*) AS count
      FROM predictions
      WHERE user_id=$1 AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY month ASC`, [uid]);

    const s = rows[0];
    res.json({
      total:          Number(s.total),
      diseased:       Number(s.diseased),
      healthy:        Number(s.healthy),
      avg_confidence: Number(s.avg_confidence||0),
      high_conf:      Number(s.high_conf),
      low_conf:       Number(s.low_conf),
      last_scan_at:   s.last_scan_at,
      top_diseases:   top.map(r=>({disease:r.disease,count:Number(r.count)})),
      monthly:        monthly.map(r=>({month:r.month,count:Number(r.count)})),
    });
  } catch (err) {
    console.error("[history/stats]", err.message);
    res.status(500).json({ error: "Could not load stats." });
  }
});

// GET /api/history
router.get("/", requireAuth, async (req, res) => {
  const uid    = req.user.id;
  const limit  = Math.min(Number(req.query.limit)||100, 500);
  const offset = Number(req.query.offset)||0;
  const filter = req.query.filter || "all";
  const sort   = req.query.sort   || "newest";
  const search = req.query.search || "";

  const conds  = ["user_id=$1"];
  const params = [uid];
  let   p      = 2;

  if (search)              { conds.push(`disease ILIKE $${p}`); params.push(`%${search}%`); p++; }
  if (filter==="healthy")  { conds.push("disease ILIKE '%healthy%'"); }
  if (filter==="diseased") { conds.push("disease NOT ILIKE '%healthy%'"); }
  if (filter==="highconf") { conds.push("confidence >= 85"); }

  const WHERE = `WHERE ${conds.join(" AND ")}`;
  const ORDER = sort==="oldest" ? "created_at ASC"
              : sort==="conf"   ? "confidence DESC, created_at DESC"
              : "created_at DESC";

  params.push(limit, offset);
  try {
    const { rows } = await pool.query(
      `SELECT id, image_filename, disease, confidence, recommendation, top3, created_at
       FROM predictions ${WHERE} ORDER BY ${ORDER}
       LIMIT $${p} OFFSET $${p+1}`,
      params
    );
    res.json(rows.map(withUrl));
  } catch (err) {
    console.error("[history/list]", err.message);
    res.status(500).json({ error: "Could not load history." });
  }
});

// GET /api/history/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM predictions WHERE id=$1 AND user_id=$2",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Scan not found." });
    res.json(withUrl(rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Could not fetch scan." });
  }
});

// DELETE /api/history/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM predictions WHERE id=$1 AND user_id=$2 RETURNING image_filename",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Scan not found." });
    delFile(rows[0].image_filename);
    res.json({ deleted:true, id:Number(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: "Could not delete scan." });
  }
});

// DELETE /api/history (bulk)
router.delete("/", requireAuth, async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids)||!ids.length) {
    return res.status(400).json({ error: "Provide ids array in body." });
  }
  try {
    const ph = ids.map((_,i)=>`$${i+2}`).join(",");
    const { rows } = await pool.query(
      `DELETE FROM predictions WHERE user_id=$1 AND id IN (${ph}) RETURNING image_filename`,
      [req.user.id, ...ids]
    );
    rows.forEach(r => delFile(r.image_filename));
    res.json({ deleted:rows.length, ids });
  } catch (err) {
    res.status(500).json({ error: "Bulk delete failed." });
  }
});

module.exports = router;

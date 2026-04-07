/**
 * routes/feedback.js
 * POST /api/feedback  — save feedback (requires auth)
 * GET  /api/feedback  — list user's own feedback
 */
const express  = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const router   = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { scan_id, disease, rating, note, treatment_result } = req.body;
  if (!disease || !rating) return res.status(400).json({ error:"disease and rating required." });
  if (!["correct","wrong","unsure"].includes(rating)) return res.status(400).json({ error:"Invalid rating." });

  try {
    const { rows } = await pool.query(
      `INSERT INTO feedback (user_id,scan_id,disease,rating,note,treatment_result)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,created_at`,
      [req.user.id, scan_id||null, disease, rating, note||null, treatment_result||null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[feedback]", err.message);
    res.status(500).json({ error:"Could not save feedback." });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM feedback WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error:"Could not load feedback." });
  }
});

module.exports = router;

/**
 * db.js — PostgreSQL schema v3 with safe migrations
 * CropGuard AI — Mekelle Institute of Technology 2026
 *
 * Uses ALTER TABLE ... IF NOT EXISTS to safely upgrade
 * an existing database that was created by the old schema.
 */
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:        process.env.DATABASE_URL,
  max:                     10,
  idleTimeoutMillis:       30_000,
  connectionTimeoutMillis: 5_000,
});
pool.on("error", err => console.error("[db] Pool error:", err.message));

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── Users ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              SERIAL        PRIMARY KEY,
        name            TEXT          NOT NULL DEFAULT 'Researcher',
        email           TEXT          UNIQUE NOT NULL,
        password_hash   TEXT          NOT NULL,
        institution     TEXT          NOT NULL DEFAULT 'Mekelle Institute of Technology',
        language        TEXT          NOT NULL DEFAULT 'en',
        plan            TEXT          NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free','premium','enterprise')),
        plan_expires_at TIMESTAMPTZ,
        scans_today     INTEGER       NOT NULL DEFAULT 0,
        scans_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
        created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);

    // ── Refresh tokens ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id          SERIAL        PRIMARY KEY,
        user_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  TEXT          NOT NULL UNIQUE,
        device_info TEXT,
        expires_at  TIMESTAMPTZ   NOT NULL,
        created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rt_user  ON refresh_tokens(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rt_token ON refresh_tokens(token_hash);`);

    // ── Predictions — create fresh OR migrate existing ─────
    // First create the table if it doesn't exist at all
    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id              SERIAL        PRIMARY KEY,
        user_id         INTEGER       REFERENCES users(id) ON DELETE CASCADE,
        image_filename  TEXT          NOT NULL,
        disease         TEXT          NOT NULL,
        confidence      NUMERIC(6,2)  NOT NULL,
        recommendation  TEXT          NOT NULL,
        top3            JSONB         NOT NULL DEFAULT '[]',
        created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);

    // MIGRATION: add user_id column if it doesn't exist yet
    // (handles databases created by the old schema v1/v2)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='predictions' AND column_name='user_id'
        ) THEN
          ALTER TABLE predictions
            ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
          RAISE NOTICE 'Migration: added user_id column to predictions';
        END IF;
      END
      $$;
    `);

    // MIGRATION: add top3 column if missing (old schema had it as nullable)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='predictions' AND column_name='top3'
        ) THEN
          ALTER TABLE predictions ADD COLUMN top3 JSONB NOT NULL DEFAULT '[]';
          RAISE NOTICE 'Migration: added top3 column to predictions';
        END IF;
      END
      $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pred_user ON predictions(user_id, created_at DESC);
    `);

    // ── Feedback ───────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id               SERIAL        PRIMARY KEY,
        user_id          INTEGER       REFERENCES users(id) ON DELETE SET NULL,
        scan_id          INTEGER       REFERENCES predictions(id) ON DELETE SET NULL,
        disease          TEXT          NOT NULL,
        rating           TEXT          NOT NULL CHECK(rating IN ('correct','wrong','unsure')),
        note             TEXT,
        treatment_result TEXT          CHECK(treatment_result IN ('worked','partial','didnt')),
        created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );
    `);

    // MIGRATION: add user_id to feedback if missing
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='feedback' AND column_name='user_id'
        ) THEN
          ALTER TABLE feedback
            ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
          RAISE NOTICE 'Migration: added user_id column to feedback';
        END IF;
      END
      $$;
    `);

    await client.query("COMMIT");
    console.log("[db] Schema ready — tables: users, refresh_tokens, predictions, feedback");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[db] Schema init failed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

async function resetQuotaIfNewDay(userId) {
  await pool.query(`
    UPDATE users SET scans_today=0, scans_date=CURRENT_DATE
    WHERE id=$1 AND scans_date < CURRENT_DATE
  `, [userId]);
}

async function checkDB() {
  const { rows } = await pool.query("SELECT COUNT(*) AS total FROM predictions");
  return { connected: true, total_scans: Number(rows[0].total) };
}

module.exports = { pool, initDB, checkDB, resetQuotaIfNewDay };

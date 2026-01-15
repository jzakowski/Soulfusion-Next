// src/routes/chats.js
// Chat API - Anonymous Chat, Normal Chat, In-Call Chat
import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const r = express.Router();

/* ---------- Constants ---------- */
const REVEAL_MESSAGE_THRESHOLD = 15;
const CHAT_TYPES = ['anonymous', 'normal', 'incall'];
const MESSAGE_TYPES = ['text', 'system', 'reveal_request', 'reveal_accepted', 'reveal_declined'];

/* ---------- Helpers ---------- */
function generateAnonymousName() {
  const adjectives = ['Freche', 'Neugierige', 'Vertrauensvolle', 'Offene', 'Ehrliche', 'Warmherzige', 'Verspielte', 'Tiefgründige'];
  const nouns = ['Ente', 'Eule', 'Biene', 'Ameise', 'Spinne', 'Schmetterling', 'Libelle', 'Hummer'];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}_${number}`;
}

/* ========== ANONYMOUS CHAT ========== */

/* ---------- Meine anonymen Chats auflisten ---------- */
r.get("/anonymous/my", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { state, limit = 20, cursor } = req.query;

  const params = [userId];
  const conditions = ["(ac.user1_id = $1 OR ac.user2_id = $1)"];

  if (state) {
    params.push(state);
    conditions.push("ac.state = $" + params.length);
  }

  if (cursor) {
    params.push(cursor);
    conditions.push("ac.created_at < $" + params.length);
  }

  const sql = `
    SELECT
      ac.*,
      CASE
        WHEN ac.user1_id = $1 THEN ac.user2_anonymous_name
        ELSE ac.user1_anonymous_name
      END AS partner_anonymous_name,
      CASE
        WHEN ac.user1_id = $1 THEN up2.avatar_url
        ELSE up1.avatar_url
      END AS partner_avatar_url,
      CASE
        WHEN ac.user1_id = $1 THEN up2.display_name
        ELSE up1.display_name
      END AS partner_real_name,
      acm_last.content AS last_message,
      acm_last.created_at AS last_message_at,
      crs.last_read_at,
      (SELECT COUNT(*) FROM anonymous_chat_messages WHERE chat_id = ac.id AND created_at > COALESCE(crs.last_read_at, '1970-01-01'::timestamp)) AS unread_count
    FROM anonymous_chats ac
    LEFT JOIN user_profiles up1 ON up1.user_id = ac.user1_id
    LEFT JOIN user_profiles up2 ON up2.user_id = ac.user2_id
    LEFT JOIN LATERAL (
      SELECT content, created_at
      FROM anonymous_chat_messages
      WHERE chat_id = ac.id
      ORDER BY created_at DESC
      LIMIT 1
    ) acm_last ON true
    LEFT JOIN chat_read_states crs ON crs.chat_id = ac.id AND crs.user_id = $1
    WHERE ${conditions.join(" AND ")}
    ORDER BY ac.updated_at DESC
    LIMIT ${Math.min(+limit || 20, 100)}
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json({ items: rows });
  } catch (error) {
    console.error("[Chats] Error listing anonymous chats:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Anonymen Chat starten (oder existierenden holen) ---------- */
r.post("/anonymous/start", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { target_user_id } = req.body;

  if (!target_user_id) {
    return res.status(400).json({ error: "target_user_id_required" });
  }

  if (target_user_id === userId) {
    return res.status(400).json({ error: "cannot_chat_with_self" });
  }

  try {
    // Check ob bereits ein Chat existiert
    const existingSql = `
      SELECT * FROM anonymous_chats
      WHERE (user1_id = $1 AND user2_id = $2)
         OR (user1_id = $2 AND user2_id = $1)
    `;
    const existingResult = await pool.query(existingSql, [userId, target_user_id]);

    if (existingResult.rows.length > 0) {
      return res.json(existingResult.rows[0]);
    }

    // Neuen Chat erstellen
    const createSql = `
      INSERT INTO anonymous_chats (user1_id, user2_id, user1_anonymous_name, user2_anonymous_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const anonymousName1 = generateAnonymousName();
    const anonymousName2 = generateAnonymousName();

    const { rows } = await pool.query(createSql, [userId, target_user_id, anonymousName1, anonymousName2]);

    // Systemnachricht senden
    await pool.query(
      `INSERT INTO anonymous_chat_messages (chat_id, sender_id, content, message_type)
       VALUES ($1, $2, 'Chat gestartet', 'system')`,
      [rows[0].id, userId]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("[Chats] Error starting anonymous chat:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Chat Details holen ---------- */
r.get("/anonymous/:chatId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;

  try {
    const sql = `
      SELECT
        ac.*,
        CASE
          WHEN ac.user1_id = $2 THEN ac.user2_anonymous_name
          ELSE ac.user1_anonymous_name
        END AS partner_anonymous_name,
        CASE
          WHEN ac.user1_id = $2 THEN up2.avatar_url
          ELSE up1.avatar_url
        END AS partner_avatar_url,
        CASE
          WHEN ac.user1_id = $2 THEN ac.user2_id
          ELSE ac.user1_id
        END AS partner_id,
        CASE
          WHEN ac.user1_id = $2 THEN up2.display_name
          ELSE up1.display_name
        END AS partner_real_name,
        CASE
          WHEN ac.state = 'normal' THEN true
          ELSE false
        END AS is_revealed
      FROM anonymous_chats ac
      LEFT JOIN user_profiles up1 ON up1.user_id = ac.user1_id
      LEFT JOIN user_profiles up2 ON up2.user_id = ac.user2_id
      WHERE ac.id = $1 AND (ac.user1_id = $2 OR ac.user2_id = $2)
    `;

    const { rows } = await pool.query(sql, [chatId, userId]);

    if (!rows.length) {
      return res.status(404).json({ error: "chat_not_found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("[Chats] Error getting chat details:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Nachrichten holen ---------- */
r.get("/anonymous/:chatId/messages", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const { limit = 50, before } = req.query;

  try {
    // Check ob User berechtigt ist
    const chatCheck = await pool.query(
      "SELECT 1 FROM anonymous_chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
      [chatId, userId]
    );

    if (!chatCheck.rows.length) {
      return res.status(404).json({ error: "chat_not_found" });
    }

    const params = [chatId];
    let sql = `
      SELECT
        m.*,
        CASE
          WHEN m.sender_id = $2 THEN true
          ELSE false
        END AS is_own,
        CASE
          WHEN ac.user1_id = m.sender_id THEN ac.user1_anonymous_name
          ELSE ac.user2_anonymous_name
        END AS sender_anonymous_name,
        CASE
          WHEN ac.state = 'normal' AND m.sender_id = ac.user1_id THEN up1.display_name
          WHEN ac.state = 'normal' AND m.sender_id = ac.user2_id THEN up2.display_name
          ELSE NULL
        END AS sender_real_name,
        CASE
          WHEN ac.state = 'normal' AND m.sender_id = ac.user1_id THEN up1.avatar_url
          WHEN ac.state = 'normal' AND m.sender_id = ac.user2_id THEN up2.avatar_url
          ELSE NULL
        END AS sender_avatar_url
      FROM anonymous_chat_messages m
      JOIN anonymous_chats ac ON ac.id = m.chat_id
      LEFT JOIN user_profiles up1 ON up1.user_id = ac.user1_id
      LEFT JOIN user_profiles up2 ON up2.user_id = ac.user2_id
      WHERE m.chat_id = $1
    `;

    if (before) {
      params.push(before);
      sql += " AND m.created_at < $" + params.length;
    }

    sql += ` ORDER BY m.created_at DESC LIMIT ${Math.min(+limit || 50, 100)}`;

    const { rows } = await pool.query(sql, [chatId, userId, ...params.slice(1)]);
    res.json({ items: rows.reverse() });
  } catch (error) {
    console.error("[Chats] Error getting messages:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Nachricht senden ---------- */
r.post("/anonymous/:chatId/messages", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const { content, message_type = 'text' } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "content_required" });
  }

  if (!MESSAGE_TYPES.includes(message_type)) {
    return res.status(400).json({ error: "invalid_message_type" });
  }

  try {
    // Check Berechtigung und Chat-Status
    const chatCheck = await pool.query(
      "SELECT * FROM anonymous_chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
      [chatId, userId]
    );

    if (!chatCheck.rows.length) {
      return res.status(404).json({ error: "chat_not_found" });
    }

    const chat = chatCheck.rows[0];

    // Nachricht senden
    const insertSql = `
      INSERT INTO anonymous_chat_messages (chat_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(insertSql, [chatId, userId, content.trim(), message_type]);

    // Message count aktualisieren
    await pool.query(
      `UPDATE anonymous_chats
       SET message_count = message_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [chatId]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("[Chats] Error sending message:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Aufdecken anfragen ---------- */
r.post("/anonymous/:chatId/reveal", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;

  try {
    const chatCheck = await pool.query(
      "SELECT * FROM anonymous_chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
      [chatId, userId]
    );

    if (!chatCheck.rows.length) {
      return res.status(404).json({ error: "chat_not_found" });
    }

    const chat = chatCheck.rows[0];

    if (chat.state !== 'anonymous') {
      return res.status(400).json({ error: "chat_not_anonymous" });
    }

    if (chat.message_count < REVEAL_MESSAGE_THRESHOLD) {
      return res.status(400).json({
        error: "not_enough_messages",
        required: REVEAL_MESSAGE_THRESHOLD,
        current: chat.message_count
      });
    }

    // State update
    await pool.query(
      `UPDATE anonymous_chats
       SET state = 'reveal_pending',
           reveal_requested_by = $2,
           reveal_requested_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [chatId, userId]
    );

    // Systemnachricht senden
    await pool.query(
      `INSERT INTO anonymous_chat_messages (chat_id, sender_id, content, message_type)
       VALUES ($1, $2, 'möchte sich aufdecken', 'reveal_request')`,
      [chatId, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("[Chats] Error requesting reveal:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Aufdecken beantworten ---------- */
r.post("/anonymous/:chatId/reveal/respond", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const { accept } = req.body;

  try {
    const chatCheck = await pool.query(
      "SELECT * FROM anonymous_chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
      [chatId, userId]
    );

    if (!chatCheck.rows.length) {
      return res.status(404).json({ error: "chat_not_found" });
    }

    const chat = chatCheck.rows[0];

    if (chat.state !== 'reveal_pending') {
      return res.status(400).json({ error: "no_pending_reveal" });
    }

    // Prüfen ob User der Empfänger der Anfrage ist
    if (chat.reveal_requested_by === userId) {
      return res.status(400).json({ error: "cannot_respond_to_own_request" });
    }

    if (accept) {
      // Aufdecken akzeptieren
      await pool.query(
        `UPDATE anonymous_chats
         SET state = 'normal',
             revealed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [chatId]
      );

      // Systemnachricht
      await pool.query(
        `INSERT INTO anonymous_chat_messages (chat_id, sender_id, content, message_type)
         VALUES ($1, $2, 'Profil sichtbar!', 'reveal_accepted')`,
        [chatId, userId]
      );
    } else {
      // Ablehnen - zurück zu anonymous
      await pool.query(
        `UPDATE anonymous_chats
         SET state = 'anonymous',
             reveal_requested_by = NULL,
             reveal_requested_at = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [chatId]
      );

      // Systemnachricht
      await pool.query(
        `INSERT INTO anonymous_chat_messages (chat_id, sender_id, content, message_type)
         VALUES ($1, $2, 'Aufdecken abgelehnt', 'reveal_declined')`,
        [chatId, userId]
      );
    }

    res.json({ success: true, accepted: accept });
  } catch (error) {
    console.error("[Chats] Error responding to reveal:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Read State aktualisieren ---------- */
r.post("/anonymous/:chatId/read", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;

  try {
    const sql = `
      INSERT INTO chat_read_states (chat_id, user_id, last_read_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (chat_id, user_id)
      DO UPDATE SET last_read_at = NOW()
    `;

    await pool.query(sql, [chatId, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("[Chats] Error updating read state:", error);
    res.status(500).json({ error: "database_error" });
  }
});

/* ---------- Chat löschen ---------- */
r.delete("/anonymous/:chatId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM anonymous_chats WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) RETURNING id",
      [chatId, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "chat_not_found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[Chats] Error deleting chat:", error);
    res.status(500).json({ error: "database_error" });
  }
});

export default r;

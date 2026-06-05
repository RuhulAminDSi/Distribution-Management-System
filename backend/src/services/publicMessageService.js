import { query } from '../config/database.js';
import notificationService from './notificationService.js';
import crypto from 'crypto';

function generateToken() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

async function ensureUniqueToken() {
  let token;
  let exists = true;
  while (exists) {
    token = generateToken();
    const rows = await query('SELECT id FROM public_sessions WHERE token = $1', [token]);
    exists = rows.length > 0;
  }
  return token;
}

function rawSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    token: row.token,
    last_public_typing_at: row.last_public_typing_at,
    last_admin_typing_at: row.last_admin_typing_at,
    created_at: row.created_at,
  };
}

export const publicMessageService = {
  async startSession(name, phone) {
    const existing = await query('SELECT * FROM public_sessions WHERE phone = $1 AND is_active = 1', [phone]);
    if (existing.length > 0) {
      const session = existing[0];
      if (session.name !== name) {
        await query('UPDATE public_sessions SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [name, session.id]);
      }
      return { token: session.token, name, phone, created: false };
    }

    const token = await ensureUniqueToken();
    const result = await query(
      `INSERT INTO public_sessions (name, phone, token) VALUES ($1, $2, $3) RETURNING *`,
      [name, phone, token]
    );
    return { token: result[0].token, name, phone, created: true };
  },

  async setTypingPublic(token) {
    await query(
      `UPDATE public_sessions SET last_public_typing_at = CURRENT_TIMESTAMP WHERE token = $1 AND is_active = 1`,
      [token]
    );
  },

  async setTypingAdmin(phone) {
    await query(
      `UPDATE public_sessions SET last_admin_typing_at = CURRENT_TIMESTAMP WHERE phone = $1 AND is_active = 1`,
      [phone]
    );
  },

  async sendFromPublic(name, phone, message, token) {
    const sessions = await query('SELECT id FROM public_sessions WHERE token = $1 AND is_active = 1', [token]);
    if (sessions.length === 0) throw new Error('Invalid session token');

    const sessionId = sessions[0].id;
    const result = await query(
      `INSERT INTO public_messages (session_id, message, is_from_public) VALUES ($1, $2, 1) RETURNING id, message, is_from_public, created_at`,
      [sessionId, message]
    );

    const admins = await query(
      `SELECT id FROM users WHERE is_active = 1 AND role_id IN (SELECT id FROM roles WHERE name IN ('system_admin', 'admin', 'manager'))`
    );

    const notifications = admins.map(a => ({
      user_id: a.id,
      title: 'New Public Message',
      message: `${name} (${phone}) sent: ${message.substring(0, 100)}`,
      type: 'info',
      category: 'public_message',
      action_url: '/dashboard/messages',
    }));
    await notificationService.createBulkNotifications(notifications);

    return result[0];
  },

  async getSessionByPhone(phone) {
    const rows = await query(
      `SELECT * FROM public_sessions WHERE phone = $1 AND is_active = 1`,
      [phone]
    );
    return rawSession(rows[0] || null);
  },

  async getSessionByToken(token) {
    const rows = await query(
      `SELECT * FROM public_sessions WHERE token = $1 AND is_active = 1`,
      [token]
    );
    return rawSession(rows[0] || null);
  },

  async getMessagesBySession(sessionId) {
    await query(
      `UPDATE public_messages SET is_read = 1 WHERE session_id = $1 AND is_from_public = 1 AND is_read = 0`,
      [sessionId]
    );

    const rows = await query(
      `SELECT * FROM public_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId]
    );
    return rows;
  },

  async replyFromAdmin(phone, message, adminId) {
    const sessions = await query('SELECT id FROM public_sessions WHERE phone = $1 AND is_active = 1', [phone]);
    if (sessions.length === 0) throw new Error('No session found for this phone');

    const sessionId = sessions[0].id;
    const result = await query(
      `INSERT INTO public_messages (session_id, message, is_from_public, admin_id) VALUES ($1, $2, 0, $3) RETURNING *`,
      [sessionId, message, adminId]
    );
    return result[0];
  },

  async getConversations() {
    const rows = await query(`
      SELECT
        ps.id as session_id,
        ps.name,
        ps.phone,
        ps.token,
        ps.last_public_typing_at,
        ps.last_admin_typing_at,
        MAX(pm.created_at) as last_message_at,
        COUNT(pm.id) as total_messages,
        SUM(CASE WHEN pm.is_from_public = 1 AND pm.is_read = 0 THEN 1 ELSE 0 END) as unread_count
      FROM public_sessions ps
      JOIN public_messages pm ON pm.session_id = ps.id
      WHERE ps.is_active = 1
      GROUP BY ps.id, ps.name, ps.phone, ps.token, ps.last_public_typing_at, ps.last_admin_typing_at
      ORDER BY last_message_at DESC
    `);
    return rows;
  },

  async getMessages(phone) {
    const sessions = await query('SELECT id FROM public_sessions WHERE phone = $1 AND is_active = 1', [phone]);
    if (sessions.length === 0) return [];

    const sessionId = sessions[0].id;
    return this.getMessagesBySession(sessionId);
  },

  async getUnreadCount() {
    const rows = await query(`
      SELECT COUNT(*) as count FROM public_messages pm
      JOIN public_sessions ps ON ps.id = pm.session_id
      WHERE pm.is_from_public = 1 AND pm.is_read = 0 AND ps.is_active = 1
    `);
    return rows[0].count;
  },
};

import { publicMessageService } from '../services/publicMessageService.js';

export const publicMessageController = {
  async startSession(req, res, next) {
    try {
      const { name, phone } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'name and phone are required' });
      }
      const session = await publicMessageService.startSession(name.trim(), phone.trim());
      res.json(session);
    } catch (error) {
      next(error);
    }
  },

  async sendFromPublic(req, res, next) {
    try {
      const { name, phone, message, token } = req.body;
      if (!name || !phone || !message || !token) {
        return res.status(400).json({ error: 'name, phone, message, and token are required' });
      }
      const result = await publicMessageService.sendFromPublic(name.trim(), phone.trim(), message.trim(), token);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async typingPublic(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'token is required' });
      await publicMessageService.setTypingPublic(token);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },

  async typingAdmin(req, res, next) {
    try {
      const { phone } = req.body;
      if (!phone) return res.status(400).json({ error: 'phone is required' });
      await publicMessageService.setTypingAdmin(phone);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },

  async getSessionByPhone(req, res, next) {
    try {
      const { phone } = req.params;
      const session = await publicMessageService.getSessionByPhone(phone);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      const messages = await publicMessageService.getMessagesBySession(session.id);
      res.json({ session, messages });
    } catch (error) {
      next(error);
    }
  },

  async getSessionByToken(req, res, next) {
    try {
      const { token } = req.params;
      const session = await publicMessageService.getSessionByToken(token);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      const messages = await publicMessageService.getMessagesBySession(session.id);
      res.json({ session, messages });
    } catch (error) {
      next(error);
    }
  },

  async getConversations(req, res, next) {
    try {
      const conversations = await publicMessageService.getConversations();
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req, res, next) {
    try {
      const { phone } = req.params;
      const messages = await publicMessageService.getMessages(phone);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  },

  async replyFromAdmin(req, res, next) {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) {
        return res.status(400).json({ error: 'phone and message are required' });
      }
      const result = await publicMessageService.replyFromAdmin(phone, message.trim(), req.user?.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const count = await publicMessageService.getUnreadCount();
      res.json({ count });
    } catch (error) {
      next(error);
    }
  },
};

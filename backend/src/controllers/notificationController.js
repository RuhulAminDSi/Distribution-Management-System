import notificationService from '../services/notificationService.js';
import { ApiError } from '../utils/ApiError.js';

export const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await notificationService.getUserNotifications(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUnread(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.getUnreadNotifications(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getDetail(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await notificationService.getNotificationDetail(userId, parseInt(id));
      res.json({ data: notification });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await notificationService.markNotificationAsRead(
        userId,
        parseInt(id)
      );
      res.json({ data: notification });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await notificationService.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await notificationService.deleteNotification(userId, parseInt(id));
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async getByCategory(req, res, next) {
    try {
      const userId = req.user.id;
      const { category } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const Notification = (await import('../models/Notification.js')).default;
      const notifications = await Notification.getByCategory(
        userId,
        category,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default notificationController;

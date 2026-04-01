import express from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications for the logged-in user
router.get('/', notificationController.getNotifications);

// Get unread notifications count and preview
router.get('/unread', notificationController.getUnread);

// Get notifications by category
router.get('/category/:category', notificationController.getByCategory);

// Get notification detail
router.get('/:id', notificationController.getDetail);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/all/read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.delete);

export default router;

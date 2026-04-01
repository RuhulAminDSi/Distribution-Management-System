import express from 'express';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/unread', notificationController.getUnread);
router.get('/category/:category', notificationController.getByCategory);
router.put('/all/read', notificationController.markAllAsRead);
router.get('/:id', notificationController.getDetail);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.delete);

export default router;

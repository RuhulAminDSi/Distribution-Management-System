import express from 'express';
import { publicMessageController } from '../controllers/publicMessageController.js';

const router = express.Router();

router.post('/start-session', publicMessageController.startSession);
router.post('/', publicMessageController.sendFromPublic);
router.post('/typing', publicMessageController.typingPublic);
router.post('/typing-admin', publicMessageController.typingAdmin);
router.get('/by-token/:token', publicMessageController.getSessionByToken);
router.get('/by-phone/:phone', publicMessageController.getSessionByPhone);
router.get('/conversations', publicMessageController.getConversations);
router.get('/unread-count', publicMessageController.getUnreadCount);
router.get('/:phone', publicMessageController.getMessages);
router.post('/reply', publicMessageController.replyFromAdmin);

export default router;

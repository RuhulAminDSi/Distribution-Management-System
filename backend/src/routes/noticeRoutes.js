import express from 'express';
import { noticeController } from '../controllers/noticeController.js';
import { authenticate, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/notices', authenticate, permit('notices_view'), noticeController.findAll);
router.get('/notices/active', authenticate, noticeController.getActive);
router.get('/notices/:id', authenticate, permit('notices_view'), noticeController.findById);
router.post('/notices', authenticate, permit('notices_create'), noticeController.create);
router.put('/notices/:id', authenticate, permit('notices_edit'), noticeController.update);
router.delete('/notices/:id', authenticate, permit('notices_delete'), noticeController.delete);
router.put('/notices/:id/toggle-publish', authenticate, permit('notices_edit'), noticeController.togglePublished);

export default router;

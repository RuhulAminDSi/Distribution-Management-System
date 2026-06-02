import express from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.post('/users/:id/upload-photo', authenticate, upload.single('profile_picture'), uploadController.uploadProfilePicture);
router.delete('/users/:id/upload-photo', authenticate, uploadController.deleteProfilePicture);

export default router;

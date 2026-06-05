import express from 'express';
import { chatbotController } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/chat', chatbotController.chat);

export default router;

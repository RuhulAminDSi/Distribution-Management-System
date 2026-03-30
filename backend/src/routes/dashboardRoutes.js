import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authenticate, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authenticate, permit('dashboard_view'), dashboardController.getSummary);

export default router;

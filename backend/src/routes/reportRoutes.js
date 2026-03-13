import express from 'express';
import { reportController } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/daily-sales', authenticate, reportController.dailySales);
router.get('/product-sales', authenticate, reportController.productSales);
router.get('/company-sales', authenticate, reportController.companySales);
router.get('/profit', authenticate, reportController.profitReport);
router.get('/stock', authenticate, reportController.stockReport);
router.get('/due', authenticate, reportController.dueReport);
router.get('/expiry', authenticate, reportController.expiryReport);

export default router;

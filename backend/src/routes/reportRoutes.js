import express from 'express';
import { reportController } from '../controllers/reportController.js';
import { authenticate, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authenticate, permit('reports_view'), reportController.getSummary);
router.get('/daily-sales', authenticate, permit('reports_view'), reportController.dailySales);
router.get('/product-sales', authenticate, permit('reports_view'), reportController.productSales);
router.get('/company-sales', authenticate, permit('reports_view'), reportController.companySales);
router.get('/profit', authenticate, permit('reports_view'), reportController.profitReport);
router.get('/stock', authenticate, permit('reports_view'), reportController.stockReport);
router.get('/due', authenticate, permit('reports_view'), reportController.dueReport);
router.get('/expiry', authenticate, permit('reports_view'), reportController.expiryReport);

export default router;

import express from 'express';
import { stockController } from '../controllers/stockController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/history', authenticate, stockController.getHistory);
router.get('/purchase-orders', authenticate, stockController.getPurchaseOrders);
router.post('/purchase-orders', authenticate, authorize('admin'), stockController.createPurchaseOrder);
router.put('/purchase-orders/:id/receive', authenticate, authorize('admin'), stockController.receivePurchaseOrder);

export default router;

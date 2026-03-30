import express from 'express';
import { stockController } from '../controllers/stockController.js';
import { authenticate, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/history', authenticate, permit('stock_view'), stockController.getHistory);
router.get('/purchase-orders', authenticate, permit('stock_view'), stockController.getPurchaseOrders);
router.post('/purchase-orders', authenticate, permit('stock_create'), stockController.createPurchaseOrder);
router.put('/purchase-orders/:id/receive', authenticate, permit('stock_edit'), stockController.receivePurchaseOrder);

export default router;

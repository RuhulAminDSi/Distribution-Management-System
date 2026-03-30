import express from 'express';
import { invoiceController } from '../controllers/invoiceController.js';
import { authenticate, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, permit('sales_view'), invoiceController.findAll);
router.get('/:id', authenticate, permit('sales_view'), invoiceController.findById);
router.post('/', authenticate, permit('sales_create'), invoiceController.create);
router.put('/:id/payment', authenticate, permit('payments_create'), invoiceController.updatePayment);

export default router;

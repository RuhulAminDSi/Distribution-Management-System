import express from 'express';
import { invoiceController } from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, invoiceController.findAll);
router.get('/:id', authenticate, invoiceController.findById);
router.post('/', authenticate, invoiceController.create);
router.put('/:id/payment', authenticate, invoiceController.updatePayment);

export default router;

import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, permit('payments_view'), paymentController.findAll);
router.get('/:id', authenticate, permit('payments_view'), paymentController.findById);
router.post('/', authenticate, permit('payments_create'), paymentController.create);
router.get('/retailer/:retailerId', authenticate, permit('payments_view'), paymentController.getRetailerPayments);

export default router;

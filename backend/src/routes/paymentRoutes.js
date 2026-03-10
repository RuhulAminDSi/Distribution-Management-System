import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, paymentController.findAll);
router.get('/:id', authenticate, paymentController.findById);
router.post('/', authenticate, paymentController.create);
router.get('/retailer/:retailerId', authenticate, paymentController.getRetailerPayments);

export default router;

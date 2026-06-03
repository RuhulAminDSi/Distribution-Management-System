import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { authenticate, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, permit('orders_view'), orderController.findAll);
router.get('/:id', authenticate, permit('orders_view'), orderController.findById);
router.post('/', authenticate, permit('orders_create'), orderController.create);

export default router;

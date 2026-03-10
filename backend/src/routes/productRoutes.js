import express from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, productController.findAll);
router.get('/low-stock', authenticate, productController.getLowStock);
router.get('/:id', authenticate, productController.findById);
router.post('/', authenticate, authorize('admin'), productController.create);
router.put('/:id', authenticate, authorize('admin'), productController.update);
router.delete('/:id', authenticate, authorize('admin'), productController.delete);

export default router;

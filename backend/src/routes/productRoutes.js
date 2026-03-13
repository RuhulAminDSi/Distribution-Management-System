import express from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, productController.findAll);
router.get('/low-stock', authenticate, productController.getLowStock);
router.get('/expired', authenticate, productController.getExpired);
router.get('/expiring-soon', authenticate, productController.getExpiringSoon);
router.get('/:id', authenticate, productController.findById);
router.post('/', authenticate, authorize('system_admin', 'admin'), productController.create);
router.put('/:id', authenticate, authorize('system_admin', 'admin'), productController.update);
router.delete('/:id', authenticate, authorize('system_admin', 'admin'), productController.delete);

export default router;

import express from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate, authorize, permit } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, permit('products_view'), productController.findAll);
router.get('/low-stock', authenticate, permit('products_view'), productController.getLowStock);
router.get('/expired', authenticate, permit('products_view'), productController.getExpired);
router.get('/expiring-soon', authenticate, permit('products_view'), productController.getExpiringSoon);
router.get('/:id', authenticate, permit('products_view'), productController.findById);
router.post('/', authenticate, permit('products_create'), productController.create);
router.put('/:id', authenticate, permit('products_edit'), productController.update);
router.delete('/:id', authenticate, permit('products_delete'), productController.delete);

export default router;

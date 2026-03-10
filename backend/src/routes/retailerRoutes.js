import express from 'express';
import { retailerController } from '../controllers/retailerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, retailerController.findAll);
router.get('/areas', authenticate, retailerController.getAreas);
router.get('/:id', authenticate, retailerController.findById);
router.get('/:id/balance', authenticate, retailerController.getBalance);
router.post('/', authenticate, authorize('admin', 'salesman'), retailerController.create);
router.put('/:id', authenticate, authorize('admin', 'salesman'), retailerController.update);
router.delete('/:id', authenticate, authorize('admin'), retailerController.delete);

export default router;

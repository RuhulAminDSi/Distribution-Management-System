import express from 'express';
import { retailerController } from '../controllers/retailerController.js';
import { authenticate, permit } from '../middleware/auth.js';
import { validateCreateRetailer, validateUpdateRetailer } from '../utils/validation.js';

const router = express.Router();

router.get('/', authenticate, permit('retailers_view'), retailerController.findAll);
router.get('/areas', authenticate, permit('retailers_view'), retailerController.getAreas);
router.get('/:id', authenticate, permit('retailers_view'), retailerController.findById);
router.get('/:id/balance', authenticate, permit('retailers_view'), retailerController.getBalance);
router.post('/', authenticate, permit('retailers_create'), validateCreateRetailer, retailerController.create);
router.put('/:id', authenticate, permit('retailers_edit'), validateUpdateRetailer, retailerController.update);
router.delete('/:id', authenticate, permit('retailers_delete'), retailerController.delete);

export default router;

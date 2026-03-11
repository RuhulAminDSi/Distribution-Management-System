import express from 'express';
import { companyController, categoryController } from '../controllers/companyController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/companies', authenticate, companyController.findAll);
router.get('/companies/:id', authenticate, companyController.findById);
router.post('/companies', authenticate, authorize('system_admin', 'admin'), companyController.create);
router.put('/companies/:id', authenticate, authorize('system_admin', 'admin'), companyController.update);
router.delete('/companies/:id', authenticate, authorize('system_admin', 'admin'), companyController.delete);

router.get('/categories', authenticate, categoryController.findAll);
router.get('/categories/:id', authenticate, categoryController.findById);
router.post('/categories', authenticate, authorize('system_admin', 'admin'), categoryController.create);
router.put('/categories/:id', authenticate, authorize('system_admin', 'admin'), categoryController.update);
router.delete('/categories/:id', authenticate, authorize('system_admin', 'admin'), categoryController.delete);

export default router;

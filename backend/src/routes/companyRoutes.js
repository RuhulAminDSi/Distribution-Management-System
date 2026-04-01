import express from 'express';
import { companyController, categoryController } from '../controllers/companyController.js';
import { authenticate, permit } from '../middleware/auth.js';
import { validateCreateCompany, validateUpdateCompany } from '../utils/validation.js';

const router = express.Router();

router.get('/companies', authenticate, permit('companies_view'), companyController.findAll);
router.get('/companies/:id', authenticate, permit('companies_view'), companyController.findById);
router.post('/companies', authenticate, permit('companies_create'), validateCreateCompany, companyController.create);
router.put('/companies/:id', authenticate, permit('companies_edit'), validateUpdateCompany, companyController.update);
router.delete('/companies/:id', authenticate, permit('companies_delete'), companyController.delete);

router.get('/categories', authenticate, permit('companies_view'), categoryController.findAll);
router.get('/categories/:id', authenticate, permit('companies_view'), categoryController.findById);
router.post('/categories', authenticate, permit('companies_create'), categoryController.create);
router.put('/categories/:id', authenticate, permit('companies_edit'), categoryController.update);
router.delete('/categories/:id', authenticate, permit('companies_delete'), categoryController.delete);

export default router;

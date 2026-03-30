import express from 'express';
import { roleController } from '../controllers/roleController.js';
import { authenticate, permit, clearPermissionCache } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, roleController.getAllRoles);
router.get('/permissions', authenticate, roleController.getAllPermissions);
router.get('/:id', authenticate, roleController.getRoleById);
router.post('/', authenticate, permit('roles_manage'), async (req, res, next) => {
  try {
    await roleController.createRole(req, res, next);
    clearPermissionCache();
  } catch (err) { next(err); }
});
router.put('/:id', authenticate, permit('roles_manage'), async (req, res, next) => {
  try {
    await roleController.updateRole(req, res, next);
    clearPermissionCache();
  } catch (err) { next(err); }
});
router.delete('/:id', authenticate, permit('roles_manage'), async (req, res, next) => {
  try {
    await roleController.deleteRole(req, res, next);
    clearPermissionCache();
  } catch (err) { next(err); }
});

export default router;

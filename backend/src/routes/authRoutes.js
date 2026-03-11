import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.post('/register', authenticate, authorize('system_admin', 'admin'), authController.register);
router.get('/users', authenticate, authorize('system_admin', 'admin'), authController.getAllUsers);
router.put('/users/:id', authenticate, authorize('system_admin', 'admin'), authController.updateUser);
router.delete('/users/:id', authenticate, authorize('system_admin', 'admin'), authController.deleteUser);

export default router;

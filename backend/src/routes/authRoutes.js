import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, authorize, permit } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/register', authenticate, permit('users_create'), authController.register);
router.get('/users', authenticate, permit('users_view'), authController.getAllUsers);
router.put('/users/:id', authenticate, authController.updateUser);
router.delete('/users/:id', authenticate, permit('users_delete'), authController.deleteUser);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;

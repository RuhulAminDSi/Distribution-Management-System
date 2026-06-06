import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, permit } from '../middleware/auth.js';
import { validateLogin, validateRegister, validateUpdateUser, validateChangePassword, validateResetPassword, validateShopkeeperRegister } from '../utils/validation.js';

const router = express.Router();

router.get('/check-unique', authController.checkUnique);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/register', authenticate, permit('users_create'), validateRegister, authController.register);
router.get('/users', authenticate, permit('users_view'), authController.getAllUsers);
router.put('/users/:id', authenticate, validateUpdateUser, authController.updateUser);
router.delete('/users/:id', authenticate, permit('users_delete'), authController.deleteUser);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password-with-otp', authController.resetPasswordWithOtp);
router.post('/shopkeeper-register', validateShopkeeperRegister, authController.shopkeeperRegister);

export default router;

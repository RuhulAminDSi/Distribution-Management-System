import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { userModel } from '../models/index.js';
import { userService } from '../services/userService.js';
import { ApiError } from '../utils/ApiError.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new ApiError(400, 'Username/Email/Phone and password required');
      }

      const user = await userModel.findByUsername(username);
      
      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      if (!user.is_active) {
        throw new ApiError(401, 'Your account has been deactivated. Please contact administrator.');
      }

      const isValidPassword = await userModel.verifyPassword(user, password);

      if (!isValidPassword) {
        throw new ApiError(401, 'Invalid credentials');
      }

      const [roleResult] = await query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
      const roleName = roleResult ? roleResult.name : 'unknown';

      const token = jwt.sign(
        { userId: user.id, role: roleName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role_id: user.role_id,
          role: roleName,
          phone: user.phone,
          profile_picture: user.profile_picture || null
        },
        token
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      res.clearCookie('token');
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  },

  async register(req, res, next) {
    try {
      const { username, password, full_name, email, role, phone, role_id } = req.body;

      if (!username || !password || !full_name || (!role && !role_id)) {
        throw new ApiError(400, 'All fields required');
      }

      let newRoleId = role_id;
      if (!newRoleId && role) {
        const [roleResult] = await query('SELECT id FROM roles WHERE name = ?', [role]);
        if (roleResult) {
          newRoleId = roleResult.id;
        }
      }

      if (!newRoleId) {
        throw new ApiError(400, 'Invalid role');
      }

      const user = await userService.createUser({
        username,
        password,
        full_name,
        email,
        role_id: newRoleId,
        phone
      }, req.user);

      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await userService.getAllUsers(page, limit, search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await userService.updateUser(parseInt(id), updates, req.user);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(parseInt(id), req.user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(400, 'Email is required');
      }

      const resetResult = await userService.createPasswordReset(email);
      
      if (resetResult.success) {
        const emailResult = await sendPasswordResetEmail(resetResult.email, resetResult.token);
        
        if (emailResult.success) {
          res.json({ message: 'Password reset link has been sent to your email' });
        } else if (emailResult.resetLink) {
          const isDev = process.env.NODE_ENV === 'development';
          res.json({
            message: isDev ? 'Use the button below to reset your password:' : 'Email service not configured. Use the link below:',
            resetLink: emailResult.resetLink
          });
        } else {
          res.json({ message: 'Failed to send email. Please contact administrator.' });
        }
      } else {
        res.json({ message: resetResult.message });
      }
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw new ApiError(400, 'Token and new password are required');
      }

      const result = await userService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async requestOtp(req, res, next) {
    try {
      const { phone } = req.body;
      if (!phone) throw new ApiError(400, 'Phone number is required');

      const result = await userService.requestOtp(phone);

      res.json({
        success: result.success !== false,
        message: result.message,
        ...(result.otp && { otp: result.otp }),
        ...(result.alreadySent && { alreadySent: true })
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        throw new ApiError(400, 'Phone and OTP are required');
      }

      const result = await userService.verifyOtp(phone, otp);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async resetPasswordWithOtp(req, res, next) {
    try {
      const { phone, otp, newPassword } = req.body;
      if (!phone || !otp || !newPassword) {
        throw new ApiError(400, 'Phone, OTP, and new password are required');
      }
      if (newPassword.length < 6) {
        throw new ApiError(400, 'Password must be at least 6 characters');
      }

      const result = await userService.verifyOtpAndReset(phone, otp, newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async checkUnique(req, res, next) {
    try {
      const { field, value, excludeId } = req.query;
      if (!field || !value) {
        throw new ApiError(400, 'Field and value are required');
      }
      const result = await userService.checkUnique(field, value, excludeId || null);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async shopkeeperRegister(req, res, next) {
    try {
      const { username, password, full_name, email, phone } = req.body;

      if (!username || !password || !full_name) {
        throw new ApiError(400, 'Username, password, and full name are required');
      }

      const user = await userService.createShopkeeper({
        username,
        password,
        full_name,
        email,
        phone
      });

      const roleName = user.role || 'shopkeeper';

      const token = jwt.sign(
        { userId: user.id, role: roleName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000
      });

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role_id: user.role_id,
          role: roleName,
          phone: user.phone,
          profile_picture: user.profile_picture || null
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }
};

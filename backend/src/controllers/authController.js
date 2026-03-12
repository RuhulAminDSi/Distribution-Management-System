import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username/Email/Phone and password required' });
      }

      // Try to find user by username, email, or phone
      let users = await query('SELECT * FROM users WHERE (username = ? OR email = ? OR phone = ?) AND is_active = 1', [username, username, username]);
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
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
      const { username, password, full_name, email, role, phone } = req.body;

      if (!username || !password || !full_name || !role) {
        return res.status(400).json({ message: 'All fields required' });
      }

      const existingUser = await query('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const result = await query(
        'INSERT INTO users (username, password_hash, full_name, email, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [username, password_hash, full_name, email || null, role, phone || null]
      );

      const users = await query('SELECT id, username, full_name, email, role, phone FROM users WHERE id = ?', [result.insertId]);
      
      res.status(201).json({ user: users[0] });
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const users = await query(
        'SELECT id, username, full_name, email, role, phone, is_active, created_at FROM users ORDER BY id DESC'
      );
      res.json({ data: users });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { username, full_name, email, role, phone, password } = req.body;
      const currentUser = req.user;

      const users = await query('SELECT id, username, role FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const targetUser = users[0];

      // system_admin can edit anyone, admin cannot edit system_admin or admin
      if (currentUser.role !== 'system_admin') {
        if (targetUser.role === 'system_admin' || (targetUser.role === 'admin' && targetUser.username !== currentUser.username)) {
          return res.status(403).json({ message: 'You cannot edit this user' });
        }
        // admin cannot create system_admin
        if (role === 'system_admin') {
          return res.status(403).json({ message: 'Only system admin can assign system admin role' });
        }
      }

      const fields = [];
      const params = [];

      if (username) {
        fields.push('username = ?');
        params.push(username);
      }
      if (full_name) {
        fields.push('full_name = ?');
        params.push(full_name);
      }
      if (email !== undefined) {
        fields.push('email = ?');
        params.push(email);
      }
      if (role) {
        fields.push('role = ?');
        params.push(role);
      }
      if (phone !== undefined) {
        fields.push('phone = ?');
        params.push(phone);
      }
      if (password) {
        fields.push('password_hash = ?');
        params.push(await bcrypt.hash(password, 10));
      }

      if (fields.length > 0) {
        params.push(id);
        await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
      }

      const updatedUsers = await query('SELECT id, username, full_name, email, role, phone FROM users WHERE id = ?', [id]);
      res.json({ user: updatedUsers[0] });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      
      const users = await query('SELECT id, username, role FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const targetUser = users[0];

      // system_admin can delete anyone, admin cannot delete system_admin or admin
      if (currentUser.role !== 'system_admin') {
        if (targetUser.role === 'system_admin' || targetUser.role === 'admin') {
          return res.status(403).json({ message: 'You cannot delete admin or system admin' });
        }
      }

      await query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
      }

      const users = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      await query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const users = await query('SELECT id, email, phone FROM users WHERE email = ? OR phone = ?', [email, email]);
      
      // Always return success to prevent enumeration
      if (users.length === 0) {
        return res.json({ message: 'If an account exists with this email, a password reset link will be sent to your email' });
      }

      const user = users[0];
      
      if (!user.email) {
        return res.json({ message: 'No email address on file. Please contact administrator.' });
      }

      // Generate reset token
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await query(
        'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
        [resetToken, resetExpires, user.id]
      );

      // Send email
      const emailResult = await sendPasswordResetEmail(user.email, resetToken);
      
      if (emailResult.success) {
        res.json({ message: 'Password reset link has been sent to your email' });
      } else if (emailResult.resetLink) {
        // If email fails, show link in response for testing
        res.json({ 
          message: 'Email service not configured. Use the link below:',
          resetLink: emailResult.resetLink
        });
      } else {
        res.json({ message: 'Failed to send email. Please contact administrator.' });
      }
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }

      const users = await query(
        'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()',
        [token]
      );

      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      await query(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
        [password_hash, users[0].id]
      );

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }
};

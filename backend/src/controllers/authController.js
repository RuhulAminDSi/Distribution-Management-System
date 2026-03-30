import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { userModel } from '../models/index.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username/Email/Phone and password required' });
      }

      const user = await userModel.findByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.is_active) {
        return res.status(401).json({ message: 'Your account has been deactivated. Please contact administrator.' });
      }

      const isValidPassword = await userModel.verifyPassword(user, password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Get role name from roles table
      const [roleResult] = await query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
      const roleName = roleResult ? roleResult.name : 'unknown';

      const token = jwt.sign(
        { userId: user.id, role: roleName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000 // 8 hours
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          role_id: user.role_id,
          role: roleName,
          phone: user.phone
        }
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
        return res.status(400).json({ message: 'All fields required' });
      }

      const existingUser = await query('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      // Get role_id from role name if not provided
      let newRoleId = role_id;
      if (!newRoleId && role) {
        const [roleResult] = await query('SELECT id FROM roles WHERE name = ?', [role]);
        if (roleResult) {
          newRoleId = roleResult.id;
        }
      }

      if (!newRoleId) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const result = await query(
        'INSERT INTO users (username, password_hash, full_name, email, role_id, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [username, password_hash, full_name, email || null, newRoleId, phone || null]
      );

      const users = await query('SELECT id, username, full_name, email, role_id, phone FROM users WHERE id = ?', [result.insertId]);
      const [roleResult] = await query('SELECT name FROM roles WHERE id = ?', [users[0].role_id]);
      
      res.status(201).json({ user: { ...users[0], role: roleResult ? roleResult.name : 'unknown' } });
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await userModel.getAllWithPagination(
        parseInt(page),
        parseInt(limit),
        search
      );
      
      // Add role name to each user
      const usersWithRole = await Promise.all(result.data.map(async (user) => {
        const [role] = await query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
        return { ...user, role: role ? role.name : 'unknown' };
      }));
      
      result.data = usersWithRole;
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { username, full_name, email, role, phone, password, is_active, role_id } = req.body;
      const currentUser = req.user;

      const users = await query('SELECT id, username, role_id FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const targetUser = users[0];
      const isOwnProfile = currentUser.id === parseInt(id);
      
      if (isOwnProfile) {
        const fields = [];
        const values = [];
        
        if (full_name !== undefined) {
          fields.push('full_name = ?');
          values.push(full_name);
        }
        if (email !== undefined) {
          fields.push('email = ?');
          values.push(email);
        }
        if (phone !== undefined) {
          fields.push('phone = ?');
          values.push(phone);
        }
        
        if (fields.length === 0) {
          return res.status(400).json({ message: 'No fields to update' });
        }
        
        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        
        await query(sql, values);
        
        const [updatedUser] = await query('SELECT id, username, full_name, email, role_id, phone, is_active FROM users WHERE id = ?', [id]);
        const [updatedRole] = await query('SELECT name FROM roles WHERE id = ?', [updatedUser.role_id]);
        return res.json({ ...updatedUser, role: updatedRole ? updatedRole.name : 'unknown' });
      }
      
      // Get the role name being assigned
      let newRoleName = role;
      let newRoleId = role_id;
      
      if (role && !role_id) {
        const [roleResult] = await query('SELECT id FROM roles WHERE name = ?', [role]);
        if (roleResult) {
          newRoleId = roleResult.id;
        }
      } else if (role_id && !role) {
        const [roleResult] = await query('SELECT name FROM roles WHERE id = ?', [role_id]);
        newRoleName = roleResult ? roleResult.name : role;
      }
      
      // system_admin can edit anyone, admin cannot edit system_admin or admin
      if (currentUser.role !== 'system_admin') {
        if (targetRoleName === 'system_admin' || (targetRoleName === 'admin' && targetUser.username !== currentUser.username)) {
          return res.status(403).json({ message: 'You cannot edit this user' });
        }
        // admin cannot create system_admin
        if (newRoleName === 'system_admin') {
          return res.status(403).json({ message: 'Only system admin can assign system admin role' });
        }
        // admin cannot change status of other admins
        if (is_active !== undefined && targetRoleName === 'admin') {
          return res.status(403).json({ message: 'You cannot change admin status' });
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
      if (newRoleId) {
        fields.push('role_id = ?');
        params.push(newRoleId);
      }
      if (phone !== undefined) {
        fields.push('phone = ?');
        params.push(phone);
      }
      if (password) {
        fields.push('password_hash = ?');
        params.push(await bcrypt.hash(password, 10));
      }
      if (is_active !== undefined) {
        fields.push('is_active = ?');
        params.push(is_active);
      }

      if (fields.length > 0) {
        params.push(id);
        await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
      }

      const updatedUsers = await query('SELECT id, username, full_name, email, role_id, phone, is_active FROM users WHERE id = ?', [id]);
      const [updatedRole] = await query('SELECT name FROM roles WHERE id = ?', [updatedUsers[0].role_id]);
      res.json({ user: { ...updatedUsers[0], role: updatedRole ? updatedRole.name : 'unknown' } });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      
      const users = await query('SELECT id, username, role_id FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const targetUser = users[0];
      
      // Get target user's role name
      const [targetRole] = await query('SELECT name FROM roles WHERE id = ?', [targetUser.role_id]);
      const targetRoleName = targetRole ? targetRole.name : 'unknown';

      // system_admin can delete anyone, admin cannot delete system_admin or admin
      if (currentUser.role !== 'system_admin') {
        if (targetRoleName === 'system_admin' || targetRoleName === 'admin') {
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

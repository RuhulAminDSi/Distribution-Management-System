/**
 * User Service
 * Handles all user management operations
 * Extracted from authController to separate concerns
 */

import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';
import { ApiError } from '../utils/ApiError.js';

export const userService = {
  /**
   * Create a new user
   * @param {object} userData - { username, password, full_name, email, role_id, phone }
   */
  async createUser(userData, currentUser) {
    const { username, password, full_name, email, role_id, phone } = userData;

    // Authorization: Only system_admin and admin can create users
    const isSystemAdmin = currentUser?.role === 'system_admin';
    const isAdmin = currentUser?.role === 'admin';

    if (!isSystemAdmin && !isAdmin) {
      throw new ApiError(403, 'Only System Admin and Admin can create users');
    }

    // Admin cannot create System Admin or Admin users
    if (isAdmin) {
      const targetRole = await query('SELECT name FROM roles WHERE id = ?', [role_id]);
      if (targetRole.length > 0) {
        const targetRoleName = targetRole[0].name;
        if (targetRoleName === 'system_admin' || targetRoleName === 'admin') {
          throw new ApiError(403, 'Cannot create System Admin or Admin users');
        }
      }
    }

    if (email) {
      const existingEmail = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        throw new ApiError(400, 'Email already exists');
      }
    }

    if (phone) {
      const existingPhone = await query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existingPhone.length > 0) {
        throw new ApiError(400, 'Phone number already exists');
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      'INSERT INTO users (username, password_hash, full_name, email, role_id, phone) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [username, password_hash, full_name, email || null, role_id, phone || null]
    );

    if (!result[0]?.id) {
      throw new ApiError(500, 'Failed to create user');
    }

    // Get created user with role
    return this.getUserById(result[0].id);
  },

  /**
   * Get user by ID with role information
   */
  async getUserById(userId) {
    const user = await new QueryBuilder('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const role = await query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    return {
      ...user,
      role: role[0]?.name || 'unknown'
    };
  },

  /**
   * Get all users with pagination and search (optimized with JOIN)
   */
  async getAllUsers(page = 1, limit = 20, search = '') {
    let builder = new QueryBuilder('users u')
      .select('u.id, u.username, u.full_name, u.email, u.role_id, u.phone, u.is_active, u.profile_picture, u.created_at, r.name as role')
      .leftJoin('roles r', 'r.id = u.role_id');

    if (search) {
      builder = builder.whereLike('u.full_name', search);
    }

    const result = await builder.paginate(page, limit);

    return {
      ...result,
      data: result.data.map(user => ({
        ...user,
        role: user.role || 'unknown'
      }))
    };
  },

  /**
   * Update user information
   * Handles role-based restrictions
   */
  async updateUser(userId, updates, currentUser) {
    const targetUser = await query('SELECT id, username, role_id FROM users WHERE id = ?', [userId]);
    if (targetUser.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    const user = targetUser[0];
    const isOwnProfile = currentUser.id === userId;
    const isSystemAdmin = currentUser.role === 'system_admin';

    // Get role name for authorization checks
    const targetRole = await query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    const targetRoleName = targetRole[0]?.name || 'unknown';

    // Authorization rules
    const isAdmin = currentUser.role === 'admin';

    if (!isOwnProfile && !isSystemAdmin && !isAdmin) {
      throw new ApiError(403, 'You can only edit your own profile');
    }

    // Admin cannot edit System Admin or Admin users
    if (isAdmin && (targetRoleName === 'system_admin' || targetRoleName === 'admin')) {
      throw new ApiError(403, 'Cannot edit System Admin or Admin users');
    }

    if (updates.email) {
      const existingEmail = await query('SELECT id FROM users WHERE email = ? AND id != ?', [updates.email, userId]);
      if (existingEmail.length > 0) {
        throw new ApiError(400, 'Email already exists');
      }
    }

    if (updates.phone) {
      const existingPhone = await query('SELECT id FROM users WHERE phone = ? AND id != ?', [updates.phone, userId]);
      if (existingPhone.length > 0) {
        throw new ApiError(400, 'Phone number already exists');
      }
    }

    const fields = [];
    const params = [];

    // Build dynamic UPDATE query based on provided fields
    if (updates.username) {
      fields.push('username = ?');
      params.push(updates.username);
    }
    if (updates.full_name) {
      fields.push('full_name = ?');
      params.push(updates.full_name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      params.push(updates.email || null);
    }
    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      params.push(updates.phone || null);
    }
    if (updates.password) {
      const password_hash = await bcrypt.hash(updates.password, 10);
      fields.push('password_hash = ?');
      params.push(password_hash);
    }
    if (updates.role_id && (isSystemAdmin || isAdmin)) {
      // Only system admin and admin can change roles
      if (isAdmin) {
        const newRole = await query('SELECT name FROM roles WHERE id = ?', [updates.role_id]);
        if (newRole.length > 0 && (newRole[0].name === 'system_admin' || newRole[0].name === 'admin')) {
          throw new ApiError(403, 'Cannot assign System Admin or Admin role');
        }
      }
      fields.push('role_id = ?');
      params.push(updates.role_id);
    }
    if (updates.is_active !== undefined && (isSystemAdmin || isAdmin || isOwnProfile)) {
      fields.push('is_active = ?');
      params.push(updates.is_active);
    }

    if (fields.length === 0) {
      throw new ApiError(400, 'No fields to update');
    }

    params.push(userId);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    // Return updated user
    return this.getUserById(userId);
  },

  /**
   * Delete user (soft delete - set is_active to 0)
   */
  async deleteUser(userId, currentUser) {
    const targetUser = await query('SELECT id, role_id FROM users WHERE id = ?', [userId]);
    if (targetUser.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    const user = targetUser[0];
    const isSystemAdmin = user.role_id === 1;

    // Cannot delete system admin
    if (isSystemAdmin) {
      throw new ApiError(403, 'Cannot delete system admin user');
    }

    // Non-system-admins cannot delete admin users
    if (currentUser.role !== 'system_admin') {
      const targetRole = await query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
      const targetRoleName = targetRole[0]?.name || 'unknown';

      if (targetRoleName === 'system_admin' || targetRoleName === 'admin') {
        throw new ApiError(403, 'You cannot delete admin or system admin users');
      }
    }

    // Soft delete
    await query('UPDATE users SET is_active = 0 WHERE id = ?', [userId]);
    return { message: 'User deleted successfully' };
  },

  /**
   * Change user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const users = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash and update new password
    const password_hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    return { message: 'Password changed successfully' };
  },

  /**
   * Create password reset token
   */
  async createPasswordReset(email) {
    const users = await query('SELECT id, email, phone FROM users WHERE email = ? OR phone = ?', [email, email]);

    if (users.length === 0) {
      // Return generic message for security
      return {
        success: false,
        message: 'If an account exists with this email, a password reset link will be sent'
      };
    }

    const user = users[0];

    if (!user.email) {
      return {
        success: false,
        message: 'No email address on file. Please contact administrator.'
      };
    }

    // Generate reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    return {
      success: true,
      token: resetToken,
      userId: user.id,
      email: user.email
    };
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const users = await query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Hash and update password
    const password_hash = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [password_hash, users[0].id]
    );

    return { message: 'Password reset successfully' };
  },

  /**
   * Get role name for a user
   */
  async getUserRoleName(userId) {
    const result = await query(
      'SELECT r.name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [userId]
    );

    return result[0]?.name || 'unknown';
  }
};

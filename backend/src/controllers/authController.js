import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const users = await query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
      
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
      const { username, password, full_name, role, phone } = req.body;

      if (!username || !password || !full_name || !role) {
        return res.status(400).json({ message: 'All fields required' });
      }

      const existingUser = await query('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const result = await query(
        'INSERT INTO users (username, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?)',
        [username, password_hash, full_name, role, phone || null]
      );

      const users = await query('SELECT id, username, full_name, role, phone FROM users WHERE id = ?', [result.insertId]);
      
      res.status(201).json({ user: users[0] });
    } catch (error) {
      next(error);
    }
  }
};

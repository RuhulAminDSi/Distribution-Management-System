import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { roleModel, userModel } from '../models/index.js';

const rolePermissionsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const getRolePermissions = async (roleName) => {
  const cached = rolePermissionsCache.get(roleName);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.permissions;
  }

  try {
    const role = await roleModel.findByName(roleName);
    if (!role) return [];

    const permissions = await roleModel.getPermissions(role.id);
    const permNames = permissions.map(p => p.name);

    rolePermissionsCache.set(roleName, {
      permissions: permNames,
      timestamp: Date.now()
    });

    return permNames;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
};

export const clearPermissionCache = (roleName) => {
  if (roleName) {
    rolePermissionsCache.delete(roleName);
  } else {
    rolePermissionsCache.clear();
  }
};

export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid user or inactive account' });
    }

    // Get role name from roles table
    const [roleResult] = await query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    const roleName = roleResult ? roleResult.name : 'unknown';

    const permissions = await getRolePermissions(roleName);
    
    const { password_hash, ...userWithoutPassword } = user;
    
    req.user = {
      ...userWithoutPassword,
      role: roleName,
      permissions
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    next(error);
  }
};

export const permit = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    
    const hasAllPermission = userPermissions.includes('all');
    const hasRequiredPermission = requiredPermissions.some(perm => userPermissions.includes(perm));

    if (!hasAllPermission && !hasRequiredPermission) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to perform this action.',
        required: requiredPermissions,
        user_permissions: userPermissions
      });
    }

    next();
  };
};

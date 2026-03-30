import { BaseModel } from './baseModel.js';
import { query } from '../config/database.js';

export class Role extends BaseModel {
  constructor() {
    super('roles');
  }

  async findAllWithPermissions() {
    const roles = await query('SELECT * FROM roles ORDER BY id');
    
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const permissions = await this.getPermissions(role.id);
        return {
          ...role,
          permissions: permissions.map(p => p.name)
        };
      })
    );
    
    return rolesWithPermissions;
  }

  async findByIdWithPermissions(id) {
    const role = await this.findById(id);
    if (!role) return null;

    const permissions = await this.getPermissions(id);
    return {
      ...role,
      permissions: permissions.map(p => p.name)
    };
  }

  async findByName(name) {
    const results = await query('SELECT * FROM roles WHERE name = ?', [name]);
    return results[0] || null;
  }

  async getPermissions(roleId) {
    return await query(
      `SELECT p.* FROM permissions p 
       JOIN role_permissions rp ON p.name = rp.permission 
       WHERE rp.role_id = ?`,
      [roleId]
    );
  }

  async setPermissions(roleId, permissions) {
    await query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

    if (permissions && permissions.length > 0) {
      for (const permName of permissions) {
        try {
          await query(
            'INSERT IGNORE INTO role_permissions (role_id, permission) VALUES (?, ?)',
            [roleId, permName]
          );
        } catch (error) {
          console.error('Error adding permission:', permName, error.message);
        }
      }
    }

    return await this.findByIdWithPermissions(roleId);
  }

  async hasPermission(roleId, permission) {
    const role = await this.findById(roleId);
    if (!role) return false;

    const permissions = await this.getPermissions(roleId);
    const permNames = permissions.map(p => p.name);

    if (permNames.includes('all')) return true;
    return permNames.includes(permission);
  }

  async getUsers(roleId) {
    return await query('SELECT * FROM users WHERE role_id = ?', [roleId]);
  }

  async createWithPermissions(data, permissions = []) {
    const result = await this.create(data);
    
    if (permissions.length > 0) {
      await this.setPermissions(result.id, permissions);
    }

    return await this.findByIdWithPermissions(result.id);
  }

  async updateWithPermissions(id, data, permissions = null) {
    const { permissions: _, ...updateData } = data;
    
    if (Object.keys(updateData).length > 0) {
      await this.update(id, updateData);
    }

    if (permissions !== null) {
      await this.setPermissions(id, permissions);
    }

    return await this.findByIdWithPermissions(id);
  }

  async deleteWithCheck(id) {
    const role = await this.findById(id);
    if (!role) return { success: false, message: 'Role not found' };

    const systemRoles = ['system_admin', 'admin'];
    if (systemRoles.includes(role.name)) {
      return { success: false, message: 'Cannot delete system roles' };
    }

    const users = await this.getUsers(id);
    if (users.length > 0) {
      return { success: false, message: 'Cannot delete role - users are assigned to this role' };
    }

    await query('DELETE FROM role_permissions WHERE role_id = ?', [id]);
    await this.delete(id);

    return { success: true, message: 'Role deleted successfully' };
  }
}

export const roleModel = new Role();

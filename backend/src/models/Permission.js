import { BaseModel } from './baseModel.js';
import { query } from '../config/database.js';

export class Permission extends BaseModel {
  constructor() {
    super('permissions');
  }

  async findAllGroupedByModule() {
    const permissions = await query('SELECT * FROM permissions ORDER BY module, name');
    
    const grouped = {};
    for (const perm of permissions) {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    }
    
    return grouped;
  }

  async findByName(name) {
    const results = await query('SELECT * FROM permissions WHERE name = ?', [name]);
    return results[0] || null;
  }

  async findByModule(moduleName) {
    return await query('SELECT * FROM permissions WHERE module = ? ORDER BY name', [moduleName]);
  }

  async getRoles(permissionName) {
    return await query(
      `SELECT r.* FROM roles r 
       JOIN role_permissions rp ON r.id = rp.role_id 
       WHERE rp.permission = ?`,
      [permissionName]
    );
  }

  async hasRole(permissionName, roleName) {
    const result = await query(
      `SELECT COUNT(*) as count FROM role_permissions rp
       JOIN roles r ON r.id = rp.role_id
       WHERE rp.permission = ? AND r.name = ?`,
      [permissionName, roleName]
    );
    return result[0].count > 0;
  }

  async createMany(permissions) {
    const created = [];
    for (const perm of permissions) {
      const existing = await this.findByName(perm.name);
      if (!existing) {
        const result = await this.create(perm);
        created.push(result);
      }
    }
    return created;
  }

  async getAllWithRoleStatus(roleId) {
    const permissions = await query('SELECT * FROM permissions ORDER BY module, name');
    const rolePerms = await query(
      'SELECT permission FROM role_permissions WHERE role_id = ?',
      [roleId]
    );
    
    const rolePermNames = rolePerms.map(rp => rp.permission);
    
    return permissions.map(perm => ({
      ...perm,
      assigned: rolePermNames.includes(perm.name)
    }));
  }
}

export const permissionModel = new Permission();

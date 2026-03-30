import { roleModel, permissionModel } from '../models/index.js';

export const roleController = {
  async getAllRoles(req, res, next) {
    try {
      const roles = await roleModel.findAllWithPermissions();
      res.json({ data: roles });
    } catch (error) {
      next(error);
    }
  },

  async getAllPermissions(req, res, next) {
    try {
      const permissions = await permissionModel.findAllGroupedByModule();
      res.json({ data: permissions });
    } catch (error) {
      next(error);
    }
  },

  async getRoleById(req, res, next) {
    try {
      const { id } = req.params;
      const role = await roleModel.findByIdWithPermissions(id);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      res.json({ role });
    } catch (error) {
      next(error);
    }
  },

  async createRole(req, res, next) {
    try {
      const { name, description, permissions, color } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const existing = await roleModel.findByName(name);
      if (existing) {
        return res.status(400).json({ message: 'Role already exists' });
      }

      const role = await roleModel.createWithPermissions(
        { name, description, color },
        permissions || []
      );

      res.status(201).json({ role });
    } catch (error) {
      next(error);
    }
  },

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, permissions, color, is_active } = req.body;

      const existing = await roleModel.findById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Role not found' });
      }

      const systemRoles = ['system_admin', 'admin'];
      if (systemRoles.includes(existing.name)) {
        return res.status(400).json({ message: 'Cannot modify system roles' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (color) updateData.color = color;
      if (is_active !== undefined) updateData.is_active = is_active;

      const role = await roleModel.updateWithPermissions(
        id,
        updateData,
        permissions || []
      );

      res.json({ role });
    } catch (error) {
      next(error);
    }
  },

  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;

      const result = await roleModel.deleteWithCheck(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
};

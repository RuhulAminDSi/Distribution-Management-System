import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { roleService } from '../../services/api';
import { Shield, Key, Plus, X, Save, Edit, Trash2, FileText } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';
import Toast from '../../components/common/Toast';

const availablePermissionsDefault = [
  { id: 'all', name: 'All Access', module: 'system' },
  { id: 'dashboard_view', name: 'View Dashboard', module: 'dashboard' },
  { id: 'companies_view', name: 'View Companies', module: 'companies' },
  { id: 'companies_create', name: 'Create Companies', module: 'companies' },
  { id: 'companies_edit', name: 'Edit Companies', module: 'companies' },
  { id: 'companies_delete', name: 'Delete Companies', module: 'companies' },
  { id: 'products_view', name: 'View Products', module: 'products' },
  { id: 'products_create', name: 'Create Products', module: 'products' },
  { id: 'products_edit', name: 'Edit Products', module: 'products' },
  { id: 'products_delete', name: 'Delete Products', module: 'products' },
  { id: 'retailers_view', name: 'View Retailers', module: 'retailers' },
  { id: 'retailers_create', name: 'Create Retailers', module: 'retailers' },
  { id: 'retailers_edit', name: 'Edit Retailers', module: 'retailers' },
  { id: 'retailers_delete', name: 'Delete Retailers', module: 'retailers' },
  { id: 'sales_view', name: 'View Sales', module: 'sales' },
  { id: 'sales_create', name: 'Create Sales', module: 'sales' },
  { id: 'payments_view', name: 'View Payments', module: 'payments' },
  { id: 'payments_create', name: 'Create Payments', module: 'payments' },
  { id: 'stock_view', name: 'View Stock', module: 'stock' },
  { id: 'stock_create', name: 'Create Stock', module: 'stock' },
  { id: 'stock_edit', name: 'Edit Stock', module: 'stock' },
  { id: 'reports_view', name: 'View Reports', module: 'reports' },
  { id: 'users_view', name: 'View Users', module: 'users' },
  { id: 'users_create', name: 'Create Users', module: 'users' },
  { id: 'users_edit', name: 'Edit Users', module: 'users' },
  { id: 'users_delete', name: 'Delete Users', module: 'users' },
  { id: 'roles_manage', name: 'Manage Roles', module: 'roles' },
  { id: 'settings_view', name: 'View Settings', module: 'settings' },
  { id: 'settings_edit', name: 'Edit Settings', module: 'settings' },
  { id: 'view_deliveries', name: 'View Deliveries', module: 'deliveries' }
];

export default function RolesTab() {
  const { user, refreshRoles } = useAuth();
  const { t } = useLanguage();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [toast, setToast] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
    color: '#6b7280'
  });

  const isSystemAdmin = user?.role === 'system_admin';

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setRoleLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        roleService.getAll(),
        roleService.getPermissions()
      ]);
      setRoles(rolesRes.data.data || []);

      const allPerms = [];
      const groupedPerms = permsRes.data.data || {};
      Object.keys(groupedPerms).forEach(module => {
        groupedPerms[module].forEach(perm => {
          allPerms.push(perm);
        });
      });
      setPermissions(allPerms);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setPermissions(availablePermissionsDefault);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setRoleLoading(true);
    try {
      const submitData = {
        ...roleForm,
        permissions: roleForm.permissions
      };
      console.log('Submitting role data:', submitData);

      if (editingRole) {
        await roleService.update(editingRole.id, submitData);
      } else {
        await roleService.create(submitData);
      }
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissions: [], color: '#6b7280' });
      fetchRoles();
      refreshRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert(error.response?.data?.message || 'Failed to save role');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      await roleService.delete(id);
      setShowDeleteConfirm(null);
      setToast(t('RoleDeleted'));
      fetchRoles();
      refreshRoles();
    } catch (error) {
      setToast(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    const rolePerms = role.permissions || [];
    console.log('Editing role:', role.name, 'Permissions:', rolePerms);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: rolePerms,
      color: role.color || '#6b7280'
    });
    setShowRoleModal(true);
  };

  const togglePermission = (permissionId) => {
    setRoleForm(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const canEditRole = (role) => {
    return !['system_admin', 'admin'].includes(role.name);
  };

  return (
    <div className="settings-content">
      <div className="settings-section">
        <div className="section-header">
          <Key size={20} />
          <h3>{t('RoleManagement')}</h3>
          {isSystemAdmin && (
            <button className="btn-add-role" onClick={() => { setEditingRole(null); setRoleForm({ name: '', description: '', permissions: [], color: '#6b7280' }); setShowRoleModal(true); }}>
              <Plus size={16} /> {t('AddRole')}
            </button>
          )}
        </div>

        {roleLoading && roles.length === 0 ? (
          <div className="loading-state">{t('Loading')}</div>
        ) : (
          <div className="roles-grid">
            {roles.map(role => (
              <div key={role.id} className="role-card" style={{ borderLeftColor: role.color }}>
                <div className="role-header">
                  <div className="role-icon" style={{ background: role.color }}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4>{t(role.name) || role.name.replace('_', ' ')}</h4>
                    <span className="role-id">{role.name}</span>
                  </div>
                  {isSystemAdmin && canEditRole(role) && (
                    <div className="role-actions">
                      <button className="btn-icon" onClick={() => openEditRole(role)} title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={() => setShowDeleteConfirm(role)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="role-description">{role.description}</p>
                <div className="role-permissions">
                  {(role.permissions || []).map(perm => (
                    <span key={perm} className="permission-tag" style={{ background: `${role.color}20`, color: role.color }}>
                      {perm === 'all' ? t('AllAccess') : t(perm) || perm.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Shield size={24} className="modal-header-icon" />
                <h3>{editingRole ? t('EditRole') : t('AddRole')}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit} className="modal-body">
              <div className="form-section">
                <div className="form-section-title">{t('RoleDetails') || 'Role Details'}</div>
                <div className="form-group">
                  <label>{t('RoleName')}</label>
                  <div className="input-with-icon">
                    <Shield size={18} className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({...roleForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                      placeholder="e.g., warehouse_manager"
                      required
                      disabled={!!editingRole}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('Description')}</label>
                  <div className="input-with-icon">
                    <FileText size={18} className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                      placeholder={t('Description')}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('Color')}</label>
                  <div className="input-with-icon">
                    <span className="input-icon" style={{ color: roleForm.color, fontWeight: 'bold', fontSize: '14px' }}>●</span>
                    <input
                      type="color"
                      className="form-input"
                      value={roleForm.color}
                      onChange={(e) => setRoleForm({...roleForm, color: e.target.value})}
                      style={{ height: '40px', padding: '4px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('Permissions')}</div>
                <div className="form-group">
                  <div className="permissions-grid">
                    {(permissions.length > 0 ? permissions : availablePermissionsDefault).map(perm => {
                      const permName = perm.name;
                      return (
                        <label key={permName} className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={roleForm.permissions.includes(permName)}
                            onChange={() => togglePermission(permName)}
                          />
                          <span>{permName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={roleLoading}>
                  <Save size={18} /> {roleLoading ? t('Loading') : t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => handleDeleteRole(showDeleteConfirm.id)}
        title={t('DeleteRole')}
        message={`${t('ConfirmDelete')} "${showDeleteConfirm?.name}"?`}
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
        confirmVariant="danger"
      />

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

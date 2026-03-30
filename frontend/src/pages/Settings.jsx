import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { authService, roleService } from '../services/api';
import { Shield, Key, Database, User, Bell, Globe, Plus, Save, Check, X, Trash2, Edit } from 'lucide-react';

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

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { user, setUser, refreshRoles } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
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
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const isSystemAdmin = user?.role === 'system_admin';
  const isAdmin = user?.role === 'system_admin' || user?.role === 'admin';

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || user.phone_number || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isAdmin && (activeTab === 'general' || activeTab === 'roles')) {
      setActiveTab('profile');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'roles' && isAdmin) {
      fetchRoles();
    }
    if ((activeTab === 'roles' || activeTab === 'general') && !isAdmin) {
      setActiveTab('profile');
    }
  }, [activeTab, isAdmin]);

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
      fetchRoles();
      refreshRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete role');
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

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    
    try {
      const userId = user.id || user.user_id;
      await authService.updateUser(userId, {
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone
      });
      
      setUser(prev => ({
        ...prev,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone
      }));
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: t('General') || 'General', icon: <Shield size={18} />, requiresAdmin: true },
    { id: 'roles', label: t('Roles') || 'Roles', icon: <Key size={18} />, requiresAdmin: true },
    { id: 'profile', label: t('Profile') || 'Profile', icon: <User size={18} /> },
  ];

  const visibleTabs = tabs.filter(tab => !tab.requiresAdmin || isAdmin);

  return (
    <div>
      <div className="page-header">
        <h2>{t('Settings')}</h2>
      </div>

      <div className="settings-tabs">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="settings-content">
          <div className="settings-section">
            <div className="section-header">
              <Globe size={20} />
              <h3>{t('Language') || 'Language Settings'}</h3>
            </div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Default Language</h4>
                  <p>{t('DefaultLanguage')}</p>
                </div>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="form-input"
                  style={{ width: '150px' }}
                >
                  <option value="bn">বাংলা</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <Database size={20} />
              <h3>{t('SystemInformation')}</h3>
            </div>
            <div className="settings-card">
              <div className="system-info-grid">
                <div className="info-box">
                  <span className="info-label">Database</span>
                  <span className="info-value">MySQL - dms_db</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Backend</span>
                  <span className="info-value">Node.js + Express</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Frontend</span>
                  <span className="info-value">React + Vite</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Version</span>
                  <span className="info-value">v1.0.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <Bell size={20} />
              <h3>{t('Notifications')}</h3>
            </div>
            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>{t('LowStockAlerts')}</h4>
                  <p>{t('LowStockAlerts')}</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>{t('ExpiryAlerts')}</h4>
                  <p>{t('ExpiryAlerts')}</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>{t('PaymentReminders')}</h4>
                  <p>{t('PaymentReminders')}</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
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
        </div>
      )}

      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRole ? t('EditRole') : t('AddRole')}</h3>
              <button className="btn-close" onClick={() => setShowRoleModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t('RoleName')}</label>
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
                <div className="form-group">
                  <label>{t('Description')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                    placeholder={t('Description')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Color')}</label>
                  <input
                    type="color"
                    className="form-input"
                    value={roleForm.color}
                    onChange={(e) => setRoleForm({...roleForm, color: e.target.value})}
                    style={{ height: '40px', padding: '4px' }}
                  />
                </div>
                  <div className="form-group">
                  <label>{t('Permissions')}</label>
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
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={roleLoading}>
                  {roleLoading ? t('Loading') : t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('DeleteRole')}</h3>
              <button className="btn-close" onClick={() => setShowDeleteConfirm(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>{t('ConfirmDelete')} "{showDeleteConfirm.name}"?</p>
              <p className="text-danger">{t('DeleteError')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                {t('Cancel')}
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteRole(showDeleteConfirm.id)}>
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="settings-content">
          <div className="settings-section">
            <div className="section-header">
              <User size={20} />
              <h3>{t('Profile')} {t('Settings')}</h3>
            </div>
            <div className="settings-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {profileData.full_name?.charAt(0) || 'U'}
                </div>
                <div className="profile-info">
                  <h4>{profileData.full_name}</h4>
                  <p>{user?.username}</p>
                  <span className="role-badge">{user?.role}</span>
                </div>
              </div>
              
              <form className="profile-form" onSubmit={handleProfileSave}>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" className="form-input" value={user?.username || ''} disabled />
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : profileSuccess ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .settings-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .settings-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .settings-tab:hover {
          background: var(--background);
        }
        
        .settings-tab.active {
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          color: white;
          border-color: transparent;
        }
        
        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .settings-section {
          background: var(--surface);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid var(--border);
        }
        
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: var(--text-primary);
        }
        
        .section-header h3 {
          margin: 0;
          flex: 1;
        }
        
        .btn-add-role {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-add-role:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
        }
        
        .settings-card {
          background: var(--background);
          border-radius: 12px;
          padding: 20px;
        }
        
        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }
        
        .setting-item:last-child {
          border-bottom: none;
        }
        
        .setting-info h4 {
          margin: 0 0 4px;
          color: var(--text-primary);
        }
        
        .setting-info p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }
        
        .toggle {
          position: relative;
          width: 48px;
          height: 26px;
        }
        
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--border);
          border-radius: 26px;
          transition: 0.3s;
        }
        
        .toggle-slider:before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }
        
        .toggle input:checked + .toggle-slider {
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
        }
        
        .toggle input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }
        
        .system-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }
        
        .info-box {
          background: var(--surface);
          padding: 16px;
          border-radius: 10px;
          text-align: center;
        }
        
        .info-label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        
        .info-value {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .role-card {
          background: var(--background);
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid;
        }
        
        .role-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .role-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .role-header h4 {
          margin: 0;
          color: var(--text-primary);
        }
        
        .role-id {
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .role-description {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 12px;
        }
        
        .role-permissions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .permission-tag {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: 700;
        }
        
        .profile-info h4 {
          margin: 0 0 4px;
          font-size: 20px;
          color: var(--text-primary);
        }
        
        .profile-info p {
          margin: 0 0 8px;
          color: var(--text-secondary);
        }
        
        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(233, 69, 96, 0.1);
          color: #e94560;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .profile-form .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .profile-form .form-group {
          margin-bottom: 0;
        }
        
        .profile-form label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        @media (max-width: 600px) {
          .profile-form .form-row-2 {
            grid-template-columns: 1fr;
          }
          
          .settings-tab span {
            display: none;
          }
        }

        .role-actions {
          display: flex;
          gap: 4px;
          margin-left: auto;
        }

        .btn-icon {
          padding: 6px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: var(--surface);
          color: var(--text-primary);
        }

        .btn-icon.btn-danger:hover {
          background: #fef2f2;
          color: #ef4444;
          border-color: #ef4444;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--surface);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
        }

        .modal-sm {
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .btn-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 4px;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 20px;
          border-top: 1px solid var(--border);
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .permission-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--background);
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }

        .permission-checkbox input {
          width: 16px;
          height: 16px;
        }

        .text-danger {
          color: #ef4444;
          font-size: 13px;
        }

        .btn-secondary {
          background: var(--background);
          border: 1px solid var(--border);
          color: var(--text-primary);
        }

        .btn-danger {
          background: #ef4444;
          border: none;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .loading-state {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { authService, roleService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { X, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, User, Mail, Phone, Lock, Shield } from 'lucide-react';

export default function Users() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, limit]);

  const fetchRoles = async () => {
    try {
      const res = await roleService.getAll();
      setRoles(res.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getUsers({ page, limit });
      const data = res.data?.data || res.data || [];
      const totalVal = res.data?.pagination?.total || res.data?.total || data.length || 0;
      setUsers(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setUsers([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting formData:', formData);
    try {
      if (editItem) {
        const updateData = {
          full_name: formData.full_name,
          email: formData.email,
          role_id: formData.role_id,
          phone: formData.phone
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        console.log('Updating user:', editItem.id, updateData);
        await authService.updateUser(editItem.id, updateData);
      } else {
        await authService.register(formData);
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({});
      fetchUsers();
    } catch (error) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id, username) => {
    if (!confirm(t('ConfirmDelete'))) return;
    
    if (username === 'admin') {
      alert(t('SystemAdmin') + ' ' + t('DeleteError'));
      return;
    }
    
    try {
      await authService.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert(t('DeleteError'));
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.username === 'admin') {
      alert(t('SystemAdmin') + ' status cannot be changed');
      return;
    }
    
    const newStatus = user.is_active ? 0 : 1;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await authService.updateUser(user.id, { is_active: newStatus });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        username: item.username || '',
        password: '',
        full_name: item.full_name || '',
        email: item.email || '',
        role_id: item.role_id || '',
        phone: item.phone || ''
      });
    } else {
      setEditItem(null);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        role_id: '',
        phone: ''
      });
    }
    setShowModal(true);
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'system_admin': return 'badge-danger';
      case 'admin': return 'badge-primary';
      case 'manager': return 'badge-warning';
      case 'salesman': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const formatRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      <div className="page-header">
        <h2>{t('Users')}</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> {t('AddUser')}
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>{t('Username')}</th>
              <th>{t('FullName')}</th>
              <th>{t('Email')}</th>
              <th>{t('Role')}</th>
              <th>{t('Phone')}</th>
              <th>{t('Status')}</th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
              {loading ? (
              <tr><td colSpan="7">{t('Loading')}</td></tr>
            ) : !users || users.length === 0 ? (
              <tr><td colSpan="7">{t('NoUsersFound')}</td></tr>
            ) : (
                users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email || '-'}</td>
                  <td><span className={`badge ${getRoleBadgeClass(u.role)}`}>{formatRole(u.role)}</span></td>
                  <td>{u.phone}</td>
                  <td>{u.is_active ? <span className="badge badge-success">{t('Active')}</span> : <span className="badge badge-danger">{t('Inactive')}</span>}</td>
                  <td>
                    <button 
                      className={`btn btn-sm ${u.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(u)}
                      disabled={u.username === 'admin'}
                      title={u.username === 'admin' ? 'Cannot change admin status' : u.is_active ? 'Deactivate' : 'Activate'}
                      style={{ marginRight: '4px' }}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-sm" onClick={() => openModal(u)}><Pencil size={14} /></button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.username === 'admin'}
                      title={u.username === 'admin' ? t('SystemAdmin') + ' ' + t('DeleteError') : t('Delete')}
                    ><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px' }}>Show</span>
          <select 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ fontSize: '14px' }}>of {total} entries</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '14px' }}>{t('Page')} {page} / {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditItem(null); setFormData({}); }}>
          <div className="user-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-icon">
                  <User size={20} />
                </div>
                <div>
                  <h3>{editItem ? t('EditUser') : t('AddUser')}</h3>
                  <p>{editItem ? 'Update user information' : 'Create a new user account'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditItem(null); setFormData({}); }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label><User size={14} /> {t('Username')} *</label>
                  <input 
                    type="text" 
                    value={formData.username || ''}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required 
                    placeholder="Enter username"
                    disabled={editItem}
                    className="form-input"
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group">
                  <label><Lock size={14} /> {t('Password')} {editItem ? '(Optional)' : '*'}</label>
                  <input 
                    type="password" 
                    value={formData.password || ''}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editItem}
                    placeholder={editItem ? 'Leave blank to keep current' : 'Enter password'}
                    className="form-input"
                    autoComplete="new-password"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label><User size={14} /> {t('FullName')} *</label>
                  <input 
                    type="text" 
                    value={formData.full_name || ''}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    required 
                    placeholder="Enter full name"
                    className="form-input"
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group">
                  <label><Mail size={14} /> {t('Email')}</label>
                  <input 
                    type="email" 
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                    className="form-input"
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group">
                  <label><Phone size={14} /> {t('Phone')}</label>
                  <input 
                    type="text" 
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="form-input"
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label><Shield size={14} /> {t('Role')} *</label>
                  <select 
                    value={formData.role_id || ''}
                    onChange={e => setFormData({...formData, role_id: e.target.value})}
                    required
                    className="form-input"
                  >
                    <option value="">Select role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); setEditItem(null); setFormData({}); }}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? t('Save') : t('AddUser')}
                </button>
              </div>
            </form>
          </div>
          
          <style>{`
            .user-modal {
              background: #1a1a2e !important;
              color: white !important;
              border-radius: 16px;
              width: 100%;
              max-width: 520px;
              border: 1px solid rgba(233, 69, 96, 0.2);
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
              animation: modalSlide 0.3s ease;
            }
            
            @keyframes modalSlide {
              from { opacity: 0; transform: scale(0.95) translateY(-10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .user-modal .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 24px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
              background: #1a1a2e !important;
            }
            
            .modal-title-wrapper {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            
            .modal-icon {
              width: 44px;
              height: 44px;
              background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            
            .modal-title-wrapper h3 {
              margin: 0;
              color: white;
              font-size: 1.25rem;
              font-weight: 600;
            }
            
            .modal-title-wrapper p {
              margin: 4px 0 0;
              color: rgba(255, 255, 255, 0.5);
              font-size: 0.85rem;
            }
            
            .user-modal .modal-close {
              background: rgba(255, 255, 255, 0.1) !important;
              border: none;
              color: white !important;
              width: 36px;
              height: 36px;
              border-radius: 10px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
            }
            
            .user-modal .modal-close:hover {
              background: rgba(239, 68, 68, 0.3) !important;
              color: #ff6b6b !important;
            }
            
            .user-modal .modal-body {
              padding: 24px;
              background: #1a1a2e !important;
            }
            
            .form-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            
            .form-group.full-width {
              grid-column: span 2;
            }
            
            .form-group label {
              display: flex;
              align-items: center;
              gap: 8px;
              color: rgba(255, 255, 255, 0.8);
              font-size: 0.875rem;
              font-weight: 500;
              margin-bottom: 8px;
            }
            
            .form-input {
              width: 100%;
              padding: 12px 14px;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              color: white;
              font-size: 0.95rem;
              transition: all 0.3s;
            }
            
            .form-input:focus {
              outline: none;
              border-color: #e94560;
              box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.15);
            }
            
            .form-input::placeholder {
              color: rgba(255, 255, 255, 0.3);
            }
            
            .form-input:disabled {
              background: rgba(255, 255, 255, 0.02);
              cursor: not-allowed;
            }
            
            select.form-input {
              cursor: pointer;
            }
            
            select.form-input option {
              background: #1a1a2e;
              color: white;
            }
            
            .user-modal .modal-footer {
              display: flex;
              justify-content: flex-end;
              gap: 12px;
              padding: 20px 24px;
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              margin: 0 -24px -24px;
              background: #1a1a2e !important;
            }
            
            .user-modal .btn {
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .user-modal .btn-secondary {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: white;
            }
            
            .user-modal .btn-secondary:hover {
              background: rgba(255, 255, 255, 0.1);
            }
            
            .user-modal .btn-cancel {
              background: transparent;
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: rgba(255, 255, 255, 0.8);
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .user-modal .btn-cancel:hover {
              background: rgba(255, 255, 255, 0.05);
              border-color: rgba(255, 255, 255, 0.4);
              color: white;
            }
            
            .user-modal .btn-primary {
              background: #1976D2;
              border: none;
              color: white;
            }
            
            .user-modal .btn-primary:hover {
              background: #1565C0;
            }
            
            @media (max-width: 540px) {
              .form-grid {
                grid-template-columns: 1fr;
              }
              .form-group.full-width {
                grid-column: span 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

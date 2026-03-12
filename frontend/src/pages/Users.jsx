import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';

export default function Users() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getUsers();
      console.log('Users response:', res);
      const data = res?.data?.data || res?.data || res || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
      console.log('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to fetch users. Make sure you are logged in as admin.');
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
          role: formData.role,
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

  const openModal = (item = null) => {
    setEditItem(item);
    // When editing, use existing role; when creating, default to salesman
    setFormData(item ? { 
      username: item.username, 
      password: '', 
      full_name: item.full_name || '', 
      email: item.email || '',
      role: item.role || 'salesman', 
      phone: item.phone || '' 
    } : { 
      username: '', 
      password: '', 
      full_name: '', 
      email: '',
      role: 'salesman', 
      phone: '' 
    });
    setShowModal(true);
  };

  const roles = ['system_admin', 'admin', 'manager', 'salesman', 'accountant', 'driver', 'loader'];

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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? t('EditUser') : t('AddUser')}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('Username')} *</label>
                  <input 
                    type="text" 
                    value={formData.username || ''}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required 
                    placeholder={t('Username')}
                    disabled={editItem}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Password')} {editItem ? '' : '*'}</label>
                  <input 
                    type="password" 
                    value={formData.password || ''}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editItem}
                    placeholder={editItem ? t('Optional') : t('Password')}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('FullName')} *</label>
                  <input 
                    type="text" 
                    value={formData.full_name || ''}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    required 
                    placeholder={t('FullName')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('Email')}</label>
                  <input 
                    type="email" 
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder={t('Email')}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('Role')} *</label>
                  <select 
                    value={formData.role || 'salesman'}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{formatRole(r)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('Phone')}</label>
                  <input 
                    type="text" 
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder={t('Phone')}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{editItem ? t('Save') : t('AddUser')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

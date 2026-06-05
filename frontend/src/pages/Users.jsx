import { useState, useEffect, useRef } from 'react';
import { authService, roleService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, User, Mail, Phone, Lock, Shield, Search, Camera, AlertCircle, CheckCircle, Save } from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

export default function Users() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleCounts, setRoleCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({});
  const [showInactive, setShowInactive] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, title: '', message: '' });
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);
  const checkTimers = useRef({});

  const checkField = async (field, value) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }
    setValidating(prev => ({ ...prev, [field]: true }));
    try {
      const excludeId = editItem?.id || undefined;
      const res = await authService.checkUnique(field, value, excludeId);
      if (!res.data.unique) {
        const labels = { username: 'Username', email: 'Email', phone: 'Phone' };
        setErrors(prev => ({ ...prev, [field]: `${labels[field]} already exists` }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, [field]: '' }));
    } finally {
      setValidating(prev => ({ ...prev, [field]: false }));
    }
  };

  const debouncedCheck = (field, value) => {
    if (checkTimers.current[field]) {
      clearTimeout(checkTimers.current[field]);
    }
    checkTimers.current[field] = setTimeout(() => {
      checkField(field, value);
    }, 500);
  };

  const handleBlur = (field) => (e) => {
    debouncedCheck(field, e.target.value);
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search, page, limit]);

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
      const res = await authService.getUsers({ page, limit, search });
      const data = res.data?.data || res.data || [];
      const totalVal = res.data?.pagination?.total || res.data?.total || data.length || 0;
      setUsers(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
      setRoleCounts(res.data?.roleCounts || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setUsers([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!formData.username?.trim()) nextErrors.username = 'Username is required';
    if (!editItem && (!formData.password || formData.password.length < 6)) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.full_name?.trim()) nextErrors.full_name = 'Full name is required';
    if (!formData.role_id) nextErrors.role_id = 'Role is required';

    const hasFieldErrors = Object.values({ ...errors, ...nextErrors }).some(msg => msg);
    if (hasFieldErrors) {
      setErrors(prev => ({ ...prev, ...nextErrors }));
      alert('Please fix the highlighted errors before submitting');
      return;
    }

    try {
      let userId;
      if (editItem) {
        const updateData = {
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone
        };
        if (editItem.role_id !== 1) {
          updateData.role_id = formData.role_id;
        }
        if (formData.password) {
          updateData.password = formData.password;
        }
        await authService.updateUser(editItem.id, updateData);
        userId = editItem.id;
      } else {
        const res = await authService.register(formData);
        userId = res.data?.user?.id;
      }

      if (profileFile && userId) {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('profile_picture', profileFile);
        const uploadRes = await authService.uploadProfilePicture(userId, formDataUpload);
        setUploading(false);
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      setUploading(false);
      console.error('Failed to save:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        setErrors(prev => ({ ...prev, ...apiErrors }));
        alert(Object.values(apiErrors)[0] || error.response?.data?.message || 'Failed to save');
        return;
      }
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save');
    }
  };

  const resizeImage = (file, maxSize) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          canvas.width = maxSize;
          canvas.height = maxSize;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, maxSize, maxSize);
          const offsetX = (maxSize - width) / 2;
          const offsetY = (maxSize - height) / 2;
          ctx.drawImage(img, offsetX, offsetY, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], 'profile_300x300.png', { type: 'image/png' }));
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const resized = await resizeImage(file, 300);
    setProfileFile(resized);
    setProfilePreview(URL.createObjectURL(resized));
  };


  const handleDelete = async (id, role_id) => {
    if (role_id === 1) return;
    if (user?.role === 'admin' && role_id === 2) return;
    setConfirmModal({
      show: true,
      action: () => deleteConfirmed(id),
      title: t('ConfirmDelete'),
      message: t('DeleteConfirmMessage')
    });
  };

  const deleteConfirmed = async (id) => {
    try {
      await authService.deleteUser(id);
      setConfirmModal({ show: false, action: null, title: '', message: '' });
      setToast(t('DeleteSuccess'));
      fetchUsers();
    } catch (error) {
      console.error('Delete error:', error);
      const msg = error.response?.data?.message || error.message || t('DeleteError');
      setToast(msg);
      setConfirmModal({ show: false, action: null, title: '', message: '' });
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.role_id === 1) return;
    if (targetUser.role_id === 2 && user?.role === 'admin') return;

    const newStatus = targetUser.is_active ? 0 : 1;
    const action = newStatus ? 'activate' : 'deactivate';

    setConfirmModal({
      show: true,
      action: () => toggleStatusConfirmed(targetUser.id, newStatus),
      title: newStatus ? t('ConfirmActivate') : t('ConfirmDeactivate'),
      message: t('ConfirmToggleUserMsg', { action: action })
    });
  };

  const toggleStatusConfirmed = async (id, newStatus) => {
    try {
      await authService.updateUser(id, { is_active: newStatus });
      setConfirmModal({ show: false, action: null, title: '', message: '' });
      setToast(newStatus ? t('UserActivated') : t('UserDeactivated'));
      fetchUsers();
    } catch (error) {
      setToast(error.response?.data?.message || 'Failed to update status');
      setConfirmModal({ show: false, action: null, title: '', message: '' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData({});
    setErrors({});
    setProfilePreview(null);
    setProfileFile(null);
  };

  const openModal = (item = null) => {
    setEditItem(item);
    setFormData({
      username: item?.username || '',
      password: '',
      full_name: item?.full_name || '',
      email: item?.email || '',
      role_id: item?.role_id || '',
      phone: item?.phone || ''
    });
    setProfilePreview(item?.profile_picture || null);
    setProfileFile(null);
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

  const displayUsers = users.filter(u => showInactive || u.is_active);
  const displayTotal = showInactive ? total : displayUsers.length;
  const displayTotalPages = Math.ceil(displayTotal / limit) || 1;
  const displayPage = Math.min(page, displayTotalPages);

  return (
    <div>
      <div className="page-header">
        <h2>{t('Users')}</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> {t('AddUser')}
        </button>
      </div>

      <div className="roles-summary" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {roles.map(r => (
          <div key={r.id} className="role-badge-display" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px',
            background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e0e0e0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <span className={`badge ${getRoleBadgeClass(r.name)}`}>{formatRole(r.name)}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted, #888)' }}>
              {(roleCounts.find(c => c.name === r.name)?.count || 0)} users
            </span>
          </div>
        ))}
      </div>

        <div className="card">
          <div className="card-header">
            <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder={t('SearchUsers')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={showInactive} onChange={e => { setShowInactive(e.target.checked); setPage(1); }} />
              Show inactive
            </label>
          </div>
          <div className="table-container">
            <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}></th>
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
                  <tr><td colSpan="8">{t('Loading')}</td></tr>
                ) : !users || displayUsers.length === 0 ? (
                  <tr><td colSpan="8" className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>{t('NoUsersFound')}</td></tr>
                ) : (
                  displayUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-avatar-cell">
                        {u.profile_picture ? (
                          <img src={u.profile_picture} alt="" className="user-avatar" />
                        ) : (
                          <div className="user-avatar-placeholder">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{u.username}</td>
                    <td>{u.full_name}</td>
                    <td>{u.email || '-'}</td>
                    <td><span className={`badge ${getRoleBadgeClass(u.role)}`}>{formatRole(u.role)}</span></td>
                    <td>{u.phone || '-'}</td>
                    <td>{u.is_active ? <span className="badge badge-success">{t('Active')}</span> : <span className="badge badge-danger">{t('Inactive')}</span>}</td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          className={`btn btn-sm ${u.is_active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.role_id === 1 || (user?.role === 'admin' && u.role_id === 2)}
                          title={
                            u.role_id === 1 ? 'Cannot change System Admin status' :
                            user?.role === 'admin' && u.role_id === 2 ? 'Cannot change Admin status' :
                            u.is_active ? 'Deactivate' : 'Activate'
                          }
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {!(user?.role === 'admin' && (u.role_id === 1 || u.role_id === 2)) && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(u)}>
                            <Pencil size={14} />
                          </button>
                        )}
                        {u.role_id !== 1 && !(user?.role === 'admin' && u.role_id === 2) && (
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDelete(u.id, u.role_id)}
                            title={t('Delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
          <span style={{ fontSize: '14px', marginLeft: 'auto' }}>
            {Math.min((displayPage - 1) * limit + limit, displayTotal)} of {displayTotal} entries
            {!showInactive && <span style={{ color: 'var(--text-muted, #888)', fontSize: '0.8rem' }}> ({users.filter(u => !u.is_active).length} inactive hidden)</span>}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={displayPage === 1}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '14px' }}>{t('Page')} {displayPage} / {displayTotalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(displayTotalPages, p + 1))} disabled={displayPage === displayTotalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, action: null, title: '', message: '' })}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={t('Confirm')}
        cancelText={t('Cancel')}
        confirmVariant="danger"
      />

      <Toast message={toast} onClose={() => setToast('')} />

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <User size={24} className="modal-header-icon" />
                <h3>{editItem ? t('EditUser') : t('AddUser')}</h3>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-section">
                <div className="form-section-title">{t('AccountInformation') || 'Account Information'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Username')} *</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input 
                        type="text" 
                        value={formData.username || ''}
                        onChange={e => { setFormData({...formData, username: e.target.value}); setErrors(prev => ({ ...prev, username: '' })); }}
                        onBlur={handleBlur('username')}
                        required 
                        placeholder={t('Username')}
                        className={`form-input ${errors.username ? 'input-error' : ''}`}
                        autoComplete="off"
                      />
                      {validating.username && <div className="field-spinner" />}
                      {errors.username && <AlertCircle size={16} className="field-error-icon" />}
                      {!errors.username && formData.username && !validating.username && <CheckCircle size={16} className="field-success-icon" />}
                    </div>
                    {errors.username && <span className="field-error-text">{errors.username}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>{t('Password')} {editItem ? `(${t('Optional')})` : '*'}</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon" />
                      <input 
                        type="password" 
                        value={formData.password || ''}
                        onChange={e => { setFormData({...formData, password: e.target.value}); setErrors(prev => ({ ...prev, password: '' })); }}
                        required={!editItem}
                        minLength={editItem ? undefined : 6}
                        placeholder={editItem ? 'Leave blank to keep current' : t('Password')}
                        className={`form-input ${errors.password ? 'input-error' : ''}`}
                        autoComplete="new-password"
                      />
                      {errors.password && <AlertCircle size={16} className="field-error-icon" />}
                    </div>
                    {errors.password && <span className="field-error-text">{errors.password}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('ProfilePhoto') || 'Profile Photo'}</div>
                <div className="profile-upload-wrapper">
                  <div className="profile-preview" onClick={() => fileInputRef.current?.click()}>
                    {profilePreview ? (
                      <img src={profilePreview} alt="Preview" />
                    ) : (
                      <div className="profile-placeholder">
                        <Camera size={28} />
                        <span>{t('ClickToUpload') || 'Click to upload'}</span>
                        <span style={{fontSize: '0.65rem', opacity: 0.6}}>300×300</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('PersonalInformation') || 'Personal Information'}</div>
                <div className="form-group">
                  <label>{t('FullName')} *</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      value={formData.full_name || ''}
                      onChange={e => { setFormData({...formData, full_name: e.target.value}); setErrors(prev => ({ ...prev, full_name: '' })); }}
                      required 
                      placeholder={t('FullName')}
                      className={`form-input ${errors.full_name ? 'input-error' : ''}`}
                      autoComplete="off"
                    />
                    {errors.full_name && <AlertCircle size={16} className="field-error-icon" />}
                  </div>
                  {errors.full_name && <span className="field-error-text">{errors.full_name}</span>}
                  </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Email')}</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input 
                        type="email" 
                        value={formData.email || ''}
                        onChange={e => { setFormData({...formData, email: e.target.value}); setErrors(prev => ({ ...prev, email: '' })); }}
                        onBlur={handleBlur('email')}
                        placeholder={t('Email')}
                        className={`form-input ${errors.email ? 'input-error' : ''}`}
                        autoComplete="off"
                      />
                      {validating.email && <div className="field-spinner" />}
                      {errors.email && <AlertCircle size={16} className="field-error-icon" />}
                      {!errors.email && formData.email && !validating.email && <CheckCircle size={16} className="field-success-icon" />}
                    </div>
                    {errors.email && <span className="field-error-text">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>{t('Phone')}</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input 
                        type="text" 
                        value={formData.phone || ''}
                        onChange={e => { setFormData({...formData, phone: e.target.value}); setErrors(prev => ({ ...prev, phone: '' })); }}
                        onBlur={handleBlur('phone')}
                        placeholder={t('Phone')}
                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                        autoComplete="off"
                      />
                      {validating.phone && <div className="field-spinner" />}
                      {errors.phone && <AlertCircle size={16} className="field-error-icon" />}
                      {!errors.phone && formData.phone && !validating.phone && <CheckCircle size={16} className="field-success-icon" />}
                    </div>
                    {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('Permissions') || 'Permissions'}</div>
                <div className="form-group">
                  <label>{t('Role')} *</label>
                  <div className="input-with-icon">
                    <Shield size={18} className="input-icon" />
                    <select 
                      value={formData.role_id || ''}
                      onChange={e => { setFormData({...formData, role_id: e.target.value}); setErrors(prev => ({ ...prev, role_id: '' })); }}
                      required
                      disabled={editItem?.role_id === 1}
                      className={`form-select ${errors.role_id ? 'input-error' : ''}`}
                      style={{ paddingLeft: '40px' }}
                    >
                      <option value="">{t('SelectRole') || 'Select role'}</option>
                      {roles
                        .filter(r => user?.role !== 'admin' || (r.id !== 1 && r.id !== 2))
                        .map(r => (
                        <option key={r.id} value={r.id}>{formatRole(r.name)}</option>
                      ))}
                    </select>
                    {errors.role_id && <AlertCircle size={16} className="field-error-icon" />}
                  </div>
                  {errors.role_id && <span className="field-error-text">{errors.role_id}</span>}
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {editItem ? t('Save') : t('AddUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

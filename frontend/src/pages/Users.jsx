import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';

export default function Users() {
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
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    if (username === 'admin') {
      alert('System admin cannot be deleted');
      return;
    }
    
    try {
      await authService.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const openModal = (item = null) => {
    setEditItem(item);
    // When editing, use existing role; when creating, default to salesman
    setFormData(item ? { 
      username: item.username, 
      password: '', 
      full_name: item.full_name || '', 
      role: item.role || 'salesman', 
      phone: item.phone || '' 
    } : { 
      username: '', 
      password: '', 
      full_name: '', 
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
        <h2>Users</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6">Loading...</td></tr>
            ) : !users || users.length === 0 ? (
              <tr><td colSpan="6">No users found</td></tr>
            ) : (
                users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td><span className={`badge ${getRoleBadgeClass(u.role)}`}>{formatRole(u.role)}</span></td>
                  <td>{u.phone}</td>
                  <td>{u.is_active ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openModal(u)}><Pencil size={14} /></button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={u.username === 'admin'}
                      title={u.username === 'admin' ? 'System admin cannot be deleted' : 'Delete'}
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
              <h3>{editItem ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input 
                    type="text" 
                    value={formData.username || ''}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required 
                    placeholder="Unique username"
                    disabled={editItem}
                  />
                </div>
                <div className="form-group">
                  <label>Password {editItem ? '' : '*'}</label>
                  <input 
                    type="password" 
                    value={formData.password || ''}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editItem}
                    placeholder={editItem ? "Leave blank to keep" : "Enter password"}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.full_name || ''}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    required 
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
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
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  value={formData.phone || ''}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

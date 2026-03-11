import { useState, useEffect } from 'react';
import { companyService } from '../services/api';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompanies();
      const data = res?.data?.data || res?.data || res || [];
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setCompanies([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await companyService.updateCompany(editItem.id, formData);
      } else {
        await companyService.createCompany(formData);
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({});
      fetchCompanies();
    } catch (error) {
      console.error('Failed to save:', error);
      alert(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      await companyService.deleteCompany(id);
      fetchCompanies();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const openModal = (item = null) => {
    setEditItem(item);
    setFormData(item || { name: '', code: '', contact_person: '', phone: '', address: '', due_limit: 0 });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Companies</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Due Limit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6">Loading...</td></tr>
            ) : !companies || companies.length === 0 ? (
              <tr><td colSpan="6">No companies found</td></tr>
            ) : (
              companies.map(c => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.contact_person}</td>
                  <td>{c.phone}</td>
                  <td>{c.due_limit}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => openModal(c)}><Pencil size={14} /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
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
              <h3>{editItem ? 'Edit Company' : 'Add Company'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                    placeholder="Company name"
                  />
                </div>
                <div className="form-group">
                  <label>Code</label>
                  <input 
                    type="text" 
                    value={formData.code || ''}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input 
                    type="text" 
                    value={formData.contact_person || ''}
                    onChange={e => setFormData({...formData, contact_person: e.target.value})}
                    placeholder="Contact person"
                  />
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
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={formData.address || ''}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Due Limit</label>
                <input 
                  type="number" 
                  value={formData.due_limit || 0}
                  onChange={e => setFormData({...formData, due_limit: parseFloat(e.target.value)})}
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

import { useState, useEffect } from 'react';
import { retailerService } from '../services/api';
import { Plus, Search, Edit, Trash2, Phone, MapPin } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
};

export default function Retailers() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', code: '', owner_name: '', phone: '', address: '', area: '', credit_limit: 0, due_limit: 0
  });

  useEffect(() => {
    fetchRetailers();
  }, [search]);

  const fetchRetailers = async () => {
    try {
      const response = await retailerService.getAll({ search, limit: 100 });
      setRetailers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch retailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await retailerService.update(formData.id, formData);
      } else {
        await retailerService.create(formData);
      }
      setShowModal(false);
      fetchRetailers();
      setFormData({ name: '', code: '', owner_name: '', phone: '', address: '', area: '', credit_limit: 0, due_limit: 0 });
    } catch (error) {
      alert('Failed to save retailer');
    }
  };

  const handleEdit = (retailer) => {
    setFormData(retailer);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this retailer?')) {
      try {
        await retailerService.delete(id);
        fetchRetailers();
      } catch (error) {
        alert('Failed to delete retailer');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Retailers</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Retailer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search retailers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Area</th>
                <th className="text-right">Credit Limit</th>
                <th className="text-right">Outstanding</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {retailers.map(retailer => (
                <tr key={retailer.id}>
                  <td>{retailer.code}</td>
                  <td>{retailer.name}</td>
                  <td>{retailer.owner_name || '-'}</td>
                  <td>{retailer.phone}</td>
                  <td>{retailer.area || '-'}</td>
                  <td className="text-right">{formatCurrency(retailer.credit_limit)}</td>
                  <td className="text-right">
                    <span className={retailer.outstanding_balance > 0 ? 'text-danger' : ''}>
                      {formatCurrency(retailer.outstanding_balance)}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(retailer)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(retailer.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? 'Edit Retailer' : 'Add Retailer'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Shop Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Area</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Credit Limit</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Limit</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.due_limit}
                      onChange={(e) => setFormData({ ...formData, due_limit: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

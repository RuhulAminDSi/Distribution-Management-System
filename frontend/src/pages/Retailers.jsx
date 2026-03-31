import { useState, useEffect } from 'react';
import { retailerService } from '../services/api';
import { useLanguage, formatCurrency } from '../context/LanguageContext';
import { Plus, Search, Edit, Trash2, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Retailers() {
  const { t, language } = useLanguage();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', code: '', owner_name: '', phone: '', address: '', area: '', credit_limit: 0, due_limit: 0
  });

  useEffect(() => {
    fetchRetailers();
  }, [search, page, limit]);

  const fetchRetailers = async () => {
    try {
      const response = await retailerService.getAll({ search, page, limit });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setRetailers(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch retailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        name: formData.name,
        code: formData.code || null,
        owner_name: formData.owner_name || null,
        phone: formData.phone,
        address: formData.address || null,
        area: formData.area || null,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        due_limit: parseFloat(formData.due_limit) || 0
      };
      
      if (formData.id) {
        await retailerService.update(formData.id, data);
      } else {
        await retailerService.create(data);
      }
      setShowModal(false);
      fetchRetailers();
      setFormData({ name: '', code: '', owner_name: '', phone: '', address: '', area: '', credit_limit: 0, due_limit: 0 });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save retailer';
      setError(msg);
      // Focus on error element
      setTimeout(() => document.getElementById('retailer-error')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleEdit = (retailer) => {
    setFormData(retailer);
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('ConfirmDelete'))) {
      try {
        await retailerService.delete(id);
        fetchRetailers();
      } catch (error) {
        alert(t('DeleteError'));
      }
    }
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Retailers')}</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); setFormData({ name: '', code: '', owner_name: '', phone: '', address: '', area: '', credit_limit: 0, due_limit: 0 }); }}>
          <Plus size={18} /> {t('AddRetailer')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('SearchRetailers')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('Code')}</th>
                <th>{t('Name')}</th>
                <th>{t('OwnerName')}</th>
                <th>{t('Phone')}</th>
                <th>{t('Area')}</th>
                <th className="text-right">{t('CreditLimit')}</th>
                <th className="text-right">{t('Outstanding')}</th>
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
                  <td className="text-right">{formatCurrency(retailer.credit_limit, language)}</td>
                  <td className="text-right">
                    <span className={retailer.outstanding_balance > 0 ? 'text-danger' : ''}>
                      {formatCurrency(retailer.outstanding_balance, language)}
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
              {Math.min((page - 1) * limit + limit, total)} of {total} entries
            </span>
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
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{formData.id ? t('EditRetailer') : t('AddRetailer')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div id="retailer-error" className="alert alert-danger" style={{ marginBottom: '16px' }}>
                    <strong>{t('Error')}: </strong>{error}
                    {error.includes('access denied') && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        {t('Error')}: Only admin or salesman can add/edit retailers.
                      </div>
                    )}
                  </div>
                )}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('ShopName')} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Code')}</label>
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
                    <label className="form-label">{t('OwnerName')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Phone')} *</label>
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
                  <label className="form-label">{t('Address')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Area')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('CreditLimit')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('DueLimit')}</label>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('Save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

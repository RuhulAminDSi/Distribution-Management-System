import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { companyService } from '../services/api';
import { X, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Building2, User, Phone, MapPin, CreditCard, Save, Search } from 'lucide-react';

export default function Companies() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [search, page, limit]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyService.getCompanies({ page, limit, search });
      const data = res.data?.data || res.data || [];
      const totalVal = res.data?.pagination?.total || res.data?.total || data.length || 0;
      setCompanies(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
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
    if (!confirm(t('ConfirmDelete'))) return;
    try {
      await companyService.deleteCompany(id);
      fetchCompanies();
    } catch (error) {
      alert(t('DeleteError'));
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
        <h2>{t('Companies')}</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> {t('AddCompany')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('SearchCompanies')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>{t('Code')}</th>
              <th>{t('Name')}</th>
              <th>{t('ContactPerson')}</th>
              <th>{t('Phone')}</th>
              <th>{t('DueLimit')}</th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6">{t('Loading')}</td></tr>
            ) : !companies || companies.length === 0 ? (
              <tr><td colSpan="6">{t('NoDataFound')}</td></tr>
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal company-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Building2 size={24} className="modal-header-icon" />
                <h3>{editItem ? t('EditCompany') : t('AddCompany')}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-section">
                <div className="form-section-title">{t('BasicInformation') || 'Basic Information'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('CompanyName')} *</label>
                    <div className="input-with-icon">
                      <Building2 size={18} className="input-icon" />
                      <input 
                        type="text" 
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required 
                        placeholder={t('CompanyName')}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('Code')}</label>
                    <div className="input-with-icon">
                      <span className="input-icon" style={{fontWeight: 'bold', fontSize: '14px'}}>#</span>
                      <input 
                        type="text" 
                        value={formData.code || ''}
                        onChange={e => setFormData({...formData, code: e.target.value})}
                        placeholder="Auto"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('ContactInformation') || 'Contact Information'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('ContactPerson')}</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input 
                        type="text" 
                        value={formData.contact_person || ''}
                        onChange={e => setFormData({...formData, contact_person: e.target.value})}
                        placeholder={t('ContactPerson')}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('Phone')}</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input 
                        type="text" 
                        value={formData.phone || ''}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder={t('Phone')}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('Address')}</label>
                  <div className="input-with-icon" style={{alignItems: 'flex-start'}}>
                    <MapPin size={18} className="input-icon" style={{marginTop: '12px'}} />
                    <textarea 
                      value={formData.address || ''}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder={t('Address')}
                      rows={2}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('CreditSettings') || 'Credit Settings'}</div>
                <div className="form-group">
                  <label>{t('DueLimit')}</label>
                  <div className="input-with-icon">
                    <CreditCard size={18} className="input-icon" />
                    <input 
                      type="number" 
                      value={formData.due_limit || 0}
                      onChange={e => setFormData({...formData, due_limit: parseFloat(e.target.value)})}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {editItem ? t('Update') : t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

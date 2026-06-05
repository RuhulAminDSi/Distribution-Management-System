import { useState, useEffect } from 'react';
import { retailerService } from '../services/api';
import { useLanguage, formatCurrency } from '../context/LanguageContext';
import { X, Plus, Search, Edit, Trash2, Phone, MapPin, ChevronLeft, ChevronRight, Save, User, CreditCard, Building2 } from 'lucide-react';
import { usePagination, useFormData, useAsyncError } from '../hooks';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

const initialFormData = {
  name: '', code: '', owner_name: '', phone: '', address: '', area: '', credit_limit: 0, due_limit: 0
};

export default function Retailers() {
  const { t, language } = useLanguage();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const pagination = usePagination(10);
  const form = useFormData(initialFormData);

  useEffect(() => {
    fetchRetailers();
  }, [search, pagination.page, pagination.limit]);

  const fetchRetailers = async () => {
    try {
      const response = await retailerService.getAll({ search, page: pagination.page, limit: pagination.limit });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setRetailers(data);
      pagination.setTotalCount(totalVal);
      pagination.setTotalPages(Math.ceil(totalVal / pagination.limit) || 1);
    } catch (error) {
      console.error('Failed to fetch retailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      const data = {
        name: form.formData.name,
        code: form.formData.code || null,
        owner_name: form.formData.owner_name || null,
        phone: form.formData.phone,
        address: form.formData.address || null,
        area: form.formData.area || null,
        credit_limit: parseFloat(form.formData.credit_limit) || 0,
        due_limit: parseFloat(form.formData.due_limit) || 0
      };
      
      if (form.formData.id) {
        await retailerService.update(form.formData.id, data);
      } else {
        await retailerService.create(data);
      }
      setShowModal(false);
      fetchRetailers();
      form.resetForm();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setFieldErrors(errors);
      } else {
        alert(err.response?.data?.message || 'Failed to save');
      }
    }
  };

  const handleEdit = (retailer) => {
    form.setFormData(retailer);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await retailerService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      setToast(t('DeleteSuccess'));
      fetchRetailers();
    } catch (error) {
      setToast(t('DeleteError'));
      setDeleteModal({ show: false, id: null });
    }
  };

  const openModal = (retailer = null) => {
    form.setFormData(retailer || initialFormData);
    setFieldErrors({});
    setShowModal(true);
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Retailers')}</h1>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); form.resetForm(); setFieldErrors({}); }}>
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
              {retailers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {t('NoDataFound')}
                  </td>
                </tr>
              ) : retailers.map(retailer => (
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
              value={pagination.limit} 
              onChange={(e) => pagination.setLimit(Number(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: '14px', marginLeft: 'auto' }}>
              {Math.min((pagination.page - 1) * pagination.limit + pagination.limit, pagination.totalCount)} of {pagination.totalCount} entries
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => pagination.prevPage()} disabled={pagination.page === 1}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '14px' }}>{t('Page')} {pagination.page} / {pagination.totalPages}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => pagination.nextPage()} disabled={pagination.page === pagination.totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={confirmDelete}
        title={t('ConfirmDelete')}
        message={t('DeleteConfirmMessage')}
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
        confirmVariant="danger"
      />

      <Toast message={toast} onClose={() => setToast('')} />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Building2 size={24} className="modal-header-icon" />
                <h3>{form.formData.id ? t('EditRetailer') : t('AddRetailer')}</h3>
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
                    <label>{t('ShopName')} *</label>
                    <div className="input-with-icon">
                      <Building2 size={18} className="input-icon" />
                      <input
                        type="text"
                        value={form.formData.name}
                        onChange={(e) => { form.updateField('name', e.target.value); setFieldErrors({...fieldErrors, name: null}); }}
                        required
                        placeholder={t('ShopName')}
                        className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
                      />
                    </div>
                    {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
                  </div>
                  <div className="form-group">
                    <label>{t('Code')}</label>
                    <div className="input-with-icon">
                      <span className="input-icon" style={{fontWeight: 'bold', fontSize: '14px'}}>#</span>
                      <input
                        type="text"
                        value={form.formData.code}
                        onChange={(e) => form.updateField('code', e.target.value)}
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
                    <label>{t('OwnerName')}</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        value={form.formData.owner_name}
                        onChange={(e) => form.updateField('owner_name', e.target.value)}
                        placeholder={t('OwnerName')}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('Phone')} *</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="text"
                        value={form.formData.phone}
                        onChange={(e) => { form.updateField('phone', e.target.value); setFieldErrors({...fieldErrors, phone: null}); }}
                        required
                        placeholder={t('Phone')}
                        className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`}
                      />
                    </div>
                    {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('Address')}</label>
                  <div className="input-with-icon" style={{alignItems: 'flex-start'}}>
                    <MapPin size={18} className="input-icon" style={{marginTop: '12px'}} />
                    <textarea
                      value={form.formData.address}
                      onChange={(e) => form.updateField('address', e.target.value)}
                      placeholder={t('Address')}
                      rows={2}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('Area')}</label>
                  <div className="input-with-icon">
                    <MapPin size={18} className="input-icon" />
                    <input
                      type="text"
                      value={form.formData.area}
                      onChange={(e) => form.updateField('area', e.target.value)}
                      placeholder={t('Area')}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('CreditSettings') || 'Credit Settings'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('CreditLimit')}</label>
                    <div className="input-with-icon">
                      <CreditCard size={18} className="input-icon" />
                      <input
                        type="number"
                        value={form.formData.credit_limit}
                        onChange={(e) => form.updateField('credit_limit', e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('DueLimit')}</label>
                    <div className="input-with-icon">
                      <CreditCard size={18} className="input-icon" />
                      <input
                        type="number"
                        value={form.formData.due_limit}
                        onChange={(e) => form.updateField('due_limit', e.target.value)}
                        placeholder="0.00"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

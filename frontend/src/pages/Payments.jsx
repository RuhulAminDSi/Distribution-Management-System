import { useState, useEffect } from 'react';
import { paymentService, retailerService } from '../services/api';
import { useLanguage, formatCurrency, formatDate } from '../context/LanguageContext';
import { Plus, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function Payments() {
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [retailers, setRetailers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    retailer_id: '', amount: 0, payment_method: 'cash',
    reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchPayments();
    fetchRetailers();
  }, [search, page, limit]);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getAll({ page, limit, search });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setPayments(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRetailers = async () => {
    try {
      const response = await retailerService.getAll({ limit: 100 });
      setRetailers(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch retailers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    const errors = {};
    if (!formData.retailer_id || formData.retailer_id === '') {
      errors.retailer_id = t('RetailerRequired');
    }
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = t('AmountRequired');
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      const paymentData = {
        retailer_id: parseInt(formData.retailer_id),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        reference_no: formData.reference_no || null,
        notes: formData.notes || null,
        payment_date: formData.payment_date
      };
      const result = await paymentService.create(paymentData);
      setShowModal(false);
      fetchPayments();
      fetchRetailers();
      setFormData({
        retailer_id: '', amount: 0, payment_method: 'cash',
        reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
      });
      setFieldErrors({});
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        setFieldErrors(errors);
      } else {
        alert(error.response?.data?.message || error.message || 'Failed to record payment');
      }
    }
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Payments')}</h1>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setFieldErrors({}); setFormData({ retailer_id: '', amount: 0, payment_method: 'cash', reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: '' }); }}>
          <Plus size={18} /> {t('RecordPayment')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('SearchPayments')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('PaymentNo')}</th>
                <th>{t('Date')}</th>
                <th>{t('Retailer')}</th>
                <th className="text-right">{t('Amount')}</th>
                <th>{t('PaymentMethod')}</th>
                <th>{t('CollectedBy')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.payment_no}</td>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td>{payment.retailer_name}</td>
                  <td className="text-right text-success">{formatCurrency(payment.amount, language)}</td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.collected_by_name}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" title={t('View')}>
                        <Eye size={14} />
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
              <h2 className="modal-title">{t('RecordPayment')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t('Retailer')} *</label>
                  <select
                    className={`form-select ${fieldErrors.retailer_id ? 'input-error' : ''}`}
                    value={formData.retailer_id}
                    onChange={(e) => { setFormData({ ...formData, retailer_id: e.target.value }); setFieldErrors({...fieldErrors, retailer_id: null}); }}
                    required
                  >
                    <option value="">{t('SelectRetailerPayment')}</option>
                    {retailers.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} - Due: {formatCurrency(r.outstanding_balance || 0, language)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.retailer_id && <div className="field-error">{fieldErrors.retailer_id}</div>}
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('Amount')} *</label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-input ${fieldErrors.amount ? 'input-error' : ''}`}
                      value={formData.amount}
                      onChange={(e) => { setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 }); setFieldErrors({...fieldErrors, amount: null}); }}
                      required
                    />
                    {fieldErrors.amount && <div className="field-error">{fieldErrors.amount}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('PaymentMethod')}</label>
                    <select
                      className="form-select"
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                      <option value="cash">{t('Cash')}</option>
                      <option value="bank">{t('Bank')}</option>
                      <option value="mobile_banking">{t('MobileBanking')}</option>
                      <option value="cheque">{t('Cheque')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('Date')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('ReferenceNo')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.reference_no}
                      onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Notes')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('RecordPayment')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { paymentService, retailerService } from '../services/api';
import { useLanguage, formatCurrency } from '../context/LanguageContext';
import { Plus, Search } from 'lucide-react';

export default function Payments() {
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [retailers, setRetailers] = useState([]);
  const [formData, setFormData] = useState({
    retailer_id: '', amount: 0, payment_method: 'cash',
    reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchRetailers();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getAll({ limit: 50 });
      setPayments(response.data?.data || []);
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
    if (!formData.retailer_id || !formData.amount) {
      alert(t('SelectRetailer') + ' ' + t('EnterAmount'));
      return;
    }

    console.log('Submitting payment:', formData);
    
    try {
      const paymentData = {
        retailer_id: parseInt(formData.retailer_id),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        reference_no: formData.reference_no || null,
        notes: formData.notes || null,
        payment_date: formData.payment_date
      };
      console.log('Payment data:', paymentData);
      const result = await paymentService.create(paymentData);
      console.log('Payment created:', result);
      setShowModal(false);
      fetchPayments();
      fetchRetailers();
      setFormData({
        retailer_id: '', amount: 0, payment_method: 'cash',
        reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
      });
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert(error.response?.data?.message || error.message || 'Failed to record payment');
    }
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Payments')}</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t('RecordPayment')}
        </button>
      </div>

      <div className="card">
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
              <h2 className="modal-title">{t('RecordPayment')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t('Retailer')} *</label>
                  <select
                    className="form-select"
                    value={formData.retailer_id}
                    onChange={(e) => setFormData({ ...formData, retailer_id: e.target.value })}
                    required
                  >
                    <option value="">{t('SelectRetailer')}</option>
                    {retailers.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} - Due: {formatCurrency(r.outstanding_balance || 0, language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('Amount')} *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
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

import { useState, useEffect } from 'react';
import { invoiceService, retailerService, productService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber } from '../context/LanguageContext';
import { Plus, Search, Eye, Printer } from 'lucide-react';

export default function Sales() {
  const { t, language } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    retailer_id: '', invoice_date: new Date().toISOString().split('T')[0],
    discount_percent: 0, paid_amount: 0, notes: '', items: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchRetailers();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getAll({ limit: 50 });
      setInvoices(response.data.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRetailers = async () => {
    try {
      const response = await retailerService.getAll({ limit: 100 });
      setRetailers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch retailers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 100 });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1, rate: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].rate = product.dealer_price;
      }
    }
    
    newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discount = (subtotal * formData.discount_percent) / 100;
    return { subtotal, discount, total: subtotal - discount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.retailer_id) {
      setError(t('SelectRetailer'));
      return;
    }
    
    if (formData.items.length === 0) {
      setError(t('AddItem'));
      return;
    }

    const validItems = formData.items.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      setError(t('SelectProduct'));
      return;
    }

    try {
      await invoiceService.create(formData);
      setShowModal(false);
      fetchInvoices();
      setFormData({
        retailer_id: '', invoice_date: new Date().toISOString().split('T')[0],
        discount_percent: 0, paid_amount: 0, notes: '', items: []
      });
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create invoice';
      setError(errorMsg);
    }
  };

  const { subtotal, discount, total } = calculateTotal();

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Sales')}</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); }}>
          <Plus size={18} /> {t('NewInvoice')}
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('InvoiceNo')}</th>
                <th>{t('Date')}</th>
                <th>{t('Time')}</th>
                <th>{t('Retailer')}</th>
                <th className="text-right">{t('Total')}</th>
                <th className="text-right">{t('Paid')}</th>
                <th className="text-right">{t('Due')}</th>
                <th>{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_no}</td>
                  <td>{formatDate(invoice.invoice_date)}</td>
                  <td>{formatDateTime(invoice.created_at)}</td>
                  <td>{invoice.retailer_name}</td>
<td className="text-right">{formatCurrency(invoice.total_amount, language)}</td>
                      <td className="text-right">{formatCurrency(invoice.paid_amount, language)}</td>
                      <td className="text-right">{formatCurrency(invoice.due_amount, language)}</td>
                  <td>
                    <span className={`badge badge-${invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'danger'}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('NewInvoice')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                    <strong>{t('Error')}: </strong>{error}
                    {error.includes('Credit limit exceeded') && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        {t('Error')}: {t('CreditLimitExceeded')}
                      </div>
                    )}
                    {error.includes('Insufficient stock') && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        {t('Error')}: {t('InsufficientStock')}
                      </div>
                    )}
                    {error.includes('Product not found') && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        {t('Error')}: {t('SelectProduct')}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid-2">
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
                        <option key={r.id} value={r.id}>{r.name} - {r.phone}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Date')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Products')}</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'flex-end' }}>
                      <select
                        className="form-select"
                        style={{ flex: 2 }}
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      >
                        <option value="">{t('SelectProduct')}</option>
                        {products.filter(p => p.stock_quantity > 0).map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {formatNumber(p.stock_quantity, language)})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder={t('Quantity')}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <input
                        type="number"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder={t('Price')}
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder={t('Amount')}
                        value={item.amount || 0}
                        readOnly
                      />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ {t('AddItem')}</button>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('DiscountPercent')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('PaidAmount')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="card" style={{ background: 'var(--background)', marginTop: '16px' }}>
                  <div className="card-body">
                    <div className="flex justify-between mb-2">
                      <span>{t('Subtotal')}:</span>
                    <span>{formatCurrency(subtotal, language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>- {formatCurrency(discount, language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{formatCurrency(total, language)}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group mt-4">
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
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setError(''); }}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('CreateInvoice')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

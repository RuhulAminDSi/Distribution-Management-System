import { useState, useEffect } from 'react';
import { invoiceService, retailerService, productService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber, formatDate, formatDateTime } from '../context/LanguageContext';
import { Plus, Search, Eye, Printer, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { usePagination, useFormData, useAsyncError, useSalesForm } from '../hooks';

const initialFormData = {
  retailer_id: '', invoice_date: new Date().toISOString().split('T')[0],
  discount_percent: 0, paid_amount: 0, notes: ''
};

export default function Sales() {
  const { t, language } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const pagination = usePagination(10);
  const form = useFormData(initialFormData);
  const { error, setError, handleAsyncError, clearError } = useAsyncError();
  const salesForm = useSalesForm();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchRetailers();
    fetchProducts();
  }, [search, pagination.page, pagination.limit]);

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getAll({ page: pagination.page, limit: pagination.limit, search });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setInvoices(data);
      pagination.setTotalCount(totalVal);
      pagination.setTotalPages(Math.ceil(totalVal / pagination.limit) || 1);
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

  const handleAddItem = () => {
    salesForm.addItem();
  };

  const handleUpdateItem = (index, field, value) => {
    salesForm.updateItem(index, field, value, products);
  };

  const handleRemoveItem = (index) => {
    salesForm.removeItem(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.formData.retailer_id) {
      setError(t('SelectRetailer'));
      return;
    }
    
    if (salesForm.items.length === 0) {
      setError(t('AddItem'));
      return;
    }

    const validItems = salesForm.items.filter(item => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      setError(t('SelectProduct'));
      return;
    }

    try {
      const submitData = { ...form.formData, items: salesForm.items };
      await invoiceService.create(submitData);
      setShowModal(false);
      fetchInvoices();
      form.resetForm();
      salesForm.resetItems();
      setError('');
    } catch (err) {
      handleAsyncError(err);
    }
  };

  const { subtotal, discount, total } = salesForm.calculateTotals(form.formData.discount_percent);

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Sales')}</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); clearError(); }}>
          <Plus size={18} /> {t('NewInvoice')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('SearchSales')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
                <tr>
                <th>{t('InvoiceNo')}</th>
                <th>{t('Date')}</th>
                <th>{t('Retailer')}</th>
                <th className="text-right">{t('Total')}</th>
                <th className="text-right">{t('Paid')}</th>
                <th className="text-right">{t('DueLabel')}</th>
                <th>{t('Status')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_no}</td>
                  <td>{formatDate(invoice.invoice_date)}</td>
                  <td>{invoice.retailer_name}</td>
                  <td className="text-right">{formatCurrency(invoice.total_amount, language)}</td>
                  <td className="text-right">{formatCurrency(invoice.paid_amount, language)}</td>
                  <td className="text-right">{formatCurrency(invoice.due_amount, language)}</td>
                  <td>
                    <span className={`badge badge-${invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'danger'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" title={t('View')}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" title={t('Print')}>
                        <Printer size={14} />
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
                      value={form.formData.retailer_id}
                      onChange={(e) => form.updateField('retailer_id', e.target.value)}
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
                      value={form.formData.invoice_date}
                      onChange={(e) => form.updateField('invoice_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Products')}</label>
                  {salesForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'flex-end' }}>
                      <select
                        className="form-select"
                        style={{ flex: 2 }}
                        value={item.product_id}
                        onChange={(e) => handleUpdateItem(index, 'product_id', e.target.value)}
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
                        onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <input
                        type="number"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder={t('Price')}
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder={t('Amount')}
                        value={item.amount || 0}
                        readOnly
                      />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(index)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>+ {t('AddItem')}</button>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('DiscountPercent')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.formData.discount_percent}
                      onChange={(e) => form.updateField('discount_percent', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('PaidAmount')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.formData.paid_amount}
                      onChange={(e) => form.updateField('paid_amount', parseFloat(e.target.value) || 0)}
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
                    value={form.formData.notes}
                    onChange={(e) => form.updateField('notes', e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); clearError(); }}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('CreateInvoice')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

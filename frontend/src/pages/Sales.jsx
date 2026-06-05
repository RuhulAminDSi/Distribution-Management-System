import { useState, useEffect } from 'react';
import { invoiceService, retailerService, productService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber, formatDate, formatDateTime } from '../context/LanguageContext';
import DatePicker from '../components/common/DatePicker';
import { X, Plus, Search, Eye, Printer, ChevronLeft, ChevronRight, Edit, Save, Building2, ShoppingCart, Percent, FileText, Receipt, DollarSign } from 'lucide-react';
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
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
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

  const handleView = async (id) => {
    try {
      const response = await invoiceService.getById(id);
      setViewInvoice(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    }
  };

  const handlePrint = (invoice) => {
    const printHtml = () => {
      const statusBn = invoice.status === 'paid' ? 'পরিশোধিত' : invoice.status === 'partial' ? 'আংশিক' : 'বকেয়া';
      const itemsHtml = invoice.items.map(item => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.product_name || item.product_code}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.rate, language)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.amount, language)}</td>
        </tr>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>ইনভয়েস ${invoice.invoice_no}</title>
        <style>
          body { font-family: 'Noto Sans Bengali', 'Arial Unicode MS', Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1a56db; padding-bottom: 15px; }
          .header .company-name { font-size: 20px; font-weight: bold; color: #1a56db; margin: 5px 0; }
          .header .invoice-label { font-size: 14px; color: #6b7280; margin: 2px 0; }
          .header .invoice-no { font-size: 16px; font-weight: bold; color: #111827; margin: 2px 0; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info div { width: 48%; }
          .info h3 { margin: 0 0 5px 0; font-size: 13px; color: #1a56db; letter-spacing: 0.5px; }
          .info p { margin: 3px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1a56db; color: #fff; padding: 10px 8px; border: 1px solid #1a56db; text-align: center; font-size: 13px; letter-spacing: 0.5px; }
          td { padding: 8px; border: 1px solid #d1d5db; font-size: 14px; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .totals { width: 300px; margin-left: auto; }
          .totals td { padding: 6px 8px; border: none; }
          .totals tr td:first-child { font-weight: 500; color: #6b7280; }
          .totals .grand-total td { font-weight: bold; font-size: 16px; border-top: 2px solid #1a56db; padding-top: 8px; color: #111827; }
          .totals .grand-total td:last-child { color: #1a56db; }
          .note-box { margin-top: 20px; padding: 12px; background: #f0f5ff; border-left: 4px solid #1a56db; border-radius: 4px; }
          .note-box p { margin: 0; font-size: 13px; color: #374151; }
          .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-partial { background: #fef3c7; color: #92400e; }
          .status-due { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 0; } }
        </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">রুহানা এন্টারপ্রাইজ</div>
            <div class="invoice-label">ইনভয়েস</div>
            <div class="invoice-no">${invoice.invoice_no}</div>
            <p style="margin: 2px 0; color: #6b7280; font-size: 13px;">তারিখ: ${formatDate(invoice.invoice_date, language)}</p>
          </div>
          <div class="info">
            <div>
              <h3>প্রাপক</h3>
              <p><strong>${invoice.retailer_name}</strong></p>
              <p>${invoice.retailer_phone || ''}</p>
              <p>${invoice.retailer_address || ''}</p>
            </div>
            <div style="text-align: right;">
              <h3>ইনভয়েস তথ্য</h3>
              <p><strong>স্ট্যাটাস:</strong> <span class="status-badge status-${invoice.status}">${statusBn}</span></p>
              <p><strong>তৈরি করেছেন:</strong> ${invoice.created_by_name || ''}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>পণ্য</th>
                <th>পরিমাণ</th>
                <th>দর</th>
                <th>মোট</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <table class="totals">
            <tr><td>সাবটোটাল</td><td style="text-align: right;">${formatCurrency(invoice.subtotal, language)}</td></tr>
            ${invoice.discount_amount > 0 ? `<tr><td>ডিসকাউন্ট (${invoice.discount_percent}%)</td><td style="text-align: right; color: #dc2626;">-${formatCurrency(invoice.discount_amount, language)}</td></tr>` : ''}
            <tr class="grand-total"><td>সর্বমোট</td><td style="text-align: right;">${formatCurrency(invoice.total_amount, language)}</td></tr>
            <tr><td>পরিশোধিত</td><td style="text-align: right; color: #059669;">${formatCurrency(invoice.paid_amount, language)}</td></tr>
            <tr><td>বাকি</td><td style="text-align: right; color: #dc2626;">${formatCurrency(invoice.due_amount, language)}</td></tr>
          </table>
          ${invoice.notes ? `<div class="note-box"><p><strong>নোট:</strong> ${invoice.notes}</p></div>` : ''}
          <div class="footer">আপনার ব্যবসার জন্য ধন্যবাদ!</div>
        </body>
        </html>
      `;
    };

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.write(printHtml());
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    }, 250);
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
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {t('NoDataFound')}
                  </td>
                </tr>
              ) : invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_no}</td>
<td>{formatDate(invoice.invoice_date, language)}</td>
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
                      <button className="btn btn-secondary btn-sm" title={t('View')} onClick={() => handleView(invoice.id)}>
                        <Eye size={14} />
                      </button>
<button className="btn btn-secondary btn-sm" title={t('Print')} onClick={() => handlePrint(invoice)}>
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
              <div className="modal-title-wrapper">
                <Receipt size={24} className="modal-header-icon" />
                <h3>{t('NewInvoice')}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
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
              <div className="form-section">
                <div className="form-section-title">{t('InvoiceInformation') || 'Invoice Information'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Retailer')} *</label>
                    <div className="input-with-icon">
                      <Building2 size={18} className="input-icon" />
                      <select
                        className="form-select"
                        value={form.formData.retailer_id}
                        onChange={(e) => form.updateField('retailer_id', e.target.value)}
                        required
                        style={{ paddingLeft: '40px' }}
                      >
                        <option value="">{t('SelectRetailer')}</option>
                        {retailers.map(r => (
                          <option key={r.id} value={r.id}>{r.name} - {r.phone}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('Date')}</label>
                    <DatePicker
                      value={form.formData.invoice_date}
                      onChange={(v) => form.updateField('invoice_date', v)}
                      language={language}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('Products')}</div>
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
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                  <Plus size={14} /> {t('AddItem')}
                </button>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('PaymentDetails') || 'Payment Details'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('DiscountPercent')}</label>
                    <div className="input-with-icon">
                      <Percent size={18} className="input-icon" />
                      <input
                        type="number"
                        className="form-input"
                        value={form.formData.discount_percent}
                        onChange={(e) => form.updateField('discount_percent', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('PaidAmount')}</label>
                    <div className="input-with-icon">
                      <DollarSign size={18} className="input-icon" />
                      <input
                        type="number"
                        className="form-input"
                        value={form.formData.paid_amount}
                        onChange={(e) => form.updateField('paid_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
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
                    <div className="flex justify-between" style={{ fontWeight: 700 }}>
                      <span>{t('Total')}:</span>
                      <span>{formatCurrency(total, language)}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('Notes')}</label>
                  <div className="input-with-icon" style={{alignItems: 'flex-start'}}>
                    <FileText size={18} className="input-icon" style={{marginTop: '12px'}} />
                    <input
                      type="text"
                      className="form-input"
                      value={form.formData.notes}
                      onChange={(e) => form.updateField('notes', e.target.value)}
                      placeholder={t('Notes')}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); clearError(); }}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {t('CreateInvoice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewInvoice && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <FileText size={24} className="modal-header-icon" />
                <h3>{t('Invoice')} #{viewInvoice.invoice_no}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowViewModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="card" style={{ background: 'var(--background)', marginBottom: '16px' }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>{t('Retailer')}</p>
                    <p style={{ margin: '2px 0', fontWeight: 600 }}>{viewInvoice.retailer_name}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>{viewInvoice.retailer_phone}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>{viewInvoice.retailer_address}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>{t('Date')}</p>
                    <p style={{ margin: '2px 0', fontWeight: 600 }}>{formatDate(viewInvoice.invoice_date, language)}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>{t('CreatedBy')}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>{viewInvoice.created_by_name}</p>
                  </div>
                </div>
              </div>

              <table className="table" style={{ marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th>{t('Product')}</th>
                    <th className="text-center">{t('Quantity')}</th>
                    <th className="text-right">{t('Price')}</th>
                    <th className="text-right">{t('Amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInvoice.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.rate, language)}</td>
                      <td className="text-right">{formatCurrency(item.amount, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>{t('Subtotal')}</span>
                  <span style={{ fontSize: '14px' }}>{formatCurrency(viewInvoice.subtotal, language)}</span>
                </div>
                {viewInvoice.discount_amount > 0 && (
                  <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>{t('Discount')} ({viewInvoice.discount_percent}%)</span>
                    <span style={{ fontSize: '14px', color: '#e74c3c' }}>-{formatCurrency(viewInvoice.discount_amount, language)}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ marginBottom: '4px', fontWeight: 700, fontSize: '16px', borderTop: '2px solid var(--border)', paddingTop: '8px' }}>
                  <span>{t('Total')}</span>
                  <span>{formatCurrency(viewInvoice.total_amount, language)}</span>
                </div>
                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#27ae60' }}>{t('Paid')}</span>
                  <span style={{ fontSize: '14px', color: '#27ae60' }}>{formatCurrency(viewInvoice.paid_amount, language)}</span>
                </div>
                <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#e74c3c' }}>{t('DueLabel')}</span>
                  <span style={{ fontSize: '14px', color: '#e74c3c' }}>{formatCurrency(viewInvoice.due_amount, language)}</span>
                </div>
              </div>

              {viewInvoice.notes && (
                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--background)', borderRadius: '4px' }}>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{t('Notes')}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{viewInvoice.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => { handlePrint(viewInvoice); setShowViewModal(false); }}>
                <Printer size={16} style={{ marginRight: '6px' }} /> {t('Print')}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>{t('Close')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

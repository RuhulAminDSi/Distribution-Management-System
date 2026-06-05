import { useState, useEffect } from 'react';
import { orderService, companyService, productService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber, formatDate } from '../context/LanguageContext';
import DatePicker from '../components/common/DatePicker';
import { X, Plus, Search, Eye, Printer, ChevronLeft, ChevronRight, Save, Building2, ShoppingCart, FileText } from 'lucide-react';
import { usePagination } from '../hooks';

export default function Orders() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    company_id: '', order_date: new Date().toISOString().split('T')[0],
    notes: '', items: [{ product_id: '', quantity: 1, rate: 0 }]
  });

  const pagination = usePagination(10);

  useEffect(() => {
    fetchOrders();
    fetchCompanies();
    fetchProducts();
  }, [search, pagination.page, pagination.limit]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll({ page: pagination.page, limit: pagination.limit, search });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setOrders(data);
      pagination.setTotalCount(totalVal);
      pagination.setTotalPages(Math.ceil(totalVal / pagination.limit) || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      let data = response.data;
      if (data && data.data) data = data.data;
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 100 });
      let data = response.data;
      if (data && data.data) data = data.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await orderService.getById(id);
      setViewOrder(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  const handlePrint = (order) => {
    const statusBn = order.status === 'received' ? 'গৃহীত' : 'বিচারাধীন';
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.product_name || item.product_code}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.rate, language)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.amount, language)}</td>
        ${order.status === 'received' ? `<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.received_quantity}</td>` : ''}
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>অর্ডার ${order.po_no}</title>
      <style>
        body { font-family: 'Noto Sans Bengali', 'Arial Unicode MS', Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1a56db; padding-bottom: 15px; }
        .header .company-name { font-size: 20px; font-weight: bold; color: #1a56db; margin: 5px 0; }
        .header .order-label { font-size: 14px; color: #6b7280; margin: 2px 0; }
        .header .order-no { font-size: 16px; font-weight: bold; color: #111827; margin: 2px 0; }
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
        .status-received { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        @media print { body { padding: 0; } }
      </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">রুহানা এন্টারপ্রাইজ</div>
          <div class="order-label">পারচেস অর্ডার</div>
          <div class="order-no">${order.po_no}</div>
          <p style="margin: 2px 0; color: #6b7280; font-size: 13px;">তারিখ: ${formatDate(order.order_date, language)}</p>
        </div>
        <div class="info">
          <div>
            <h3>সরবরাহকারী</h3>
            <p><strong>${order.company_name}</strong></p>
            <p>${order.company_phone || ''}</p>
            <p>${order.company_address || ''}</p>
            ${order.contact_person ? `<p>যোগাযোগ: ${order.contact_person}</p>` : ''}
          </div>
          <div style="text-align: right;">
            <h3>অর্ডার তথ্য</h3>
            <p><strong>স্ট্যাটাস:</strong> <span class="status-badge status-${order.status}">${statusBn}</span></p>
            <p><strong>তৈরি করেছেন:</strong> ${order.created_by_name || ''}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>পণ্য</th>
              <th>পরিমাণ</th>
              <th>দর</th>
              <th>মোট</th>
              ${order.status === 'received' ? '<th>গৃহীত</th>' : ''}
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <table class="totals">
          <tr class="grand-total"><td>সর্বমোট</td><td style="text-align: right;">${formatCurrency(order.total_amount, language)}</td></tr>
          ${order.paid_amount > 0 ? `<tr><td>পরিশোধিত</td><td style="text-align: right; color: #059669;">${formatCurrency(order.paid_amount, language)}</td></tr>` : ''}
          ${order.due_amount > 0 ? `<tr><td>বাকি</td><td style="text-align: right; color: #dc2626;">${formatCurrency(order.due_amount, language)}</td></tr>` : ''}
        </table>
        ${order.notes ? `<div class="note-box"><p><strong>নোট:</strong> ${order.notes}</p></div>` : ''}
        <div class="footer">আপনার ব্যবসার জন্য ধন্যবাদ!</div>
      </body>
      </html>
    `;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 500);
    }, 250);
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
        newItems[index].rate = product.purchase_price;
      }
    }
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderService.create(formData);
      setShowModal(false);
      fetchOrders();
      setFormData({
        company_id: '', order_date: new Date().toISOString().split('T')[0],
        notes: '', items: [{ product_id: '', quantity: 1, rate: 0 }]
      });
    } catch (error) {
      alert(t('SaveError'));
    }
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('PurchaseOrders')}</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t('NewPurchaseOrder')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('Search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('OrderNo')}</th>
                <th>{t('OrderDate')}</th>
                <th>{t('Company')}</th>
                <th className="text-right">{t('Total')}</th>
                <th>{t('CreatedBy')}</th>
                <th className="text-center">{t('ItemsCount')}</th>
                <th>{t('Status')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {t('NoDataFound')}
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.po_no}</td>
                    <td>{formatDate(order.order_date, language)}</td>
                    <td>{order.company_name}</td>
                    <td className="text-right">{formatCurrency(order.total_amount, language)}</td>
                    <td>{order.created_by_name}</td>
                    <td className="text-center">{order.items_count || '-'}</td>
                    <td>
                      <span className={`badge badge-${order.status === 'received' ? 'success' : 'warning'}`}>
                        {order.status === 'received' ? t('Received') : t('Pending')}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" title={t('View')} onClick={() => handleView(order.id)}>
                        <Eye size={14} />
                      </button>
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
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <ShoppingCart size={24} className="modal-header-icon" />
                <h3>{t('NewPurchaseOrder')}</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-section">
                <div className="form-section-title">{t('OrderInformation') || 'Order Information'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Company')} *</label>
                    <div className="input-with-icon">
                      <Building2 size={18} className="input-icon" />
                      <select
                        className="form-select"
                        value={formData.company_id}
                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                        required
                        style={{ paddingLeft: '40px' }}
                      >
                        <option value="">{t('SelectCompany')}</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('OrderDate')}</label>
                    <DatePicker
                      value={formData.order_date}
                      onChange={(v) => setFormData({ ...formData, order_date: v })}
                      language={language}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('Products')}</div>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'flex-end' }}>
                    <select
                      className="form-select"
                      style={{ flex: 2 }}
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    >
                      <option value="">{t('SelectProduct')}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
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
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
                  <Plus size={14} /> {t('AddItem')}
                </button>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>{t('Notes')}</label>
                  <div className="input-with-icon" style={{alignItems: 'flex-start'}}>
                    <FileText size={18} className="input-icon" style={{marginTop: '12px'}} />
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('Notes')}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {t('NewPurchaseOrder')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewOrder && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <FileText size={24} className="modal-header-icon" />
                <h3>{t('OrderDetails')} - {viewOrder.po_no}</h3>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowViewModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="card" style={{ background: 'var(--background)', marginBottom: '16px' }}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>{t('Company')}</p>
                    <p style={{ margin: '2px 0', fontWeight: 600 }}>{viewOrder.company_name}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>{viewOrder.company_phone}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>{viewOrder.company_address}</p>
                    {viewOrder.contact_person && (
                      <p style={{ margin: '2px 0', fontSize: '13px' }}>{t('ContactPerson')}: {viewOrder.contact_person}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>{t('OrderDate')}</p>
                    <p style={{ margin: '2px 0', fontWeight: 600 }}>{formatDate(viewOrder.order_date, language)}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}>{t('CreatedBy')}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px' }}>{viewOrder.created_by_name}</p>
                    <p style={{ margin: '6px 0 0 0' }}>
                      <span className={`badge badge-${viewOrder.status === 'received' ? 'success' : 'warning'}`}>
                        {viewOrder.status === 'received' ? t('Received') : t('Pending')}
                      </span>
                    </p>
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
                    {viewOrder.status === 'received' && <th className="text-center">{t('ReceivedQuantity')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {viewOrder.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td className="text-center">{formatNumber(item.quantity, language)}</td>
                      <td className="text-right">{formatCurrency(item.rate, language)}</td>
                      <td className="text-right">{formatCurrency(item.amount, language)}</td>
                      {viewOrder.status === 'received' && <td className="text-center">{formatNumber(item.received_quantity, language)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div className="flex justify-between" style={{ marginBottom: '4px', fontWeight: 700, fontSize: '16px' }}>
                  <span>{t('Total')}</span>
                  <span>{formatCurrency(viewOrder.total_amount, language)}</span>
                </div>
                {viewOrder.paid_amount > 0 && (
                  <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#27ae60' }}>{t('Paid')}</span>
                    <span style={{ fontSize: '14px', color: '#27ae60' }}>{formatCurrency(viewOrder.paid_amount, language)}</span>
                  </div>
                )}
                {viewOrder.due_amount > 0 && (
                  <div className="flex justify-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#e74c3c' }}>{t('DueLabel')}</span>
                    <span style={{ fontSize: '14px', color: '#e74c3c' }}>{formatCurrency(viewOrder.due_amount, language)}</span>
                  </div>
                )}
              </div>

              {viewOrder.notes && (
                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--background)', borderRadius: '4px' }}>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{t('Notes')}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{viewOrder.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => { handlePrint(viewOrder); setShowViewModal(false); }}>
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
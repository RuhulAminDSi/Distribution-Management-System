import { useState, useEffect } from 'react';
import { stockService, companyService, productService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber, formatDateTime } from '../context/LanguageContext';
import { Plus, ArrowDownToLine, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Stock() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [formData, setFormData] = useState({
    company_id: '', order_date: new Date().toISOString().split('T')[0],
    notes: '', items: [{ product_id: '', quantity: 1, rate: 0 }]
  });

  useEffect(() => {
    fetchHistory();
    fetchPurchaseOrders();
    fetchCompanies();
    fetchProducts();
  }, [page, limit]);

  const fetchHistory = async () => {
    try {
      const response = await stockService.getHistory({ page, limit });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setHistory(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await stockService.getPurchaseOrders({ page, limit });
      setPurchaseOrders(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
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
      await stockService.createPurchaseOrder(formData);
      setShowModal(false);
      fetchPurchaseOrders();
      setFormData({
        company_id: '', order_date: new Date().toISOString().split('T')[0],
        notes: '', items: [{ product_id: '', quantity: 1, rate: 0 }]
      });
    } catch (error) {
      alert(t('SaveError'));
    }
  };

  const handleReceive = async (id) => {
    if (confirm(t('Received') + '?')) {
      try {
        await stockService.receivePurchaseOrder(id);
        fetchPurchaseOrders();
      } catch (error) {
        alert(t('Error'));
      }
    }
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Stock')}</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t('NewPurchaseOrder')}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>
          {t('StockHistory')}
        </button>
        <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('orders')}>
          {t('PurchaseOrders')}
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Product')}</th>
                  <th>{t('Type')}</th>
                  <th className="text-right">{t('Quantity')}</th>
                  <th>{t('Reference')}</th>
                  <th>{t('CollectedBy')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map(log => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.created_at)}</td>
                    <td>{log.product_name}</td>
                    <td>
                      <span className={`badge badge-${log.type === 'IN' ? 'success' : log.type === 'OUT' ? 'danger' : 'warning'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="text-right">{formatNumber(log.quantity, language)}</td>
                    <td>{log.reference_type}</td>
                    <td>{log.created_by_name}</td>
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
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('OrderNo')}</th>
                  <th>{t('OrderDate')}</th>
                  <th>{t('Company')}</th>
                  <th className="text-right">{t('Total')}</th>
                  <th>{t('Status')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id}>
                    <td>{po.po_no}</td>
                    <td>{po.order_date}</td>
                    <td>{po.company_name}</td>
                    <td className="text-right">{formatCurrency(po.total_amount, language)}</td>
                    <td>
                      <span className={`badge badge-${po.status === 'received' ? 'success' : po.status === 'pending' ? 'warning' : 'danger'}`}>
                        {po.status}
                      </span>
                    </td>
                    <td>
                      {po.status === 'pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleReceive(po.id)}>
                          <ArrowDownToLine size={14} /> {t('Received')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('NewPurchaseOrder')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('Company')} *</label>
                    <select
                      className="form-select"
                      value={formData.company_id}
                      onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                      required
                    >
                      <option value="">{t('SelectCompany')}</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('OrderDate')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.order_date}
                      onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
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
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ {t('AddItem')}</button>
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
                <button type="submit" className="btn btn-primary">{t('NewPurchaseOrder')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

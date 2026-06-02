import { useState, useEffect } from 'react';
import { orderService, companyService, productService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber, formatDate } from '../context/LanguageContext';
import { Plus, Search } from 'lucide-react';

export default function Orders() {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    company_id: '', order_date: new Date().toISOString().split('T')[0],
    notes: '', items: [{ product_id: '', quantity: 1, rate: 0 }]
  });

  useEffect(() => {
    fetchOrders();
    fetchCompanies();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAll();
      const data = response.data || [];
      setOrders(data);
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

  const filteredOrders = orders.filter(order =>
    !searchTerm ||
    order.po_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Orders')}</h1>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <th>{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)' }}>
                    {t('NoDataFound')}
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.po_no}</td>
                    <td>{formatDate(order.order_date, language)}</td>
                    <td>{order.company_name}</td>
                    <td className="text-right">{formatCurrency(order.total_amount, language)}</td>
                    <td>
                      <span className={`badge badge-${order.status === 'received' ? 'success' : 'warning'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="stock-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2>{t('NewPurchaseOrder')}</h2>
                <button type="button" className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
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

      <style>{`
        .stock-modal {
          background: var(--surface);
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .stock-modal .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--primary);
          border-radius: 16px 16px 0 0;
        }
        .stock-modal .modal-header h2 {
          color: white;
          margin: 0;
          font-size: 1.25rem;
        }
        .stock-modal .modal-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stock-modal .modal-close:hover {
          background: rgba(255,255,255,0.3);
        }
        .stock-modal .modal-body {
          padding: 24px;
        }
        .stock-modal .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

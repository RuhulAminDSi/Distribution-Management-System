import { useState, useEffect } from 'react';
import { stockService, companyService, productService } from '../services/api';
import { Plus, ArrowDownToLine } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
};

export default function Stock() {
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '', order_date: new Date().toISOString().split('T')[0],
    notes: '', items: [{ product_id: '', quantity: 1, rate: 0 }]
  });

  useEffect(() => {
    fetchHistory();
    fetchPurchaseOrders();
    fetchCompanies();
    fetchProducts();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await stockService.getHistory({});
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await stockService.getPurchaseOrders({});
      setPurchaseOrders(response.data);
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
      alert('Failed to create purchase order');
    }
  };

  const handleReceive = async (id) => {
    if (confirm('Receive this stock?')) {
      try {
        await stockService.receivePurchaseOrder(id);
        fetchPurchaseOrders();
      } catch (error) {
        alert('Failed to receive stock');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stock Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Purchase Order
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>
          Stock History
        </button>
        <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('orders')}>
          Purchase Orders
        </button>
      </div>

      {activeTab === 'history' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th className="text-right">Quantity</th>
                  <th>Reference</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {history.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.product_name}</td>
                    <td>
                      <span className={`badge badge-${log.type === 'IN' ? 'success' : log.type === 'OUT' ? 'danger' : 'warning'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="text-right">{log.quantity}</td>
                    <td>{log.reference_type}</td>
                    <td>{log.created_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>PO No</th>
                  <th>Date</th>
                  <th>Company</th>
                  <th className="text-right">Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id}>
                    <td>{po.po_no}</td>
                    <td>{po.order_date}</td>
                    <td>{po.company_name}</td>
                    <td className="text-right">{formatCurrency(po.total_amount)}</td>
                    <td>
                      <span className={`badge badge-${po.status === 'received' ? 'success' : po.status === 'pending' ? 'warning' : 'danger'}`}>
                        {po.status}
                      </span>
                    </td>
                    <td>
                      {po.status === 'pending' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleReceive(po.id)}>
                          <ArrowDownToLine size={14} /> Receive
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
              <h2 className="modal-title">Purchase Order</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <select
                      className="form-select"
                      value={formData.company_id}
                      onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.order_date}
                      onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Products</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2" style={{ alignItems: 'flex-end' }}>
                      <select
                        className="form-select"
                        style={{ flex: 2 }}
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <input
                        type="number"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create PO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

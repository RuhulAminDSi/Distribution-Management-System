import { useState, useEffect } from 'react';
import { invoiceService, retailerService, productService } from '../services/api';
import { Plus, Search, Eye, Printer } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
};

export default function Sales() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    retailer_id: '', invoice_date: new Date().toISOString().split('T')[0],
    discount_percent: 0, paid_amount: 0, notes: '', items: []
  });

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
    if (!formData.retailer_id || formData.items.length === 0) {
      alert('Please select retailer and add items');
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
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  const { subtotal, discount, total } = calculateTotal();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales / Invoices</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Invoice
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Retailer</th>
                <th className="text-right">Total</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_no}</td>
                  <td>{invoice.invoice_date}</td>
                  <td>{invoice.retailer_name}</td>
                  <td className="text-right">{formatCurrency(invoice.total_amount)}</td>
                  <td className="text-right">{formatCurrency(invoice.paid_amount)}</td>
                  <td className="text-right">{formatCurrency(invoice.due_amount)}</td>
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
              <h2 className="modal-title">New Invoice</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Retailer *</label>
                    <select
                      className="form-select"
                      value={formData.retailer_id}
                      onChange={(e) => setFormData({ ...formData, retailer_id: e.target.value })}
                      required
                    >
                      <option value="">Select Retailer</option>
                      {retailers.map(r => (
                        <option key={r.id} value={r.id}>{r.name} - {r.phone}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
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
                        {products.filter(p => p.stock_quantity > 0).map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
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
                      <input
                        type="text"
                        className="form-input"
                        style={{ flex: 1 }}
                        placeholder="Amount"
                        value={item.amount || 0}
                        readOnly
                      />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Discount %</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Paid Amount</label>
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
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Discount:</span>
                      <span>- {formatCurrency(discount)}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontWeight: '600', fontSize: '18px' }}>
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group mt-4">
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
                <button type="submit" className="btn btn-primary">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

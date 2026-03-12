import { useState, useEffect } from 'react';
import { productService, companyService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return 'BDT 0';
  return 'BDT ' + new Intl.NumberFormat('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', code: '', category_id: '', company_id: '',
    purchase_price: '', dealer_price: '', mrp: '', stock_quantity: 0,
    low_stock_alert: 10, unit: 'piece', pack_size: 1
  });

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ search, limit: 100 });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await productService.update(formData.id, formData);
      } else {
        await productService.create(formData);
      }
      setShowModal(false);
      fetchProducts();
      setFormData({
        name: '', code: '', category_id: '', company_id: '',
        purchase_price: '', dealer_price: '', mrp: '', stock_quantity: 0,
        low_stock_alert: 10, unit: 'piece', pack_size: 1
      });
    } catch (error) {
      alert(t('SaveError'));
    }
  };

  const handleEdit = (product) => {
    setFormData({ ...product, company_id: product.company_id || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('ConfirmDelete'))) {
      try {
        await productService.delete(id);
        fetchProducts();
      } catch (error) {
        alert(t('DeleteError'));
      }
    }
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Products')}</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t('AddProduct')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('Search') + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('Code')}</th>
                <th>{t('Name')}</th>
                <th>{t('Company')}</th>
                <th className="text-right">{t('PurchasePrice')}</th>
                <th className="text-right">{t('DealerPrice')}</th>
                <th className="text-right">{t('MRP')}</th>
                <th className="text-right">{t('Stock')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.company_name || '-'}</td>
                  <td className="text-right">{formatCurrency(product.purchase_price)}</td>
                  <td className="text-right">{formatCurrency(product.dealer_price)}</td>
                  <td className="text-right">{formatCurrency(product.mrp)}</td>
                  <td className="text-right">
                    {product.stock_quantity <= product.low_stock_alert ? (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> {product.stock_quantity}
                      </span>
                    ) : product.stock_quantity}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(product)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
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
              <h2 className="modal-title">{formData.id ? t('EditProduct') : t('AddProduct')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('ProductName')} *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Code')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('Company')}</label>
                  <select
                    className="form-select"
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  >
                    <option value="">{t('SelectCompany')}</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">{t('PurchasePrice')} *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('DealerPrice')} *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.dealer_price}
                      onChange={(e) => setFormData({ ...formData, dealer_price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('MRP')} *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">{t('Stock')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('LowStockAlert')}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.low_stock_alert}
                      onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Unit')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('Save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

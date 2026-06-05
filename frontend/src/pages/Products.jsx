import { useState, useEffect } from 'react';
import { productService, companyService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber, formatDate } from '../context/LanguageContext';
import DatePicker from '../components/common/DatePicker';
import { X, Plus, Search, Edit, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Save, Package, Building2, DollarSign, Box } from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast from '../components/common/Toast';

export default function Products() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [formData, setFormData] = useState({
    name: '', code: '', category_id: '', company_id: '',
    purchase_price: '', dealer_price: '', mrp: '', stock_quantity: 0,
    low_stock_alert: 10, unit: 'piece', pack_size: 1, expiry_date: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
  }, [search, page, limit]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ search, page, limit });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setProducts(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      const data = response.data?.data || response.data || [];
      setCompanies(Array.isArray(data) ? data : []);
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
        low_stock_alert: 10, unit: 'piece', pack_size: 1, expiry_date: ''
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
    setDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await productService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      setToast({ show: true, message: t('DeleteSuccess') });
      fetchProducts();
    } catch (error) {
      setToast({ show: true, message: t('DeleteError') });
      setDeleteModal({ show: false, id: null });
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
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('SearchProducts')}
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
                <th className="text-right">{t('StockLabel')}</th>
                <th>{t('ExpiryDate')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center" style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {t('NoDataFound')}
                  </td>
                </tr>
              ) : products.map(product => {
                const isExpired = product.expiry_date && new Date(product.expiry_date) <= new Date() && product.stock_quantity > 0;
                const isExpiringSoon = product.expiry_date && !isExpired && new Date(product.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && product.stock_quantity > 0;
                return (
                <tr key={product.id}>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.company_name || '-'}</td>
                  <td className="text-right">{formatCurrency(product.purchase_price, language)}</td>
                  <td className="text-right">{formatCurrency(product.dealer_price, language)}</td>
                  <td className="text-right">{formatCurrency(product.mrp, language)}</td>
                  <td className="text-right">
                    {product.stock_quantity <= product.low_stock_alert ? (
                      <span className="text-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> {formatNumber(product.stock_quantity, language)}
                      </span>
                    ) : formatNumber(product.stock_quantity, language)}
                  </td>
                  <td>
                    {product.expiry_date ? (
                      <span className={isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}>
                        {formatDate(product.expiry_date, language)}
                      </span>
                    ) : '-'}
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
              )})}
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
            <span style={{ fontSize: '14px', marginLeft: 'auto' }}>
              {Math.min((page - 1) * limit + limit, total)} of {total} entries
            </span>
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

      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={confirmDelete}
        title={t('ConfirmDelete')}
        message={t('DeleteConfirmMessage')}
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
        confirmVariant="danger"
      />

      <Toast message={toast.message} onClose={() => setToast({ show: false, message: '' })} />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Package size={24} className="modal-header-icon" />
                <h3>{formData.id ? t('EditProduct') : t('AddProduct')}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-section">
                <div className="form-section-title">{t('BasicInformation') || 'Basic Information'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('ProductName')} *</label>
                    <div className="input-with-icon">
                      <Package size={18} className="input-icon" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder={t('ProductName')}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('Code')}</label>
                    <div className="input-with-icon">
                      <span className="input-icon" style={{fontWeight: 'bold', fontSize: '14px'}}>#</span>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Auto"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('Company')}</label>
                  <div className="input-with-icon">
                    <Building2 size={18} className="input-icon" />
                    <select
                      className="form-select"
                      value={formData.company_id}
                      onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                      style={{ paddingLeft: '40px' }}
                    >
                      <option value="">{t('SelectCompany')}</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('Pricing') || 'Pricing'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('PurchasePrice')} *</label>
                    <div className="input-with-icon">
                      <DollarSign size={18} className="input-icon" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        required
                        placeholder="0.00"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('DealerPrice')} *</label>
                    <div className="input-with-icon">
                      <DollarSign size={18} className="input-icon" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.dealer_price}
                        onChange={(e) => setFormData({ ...formData, dealer_price: e.target.value })}
                        required
                        placeholder="0.00"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('MRP')} *</label>
                  <div className="input-with-icon">
                    <DollarSign size={18} className="input-icon" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      required
                      placeholder="0.00"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">{t('Inventory') || 'Inventory'}</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('StockLabel')}</label>
                    <div className="input-with-icon">
                      <Box size={18} className="input-icon" />
                      <input
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        placeholder="0"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('LowStockAlert')}</label>
                    <div className="input-with-icon">
                      <AlertTriangle size={18} className="input-icon" />
                      <input
                        type="number"
                        value={formData.low_stock_alert}
                        onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })}
                        placeholder="10"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Unit')}</label>
                    <div className="input-with-icon">
                      <Box size={18} className="input-icon" />
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="piece"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('ExpiryDate')}</label>
                    <DatePicker
                      value={formData.expiry_date || ''}
                      onChange={(v) => setFormData({ ...formData, expiry_date: v })}
                      language={language}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

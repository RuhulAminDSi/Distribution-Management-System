import { Plus, Search, AlertTriangle, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoProducts() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('products')}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add Product</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search products..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Company</th>
                <th className="text-right">MRP</th>
                <th className="text-right">Dealer Price</th>
                <th className="text-right">Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PR-001</td>
                <td>Premium Rice 25kg</td>
                <td>Agrani</td>
                <td className="text-right">৳ 1,800</td>
                <td className="text-right">৳ 1,650</td>
                <td className="text-right">500</td>
                <td><span className="badge badge-success">In Stock</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>PR-002</td>
                <td>Sugar 1kg</td>
                <td>Maa Enterprise</td>
                <td className="text-right">৳ 120</td>
                <td className="text-right">৳ 105</td>
                <td className="text-right">
                  <span className="text-danger flex items-center gap-1">
                    <AlertTriangle size={12} /> 50
                  </span>
                </td>
                <td><span className="badge badge-warning">Low Stock</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pagination-footer">
          <div className="pagination-left">
            <label>Show</label>
            <select className="form-select sm" defaultValue="10">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="pagination-info">1-2 of 245 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 25</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

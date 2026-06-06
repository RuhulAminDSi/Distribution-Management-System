import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoCompanies() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('companies')}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add Company</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search companies..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Agrani Food Products</td>
                <td>+880 1234-567890</td>
                <td>agrani@example.com</td>
                <td>Dhaka</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Maa Enterprise</td>
                <td>+880 1234-567891</td>
                <td>maa@example.com</td>
                <td>Chittagong</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
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
            <span className="pagination-info">1-2 of 12 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 2</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

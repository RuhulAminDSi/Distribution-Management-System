import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoRetailers() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('retailers')}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add Retailer</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search retailers..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Address</th>
                <th className="text-right">Credit Limit</th>
                <th className="text-right">Due</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>City Store</td>
                <td>Md. Rahim</td>
                <td>+880 1711-111111</td>
                <td>Dhaka</td>
                <td className="text-right">৳ 50,000</td>
                <td className="text-right text-danger">৳ 12,500</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Market Plus</td>
                <td>Md. Karim</td>
                <td>+880 1722-222222</td>
                <td>Chittagong</td>
                <td className="text-right">৳ 75,000</td>
                <td className="text-right text-danger">৳ 8,200</td>
                <td><span className="badge badge-success">Active</span></td>
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
            <span className="pagination-info">1-2 of 500 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 50</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

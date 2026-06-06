import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoUsers() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('users')}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add User</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search users..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="user-avatar-sm">A</div>
                    Admin User
                  </div>
                </td>
                <td>admin</td>
                <td><span className="badge badge-info">Admin</span></td>
                <td>admin@dms.com</td>
                <td>+880 1234-567890</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="user-avatar-sm">S</div>
                    Sales Manager
                  </div>
                </td>
                <td>sales_mgr</td>
                <td><span className="badge badge-primary">Manager</span></td>
                <td>sales@dms.com</td>
                <td>+880 1234-567891</td>
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
            <span className="pagination-info">1-2 of 25 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 3</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

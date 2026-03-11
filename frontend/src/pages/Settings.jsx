import { useState } from 'react';
import { Shield, Key, Clock, Database } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`tab ${activeTab === 'access' ? 'active' : ''}`}
          onClick={() => setActiveTab('access')}
        >
          Role Access
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>General Settings</h3>
          
          <div className="settings-section">
            <div className="settings-item">
              <div className="settings-icon">
                <Database size={20} />
              </div>
              <div className="settings-info">
                <h4>Database</h4>
                <p>MySQL - dms_db</p>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-icon">
                <Clock size={20} />
              </div>
              <div className="settings-info">
                <h4>Last Sync</h4>
                <p>Real-time</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: 'var(--background)', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '10px' }}>System Info</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Distribution Management System v1.0.0<br/>
              Backend: Node.js + Express + MySQL<br/>
              Frontend: React + Vite
            </p>
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Role Access Control</h3>
          
          <div className="role-grid">
            {[
              { role: 'system_admin', description: 'Full system access - cannot be deleted', permissions: ['All'] },
              { role: 'admin', description: 'Full access to all features', permissions: ['All'] },
              { role: 'manager', description: 'Manage sales and inventory', permissions: ['Products', 'Retailers', 'Sales', 'Payments', 'Reports'] },
              { role: 'salesman', description: 'Create sales and manage retailers', permissions: ['Retailers', 'Sales', 'Payments'] },
              { role: 'accountant', description: 'Manage payments and reports', permissions: ['Payments', 'Reports'] },
              { role: 'driver', description: 'View deliveries', permissions: ['View Only'] },
              { role: 'loader', description: 'Stock management', permissions: ['Stock'] }
            ].map(item => (
              <div key={item.role} className="role-card">
                <div className="role-header">
                  <Shield size={20} />
                  <span>{item.role}</span>
                </div>
                <p>{item.description}</p>
                <div className="role-permissions">
                  {item.permissions.map(p => (
                    <span key={p} className="badge badge-info">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { Globe, Database, Bell } from 'lucide-react';

export default function GeneralSettings({ language, setLanguage, t }) {
  return (
    <div className="settings-content">
      <div className="settings-section">
        <div className="section-header">
          <Globe size={20} />
          <h3>{t('Language') || 'Language Settings'}</h3>
        </div>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Default Language</h4>
              <p>{t('DefaultLanguage')}</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="form-input"
              style={{ width: '150px' }}
            >
              <option value="bn">বাংলা</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <Database size={20} />
          <h3>{t('SystemInformation')}</h3>
        </div>
        <div className="settings-card">
          <div className="system-info-grid">
            <div className="info-box">
              <span className="info-label">Database</span>
              <span className="info-value">Postgres - dms_db</span>
            </div>
            <div className="info-box">
              <span className="info-label">Backend</span>
              <span className="info-value">Node.js + Express</span>
            </div>
            <div className="info-box">
              <span className="info-label">Frontend</span>
              <span className="info-value">React + Vite</span>
            </div>
            <div className="info-box">
              <span className="info-label">Version</span>
              <span className="info-value">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <Bell size={20} />
          <h3>{t('Notifications')}</h3>
        </div>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <h4>{t('LowStockAlerts')}</h4>
              <p>{t('LowStockAlerts')}</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>{t('ExpiryAlerts')}</h4>
              <p>{t('ExpiryAlerts')}</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>{t('PaymentReminders')}</h4>
              <p>{t('PaymentReminders')}</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

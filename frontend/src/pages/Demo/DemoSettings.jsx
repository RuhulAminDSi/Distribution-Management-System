import { Building2, Package, Users, CreditCard, Bell, Settings, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoSettings() {
  const { t } = useLanguage();

  const settingsItems = [
    { icon: Building2, name: 'Company Settings', desc: 'Manage company information and preferences' },
    { icon: Package, name: 'Product Settings', desc: 'Configure categories, units, and variants' },
    { icon: Users, name: 'Retailer Settings', desc: 'Set credit limits, payment terms' },
    { icon: CreditCard, name: 'Payment Settings', desc: 'Configure payment methods and banks' },
    { icon: Bell, name: 'Notification Settings', desc: 'Manage alerts and notifications' },
    { icon: Settings, name: 'System Settings', desc: 'General system configuration' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('settings')}</h1>
      </div>
      <div className="settings-grid">
        {settingsItems.map((s, i) => (
          <div key={i} className="settings-card">
            <div className="settings-icon">
              <s.icon size={20} />
            </div>
            <div className="settings-info">
              <h4>{s.name}</h4>
              <p>{s.desc}</p>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

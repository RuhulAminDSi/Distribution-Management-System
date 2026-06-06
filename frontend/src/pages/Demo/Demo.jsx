import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Warehouse,
  FileText,
  Settings,
  Building2,
  UserCircle,
  User,
  ArrowRight,
  Circle,
  LogOut,
  Key,
  ChevronDown,
  Bell,
  Globe,
  Home,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DemoDashboard from './DemoDashboard';
import DemoCompanies from './DemoCompanies';
import DemoProducts from './DemoProducts';
import DemoRetailers from './DemoRetailers';
import DemoSales from './DemoSales';
import DemoPayments from './DemoPayments';
import DemoStock from './DemoStock';
import DemoReports from './DemoReports';
import DemoUsers from './DemoUsers';
import DemoSettings from './DemoSettings';
import './Demo.css';

export default function Demo() {
  const { t, language, setLanguage } = useLanguage();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const labels = {
      dashboard: t('dashboard'), companies: t('companies'), products: t('products'),
      retailers: t('retailers'), sales: t('sales'), payments: t('payments'),
      stock: t('stock'), reports: t('reports'), users: t('users'), settings: t('settings'),
    };
    const pageLabel = labels[activePage] || t('dashboard');
    document.title = `${pageLabel} - DMS`;
  }, [activePage, t]);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'companies', icon: Building2, label: t('companies') },
    { id: 'products', icon: Package, label: t('products') },
    { id: 'retailers', icon: Users, label: t('retailers') },
    { id: 'sales', icon: ShoppingCart, label: t('sales') },
    { id: 'payments', icon: CreditCard, label: t('payments') },
    { id: 'stock', icon: Warehouse, label: t('stock') },
    { id: 'reports', icon: FileText, label: t('reports') },
    { id: 'users', icon: UserCircle, label: t('users') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <DemoDashboard />;
      case 'companies': return <DemoCompanies />;
      case 'products': return <DemoProducts />;
      case 'retailers': return <DemoRetailers />;
      case 'sales': return <DemoSales />;
      case 'payments': return <DemoPayments />;
      case 'stock': return <DemoStock />;
      case 'reports': return <DemoReports />;
      case 'users': return <DemoUsers />;
      case 'settings': return <DemoSettings />;
      default: return <DemoDashboard />;
    }
  };

  return (
    <div className="demo-page">
      <header className="demo-topnav">
        <div className="demo-topnav-left">
          <button className="demo-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className={`demo-hamburger ${sidebarOpen ? 'vertical' : 'horizontal'}`}>
              <span></span><span></span><span></span>
            </span>
          </button>
          <Link to="/" className="demo-topnav-brand">
            <div className="demo-brand-icon">
              <Package size={20} />
            </div>
            <span className="demo-brand-text">
              <span className="demo-live-dot"><Circle size={8} fill="#10b981" /></span>
              DMS
            </span>
          </Link>
          <div className="demo-page-title-wrapper">
            <span className="demo-breadcrumb-sep">/</span>
            <span className="demo-current-page">
              {navItems.find(n => n.id === activePage)?.label}
            </span>
          </div>
        </div>

        <div className="demo-topnav-right">
          <div className="demo-topnav-actions">
            <Link to="/" className="demo-nav-icon-btn demo-home-btn">
              <Home size={18} />
            </Link>
            <button className="demo-nav-icon-btn demo-lang-btn" onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}>
              <Globe size={18} />
              <span className="demo-lang-label">{language === 'en' ? 'BN' : 'EN'}</span>
            </button>
            <div className="demo-notif-wrapper">
              <button className="demo-nav-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                <span className="demo-notif-badge">3</span>
              </button>
              {notifOpen && (
                <div className="demo-notif-dropdown">
                  <div className="demo-notif-header">
                    <span>{t('notifications')}</span>
                    <button className="demo-mark-read">{t('markAllRead')}</button>
                  </div>
                  <div className="demo-notif-list">
                    <div className="demo-notif-item unread">
                      <div className="demo-notif-icon bg-danger"><Package size={14} /></div>
                      <div className="demo-notif-content">
                        <p>Low stock alert for 5 products</p>
                        <span className="demo-notif-time">5 min ago</span>
                      </div>
                    </div>
                    <div className="demo-notif-item unread">
                      <div className="demo-notif-icon bg-success"><Users size={14} /></div>
                      <div className="demo-notif-content">
                        <p>New retailer registered</p>
                        <span className="demo-notif-time">1 hour ago</span>
                      </div>
                    </div>
                    <div className="demo-notif-item">
                      <div className="demo-notif-icon bg-warning"><Bell size={14} /></div>
                      <div className="demo-notif-content">
                        <p>Payment due tomorrow</p>
                        <span className="demo-notif-time">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="demo-notif-footer">{t('viewAll')}</div>
                </div>
              )}
            </div>
          </div>

          <div className="demo-user-section">
            <button className="demo-user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="demo-user-avatar">A</div>
              <div className="demo-user-info">
                <span className="demo-user-name">Admin User</span>
                <span className="demo-user-role">{t('admin')}</span>
              </div>
              <ChevronDown size={16} className={`demo-chevron ${dropdownOpen ? 'rotate' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="demo-user-dropdown">
                <div className="demo-dropdown-header">
                  <div className="demo-dropdown-avatar">A</div>
                  <div className="demo-dropdown-user-info">
                    <span className="demo-dropdown-name">Admin User</span>
                    <span className="demo-dropdown-email">admin@dms.com</span>
                  </div>
                </div>
                <div className="demo-dropdown-divider"></div>
                <button className="demo-dropdown-item"><User size={16} /> <span>{t('myProfile')}</span></button>
                <button className="demo-dropdown-item"><Key size={16} /> <span>{t('changePassword')}</span></button>
                <div className="demo-dropdown-divider"></div>
                <button className="demo-dropdown-item logout" disabled style={{ cursor: 'default', opacity: 0.7 }}><LogOut size={16} /> <span>{t('logout')}</span></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className="demo-sidebar-new" style={{ width: sidebarOpen ? '240px' : '70px' }}>
        <nav className="demo-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`demo-sidebar-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="demo-main-content" style={{ marginLeft: sidebarOpen ? '240px' : '70px' }}>
        <div className="demo-page-content">
          <div className="demo-page-banner">
            <span>{t('demoNote')}</span>
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
              {t('getStarted')} <ArrowRight size={14} />
            </Link>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

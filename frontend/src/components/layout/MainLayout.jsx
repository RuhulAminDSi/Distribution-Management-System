import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/api';
import TopNav from './TopNav';
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
  Key,
  Bell,
  MessageSquare
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'Dashboard', permission: 'dashboard_view' },
  { path: '/dashboard/notifications', icon: Bell, labelKey: 'Notifications', permission: null },
  { path: '/companies', icon: Building2, labelKey: 'Companies', permission: 'companies_view' },
  { path: '/products', icon: Package, labelKey: 'Products', permission: 'products_view' },
  { path: '/retailers', icon: Users, labelKey: 'Retailers', permission: 'retailers_view' },
  { path: '/orders', icon: ShoppingCart, labelKey: 'Orders', permission: 'orders_view' },
  { path: '/sales', icon: ShoppingCart, labelKey: 'Sales', permission: 'sales_view' },
  { path: '/payments', icon: CreditCard, labelKey: 'Payments', permission: 'payments_view' },
  { path: '/stock', icon: Warehouse, labelKey: 'StockNav', permission: 'stock_view' },
  { path: '/reports', icon: FileText, labelKey: 'Reports', permission: 'reports_view' },
  { path: '/users', icon: UserCircle, labelKey: 'Users', permission: 'users_view' },
  { path: '/messages', icon: MessageSquare, labelKey: 'PublicMessages', permission: 'messages_view' },
  { path: '/settings', icon: Settings, labelKey: 'Settings', permission: 'settings_view' },
];

export default function MainLayout({ children }) {
  const { user, hasPermission } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOpenPasswordModal = () => {
      setPasswordModalOpen(true);
    };
    window.addEventListener('openPasswordModal', handleOpenPasswordModal);
    return () => window.removeEventListener('openPasswordModal', handleOpenPasswordModal);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? t(item.labelKey) : t('Dashboard');
  };

  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('PasswordMismatch'));
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError(t('PasswordTooShort'));
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(t('PasswordChanged'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (error) {
      setPasswordError(error.response?.data?.message || t('SaveError'));
    }
  };

  return (
    <div className="app">
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}
      <aside className={`sidebar ${isMobile ? (sidebarOpen ? 'show' : '') : (sidebarOpen ? '' : 'collapsed')}`}>
        <nav className="sidebar-nav">
          <div className="nav-section">
            {/*<div className="nav-section-title">{t('Menu')}</div>*/}
            {visibleNavItems.map((item, index) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={index === 0}
                onClick={() => { if (isMobile) setSidebarOpen(false); }}
              >
                <item.icon size={20} />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>

      <TopNav onSidebarToggle={handleSidebarToggle} sidebarOpen={sidebarOpen} />
      
      <main className={`main-content ${isMobile || !sidebarOpen ? 'sidebar-collapsed' : ''}`}>

        <div className="page-content">
          {children || <Outlet />}
        </div>
      </main>

      {passwordModalOpen && (
        <div className="modal-overlay" onClick={() => setPasswordModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('ChangePassword')}</h3>
              <button className="modal-close" onClick={() => setPasswordModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="modal-body">
                {passwordError && <div className="alert alert-danger">{passwordError}</div>}
                {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
                <div className="form-group">
                  <label className="form-label">{t('CurrentPassword')}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('NewPassword')}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('ConfirmPassword')}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordModalOpen(false)}>
                  {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('ChangePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

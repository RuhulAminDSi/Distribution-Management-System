import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/api';
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
  LogOut,
  Menu,
  Key,
  ChevronDown,
  Globe
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'Dashboard' },
  { path: '/dashboard/companies', icon: Building2, labelKey: 'Companies' },
  { path: '/dashboard/products', icon: Package, labelKey: 'Products' },
  { path: '/dashboard/retailers', icon: Users, labelKey: 'Retailers' },
  { path: '/dashboard/sales', icon: ShoppingCart, labelKey: 'Sales' },
  { path: '/dashboard/payments', icon: CreditCard, labelKey: 'Payments' },
  { path: '/dashboard/stock', icon: Warehouse, labelKey: 'Stock' },
  { path: '/dashboard/reports', icon: FileText, labelKey: 'Reports' },
  { path: '/dashboard/users', icon: UserCircle, labelKey: 'Users' },
  { path: '/dashboard/settings', icon: Settings, labelKey: 'Settings' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

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

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? t(item.labelKey) : t('Dashboard');
  };

  return (
    <div className="app">
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}
      <aside className={`sidebar ${isMobile ? (sidebarOpen ? 'show' : '') : (sidebarOpen ? '' : 'collapsed')}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Warehouse size={24} />
            <span>DMS</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">{t('Menu')}</div>
            {navItems.map((item, index) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={index === 0}
              >
                <item.icon size={20} />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px' }}>
            {t('LoggedInAs')}
          </div>
          <div style={{ fontWeight: '600', marginBottom: '12px' }}>{user?.full_name}</div>
          
          <button 
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="btn" 
            style={{ 
              width: '100%', 
              color: 'white', 
              backgroundColor: '#1976D2',
              border: 'none',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px' 
            }}
          >
            <Globe size={16} /> {language === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </aside>

      <main className={`main-content ${isMobile || !sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <header className="header">
          <div className="header-left">
            <button className="btn btn-secondary" onClick={handleSidebarToggle}>
              <Menu size={20} />
            </button>
            <h1 className="header-title">{getPageTitle()}</h1>
          </div>
          
          <div className="header-right">
            <div className="user-menu" ref={dropdownRef} style={{ position: 'relative' }}>
              <div className="user-avatar" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer' }}>
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: 'pointer' }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>{user?.full_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role}</div>
              </div>
              <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
              
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => { setDropdownOpen(false); setPasswordModalOpen(true); }}>
                    <Key size={16} />
                    {t('ChangePassword')}
                  </button>
                  <button className="dropdown-item" onClick={() => { logout(); navigate('/login'); }}>
                    <LogOut size={16} />
                    {t('Logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
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

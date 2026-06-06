import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { noticeService } from '../../services/api';
import { 
  Package,
  Bell,
  LogOut,
  Key,
  ChevronDown,
  Globe,
  Home,
  Settings,
  User,
  Circle,
  Megaphone
} from 'lucide-react';
import './TopNav.css';

export default function TopNav({ onSidebarToggle, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState(null);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const navItems = [
    { path: '/dashboard', labelKey: 'Dashboard' },
    { path: '/companies', labelKey: 'Companies' },
    { path: '/products', labelKey: 'Products' },
    { path: '/retailers', labelKey: 'Retailers' },
    { path: '/sales', labelKey: 'Sales' },
    { path: '/payments', labelKey: 'Payments' },
    { path: '/stock', labelKey: 'Stock' },
    { path: '/reports', labelKey: 'Reports' },
    { path: '/users', labelKey: 'Users' },
    { path: '/settings', labelKey: 'Settings' },
  ];

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? t(item.labelKey) : t('Dashboard');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await noticeService.getActive();
        setActiveNotice(res.data || null);
      } catch {
        setActiveNotice(null);
      }
    };
    fetchActive();
    const interval = setInterval(fetchActive, 15000);
    const onNoticeChanged = (e) => {
      if (e.detail !== undefined) {
        setActiveNotice(e.detail);
      } else {
        fetchActive();
      }
    };
    window.addEventListener('notice-changed', onNoticeChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notice-changed', onNoticeChanged);
    };
  }, []);

  useEffect(() => {
    const el = document.querySelector('.topnav-header');
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const h = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
        document.documentElement.style.setProperty('--header-h', `${h}px`);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header className="topnav-header">
      <div className="topnav-left">
        <button className="menu-toggle" onClick={onSidebarToggle}>
          <span className={`hamburger ${sidebarOpen ? 'vertical' : 'horizontal'}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        <Link to="/dashboard" className="topnav-brand">
          <div className="brand-icon">
            <Package size={20} />
          </div>
          <span className="brand-text">
            <span className="live-dot"><Circle size={8} fill="#10b981" /></span>
            DMS
          </span>
        </Link>

        <div className="page-title-wrapper">
          <span className="breadcrumb-separator">/</span>
          <span className="current-page">{getPageTitle()}</span>
        </div>
      </div>

        {activeNotice && (
          <div className="notice-ticker">
            <Megaphone size={16} className="notice-ticker-icon" />
            <div className="notice-ticker-track">
              <div key={activeNotice.id} className="notice-ticker-wrap">
                <span className="notice-ticker-text"><b>বিশেষ বিজ্ঞপ্তিঃ</b> {activeNotice.title} — {activeNotice.content}</span>
                <span className="notice-ticker-text"><b>বিশেষ বিজ্ঞপ্তিঃ</b> {activeNotice.title} — {activeNotice.content}</span>
              </div>
            </div>
          </div>
        )}

      <div className="topnav-right">
        <div className="topnav-actions">
          <Link to="/" className="nav-icon-btn home-btn" title={language === 'en' ? 'Home' : 'হোম'}>
            <Home size={18} />
          </Link>

          <button 
            className="nav-icon-btn lang-btn"
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            title={language === 'en' ? 'বাংলা' : 'English'}
          >
            <Globe size={18} />
            <span className="lang-label">{language === 'en' ? 'BN' : 'EN'}</span>
          </button>

          <div className="notif-wrapper" ref={notifRef}>
            <button 
              className="nav-icon-btn notif-btn"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={18} />
              <span className="notif-badge">3</span>
            </button>
            
            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>{language === 'en' ? 'Notifications' : 'নোটিফিকেশন'}</span>
                  <button className="mark-read">{language === 'en' ? 'Mark all read' : 'সব পড়া হয়েছে'}</button>
                </div>
                <div className="notif-list">
                  <div className="notif-item unread">
                    <div className="notif-icon bg-danger">
                      <Package size={14} />
                    </div>
                    <div className="notif-content">
                      <p>{language === 'en' ? 'Low stock alert for 5 products' : '৫টি প্রোডাক্টে কম স্টক অ্যালার্ট'}</p>
                      <span className="notif-time">5 {language === 'en' ? 'min ago' : 'মিনিট আগে'}</span>
                    </div>
                  </div>
                  <div className="notif-item unread">
                    <div className="notif-icon bg-success">
                      <User size={14} />
                    </div>
                    <div className="notif-content">
                      <p>{language === 'en' ? 'New retailer registered' : 'নতুন রিটেইলার রেজিস্ট্রেশন'}</p>
                      <span className="notif-time">1 {language === 'en' ? 'hour ago' : 'ঘণ্টা আগে'}</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <div className="notif-icon bg-warning">
                      <Bell size={14} />
                    </div>
                    <div className="notif-content">
                      <p>{language === 'en' ? 'Payment due tomorrow' : 'আগামীকাল পেমেন্ট বাকি'}</p>
                      <span className="notif-time">2 {language === 'en' ? 'hours ago' : 'ঘণ্টা আগে'}</span>
                    </div>
                  </div>
                </div>
                <Link to="/dashboard/notifications" className="notif-footer">
                  {language === 'en' ? 'View All' : 'সব দেখুন'}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="user-section" ref={dropdownRef}>
          <button 
            className="user-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="" className="avatar-img" />
              ) : (
                user?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.full_name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'rotate' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="" className="avatar-img" />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>
                <div className="dropdown-user-info">
                  <span className="dropdown-name">{user?.full_name}</span>
                  <span className="dropdown-email">{user?.username}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/settings?tab=profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <User size={16} />
                <span>{t('MyProfile')}</span>
              </Link>
              <button className="dropdown-item" onClick={() => { 
                setDropdownOpen(false);
                window.dispatchEvent(new CustomEvent('openPasswordModal'));
              }}>
                <Key size={16} />
                <span>{t('ChangePassword')}</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={() => { logout(); navigate('/login'); }}>
                <LogOut size={16} />
                <span>{t('Logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}

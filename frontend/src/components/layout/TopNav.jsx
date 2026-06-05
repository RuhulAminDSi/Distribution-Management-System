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

      <style>{`
        .topnav-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-bottom: 1px solid rgba(233, 69, 96, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .topnav-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .menu-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
        }

        .hamburger {
          width: 24px;
          height: 18px;
          position: relative;
          display: flex;
          justify-content: space-between;
          transition: all 0.3s ease;
        }

        .hamburger.horizontal {
          flex-direction: column;
          justify-content: space-between;
        }

        .hamburger.vertical {
          flex-direction: row;
          justify-content: space-between;
        }

        .hamburger span {
          display: block;
          background: #fff;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.horizontal span {
          width: 100%;
          height: 2px;
        }

        .hamburger.vertical span {
          width: 3px;
          height: 16px;
        }

        .hamburger.horizontal span {
          width: 18px;
          height: 2px;
        }

        .topnav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #fff;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .brand-text {
          font-size: 1.4rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .live-dot {
          display: flex;
          align-items: center;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .page-title-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-separator {
          color: rgba(255, 255, 255, 0.3);
          font-size: 1.2rem;
        }

        .current-page {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1rem;
          font-weight: 500;
        }

        .topnav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .topnav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-icon-btn:hover {
          background: rgba(233, 69, 96, 0.2);
          border-color: rgba(233, 69, 96, 0.5);
          color: #fff;
        }

        .lang-btn {
          width: auto;
          padding: 0 12px;
          gap: 6px;
        }

        .lang-label {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .home-btn {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .home-btn:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
          color: #10b981;
        }

        .notif-wrapper {
          position: relative;
        }

        .notif-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 50%;
          font-size: 0.65rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notif-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background: #1a1a2e;
          border: 1px solid rgba(233, 69, 96, 0.2);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #fff;
          font-weight: 600;
        }

        .mark-read {
          background: none;
          border: none;
          color: #e94560;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .notif-list {
          max-height: 240px;
          overflow-y: auto;
        }

        .notif-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: background 0.2s;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .notif-item.unread {
          background: rgba(233, 69, 96, 0.05);
        }

        .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .bg-success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .bg-warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

        .notif-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .notif-time {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .notif-footer {
          display: block;
          text-align: center;
          padding: 12px;
          color: #e94560;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s;
        }

        .notif-footer:hover {
          background: rgba(233, 69, 96, 0.1);
        }

        .user-section {
          position: relative;
        }

        .user-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 6px 12px 6px 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(233, 69, 96, 0.3);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.9rem;
          overflow: hidden;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-name {
          color: #fff;
          font-weight: 600;
          font-size: 0.875rem;
          line-height: 1.2;
        }

        .user-role {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.7rem;
          text-transform: capitalize;
        }

        .chevron {
          color: rgba(255, 255, 255, 0.5);
          transition: transform 0.3s ease;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 240px;
          background: #1a1a2e;
          border: 1px solid rgba(233, 69, 96, 0.2);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: slideDown 0.2s ease;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(233, 69, 96, 0.1);
        }

        .dropdown-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          overflow: hidden;
          flex-shrink: 0;
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
        }

        .dropdown-name {
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .dropdown-email {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .dropdown-item.logout {
          color: #ef4444;
        }

        .dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .notice-ticker {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 24px;
          overflow: hidden;
          max-width: 500px;
          min-width: 120px;
          background: rgba(233, 69, 96, 0.1);
          border: 1px solid rgba(233, 69, 96, 0.2);
          border-radius: 10px;
          padding: 6px 14px;
          height: 36px;
        }

        .notice-ticker-icon {
          flex-shrink: 0;
          color: #e94560;
          animation: pulse 2s ease-in-out infinite;
        }

        .notice-ticker-track {
          flex: 1;
          overflow: hidden;
          height: 22px;
        }

        .notice-ticker-wrap {
          display: inline-flex;
          white-space: nowrap;
          animation: scrollNotice 22s linear infinite;
          will-change: transform;
        }

        .notice-ticker-text {
          white-space: nowrap;
          color: #f0c0c8;
          font-size: 0.85rem;
          font-weight: 400;
          padding-right: 60px;
        }

        .notice-ticker:hover .notice-ticker-wrap {
          animation-play-state: paused;
        }

        @keyframes scrollNotice {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 768px) {
          .topnav-header {
            flex-wrap: wrap;
            height: auto;
            padding: 8px 12px;
            gap: 6px;
          }

          .user-info {
            display: none;
          }

          .lang-label {
            display: none;
          }

          .brand-text {
            display: none;
          }

          .topnav-actions {
            gap: 4px;
          }

          .nav-icon-btn {
            width: 32px;
            height: 32px;
            border-radius: 8px;
          }

          .lang-btn {
            width: 32px !important;
            padding: 0 !important;
          }

          .topnav-right {
            gap: 6px;
          }

          .user-trigger {
            padding: 2px 2px 2px 2px;
            border-radius: 8px;
            gap: 0;
          }

          .user-avatar {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            font-size: 0.75rem;
          }

          .notif-badge {
            width: 14px;
            height: 14px;
            font-size: 0.55rem;
            top: 2px;
            right: 2px;
          }

          .notice-ticker {
            order: 3;
            flex: 1 1 100%;
            max-width: 100%;
            min-width: 0;
            margin: 0;
            height: 32px;
            padding: 4px 10px;
            gap: 6px;
          }

          .notice-ticker-track {
            height: 20px;
          }

          .notice-ticker-text {
            font-size: 0.75rem;
            padding-right: 40px;
          }

          .notice-ticker-icon {
            width: 14px;
            height: 14px;
          }

          .topnav-left {
            flex: 1 1 auto;
            min-width: 0;
          }

          .breadcrumb-separator,
          .current-page {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

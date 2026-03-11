import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Menu
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/retailers', icon: Users, label: 'Retailers' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/payments', icon: CreditCard, label: 'Payments' },
  { path: '/stock', icon: Warehouse, label: 'Stock' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/users', icon: UserCircle, label: 'Users' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Warehouse size={24} />
            <span>DMS</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Menu</div>
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px' }}>
            Logged in as
          </div>
          <div style={{ fontWeight: '600', marginBottom: '12px' }}>{user?.full_name}</div>
          <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="btn btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <h1 className="header-title">{getPageTitle()}</h1>
          </div>
          
          <div className="header-right">
            <div className="user-menu">
              <div className="user-avatar">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>{user?.full_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

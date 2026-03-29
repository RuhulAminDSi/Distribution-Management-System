import { useState } from 'react';
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
  ArrowRight,
  BarChart3,
  TrendingUp,
  DollarSign,
  PackagePlus,
  UserPlus,
  FileBarChart,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Check,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import './Demo.css';

const translations = {
  bn: {
    demoTitle: 'ডেমো ভিউ',
    demoSubtitle: 'সিস্টেমের সম্পূর্ণ ফিচার এবং ফাংশনালিটি দেখুন',
    dashboard: 'ড্যাশবোর্ড',
    companies: 'কোম্পানি',
    products: 'পণ্য',
    retailers: 'রিটেইলার',
    sales: 'বিক্রয়',
    payments: 'পেমেন্ট',
    stock: 'স্টক',
    reports: 'রিপোর্ট',
    users: 'ইউজার',
    settings: 'সেটিংস',
    totalSales: 'মোট বিক্রয়',
    totalOrders: 'মোট অর্ডার',
    totalRevenue: 'মোট রাজস্ব',
    pendingPayments: 'পেন্ডিং পেমেন্ট',
    recentSales: 'সাম্প্রতিক বিক্রয়',
    stockAlerts: 'স্টক অ্যালার্ট',
    topProducts: 'শীর্ষ পণ্য',
    today: 'আজ',
    thisWeek: 'এই সপ্তাহ',
    thisMonth: 'এই মাস',
    viewAll: 'সব দেখুন',
    totalCompanies: 'মোট কোম্পানি',
    activeCompanies: 'অ্যাক্টিভ কোম্পানি',
    totalProducts: 'মোট পণ্য',
    totalRetailers: 'মোট রিটেইলার',
    activeRetailers: 'অ্যাক্টিভ রিটেইলার',
    newOrders: 'নতুন অর্ডার',
    completedOrders: 'সম্পন্ন অর্ডার',
    cancelledOrders: 'বাতিল অর্ডার',
    totalAmount: 'মোট পরিমাণ',
    paid: 'পেইড',
    due: 'বকেয়া',
    totalStock: 'মোট স্টক',
    lowStock: 'লো স্টক',
    outOfStock: 'স্টক আউট',
    newRetailer: 'নতুন রিটেইলার',
    newProduct: 'নতুন পণ্য',
    newSale: 'নতুন বিক্রয়',
    newPayment: 'নতুন পেমেন্ট',
    demoNote: 'এটি একটি ডেমো পেজ। সম্পূর্ণ সিস্টেম ব্যবহার করতে লগইন করুন।',
    getStarted: 'শুরু করুন',
    exploreFeatures: 'ফিচারগুলো দেখুন',
  },
  en: {
    demoTitle: 'Demo View',
    demoSubtitle: 'Explore all features and functionality of the system',
    dashboard: 'Dashboard',
    companies: 'Companies',
    products: 'Products',
    retailers: 'Retailers',
    sales: 'Sales',
    payments: 'Payments',
    stock: 'Stock',
    reports: 'Reports',
    users: 'Users',
    settings: 'Settings',
    totalSales: 'Total Sales',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    pendingPayments: 'Pending Payments',
    recentSales: 'Recent Sales',
    stockAlerts: 'Stock Alerts',
    topProducts: 'Top Products',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    viewAll: 'View All',
    totalCompanies: 'Total Companies',
    activeCompanies: 'Active Companies',
    totalProducts: 'Total Products',
    totalRetailers: 'Total Retailers',
    activeRetailers: 'Active Retailers',
    newOrders: 'New Orders',
    completedOrders: 'Completed Orders',
    cancelledOrders: 'Cancelled Orders',
    totalAmount: 'Total Amount',
    paid: 'Paid',
    due: 'Due',
    totalStock: 'Total Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    newRetailer: 'New Retailer',
    newProduct: 'New Product',
    newSale: 'New Sale',
    newPayment: 'New Payment',
    demoNote: 'This is a demo page. Login to use the full system.',
    getStarted: 'Get Started',
    exploreFeatures: 'Explore Features',
  }
};

export default function Demo() {
  const [language, setLanguage] = useState(() => localStorage.getItem('dms_language') || 'bn');
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const t = translations[language];

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'bn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('dms_language', newLang);
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'companies', icon: Building2, label: t.companies },
    { id: 'products', icon: Package, label: t.products },
    { id: 'retailers', icon: Users, label: t.retailers },
    { id: 'sales', icon: ShoppingCart, label: t.sales },
    { id: 'payments', icon: CreditCard, label: t.payments },
    { id: 'stock', icon: Warehouse, label: t.stock },
    { id: 'reports', icon: FileText, label: t.reports },
    { id: 'users', icon: UserCircle, label: t.users },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  const renderDashboard = () => (
    <div className="demo-content">
      <div className="demo-stats-grid">
        <div className="demo-stat-card">
          <div className="stat-icon sales"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">{t.totalSales}</span>
            <span className="stat-value">৳ 12,50,000</span>
            <span className="stat-change positive">+12.5%</span>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="stat-icon orders"><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">{t.totalOrders}</span>
            <span className="stat-value">1,250</span>
            <span className="stat-change positive">+8.2%</span>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="stat-icon revenue"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">{t.totalRevenue}</span>
            <span className="stat-value">৳ 8,75,000</span>
            <span className="stat-change positive">+15.3%</span>
          </div>
        </div>
        <div className="demo-stat-card">
          <div className="stat-icon payments"><CreditCard size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">{t.pendingPayments}</span>
            <span className="stat-value">৳ 2,15,000</span>
            <span className="stat-change negative">-5.2%</span>
          </div>
        </div>
      </div>

      <div className="demo-charts-row">
        <div className="demo-chart-card">
          <div className="card-header">
            <h3>{t.totalSales}</h3>
            <div className="card-actions">
              <button className="tab-btn active">{t.thisMonth}</button>
              <button className="tab-btn">{t.thisWeek}</button>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="bar-chart">
              {[65, 45, 78, 52, 88, 72, 95, 68, 82, 75, 90, 85].map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>
        <div className="demo-chart-card small">
          <div className="card-header">
            <h3>{t.topProducts}</h3>
          </div>
          <div className="top-products-list">
            <div className="product-item">
              <span className="product-name">Premium Rice 25kg</span>
              <span className="product-sales">৳ 2,50,000</span>
            </div>
            <div className="product-item">
              <span className="product-name">Sugar 1kg</span>
              <span className="product-sales">৳ 1,80,000</span>
            </div>
            <div className="product-item">
              <span className="product-name">Flour 10kg</span>
              <span className="product-sales">৳ 1,45,000</span>
            </div>
            <div className="product-item">
              <span className="product-name">Oil 5L</span>
              <span className="product-sales">৳ 1,20,000</span>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-table-section">
        <div className="card-header">
          <h3>{t.recentSales}</h3>
          <button className="view-all-btn">{t.viewAll} <ArrowRight size={14} /></button>
        </div>
        <table className="demo-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Retailer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>INV-001</td>
              <td>City Store</td>
              <td>29 Mar 2026</td>
              <td>৳ 15,000</td>
              <td><span className="status completed">Completed</span></td>
            </tr>
            <tr>
              <td>INV-002</td>
              <td>Market Plus</td>
              <td>29 Mar 2026</td>
              <td>৳ 8,500</td>
              <td><span className="status pending">Pending</span></td>
            </tr>
            <tr>
              <td>INV-003</td>
              <td>Daily Needs</td>
              <td>28 Mar 2026</td>
              <td>৳ 22,000</td>
              <td><span className="status completed">Completed</span></td>
            </tr>
            <tr>
              <td>INV-004</td>
              <td>Super Shop</td>
              <td>28 Mar 2026</td>
              <td>৳ 12,750</td>
              <td><span className="status completed">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div className="demo-content">
      <div className="demo-header-row">
        <div className="demo-page-stats">
          <div className="page-stat">
            <span className="page-stat-value">12</span>
            <span className="page-stat-label">{t.totalCompanies}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">10</span>
            <span className="page-stat-label">{t.activeCompanies}</span>
          </div>
        </div>
        <button className="demo-action-btn"><Plus size={16} /> {t.newRetailer}</button>
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Agrani Food Products</td>
            <td>+880 1234-567890</td>
            <td>agrani@example.com</td>
            <td>Dhaka</td>
            <td><span className="status active">Active</span></td>
            <td><Eye size={16} /><Edit size={16} /><Trash2 size={16} /></td>
          </tr>
          <tr>
            <td>Maa Enterprise</td>
            <td>+880 1234-567891</td>
            <td>maa@example.com</td>
            <td>Chittagong</td>
            <td><span className="status active">Active</span></td>
            <td><Eye size={16} /><Edit size={16} /><Trash2 size={16} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderProducts = () => (
    <div className="demo-content">
      <div className="demo-header-row">
        <div className="demo-page-stats">
          <div className="page-stat">
            <span className="page-stat-value">245</span>
            <span className="page-stat-label">{t.totalProducts}</span>
          </div>
        </div>
        <button className="demo-action-btn"><Plus size={16} /> {t.newProduct}</button>
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Company</th>
            <th>MRP</th>
            <th>Dealer Price</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Premium Rice 25kg</td>
            <td>Rice</td>
            <td>Agrani</td>
            <td>৳ 1,800</td>
            <td>৳ 1,650</td>
            <td>500</td>
            <td><span className="status active">In Stock</span></td>
          </tr>
          <tr>
            <td>Sugar 1kg</td>
            <td>Sugar</td>
            <td>Maa Enterprise</td>
            <td>৳ 120</td>
            <td>৳ 105</td>
            <td>50</td>
            <td><span className="status warning">Low Stock</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderRetailers = () => (
    <div className="demo-content">
      <div className="demo-header-row">
        <div className="demo-page-stats">
          <div className="page-stat">
            <span className="page-stat-value">500</span>
            <span className="page-stat-label">{t.totalRetailers}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">450</span>
            <span className="page-stat-label">{t.activeRetailers}</span>
          </div>
        </div>
        <button className="demo-action-btn"><Plus size={16} /> {t.newRetailer}</button>
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Shop Name</th>
            <th>Owner Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Credit Limit</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>City Store</td>
            <td>Md. Rahim</td>
            <td>+880 1711-111111</td>
            <td>Dhaka</td>
            <td>৳ 50,000</td>
            <td>৳ 12,500</td>
            <td><span className="status active">Active</span></td>
          </tr>
          <tr>
            <td>Market Plus</td>
            <td>Md. Karim</td>
            <td>+880 1722-222222</td>
            <td>Chittagong</td>
            <td>৳ 75,000</td>
            <td>৳ 8,200</td>
            <td><span className="status active">Active</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderSales = () => (
    <div className="demo-content">
      <div className="demo-header-row">
        <div className="demo-page-stats">
          <div className="page-stat">
            <span className="page-stat-value">1,250</span>
            <span className="page-stat-label">{t.totalOrders}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">1,180</span>
            <span className="page-stat-label">{t.completedOrders}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">70</span>
            <span className="page-stat-label">{t.cancelledOrders}</span>
          </div>
        </div>
        <button className="demo-action-btn"><Plus size={16} /> {t.newSale}</button>
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Retailer</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Discount</th>
            <th>Grand Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>INV-001</td>
            <td>City Store</td>
            <td>29 Mar 2026</td>
            <td>5</td>
            <td>৳ 16,000</td>
            <td>৳ 1,000</td>
            <td>৳ 15,000</td>
            <td><span className="status completed">Completed</span></td>
          </tr>
          <tr>
            <td>INV-002</td>
            <td>Market Plus</td>
            <td>29 Mar 2026</td>
            <td>3</td>
            <td>৳ 9,000</td>
            <td>৳ 500</td>
            <td>৳ 8,500</td>
            <td><span className="status pending">Pending</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderPayments = () => (
    <div className="demo-content">
      <div className="demo-header-row">
        <div className="demo-page-stats">
          <div className="page-stat">
            <span className="page-stat-value">৳ 85,00,000</span>
            <span className="page-stat-label">{t.totalAmount}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">৳ 75,00,000</span>
            <span className="page-stat-label">{t.paid}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">৳ 10,00,000</span>
            <span className="page-stat-label">{t.due}</span>
          </div>
        </div>
        <button className="demo-action-btn"><Plus size={16} /> {t.newPayment}</button>
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Receipt No</th>
            <th>Retailer</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Note</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>REC-001</td>
            <td>City Store</td>
            <td>29 Mar 2026</td>
            <td>৳ 10,000</td>
            <td>Cash</td>
            <td>Payment for INV-001</td>
            <td><span className="status completed">Paid</span></td>
          </tr>
          <tr>
            <td>REC-002</td>
            <td>Market Plus</td>
            <td>28 Mar 2026</td>
            <td>৳ 5,000</td>
            <td>Bank Transfer</td>
            <td>Partial Payment</td>
            <td><span className="status completed">Paid</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderStock = () => (
    <div className="demo-content">
      <div className="demo-header-row">
        <div className="demo-page-stats">
          <div className="page-stat">
            <span className="page-stat-value">৳ 45,00,000</span>
            <span className="page-stat-label">{t.totalStock}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">15</span>
            <span className="page-stat-label">{t.lowStock}</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">3</span>
            <span className="page-stat-label">{t.outOfStock}</span>
          </div>
        </div>
        <button className="demo-action-btn"><Plus size={16} /> Transfer</button>
      </div>
      <div className="demo-stock-grid">
        <div className="stock-warehouse">
          <h4>Dhaka Warehouse</h4>
          <div className="stock-item"><span>Rice 25kg</span><span>500 qty</span></div>
          <div className="stock-item"><span>Sugar 1kg</span><span>50 qty</span></div>
          <div className="stock-item"><span>Flour 10kg</span><span>200 qty</span></div>
        </div>
        <div className="stock-warehouse">
          <h4>Chittagong Warehouse</h4>
          <div className="stock-item"><span>Rice 25kg</span><span>300 qty</span></div>
          <div className="stock-item"><span>Sugar 1kg</span><span>150 qty</span></div>
          <div className="stock-item"><span>Oil 5L</span><span>0 qty</span></div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="demo-content">
      <div className="demo-reports-grid">
        <div className="report-card">
          <BarChart3 size={32} />
          <h4>Sales Report</h4>
          <p>Daily, weekly, monthly sales analysis</p>
          <button>View Report</button>
        </div>
        <div className="report-card">
          <Package size={32} />
          <h4>Stock Report</h4>
          <p>Current stock levels and movements</p>
          <button>View Report</button>
        </div>
        <div className="report-card">
          <CreditCard size={32} />
          <h4>Payment Report</h4>
          <p>Payment collection and due tracking</p>
          <button>View Report</button>
        </div>
        <div className="report-card">
          <Users size={32} />
          <h4>Retailer Report</h4>
          <p>Retailer performance and analysis</p>
          <button>View Report</button>
        </div>
        <div className="report-card">
          <TrendingUp size={32} />
          <h4>Profit Report</h4>
          <p>Profit margin and loss analysis</p>
          <button>View Report</button>
        </div>
        <div className="report-card">
          <FileBarChart size={32} />
          <h4>Company Report</h4>
          <p>Company-wise performance</p>
          <button>View Report</button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="demo-content">
      <div className="demo-header-row">
        <div className="demo-page-stats">
          <div className="page-stat">
            <span className="page-stat-value">25</span>
            <span className="page-stat-label">Total Users</span>
          </div>
          <div className="page-stat">
            <span className="page-stat-value">5</span>
            <span className="page-stat-label">Administrators</span>
          </div>
        </div>
        <button className="demo-action-btn"><Plus size={16} /> Add User</button>
      </div>
      <table className="demo-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Admin User</td>
            <td>admin</td>
            <td><span className="role-badge admin">Admin</span></td>
            <td>admin@dms.com</td>
            <td>+880 1234-567890</td>
            <td><span className="status active">Active</span></td>
            <td><Eye size={16} /><Edit size={16} /><Trash2 size={16} /></td>
          </tr>
          <tr>
            <td>Sales Manager</td>
            <td>sales_mgr</td>
            <td><span className="role-badge manager">Manager</span></td>
            <td>sales@dms.com</td>
            <td>+880 1234-567891</td>
            <td><span className="status active">Active</span></td>
            <td><Eye size={16} /><Edit size={16} /><Trash2 size={16} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderSettings = () => (
    <div className="demo-content">
      <div className="demo-settings-grid">
        <div className="settings-card">
          <div className="settings-icon"><Building2 size={24} /></div>
          <div className="settings-info">
            <h4>Company Settings</h4>
            <p>Manage company information and preferences</p>
          </div>
          <ChevronRight size={20} />
        </div>
        <div className="settings-card">
          <div className="settings-icon"><Package size={24} /></div>
          <div className="settings-info">
            <h4>Product Settings</h4>
            <p>Configure categories, units, and variants</p>
          </div>
          <ChevronRight size={20} />
        </div>
        <div className="settings-card">
          <div className="settings-icon"><Users size={24} /></div>
          <div className="settings-info">
            <h4>Retailer Settings</h4>
            <p>Set credit limits, payment terms</p>
          </div>
          <ChevronRight size={20} />
        </div>
        <div className="settings-card">
          <div className="settings-icon"><CreditCard size={24} /></div>
          <div className="settings-info">
            <h4>Payment Settings</h4>
            <p>Configure payment methods and banks</p>
          </div>
          <ChevronRight size={20} />
        </div>
        <div className="settings-card">
          <div className="settings-icon"><Bell size={24} /></div>
          <div className="settings-info">
            <h4>Notification Settings</h4>
            <p>Manage alerts and notifications</p>
          </div>
          <ChevronRight size={20} />
        </div>
        <div className="settings-card">
          <div className="settings-icon"><Settings size={24} /></div>
          <div className="settings-info">
            <h4>System Settings</h4>
            <p>General system configuration</p>
          </div>
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return renderDashboard();
      case 'companies': return renderCompanies();
      case 'products': return renderProducts();
      case 'retailers': return renderRetailers();
      case 'sales': return renderSales();
      case 'payments': return renderPayments();
      case 'stock': return renderStock();
      case 'reports': return renderReports();
      case 'users': return renderUsers();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="demo-page">
      <div className="demo-topbar">
        <div className="demo-topbar-left">
          <span className="demo-logo">📦 DMS</span>
          <span className="demo-badge">{t.demoTitle}</span>
        </div>
        <div className="demo-topbar-right">
          <button className="lang-toggle" onClick={toggleLanguage}>
            {language === 'en' ? '🇧🇩 বাংলা' : '🇺🇸 English'}
          </button>
          <Link to="/login" className="demo-login-btn">{t.getStarted}</Link>
        </div>
      </div>

      <div className="demo-sidebar" style={{ width: sidebarOpen ? '260px' : '70px' }}>
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        <nav className="demo-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="demo-main" style={{ marginLeft: sidebarOpen ? '260px' : '70px' }}>
        <div className="demo-page-header">
          <h2>{navItems.find(n => n.id === activePage)?.label}</h2>
          <div className="demo-breadcrumb">
            <span>Home</span> / <span>{navItems.find(n => n.id === activePage)?.label}</span>
          </div>
        </div>
        {renderContent()}
      </div>

      <div className="demo-footer-banner">
        <p>{t.demoNote}</p>
        <Link to="/login" className="banner-btn">{t.getStarted} <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}

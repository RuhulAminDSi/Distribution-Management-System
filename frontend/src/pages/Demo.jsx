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
  User,
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
  AlertTriangle,
  Globe,
  Home,
  Circle,
  LogOut,
  Key,
  ChevronDown,
  Save
} from 'lucide-react';

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
    home: 'হোম',
    notifications: 'নোটিফিকেশন',
    markAllRead: 'সব পড়া হয়েছে',
    myProfile: 'আমার প্রোফাইল',
    changePassword: 'পাসওয়ার্ড পরিবর্তন',
    logout: 'লগআউট',
    admin: 'অ্যাডমিন',
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
    home: 'Home',
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    myProfile: 'My Profile',
    changePassword: 'Change Password',
    logout: 'Logout',
    admin: 'Admin',
  }
};

export default function Demo() {
  const [language, setLanguage] = useState(() => localStorage.getItem('dms_language') || 'bn');
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.dashboard}</h1>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.demoSubtitle}</span>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-value">৳ 12,50,000</div>
          <div className="stat-label">{t.totalSales}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-value">1,250</div>
          <div className="stat-label">{t.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-value">৳ 8,75,000</div>
          <div className="stat-label">{t.totalRevenue}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <DollarSign size={24} />
          </div>
          <div className="stat-value">৳ 2,15,000</div>
          <div className="stat-label">{t.pendingPayments}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t.topProducts}</h3>
          </div>
          <div className="card-body">
            <div className="top-products-list">
              {[
                { name: 'Premium Rice 25kg', sales: '৳ 2,50,000' },
                { name: 'Sugar 1kg', sales: '৳ 1,80,000' },
                { name: 'Flour 10kg', sales: '৳ 1,45,000' },
                { name: 'Oil 5L', sales: '৳ 1,20,000' },
              ].map((p, i) => (
                <div key={i} className="product-item">
                  <span className="product-name">{p.name}</span>
                  <span className="product-sales">{p.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t.recentSales}</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Retailer</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>INV-001</td>
                  <td>City Store</td>
                  <td className="text-right">৳ 15,000</td>
                  <td><span className="badge badge-success">Completed</span></td>
                </tr>
                <tr>
                  <td>INV-002</td>
                  <td>Market Plus</td>
                  <td className="text-right">৳ 8,500</td>
                  <td><span className="badge badge-warning">Pending</span></td>
                </tr>
                <tr>
                  <td>INV-003</td>
                  <td>Daily Needs</td>
                  <td className="text-right">৳ 22,000</td>
                  <td><span className="badge badge-success">Completed</span></td>
                </tr>
                <tr>
                  <td>INV-004</td>
                  <td>Super Shop</td>
                  <td className="text-right">৳ 12,750</td>
                  <td><span className="badge badge-success">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.companies}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add Company</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search companies..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
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
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Maa Enterprise</td>
                <td>+880 1234-567891</td>
                <td>maa@example.com</td>
                <td>Chittagong</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pagination-footer">
          <div className="pagination-left">
            <label>Show</label>
            <select className="form-select sm" defaultValue="10">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="pagination-info">1-2 of 12 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 2</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.products}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add Product</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search products..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Company</th>
                <th className="text-right">MRP</th>
                <th className="text-right">Dealer Price</th>
                <th className="text-right">Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PR-001</td>
                <td>Premium Rice 25kg</td>
                <td>Agrani</td>
                <td className="text-right">৳ 1,800</td>
                <td className="text-right">৳ 1,650</td>
                <td className="text-right">500</td>
                <td><span className="badge badge-success">In Stock</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>PR-002</td>
                <td>Sugar 1kg</td>
                <td>Maa Enterprise</td>
                <td className="text-right">৳ 120</td>
                <td className="text-right">৳ 105</td>
                <td className="text-right">
                  <span className="text-danger flex items-center gap-1">
                    <AlertTriangle size={12} /> 50
                  </span>
                </td>
                <td><span className="badge badge-warning">Low Stock</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pagination-footer">
          <div className="pagination-left">
            <label>Show</label>
            <select className="form-select sm" defaultValue="10">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="pagination-info">1-2 of 245 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 25</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRetailers = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.retailers}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add Retailer</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search retailers..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Address</th>
                <th className="text-right">Credit Limit</th>
                <th className="text-right">Due</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>City Store</td>
                <td>Md. Rahim</td>
                <td>+880 1711-111111</td>
                <td>Dhaka</td>
                <td className="text-right">৳ 50,000</td>
                <td className="text-right text-danger">৳ 12,500</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Market Plus</td>
                <td>Md. Karim</td>
                <td>+880 1722-222222</td>
                <td>Chittagong</td>
                <td className="text-right">৳ 75,000</td>
                <td className="text-right text-danger">৳ 8,200</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pagination-footer">
          <div className="pagination-left">
            <label>Show</label>
            <select className="form-select sm" defaultValue="10">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="pagination-info">1-2 of 500 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 50</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSales = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.sales}</h1>
        <button className="btn btn-primary"><Plus size={18} /> New Sale</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search invoices..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Retailer</th>
                <th>Date</th>
                <th className="text-right">Total</th>
                <th className="text-right">Discount</th>
                <th className="text-right">Grand Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>INV-001</td>
                <td>City Store</td>
                <td>29 Mar 2026</td>
                <td className="text-right">৳ 16,000</td>
                <td className="text-right">৳ 1,000</td>
                <td className="text-right">৳ 15,000</td>
                <td><span className="badge badge-success">Paid</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>INV-002</td>
                <td>Market Plus</td>
                <td>29 Mar 2026</td>
                <td className="text-right">৳ 9,000</td>
                <td className="text-right">৳ 500</td>
                <td className="text-right">৳ 8,500</td>
                <td><span className="badge badge-warning">Pending</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.payments}</h1>
        <button className="btn btn-primary"><Plus size={18} /> New Payment</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search payments..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Retailer</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
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
                <td className="text-right">৳ 10,000</td>
                <td>Cash</td>
                <td>Payment for INV-001</td>
                <td><span className="badge badge-success">Paid</span></td>
              </tr>
              <tr>
                <td>REC-002</td>
                <td>Market Plus</td>
                <td>28 Mar 2026</td>
                <td className="text-right">৳ 5,000</td>
                <td>Bank Transfer</td>
                <td>Partial Payment</td>
                <td><span className="badge badge-success">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.stock}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Transfer</button>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dhaka Warehouse</h3>
          </div>
          <div className="card-body">
            <div className="stock-list">
              <div className="stock-item"><span>Rice 25kg</span><span className="text-muted">500 qty</span></div>
              <div className="stock-item"><span>Sugar 1kg</span><span className="text-warning">50 qty</span></div>
              <div className="stock-item"><span>Flour 10kg</span><span className="text-muted">200 qty</span></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Chittagong Warehouse</h3>
          </div>
          <div className="card-body">
            <div className="stock-list">
              <div className="stock-item"><span>Rice 25kg</span><span className="text-muted">300 qty</span></div>
              <div className="stock-item"><span>Sugar 1kg</span><span className="text-muted">150 qty</span></div>
              <div className="stock-item"><span>Oil 5L</span><span className="text-danger">0 qty</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.reports}</h1>
      </div>
      <div className="reports-grid">
        {[
          { icon: BarChart3, name: 'Sales Report', desc: 'Daily, weekly, monthly sales analysis' },
          { icon: Package, name: 'Stock Report', desc: 'Current stock levels and movements' },
          { icon: CreditCard, name: 'Payment Report', desc: 'Payment collection and due tracking' },
          { icon: Users, name: 'Retailer Report', desc: 'Retailer performance and analysis' },
          { icon: TrendingUp, name: 'Profit Report', desc: 'Profit margin and loss analysis' },
          { icon: Building2, name: 'Company Report', desc: 'Company-wise performance' },
        ].map((r, i) => (
          <div key={i} className="card report-card">
            <r.icon size={32} />
            <h4>{r.name}</h4>
            <p>{r.desc}</p>
            <button className="btn btn-primary btn-sm">View Report</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.users}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Add User</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search users..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="user-avatar-sm">A</div>
                    Admin User
                  </div>
                </td>
                <td>admin</td>
                <td><span className="badge badge-info">Admin</span></td>
                <td>admin@dms.com</td>
                <td>+880 1234-567890</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="user-avatar-sm">S</div>
                    Sales Manager
                  </div>
                </td>
                <td>sales_mgr</td>
                <td><span className="badge badge-primary">Manager</span></td>
                <td>sales@dms.com</td>
                <td>+880 1234-567891</td>
                <td><span className="badge badge-success">Active</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                    <button className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="pagination-footer">
          <div className="pagination-left">
            <label>Show</label>
            <select className="form-select sm" defaultValue="10">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="pagination-info">1-2 of 25 entries</span>
          </div>
          <div className="pagination-right">
            <button className="btn btn-secondary btn-sm" disabled><ChevronLeft size={16} /></button>
            <span className="page-info">Page 1 / 3</span>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t.settings}</h1>
      </div>
      <div className="settings-grid">
        {[
          { icon: Building2, name: 'Company Settings', desc: 'Manage company information and preferences' },
          { icon: Package, name: 'Product Settings', desc: 'Configure categories, units, and variants' },
          { icon: Users, name: 'Retailer Settings', desc: 'Set credit limits, payment terms' },
          { icon: CreditCard, name: 'Payment Settings', desc: 'Configure payment methods and banks' },
          { icon: Bell, name: 'Notification Settings', desc: 'Manage alerts and notifications' },
          { icon: Settings, name: 'System Settings', desc: 'General system configuration' },
        ].map((s, i) => (
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
            <button className="demo-nav-icon-btn demo-lang-btn" onClick={toggleLanguage}>
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
                    <span>{t.notifications}</span>
                    <button className="demo-mark-read">{t.markAllRead}</button>
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
                  <div className="demo-notif-footer">{t.viewAll}</div>
                </div>
              )}
            </div>
          </div>

          <div className="demo-user-section">
            <button className="demo-user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="demo-user-avatar">A</div>
              <div className="demo-user-info">
                <span className="demo-user-name">Admin User</span>
                <span className="demo-user-role">{t.admin}</span>
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
                <button className="demo-dropdown-item"><User size={16} /> <span>{t.myProfile}</span></button>
                <button className="demo-dropdown-item"><Key size={16} /> <span>{t.changePassword}</span></button>
                <div className="demo-dropdown-divider"></div>
                <button className="demo-dropdown-item logout" disabled style={{ cursor: 'default', opacity: 0.7 }}><LogOut size={16} /> <span>{t.logout}</span></button>
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
            <span>{t.demoNote}</span>
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
              {t.getStarted} <ArrowRight size={14} />
            </Link>
          </div>
          {renderContent()}
        </div>
      </main>

      <style>{`
        :root {
          --primary: #e94560;
          --primary-dark: #c23152;
          --primary-light: #ff6b6b;
          --secondary: #6366f1;
          --background: #0f0f1a;
          --surface: #1a1a2e;
          --text-primary: #e8e8e8;
          --text-secondary: #9fb1c8;
          --border: rgba(255, 255, 255, 0.1);
          --sidebar-width: 240px;
          --header-height: 64px;
        }

        .demo-page {
          font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif;
          background: var(--background);
          color: var(--text-primary);
          min-height: 100vh;
        }

        .demo-topnav {
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

        .demo-topnav-left { display: flex; align-items: center; gap: 8px; }

        .demo-menu-toggle {
          background: none; border: none; cursor: pointer;
          padding: 6px; display: flex; align-items: center; justify-content: center;
        }

        .demo-hamburger {
          width: 24px; height: 18px; position: relative;
          display: flex; transition: all 0.3s ease;
        }
        .demo-hamburger.horizontal { flex-direction: column; justify-content: space-between; }
        .demo-hamburger.vertical { flex-direction: row; justify-content: space-between; }
        .demo-hamburger span { display: block; background: #fff; border-radius: 2px; transition: all 0.3s ease; }
        .demo-hamburger.horizontal span { width: 18px; height: 2px; }
        .demo-hamburger.vertical span { width: 3px; height: 16px; }

        .demo-topnav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; }

        .demo-brand-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff;
        }

        .demo-brand-text { font-size: 1.4rem; font-weight: 700; display: flex; align-items: center; gap: 6px; }

        .demo-live-dot { display: flex; align-items: center; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .demo-page-title-wrapper { display: flex; align-items: center; gap: 8px; }
        .demo-breadcrumb-sep { color: rgba(255,255,255,0.3); font-size: 1.2rem; }
        .demo-current-page { color: rgba(255,255,255,0.7); font-size: 1rem; font-weight: 500; }

        .demo-topnav-right { display: flex; align-items: center; gap: 16px; }
        .demo-topnav-actions { display: flex; align-items: center; gap: 8px; }

        .demo-nav-icon-btn {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s ease; position: relative;
        }

        .demo-nav-icon-btn:hover {
          background: rgba(233,69,96,0.2);
          border-color: rgba(233,69,96,0.5);
          color: #fff;
        }

        .demo-lang-btn { width: auto; padding: 0 12px; gap: 6px; }

        .demo-home-btn {
          background: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.3);
        }
        .demo-home-btn:hover {
          background: rgba(16,185,129,0.2);
          border-color: rgba(16,185,129,0.5);
          color: #10b981;
        }

        .demo-lang-label { font-size: 0.75rem; font-weight: 600; }

        .demo-notif-wrapper { position: relative; }

        .demo-notif-badge {
          position: absolute; top: 4px; right: 4px;
          width: 18px; height: 18px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 50%; font-size: 0.65rem; font-weight: 700;
          color: #fff; display: flex; align-items: center; justify-content: center;
        }

        .demo-notif-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 320px; background: #1a1a2e;
          border: 1px solid rgba(233,69,96,0.2);
          border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          overflow: hidden; animation: slideDown 0.2s ease; z-index: 100;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .demo-notif-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
          color: #fff; font-weight: 600;
        }

        .demo-mark-read {
          background: none; border: none; color: #e94560;
          font-size: 0.75rem; cursor: pointer;
        }

        .demo-notif-list { max-height: 240px; overflow-y: auto; }

        .demo-notif-item {
          display: flex; gap: 12px; padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          cursor: pointer; transition: background 0.2s;
        }
        .demo-notif-item:hover { background: rgba(255,255,255,0.03); }
        .demo-notif-item.unread { background: rgba(233,69,96,0.05); }

        .demo-notif-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .demo-notif-icon.bg-danger { background: rgba(239,68,68,0.2); color: #ef4444; }
        .demo-notif-icon.bg-success { background: rgba(16,185,129,0.2); color: #10b981; }
        .demo-notif-icon.bg-warning { background: rgba(245,158,11,0.2); color: #f59e0b; }

        .demo-notif-content p { margin: 0; color: rgba(255,255,255,0.85); font-size: 0.85rem; line-height: 1.4; }
        .demo-notif-time { font-size: 0.7rem; color: rgba(255,255,255,0.4); }

        .demo-notif-footer {
          display: block; text-align: center; padding: 12px;
          color: #e94560; font-size: 0.85rem; font-weight: 500;
          border-top: 1px solid rgba(255,255,255,0.05); cursor: pointer;
          transition: background 0.2s;
        }
        .demo-notif-footer:hover { background: rgba(233,69,96,0.1); }

        .demo-user-section { position: relative; }

        .demo-user-trigger {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 6px 12px 6px 6px; cursor: pointer;
          transition: all 0.3s ease; color: inherit; font-family: inherit;
        }
        .demo-user-trigger:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(233,69,96,0.3);
        }

        .demo-user-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 10px; display: flex; align-items: center;
          justify-content: center; color: #fff; font-weight: 700; font-size: 0.9rem;
        }

        .demo-user-info { display: flex; flex-direction: column; align-items: flex-start; }
        .demo-user-name { color: #fff; font-weight: 600; font-size: 0.875rem; line-height: 1.2; }
        .demo-user-role { color: rgba(255,255,255,0.5); font-size: 0.7rem; text-transform: capitalize; }

        .demo-chevron { color: rgba(255,255,255,0.5); transition: transform 0.3s ease; }
        .demo-chevron.rotate { transform: rotate(180deg); }

        .demo-user-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 240px; background: #1a1a2e;
          border: 1px solid rgba(233,69,96,0.2);
          border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          overflow: hidden; animation: slideDown 0.2s ease; z-index: 100;
        }

        .demo-dropdown-header {
          display: flex; align-items: center; gap: 12px;
          padding: 16px; background: rgba(233,69,96,0.1);
        }

        .demo-dropdown-avatar {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          border-radius: 12px; display: flex; align-items: center;
          justify-content: center; color: #fff; font-weight: 700; font-size: 1.1rem;
          flex-shrink: 0;
        }

        .demo-dropdown-user-info { display: flex; flex-direction: column; }
        .demo-dropdown-name { color: #fff; font-weight: 600; font-size: 0.95rem; }
        .demo-dropdown-email { color: rgba(255,255,255,0.5); font-size: 0.75rem; }

        .demo-dropdown-divider { height: 1px; background: rgba(255,255,255,0.05); }

        .demo-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 12px 16px; background: none; border: none;
          color: rgba(255,255,255,0.7); font-size: 0.875rem; cursor: pointer;
          text-decoration: none; transition: all 0.2s ease; font-family: inherit;
        }
        .demo-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .demo-dropdown-item.logout { color: #ef4444; }
        .demo-dropdown-item.logout:hover { background: rgba(239,68,68,0.1); }

        .demo-sidebar-new {
          position: fixed; top: 64px; left: 0; bottom: 0;
          background: #12122a;
          transition: width 0.3s; z-index: 99;
          overflow-y: auto; box-shadow: 2px 0 10px rgba(0,0,0,0.2);
        }

        .demo-sidebar-nav { padding: 12px 0; display: flex; flex-direction: column; gap: 2px; }

        .demo-sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; border: none; background: transparent;
          color: rgba(255,255,255,0.8); font-size: 14px; cursor: pointer;
          text-align: left; transition: all 0.2s;
          border-left: 3px solid transparent; font-family: inherit;
        }

        .demo-sidebar-item:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .demo-sidebar-item.active {
          background: rgba(255,255,255,0.15); color: #fff;
          border-left-color: #f7c76f;
        }

        .demo-main-content {
          margin-top: 64px; padding: 24px;
          transition: margin-left 0.3s; min-height: calc(100vh - 64px);
        }

        .demo-page-content { max-width: 1400px; margin: 0 auto; }

        .demo-page-banner {
          background: linear-gradient(90deg, #e94560 0%, #c23152 100%);
          padding: 12px 20px; border-radius: 12px;
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; font-size: 14px; color: #fff; font-weight: 500;
        }

        .user-avatar-sm {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.85rem;
          flex-shrink: 0;
        }

        .top-products-list { display: flex; flex-direction: column; gap: 8px; }

        .product-item {
          display: flex; justify-content: space-between;
          padding: 10px 12px; background: var(--background);
          border-radius: 8px;
        }

        .product-name { font-size: 13px; color: var(--text-primary); }
        .product-sales { font-size: 13px; font-weight: 600; color: var(--primary-light); }

        .stock-list { display: flex; flex-direction: column; gap: 8px; }

        .stock-item {
          display: flex; justify-content: space-between;
          padding: 10px 12px; background: var(--background);
          border-radius: 8px; font-size: 14px;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .report-card { text-align: center; padding: 32px 24px; }
        .report-card svg { color: var(--primary); margin-bottom: 16px; }
        .report-card h4 { margin-bottom: 8px; font-size: 16px; }
        .report-card p { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }

        .settings-card {
          display: flex; align-items: center; gap: 16px;
          padding: 20px; background: var(--surface);
          border: 1px solid var(--border); border-radius: 12px;
          cursor: pointer; transition: all 0.3s;
        }
        .settings-card:hover { background: rgba(255,255,255,0.05); }

        .settings-icon {
          width: 48px; height: 48px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(233,69,96,0.2); color: var(--primary-light);
          flex-shrink: 0;
        }

        .settings-info { flex: 1; }
        .settings-info h4 { font-size: 14px; margin-bottom: 4px; }
        .settings-info p { font-size: 12px; color: var(--text-secondary); margin: 0; }

        @media (max-width: 768px) {
          .demo-page-title-wrapper { display: none; }
          .demo-user-info { display: none; }
          .demo-lang-label { display: none; }
          .demo-brand-text { display: none; }
          .demo-sidebar-new { width: 70px !important; }
          .demo-main-content { margin-left: 70px !important; }
          .demo-page-banner { flex-direction: column; gap: 10px; text-align: center; }
        }
      `}</style>
    </div>
  );
}

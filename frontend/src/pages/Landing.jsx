import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Circle,
  CreditCard,
  FileText,
  Globe2,
  Layers3,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Route,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Warehouse,
  X,
  Zap
} from 'lucide-react';
import './Landing.css';

const copy = {
  bn: {
    nav: ['হোম', 'সুবিধা', 'কীভাবে কাজ করে', 'কেন ব্যবহার করবেন', 'যোগাযোগ'],
    login: 'সাইন ইন',
    signUp: 'সাইন আপ',
    register: 'সাইন আপ',
    demo: 'ডেমো',
    brandSubtitle: 'ডিস্ট্রিবিউশন স্যুইট',
    eyebrow: 'ডিস্ট্রিবিউশন ব্যবসা সহজে পরিচালনার স্মার্ট সফটওয়্যার',
    title: 'আপনার বিক্রয়, স্টক ও পেমেন্ট এক জায়গায় সহজ নিয়ন্ত্রণ',
    subtitle: 'ডিএমএস দিয়ে প্রতিদিনের অর্ডার, বিক্রয়, রিটেইলার, পণ্য, স্টক ও বকেয়া পেমেন্ট সহজে দেখা এবং পরিচালনা করা যায়। খাতায় হিসাব রাখা, স্টক ভুল হওয়া বা পেমেন্ট মিস করার ঝামেলা কমিয়ে ব্যবসাকে আরও গুছিয়ে চালান।',
    primaryCta: 'সিস্টেমে প্রবেশ করুন',
    secondaryCta: 'ফিচার দেখুন',
    trusted: 'ডিস্ট্রিবিউটর, পাইকারি ব্যবসা, দোকান ও সেলস টিমের জন্য উপযোগী',
    liveOperations: 'আজকের ব্যবসার চিত্র',
    liveSales: 'আজকের বিক্রয়',
    pendingOrders: 'পেন্ডিং অর্ডার',
    lowStock: 'লো স্টক অ্যালার্ট',
    collection: 'কালেকশন',
    dispatchReady: 'ডিসপ্যাচ প্রস্তুত',
    permissionSecure: 'নিরাপদ ব্যবহার',
    scannerActive: 'স্মার্ট অ্যালার্ট চালু',
    metricTables: 'ধরনের তথ্য একসাথে',
    metricModules: 'প্রয়োজনীয় কাজের টুল',
    metricSession: 'সহজ অ্যাক্সেস',
    moduleKicker: 'মূল সুবিধা',
    modulesTitle: 'ব্যবসার প্রতিটি গুরুত্বপূর্ণ কাজ সহজ করুন',
    modulesSubtitle: 'কোন পণ্য কত আছে, কোন রিটেইলার কত বাকি, আজ কত বিক্রয় হলো, কোন অর্ডার পেন্ডিং - সব তথ্য পরিষ্কারভাবে এক জায়গায় দেখুন।',
    openModule: 'দেখুন',
    closeModule: 'কম দেখুন',
    workflowKicker: 'কীভাবে কাজ করে',
    workflowTitle: 'প্রতিদিনের কাজ আরও সহজ ও দ্রুত',
    workflowSubtitle: 'পণ্য যোগ করুন, অর্ডার নিন, বিক্রয় করুন, পেমেন্ট রেকর্ড করুন এবং রিপোর্ট দেখে সিদ্ধান্ত নিন - সবকিছু একই সিস্টেমে।',
    securityTitle: 'কেন এই সিস্টেম আপনার ব্যবসার জন্য দরকার',
    securitySubtitle: 'ডিএমএস আপনার ব্যবসার হিসাব গুছিয়ে রাখে, ভুল কমায়, সময় বাঁচায় এবং মালিক/ম্যানেজারকে দ্রুত সিদ্ধান্ত নিতে সাহায্য করে।',
    ctaKicker: 'শুরু করুন',
    ctaTitle: 'আপনার ব্যবসা আরও গুছিয়ে চালাতে প্রস্তুত?',
    ctaSubtitle: 'লগ ইন করে আজকের বিক্রয়, স্টক, পেমেন্ট, অর্ডার এবং রিপোর্ট এক জায়গায় দেখুন।',
    contactKicker: 'যোগাযোগ',
    contactTitle: 'সাপোর্ট বা ডেমোর জন্য যোগাযোগ করুন',
    contactSubtitle: 'আপনার ব্যবসার জন্য কীভাবে ব্যবহার করবেন, সেটআপ বা ট্রেনিং দরকার হলে আমাদের সাথে কথা বলুন।',
    location: 'ঢাকা, বাংলাদেশ',
    footer: 'ডিএমএস আপনার ব্যবসার হিসাব সহজ, পরিষ্কার এবং দ্রুত বোঝার মতো করে।',
    rights: '© ২০২৬ ডিএমএস। সর্বস্বত্ব সংরক্ষিত।'
  },
  en: {
    nav: ['Home', 'Benefits', 'How It Works', 'Why DMS', 'Contact'],
    login: 'Sign In',
    signUp: 'Sign Up',
    register: 'Sign Up',
    demo: 'Demo',
    brandSubtitle: 'Distribution Suite',
    eyebrow: 'Smart software for easier distribution business management',
    title: 'Manage sales, stock and payments from one simple place',
    subtitle: 'DMS helps you handle daily orders, sales, retailers, products, stock and due payments without messy notebooks or scattered files. See what is happening in your business, reduce mistakes and make faster decisions.',
    primaryCta: 'Enter System',
    secondaryCta: 'Explore Features',
    trusted: 'Made for distributors, wholesalers, shops and field sales teams',
    liveOperations: 'Today’s Business Snapshot',
    liveSales: 'Today Sales',
    pendingOrders: 'Pending Orders',
    lowStock: 'Low Stock Alerts',
    collection: 'Collection',
    dispatchReady: 'Dispatch ready',
    permissionSecure: 'Safe access',
    scannerActive: 'Smart alerts on',
    metricTables: 'types of business data',
    metricModules: 'daily work tools',
    metricSession: 'easy access',
    moduleKicker: 'Key Benefits',
    modulesTitle: 'Make every important business task easier',
    modulesSubtitle: 'Know what products are available, who owes money, how much you sold today and which orders need attention - all from one clean screen.',
    openModule: 'View details',
    closeModule: 'Show less',
    workflowKicker: 'How It Works',
    workflowTitle: 'A simpler way to run daily distribution work',
    workflowSubtitle: 'Add products, take orders, make sales, record payments and check reports in the same system.',
    securityTitle: 'Why your business needs DMS',
    securitySubtitle: 'DMS keeps your business organized, reduces mistakes, saves time and helps owners or managers make better decisions quickly.',
    ctaKicker: 'Get Started',
    ctaTitle: 'Ready to run your business in a more organized way?',
    ctaSubtitle: 'Login to see sales, stock, payments, orders and reports in one place.',
    contactKicker: 'Contact',
    contactTitle: 'Contact us for support or demo',
    contactSubtitle: 'Talk to us if you need setup help, training or guidance for using DMS in your business.',
    location: 'Dhaka, Bangladesh',
    footer: 'DMS makes your business records simple, clear and easy to understand.',
    rights: '© 2026 DMS. All rights reserved.'
  }
};

const moduleContent = {
  bn: [
    { icon: Building2, title: 'কোম্পানি ও শাখা', text: 'আপনার কোম্পানি, শাখা এবং ব্যবসার প্রয়োজনীয় তথ্য সুন্দরভাবে সংরক্ষণ করুন।', metric: 'সব ব্যবসা একসাথে', details: ['একাধিক কোম্পানি বা শাখার তথ্য আলাদা করে রাখা যায়।', 'ঠিকানা, যোগাযোগ ও ব্যবসার পরিচয় সহজে আপডেট করা যায়।', 'মালিক বা ম্যানেজার এক জায়গা থেকেই সবকিছু দেখতে পারে।'] },
    { icon: Package, title: 'পণ্য তালিকা', text: 'কোন পণ্য কত দামে কিনেছেন, কত দামে বিক্রি করবেন এবং কত স্টক আছে সহজে দেখুন।', metric: 'পণ্য সহজে খুঁজুন', details: ['পণ্যের নাম, ক্যাটাগরি, ইউনিট ও দাম একসাথে থাকে।', 'স্টক কমে গেলে আগে থেকেই বোঝা যায়।', 'বিক্রির সময় পণ্য খুঁজতে সময় কম লাগে।'] },
    { icon: Users, title: 'রিটেইলার/গ্রাহক', text: 'প্রতিটি রিটেইলারের তথ্য, অর্ডার, বকেয়া এবং লেনদেনের ইতিহাস এক জায়গায় রাখুন।', metric: 'গ্রাহক হিসাব', details: ['কোন রিটেইলার কত অর্ডার করেছে তা দেখা যায়।', 'কার কত টাকা বাকি আছে পরিষ্কার বোঝা যায়।', 'ফোন, ঠিকানা ও ব্যবসার তথ্য দ্রুত খুঁজে পাওয়া যায়।'] },
    { icon: ShoppingCart, title: 'অর্ডার ও বিক্রয়', text: 'নতুন অর্ডার নিন, বিক্রয় রেকর্ড করুন এবং প্রয়োজনে দ্রুত ইনভয়েস তৈরি করুন।', metric: 'দ্রুত বিক্রয়', details: ['অর্ডার থেকে বিক্রয় পর্যন্ত কাজ সহজ হয়।', 'ডিসকাউন্ট ও মোট বিল দ্রুত হিসাব করা যায়।', 'প্রতিদিন কত বিক্রয় হলো সাথে সাথে দেখা যায়।'] },
    { icon: CreditCard, title: 'পেমেন্ট ও বকেয়া', text: 'কে কত টাকা দিয়েছে, কার কত বাকি আছে এবং আজ কত কালেকশন হলো পরিষ্কারভাবে দেখুন।', metric: 'বকেয়া নিয়ন্ত্রণ', details: ['ক্যাশ, বকেয়া ও কালেকশন আলাদা করে বোঝা যায়।', 'রিটেইলারভিত্তিক পেমেন্ট ইতিহাস থাকে।', 'বকেয়া আদায়ের সময় ভুলে যাওয়ার ঝুঁকি কমে।'] },
    { icon: Warehouse, title: 'স্টক হিসাব', text: 'কোন পণ্য শেষ হয়ে যাচ্ছে, কোন পণ্য বেশি আছে এবং স্টক কোথায় কম - সহজে বুঝুন।', metric: 'স্টক সতর্কতা', details: ['নতুন স্টক যোগ বা বিক্রির পর স্টক আপডেট থাকে।', 'লো স্টক পণ্য দ্রুত নজরে আসে।', 'স্টক ভুল হওয়া বা পণ্য শেষ হয়ে যাওয়ার সমস্যা কমে।'] },
    { icon: FileText, title: 'সহজ রিপোর্ট', text: 'দিন, মাস বা সময় অনুযায়ী বিক্রয়, পেমেন্ট ও স্টকের সারাংশ দেখে সিদ্ধান্ত নিন।', metric: 'ব্যবসার সারাংশ', details: ['আজ, এই মাস বা নির্দিষ্ট সময়ের রিপোর্ট দেখা যায়।', 'কোন পণ্য বেশি বিক্রি হচ্ছে বোঝা যায়।', 'ব্যবসার লাভ-ক্ষতি বুঝতে হিসাব সহজ হয়।'] },
    { icon: Bell, title: 'স্মার্ট অ্যালার্ট', text: 'লো স্টক, পেন্ডিং অর্ডার বা গুরুত্বপূর্ণ কাজ যেন চোখ এড়িয়ে না যায়।', metric: 'সময়মতো মনে করানো', details: ['পেন্ডিং অর্ডার চোখে পড়ে।', 'লো স্টক হলে দ্রুত ব্যবস্থা নেওয়া যায়।', 'গুরুত্বপূর্ণ কাজ সময়মতো মনে করিয়ে দেয়।'] },
    { icon: Settings, title: 'টিম নিয়ন্ত্রণ', text: 'কর্মচারী বা টিম মেম্বার কে কোন কাজ দেখতে বা করতে পারবে সহজে নিয়ন্ত্রণ করুন।', metric: 'নিরাপদ ব্যবহার', details: ['সবাইকে সব তথ্য দেখানোর দরকার হয় না।', 'সেলস, ম্যানেজার ও অ্যাডমিনের কাজ আলাদা করা যায়।', 'ব্যবসার গুরুত্বপূর্ণ তথ্য নিরাপদ থাকে।'] }
  ],
  en: [
    { icon: Building2, title: 'Company & Branches', text: 'Keep your company, branches and basic business information organized in one place.', metric: 'All business in one', details: ['Keep multiple companies or branches separated clearly.', 'Update address, contact and business identity whenever needed.', 'Owners or managers can see everything from one place.'] },
    { icon: Package, title: 'Product List', text: 'See purchase price, selling price and available stock for every product without confusion.', metric: 'Find products fast', details: ['Store product name, category, unit and price together.', 'Understand low stock before it becomes a problem.', 'Find products quickly while making sales.'] },
    { icon: Users, title: 'Retailers & Customers', text: 'Store retailer details, order history, dues and transactions in a clean customer record.', metric: 'Customer account', details: ['See how much each retailer ordered.', 'Know clearly who still owes money.', 'Find phone, address and business details quickly.'] },
    { icon: ShoppingCart, title: 'Orders & Sales', text: 'Take new orders, record sales and create invoices quickly when needed.', metric: 'Faster selling', details: ['Move from order to sale more easily.', 'Calculate discounts and total bills faster.', 'See daily sales immediately.'] },
    { icon: CreditCard, title: 'Payments & Dues', text: 'Know who paid, who still owes money and how much you collected today.', metric: 'Due control', details: ['Understand cash, dues and collections separately.', 'Keep payment history for each retailer.', 'Reduce the risk of forgetting due collection.'] },
    { icon: Warehouse, title: 'Stock Tracking', text: 'Understand which products are running low, which products are available and where stock needs attention.', metric: 'Stock alerts', details: ['Stock stays updated after purchase or sale.', 'Low-stock products become easier to notice.', 'Reduce mistakes and avoid suddenly running out of products.'] },
    { icon: FileText, title: 'Simple Reports', text: 'Check daily or monthly sales, payment and stock summaries to make better decisions.', metric: 'Business summary', details: ['View today, monthly or custom-period reports.', 'Understand which products are selling more.', 'Make profit and loss tracking easier.'] },
    { icon: Bell, title: 'Smart Alerts', text: 'Never miss low stock, pending orders or important business tasks that need action.', metric: 'Timely reminders', details: ['Pending orders stay visible.', 'Take action quickly when stock is low.', 'Get reminded about important business tasks.'] },
    { icon: Settings, title: 'Team Control', text: 'Decide what each staff member can see or do, so your business data stays safe.', metric: 'Safe use', details: ['Not everyone needs to see every business record.', 'Separate work for sales staff, managers and admins.', 'Keep important business information safer.'] }
  ]
};

const workflowContent = {
  bn: [
    { icon: Layers3, title: 'তথ্য যোগ করুন', text: 'পণ্য, রিটেইলার, কোম্পানি এবং টিমের তথ্য একবার গুছিয়ে যোগ করুন।' },
    { icon: Route, title: 'প্রতিদিন কাজ করুন', text: 'অর্ডার নিন, বিক্রয় করুন, স্টক দেখুন এবং পেমেন্ট লিখে রাখুন।' },
    { icon: FileText, title: 'হিসাব পরিষ্কার রাখুন', text: 'প্রতিটি বিক্রয়, কালেকশন ও বকেয়া সহজে খুঁজে পাওয়ার মতো করে জমা থাকে।' },
    { icon: BarChart3, title: 'সিদ্ধান্ত নিন', text: 'রিপোর্ট দেখে বুঝুন কোন পণ্য চলছে, কোথায় বকেয়া বেশি এবং কী করতে হবে।' }
  ],
  en: [
    { icon: Layers3, title: 'Add Your Data', text: 'Add products, retailers, company details and team information once.' },
    { icon: Route, title: 'Work Daily', text: 'Take orders, make sales, check stock and record payments every day.' },
    { icon: FileText, title: 'Keep Accounts Clear', text: 'Every sale, collection and due amount stays easy to find whenever you need it.' },
    { icon: BarChart3, title: 'Make Decisions', text: 'Use reports to see what is selling, where money is due and what needs action.' }
  ]
};

const securityContent = {
  bn: [
    'খাতার হিসাব বা Excel ফাইলের ঝামেলা কমে যায়',
    'স্টক কমে গেলে বা অর্ডার পেন্ডিং থাকলে দ্রুত বোঝা যায়',
    'রিটেইলারের বকেয়া এবং পেমেন্ট পরিষ্কারভাবে দেখা যায়',
    'মালিক, ম্যানেজার ও সেলস টিম একই তথ্য দেখে কাজ করতে পারে',
    'প্রতিদিনের বিক্রয় ও কালেকশন বুঝতে আলাদা হিসাব করতে হয় না',
    'ব্যবসা বড় হলে তথ্য হারানো বা ভুল হওয়ার ঝুঁকি কমে'
  ],
  en: [
    'Reduce notebook or spreadsheet confusion',
    'Notice low stock and pending orders faster',
    'See retailer dues and payment status clearly',
    'Owners, managers and sales teams can work from the same information',
    'Understand daily sales and collections without extra manual work',
    'Lower the chance of missing or incorrect business records as you grow'
  ]
};

export default function Landing() {
  const [language, setLanguage] = useState(() => localStorage.getItem('dms_language') || 'bn');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const t = copy[language];
  const modules = moduleContent[language];
  const workflow = workflowContent[language];
  const security = securityContent[language];

  useEffect(() => {
    localStorage.setItem('dms_language', language);
    setExpandedModule(null);
  }, [language]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);

    const sectionIds = ['home', 'modules', 'workflow', 'security', 'contact'];
    const trackActiveSection = () => {
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      let current = 'home';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= viewportCenter) current = id;
      }
      setActiveSection(current);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.16 });

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', trackActiveSection);
    handleScroll();
    trackActiveSection();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', trackActiveSection);
      observer.disconnect();
    };
  }, []);

  const navTargets = ['home', 'modules', 'workflow', 'security', 'contact'];

  return (
    <main className="landing-page">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>
      <div className="ambient ambient-three"></div>
      <div className="grid-glow"></div>

      <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-container nav-inner">
          <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-mark"><Package size={24} /></span>
            <span><strong>DMS</strong><small>{t.brandSubtitle}</small></span>
          </Link>

          <nav className={`nav-links ${mobileMenuOpen ? 'is-open' : ''}`}>
            {t.nav.map((item, index) => (
              <a key={item} href={`#${navTargets[index]}`} className={activeSection === navTargets[index] ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>{item}</a>
            ))}
          </nav>

          <div className="nav-actions">
            <button className="language-pill" onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}>
              <Globe2 size={15} /> {language === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <Link to="/register" className="ghost-link">{t.signUp}</Link>
            <Link to="/demo" className="ghost-link">{t.demo}</Link>
            <Link to="/login" className="nav-cta">{t.login}</Link>
          </div>

          <button className="menu-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <section id="home" className="hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-copy reveal" style={{ opacity: 1, transform: 'translateY(0)' }}>
            <div className="eyebrow"><Sparkles size={16} /> {t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p className="hero-subtitle">{t.subtitle}</p>
            <div className="hero-actions">
              <Link to="/register" className="register-button" onClick={() => sessionStorage.setItem('fromLanding', 'true')}>
                {t.register} <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="primary-button" onClick={() => sessionStorage.setItem('fromLanding', 'true')}>
                {t.primaryCta} <ArrowRight size={18} />
              </Link>
              <a href="#modules" className="secondary-button">{t.secondaryCta}</a>
            </div>
            <p className="trusted-line"><CheckCircle2 size={18} /> {t.trusted}</p>
            <div className="metric-strip">
              <span><strong>{language === 'bn' ? 'সব' : 'All'}</strong> {t.metricTables}</span>
              <span><strong>9</strong> {t.metricModules}</span>
              <span><strong>24/7</strong> {t.metricSession}</span>
            </div>
          </div>

          <div className="hero-visual reveal" style={{ opacity: 1, transform: 'translateY(0)' }}>
            <div className="orbit orbit-a"></div>
            <div className="orbit orbit-b"></div>
            <div className="dashboard-shell">
              <div className="dashboard-topbar">
                <span></span><span></span><span></span>
                <b>{t.liveOperations}</b>
              </div>
              <div className="dashboard-body">
                <aside className="dash-sidebar">
                  {[Package, Users, ShoppingCart, CreditCard, Warehouse].map((Icon, index) => <Icon key={index} size={18} />)}
                </aside>
                <div className="dash-main">
                  <div className="dash-kpis">
                    <div><small>{t.liveSales}</small><strong>৳ 8.42L</strong></div>
                    <div><small>{t.collection}</small><strong>৳ 4.18L</strong></div>
                  </div>
                  <div className="chart-card">
                    {[58, 82, 46, 92, 68, 76, 54, 88].map((height, index) => (
                      <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 0.14}s` }}></span>
                    ))}
                  </div>
                  <div className="signal-list">
                    <div><Bell size={17} /><span>{t.pendingOrders}</span><strong>37</strong></div>
                    <div><Zap size={17} /><span>{t.lowStock}</span><strong>12</strong></div>
                    <div><Truck size={17} /><span>{t.dispatchReady}</span><strong>64%</strong></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card card-one"><ShieldCheck size={18} /> {t.permissionSecure}</div>
            <div className="floating-card card-two"><Circle size={10} fill="currentColor" /> {t.scannerActive}</div>
          </div>
        </div>
      </section>

      <section id="modules" className="section-block">
        <div className="landing-container">
          <div className="section-heading reveal">
            <span className="section-kicker">{t.moduleKicker}</span>
            <h2>{t.modulesTitle}</h2>
            <p>{t.modulesSubtitle}</p>
          </div>
          <div className="module-grid">
            {modules.map(({ icon: Icon, title, text, metric, details }, index) => {
              const isExpanded = expandedModule === index;

              return (
              <article className={`module-card reveal ${isExpanded ? 'is-expanded' : ''}`} style={{ transitionDelay: `${index * 45}ms` }} key={index}>
                <div className="module-card-top">
                  <span className="module-icon"><Icon size={25} /></span>
                  <small>{metric}</small>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                {isExpanded && (
                  <ul className="module-details">
                    {details.map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                )}
                <button
                  type="button"
                  className="module-expand-btn"
                  onClick={() => setExpandedModule(isExpanded ? null : index)}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? t.closeModule : t.openModule} <ChevronRight size={15} />
                </button>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="workflow-section">
        <div className="landing-container workflow-grid">
          <div className="section-heading left reveal">
            <span className="section-kicker">{t.workflowKicker}</span>
            <h2>{t.workflowTitle}</h2>
            <p>{t.workflowSubtitle}</p>
          </div>
          <div className="workflow-lane">
            {workflow.map(({ icon: Icon, title, text }, index) => (
              <article className="workflow-step reveal" key={index} style={{ transitionDelay: `${index * 80}ms` }}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <Icon size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="security-section">
        <div className="landing-container security-grid">
          <div className="security-panel reveal">
            <div className="lock-badge"><LockKeyhole size={34} /></div>
            <h2>{t.securityTitle}</h2>
            <p>{t.securitySubtitle}</p>
          </div>
          <div className="security-list">
            {security.map((item, index) => (
              <div className="security-item reveal" key={index} style={{ transitionDelay: `${index * 55}ms` }}>
                <CheckCircle2 size={20} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="landing-container cta-card reveal">
          <div>
            <span className="section-kicker">{t.ctaKicker}</span>
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaSubtitle}</p>
          </div>
          <Link to="/login" className="primary-button">{t.primaryCta} <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="landing-container contact-grid">
          <div className="section-heading left reveal">
            <span className="section-kicker">{t.contactKicker}</span>
            <h2>{t.contactTitle}</h2>
            <p>{t.contactSubtitle}</p>
          </div>
          <div className="contact-cards">
            <a href="tel:+8801234567890" className="contact-card reveal"><Phone size={22} /><span>+880 1234-567890</span></a>
            <a href="mailto:support@dms.com" className="contact-card reveal"><Mail size={22} /><span>support@dms.com</span></a>
            <div className="contact-card reveal"><MapPin size={22} /><span>{t.location}</span></div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <Link to="/" className="brand"><span className="brand-mark"><Package size={22} /></span><span><strong>DMS</strong><small>{t.footer}</small></span></Link>
          <p>{t.rights}</p>
        </div>
      </footer>
    </main>
  );
}

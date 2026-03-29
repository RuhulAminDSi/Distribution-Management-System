import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Users, 
  CreditCard, 
  ShoppingCart, 
  Bell,
  Building2,
  FileText,
  Warehouse,
  UserCircle,
  Settings,
  BarChart3,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Menu,
  X,
  ChevronRight,
  Circle
} from 'lucide-react';
import './Landing.css';

const translations = {
  bn: {
    topBarPhone: '+৮৮০ ১২৩৪-৫৬৭৮৯০',
    topBarEmail: 'support@dms.com',
    topBarHours: '২৪/৭ সাপোর্ট',
    navHome: 'হোম',
    navFeatures: 'ফিচার',
    navServices: 'সার্ভিস',
    navAbout: 'আমাদের সম্পর্কে',
    navContact: 'যোগাযোগ',
    signIn: 'সাইন ইন',
    getStarted: 'লগ ইন',
    demo: 'ডেমো',
    heroTitle: 'ডিস্ট্রিবিউশন ম্যানেজমেন্ট',
    heroTitleSpan: 'সিস্টেম',
    heroSubtitle: 'শক্তিশালী ইনভেন্টরি ম্যানেজমেন্ট, রিয়েল-টাইম ট্র্যাকিং এবং অটোমেটেড অর্ডারিং দিয়ে আপনার ডিস্ট্রিবিউশন নেটওয়ার্ক স্ট্রিমলাইন করুন। আত্মবিশ্বাসের সাথে আপনার ব্যবসা বৃদ্ধি করুন।',
    startFree: 'ফ্রি ট্রায়াল শুরু করুন',
    learnMore: 'আরও জানুন',
    learnMoreDesc: 'বিস্তারিত জানতে ক্লিক করুন',
    companies: 'কোম্পানি',
    retailers: 'রিটেইলার',
    uptime: 'আপটাইম',
    featuresTitle: 'আপনার যা দরকার',
    featuresSubtitle: 'ইনভেন্টরি পরিচালনা, বিক্রয় ট্র্যাকিং এবং আপনার ব্যবসা বৃদ্ধির জন্য শক্তিশালী টুলস',
    featuresTag: 'ফিচার',
    analytics: 'রিয়েল-টাইম অ্যানালিটিক্স',
    analyticsDesc: 'ব্যাপক ড্যাশবোর্ড দিয়ে আপনার বিক্রয়, ইনভেন্টরি এবং পারফরম্যান্সে তাৎক্ষণিক অন্তর্দৃষ্টি পান। প্রতিদিনের বিক্রয় ট্রেন্ড, শীর্ষ পণ্য এবং গ্রাহক আচরণ বিশ্লেষণ করুন।',
    inventory: 'ইনভেন্টরি ম্যানেজমেন্ট',
    inventoryDesc: 'স্বয়ংক্রিয় পুনরায় অর্ডার অ্যালার্ট সহ সমস্ত গুদাম এবং রিটেইল পয়েন্টে স্টক লেভেল ট্র্যাক করুন। একাধিক গুদাম থেকে স্টক ট্রান্সফার এবং ইনভেন্টরি অপ্টিমাইজেশন করুন।',
    retailer: 'রিটেইলার নেটওয়ার্ক',
    retailerDesc: 'উৎসর্গীকৃত প্রোফাইল এবং অর্ডার ইতিহাস দিয়ে আপনার সম্পূর্ণ রিটেইলার নেটওয়ার্ক দক্ষতার সাথে পরিচালনা করুন। প্রতিটি রিটেইলারের ক্রেডিট লিমিট এবং পেমেন্ট স্ট্যাটাস ম্যানেজ করুন।',
    payment: 'পেমেন্ট ট্র্যাকিং',
    paymentDesc: 'সমস্ত পেমেন্ট ট্র্যাক করুন, ক্রেডিট লিমিট পরিচালনা করুন এবং সেটেলমেন্ট সহজে হ্যান্ডেল করুন। বকেয়া পেমেন্ট রিমাইন্ডার এবং অটোমেটেড সেটেলমেন্ট সিস্টেম।',
    sales: 'বিক্রয় ম্যানেজমেন্ট',
    salesDesc: 'অর্ডার প্রসেস করুন, ডিসকাউন্ট পরিচালনা করুন এবং অঞ্চল জুড়ে বিক্রয় পারফরম্যান্স ট্র্যাক করুন। অফলাইন এবং অনলাইন উভয় বিক্রয় চ্যানেল সাপোর্ট।',
    notification: 'স্মার্ট নোটিফিকেশন',
    notificationDesc: 'লো স্টক, পেন্ডিং অর্ডার এবং পেমেন্টের তারিখের জন্য অ্যালার্ট দিয়ে অবগত থাকুন। ইমেইল এবং SMS দিয়ে তাৎক্ষণিক নোটিফিকেশন পান।',
    servicesTag: 'সার্ভিস',
    servicesTitle: 'ব্যাপক ডিস্ট্রিবিউশন সলিউশন',
    servicesSubtitle: 'আধুনিক ডিস্ট্রিবিউশন ব্যবসার জন্য এন্ড-টু-এন্ড সলিউশন',
    companyMgmt: 'কোম্পানি ম্যানেজমেন্ট',
    companyMgmtDesc: 'রোল-ভিত্তিক অ্যাক্সেস সহ একটি প্ল্যাটফর্ম থেকে একাধিক কোম্পানি এবং শাখা পরিচালনা করুন। প্রতিটি কোম্পানির জন্য আলাদা সেটিংস এবং ড্যাশবোর্ড।',
    productCat: 'প্রোডাক্ট ক্যাটালগ',
    productCatDesc: 'ক্যাটাগরি, ইউনিট এবং ভেরিয়েন্ট দিয়ে প্রোডাক্ট সংগঠিত করুন। এমআরপি এবং হোলসেল প্রাইস ট্র্যাক করুন। প্রতিযোগী বিশ্লেষণ এবং মার্জিন ক্যালকুলেশন।',
    financial: 'ফাইন্যানশিয়াল ম্যানেজমেন্ট',
    financialDesc: 'পেমেন্ট হ্যান্ডেল করুন, ক্রেডিট ট্র্যাক করুন, খরচ পরিচালনা করুন এবং আর্থিক রিপোর্ট তৈরি করুন। প্রফিট মার্জিন, লস অ্যানালাইসিস এবং ক্যাশফ্লো ট্র্যাকিং।',
    stockMgmt: 'স্টক ম্যানেজমেন্ট',
    stockMgmtDesc: 'স্টক ট্রান্সফার ট্র্যাক করুন, গুদাম পরিচালনা করুন এবং অপ্টিমাল ইনভেন্টরি লেভেল বজায় রাখুন। স্বয়ংক্রিয় স্টক অ্যালার্ট এবং ফাস্ট মুভিং আইটেম ট্র্যাকিং।',
    reports: 'বিস্তারিত রিপোর্ট',
    reportsDesc: 'বিক্রয়, স্টক, পেমেন্ট এবং ব্যবসার পারফরম্যান্সের উপর ব্যাপক রিপোর্ট তৈরি করুন। কাস্টম রিপোর্ট, এক্সপোর্ট ফিচার এবং অটোমেটেড শিডিউলড রিপোর্ট।',
    userMgmt: 'ইউজার ম্যানেজমেন্ট',
    userMgmtDesc: 'নিরাপদ অ্যাক্সেসের জন্য বিভিন্ন রোল এবং পারমিশন সহ টিম সদস্য পরিচালনা করুন। অ্যাক্টিভিটি লগ এবং লগিন ট্র্যাকিং সহ।',
    learnMoreLink: 'আরও জানুন',
    aboutTag: 'আমাদের সম্পর্কে',
    aboutTitle: 'ডিস্ট্রিবিউশন ম্যানেজমেন্টে বিপ্লব',
    aboutDesc1: 'ডিএমএস (ডিস্ট্রিবিশন ম্যানেজমেন্ট সিস্টেম) একটি ব্যাপক সফটওয়্যার সলিউশন যা আপনার সম্পূর্ণ ডিস্ট্রিবিউশন প্রক্রিয়া স্ট্রিমলাইন এবং অটোমেট করতে ডিজাইন করা হয়েছে।',
    aboutDesc2: 'আমাদের প্ল্যাটফর্ম সব আকারের ব্যবসাকে তাদের সাপ্লাই চেইন অপ্টিমাইজ করতে, অপারেশনাল খরচ কমাতে এবং দক্ষতা উন্নত করতে সাহায্য করে।',
    cloud: 'ক্লাউড-ভিত্তিক প্ল্যাটফর্ম',
    realtime: 'রিয়েল-টাইম সিঙ্ক্রোনাইজেশন',
    support: '২৪/৭ গ্রাহক সাপোর্ট',
    security: 'নিরাপদ ডেটা এনক্রিপশন',
    ctaTitle: 'আপনার ব্যবসা রূপান্তর করতে প্রস্তুত?',
    ctaSubtitle: 'আপনার ব্যবসা বৃদ্ধি করতে ইতিমধ্যে ডিএমএস ব্যবহার করে শত শত কোম্পানিতে যোগ দিন।',
    ctaButton: 'ফ্রি শুরু করুন',
    ctaContact: 'সেলসে যোগাযোগ করুন',
    contactTag: 'যোগাযোগ',
    contactTitle: 'যোগাযোগ করুন',
    contactSubtitle: 'প্রশ্ন আছে? আমরা আপনার কাছ থেকে শুনতে ভালোবাসব।',
    address: 'ঠিকানা',
    phone: 'ফোন',
    email: 'ইমেইল',
    hours: 'সময়',
    addressLine: '১২৩ বিজনেস অ্যাভিনিউ',
    city: 'ঢাকা, বাংলাদেশ',
    phone2: '+৮৮০ ৯৮৭৬-৫৪৩২১০',
    email2: 'info@dms.com',
    hoursLine: 'সবসময় উপলব্ধ',
    footerDesc: 'ডিস্ট্রিবিউশন ম্যানেজমেন্ট সিস্টেম - শক্তিশালী টুলস এবং অ্যানালিটিক্স দিয়ে আপনার ব্যবসা স্ট্রিমলাইন করুন।',
    quickLinks: 'কুইক লিংক',
    services: 'সার্ভিস',
    contactInfo: 'যোগাযোগ',
    footerCompany: 'কোম্পানি ম্যানেজমেন্ট',
    footerProduct: 'প্রোডাক্ট ক্যাটালগ',
    footerSales: 'বিক্রয় ট্র্যাকিং',
    footerPayment: 'পেমেন্ট ম্যানেজমেন্ট',
    footerReports: 'রিপোর্ট এবং অ্যানালিটিক্স',
    copyright: '© ২০২৬ ডিএমএস। সর্বস্বত্ব সংরক্ষিত।',
    privacy: 'গোপনীয়তা নীতি',
    terms: 'সেবার শর্তাবলী',
    yearsExp: 'বছরের অভিজ্ঞতা',
  },
  en: {
    topBarPhone: '+880 1234-567890',
    topBarEmail: 'support@dms.com',
    topBarHours: '24/7 Support',
    navHome: 'Home',
    navFeatures: 'Features',
    navServices: 'Services',
    navAbout: 'About',
    navContact: 'Contact',
    signIn: 'Sign In',
    getStarted: 'Login',
    demo: 'Demo',
    heroTitle: 'Distribution Management',
    heroTitleSpan: 'System',
    heroSubtitle: 'Streamline your distribution network with powerful inventory management, real-time tracking, and automated ordering. Grow your business with confidence.',
    startFree: 'Start Free Trial',
    learnMore: 'Learn More',
    learnMoreDesc: 'Click to learn more details',
    companies: 'Companies',
    retailers: 'Retailers',
    uptime: 'Uptime',
    featuresTitle: 'Everything You Need',
    featuresSubtitle: 'Powerful tools to manage inventory, track sales, and grow your business',
    featuresTag: 'Features',
    analytics: 'Real-time Analytics',
    analyticsDesc: 'Get instant insights into your sales, inventory, and performance with comprehensive dashboards. Analyze daily sales trends, top products, and customer behavior with advanced reporting tools.',
    inventory: 'Inventory Management',
    inventoryDesc: 'Track stock levels across all warehouses and retail points with automated reorder alerts. Manage multi-warehouse inventory, stock transfers, and optimize inventory levels with smart forecasting.',
    retailer: 'Retailer Network',
    retailerDesc: 'Manage your entire retailer network efficiently with dedicated profiles and order history. Track credit limits, payment status, and performance metrics for each retailer in your distribution network.',
    payment: 'Payment Tracking',
    paymentDesc: 'Track all payments, manage credit limits, and handle settlements with ease. Automated payment reminders and settlement system for seamless financial operations.',
    sales: 'Sales Management',
    salesDesc: 'Process orders, manage discounts, and track sales performance across regions. Support for both offline and online sales channels with real-time order processing.',
    notification: 'Smart Notifications',
    notificationDesc: 'Stay informed with alerts for low stock, pending orders, and payment due dates. Receive instant notifications via email and SMS for critical business updates.',
    servicesTag: 'Services',
    servicesTitle: 'Comprehensive Distribution Solutions',
    servicesSubtitle: 'End-to-end solutions for modern distribution businesses',
    companyMgmt: 'Company Management',
    companyMgmtDesc: 'Manage multiple companies and branches from a single platform with role-based access. Separate settings and dashboards for each company with complete data isolation.',
    productCat: 'Product Catalog',
    productCatDesc: 'Organize products with categories, units, and variants. Track MRP and wholesale prices. Competitive analysis and margin calculation tools included.',
    financial: 'Financial Management',
    financialDesc: 'Handle payments, track credits, manage expenses, and generate financial reports. Profit margin analysis, loss tracking, and comprehensive cashflow management.',
    stockMgmt: 'Stock Management',
    stockMgmtDesc: 'Track stock transfers, manage warehouses, and maintain optimal inventory levels. Automated stock alerts and fast-moving item tracking for better inventory control.',
    reports: 'Detailed Reports',
    reportsDesc: 'Generate comprehensive reports on sales, stock, payments, and business performance. Custom report builder, export features, and automated scheduled report delivery.',
    userMgmt: 'User Management',
    userMgmtDesc: 'Manage team members with different roles and permissions for secure access. Activity logging and login tracking for complete security and accountability.',
    learnMoreLink: 'Learn More',
    aboutTag: 'About Us',
    aboutTitle: 'Revolutionizing Distribution Management',
    aboutDesc1: 'DMS (Distribution Management System) is a comprehensive software solution designed to streamline and automate your entire distribution process. From managing inventory to tracking payments, we\'ve got you covered.',
    aboutDesc2: 'Our platform helps businesses of all sizes optimize their supply chain, reduce operational costs, and improve efficiency. With real-time analytics and intuitive dashboards, you can make data-driven decisions instantly.',
    cloud: 'Cloud-based platform',
    realtime: 'Real-time synchronization',
    support: '24/7 customer support',
    security: 'Secure data encryption',
    ctaTitle: 'Ready to Transform Your Business?',
    ctaSubtitle: 'Join hundreds of companies already using DMS to grow their business.',
    ctaButton: 'Get Started Free',
    ctaContact: 'Contact Sales',
    contactTag: 'Contact',
    contactTitle: 'Get In Touch',
    contactSubtitle: 'Have questions? We\'d love to hear from you.',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    hours: 'Hours',
    addressLine: '123 Business Avenue',
    city: 'Dhaka, Bangladesh',
    phone2: '+880 9876-543210',
    email2: 'info@dms.com',
    hoursLine: 'Always Available',
    footerDesc: 'Distribution Management System - Streamline your business with powerful tools and analytics.',
    quickLinks: 'Quick Links',
    services: 'Services',
    contactInfo: 'Contact',
    footerCompany: 'Company Management',
    footerProduct: 'Product Catalog',
    footerSales: 'Sales Tracking',
    footerPayment: 'Payment Management',
    footerReports: 'Reports & Analytics',
    copyright: '© 2026 DMS. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    yearsExp: 'Years of Experience',
  }
};

export default function Landing() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dms_language') || 'bn';
  });
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem('dms_language', language);
  }, [language]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  return (
    <div className="landing-page">
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              <span className="brand-icon">
                <Package size={24} />
              </span>
              <span className="brand-text">
                <span className="live-indicator"><Circle size={10} fill="#fff" /></span>
                DMS
              </span>
            </Link>
            
            <nav className={`navbar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <a href="#home" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navHome}</a>
              <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navFeatures}</a>
              <a href="#services" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navServices}</a>
              <a href="#about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navAbout}</a>
              <a href="#contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t.navContact}</a>
            </nav>

            <div className="navbar-actions">
              <button className="lang-toggle-nav" onClick={toggleLanguage}>
                {language === 'en' ? 'বাংলা' : 'English'}
              </button>
              <Link to="/demo" className="btn btn-outline">{t.demo}</Link>
              <Link to="/login" className="btn btn-primary">{t.getStarted}</Link>
            </div>

            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                {t.heroTitle}<br />
                <span className="highlight">{t.heroTitleSpan}</span>
              </h1>
              <p className="hero-subtitle">
                {t.heroSubtitle}
              </p>
              <div className="hero-actions">
                <Link to="/login" className="btn btn-primary btn-lg">
                  <span>{t.startFree}</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </Link>
                <a href="#features" className="btn btn-outline btn-lg">{t.learnMore}</a>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number" data-count="500">500+</span>
                  <span className="stat-label">{t.companies}</span>
                </div>
                <div className="stat">
                  <span className="stat-number" data-count="50">50K+</span>
                  <span className="stat-label">{t.retailers}</span>
                </div>
                <div className="stat">
                  <span className="stat-number">99.9%</span>
                  <span className="stat-label">{t.uptime}</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-card">
                <div className="card-header">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="card-body">
                  <div className="mock-dashboard">
                    <div className="mock-sidebar"></div>
                    <div className="mock-content">
                      <div className="mock-chart">
                        <div className="chart-bar" style={{height: '60%'}}></div>
                        <div className="chart-bar" style={{height: '80%'}}></div>
                        <div className="chart-bar" style={{height: '45%'}}></div>
                        <div className="chart-bar" style={{height: '90%'}}></div>
                        <div className="chart-bar" style={{height: '70%'}}></div>
                        <div className="chart-bar" style={{height: '85%'}}></div>
                      </div>
                      <div className="mock-stats-row">
                        <div className="mock-stat"></div>
                        <div className="mock-stat"></div>
                        <div className="mock-stat"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="features-bg-shapes">
          <div className="feature-shape feature-shape-1"></div>
          <div className="feature-shape feature-shape-2"></div>
          <div className="feature-shape feature-shape-3"></div>
        </div>
        <div className="container">
          <div className="section-header animate-on-scroll" id="features">
            <span className="section-tag"><Circle size={10} fill="#fff" className="section-tag-dot" /> {t.featuresTag}</span>
            <h2 className="section-title">{t.featuresTitle}</h2>
            <p className="section-subtitle">{t.featuresSubtitle}</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card animate-on-scroll" id="feature-1">
              <div className="feature-icon"><BarChart3 size={48} /></div>
              <h3>{t.analytics}</h3>
              <p>{t.analyticsDesc}</p>
              <a href="#services" className="feature-learn-more">
                {t.learnMoreLink} <ArrowRight size={14} />
              </a>
              <div className="feature-card-hover">
                <BarChart3 size={120} />
              </div>
            </div>
            
            <div className="feature-card animate-on-scroll" id="feature-2">
              <div className="feature-icon"><Warehouse size={48} /></div>
              <h3>{t.inventory}</h3>
              <p>{t.inventoryDesc}</p>
              <a href="#services" className="feature-learn-more">
                {t.learnMoreLink} <ArrowRight size={14} />
              </a>
              <div className="feature-card-hover">
                <Warehouse size={120} />
              </div>
            </div>
            
            <div className="feature-card animate-on-scroll" id="feature-3">
              <div className="feature-icon"><Users size={48} /></div>
              <h3>{t.retailer}</h3>
              <p>{t.retailerDesc}</p>
              <a href="#services" className="feature-learn-more">
                {t.learnMoreLink} <ArrowRight size={14} />
              </a>
              <div className="feature-card-hover">
                <Users size={120} />
              </div>
            </div>
            
            <div className="feature-card animate-on-scroll" id="feature-4">
              <div className="feature-icon"><CreditCard size={48} /></div>
              <h3>{t.payment}</h3>
              <p>{t.paymentDesc}</p>
              <a href="#services" className="feature-learn-more">
                {t.learnMoreLink} <ArrowRight size={14} />
              </a>
              <div className="feature-card-hover">
                <CreditCard size={120} />
              </div>
            </div>
            
            <div className="feature-card animate-on-scroll" id="feature-5">
              <div className="feature-icon"><ShoppingCart size={48} /></div>
              <h3>{t.sales}</h3>
              <p>{t.salesDesc}</p>
              <a href="#services" className="feature-learn-more">
                {t.learnMoreLink} <ArrowRight size={14} />
              </a>
              <div className="feature-card-hover">
                <ShoppingCart size={120} />
              </div>
            </div>
            
            <div className="feature-card animate-on-scroll" id="feature-6">
              <div className="feature-icon"><Bell size={48} /></div>
              <h3>{t.notification}</h3>
              <p>{t.notificationDesc}</p>
              <a href="#services" className="feature-learn-more">
                {t.learnMoreLink} <ArrowRight size={14} />
              </a>
              <div className="feature-card-hover">
                <Bell size={120} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <div className="section-header animate-on-scroll" id="services">
            <span className="section-tag">{t.servicesTag}</span>
            <h2 className="section-title">{t.servicesTitle}</h2>
            <p className="section-subtitle">{t.servicesSubtitle}</p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-image">
                <Building2 size={70} className="service-icon-lucide" />
                <div className="service-shine"></div>
              </div>
              <div className="service-content">
                <h3>{t.companyMgmt}</h3>
                <p>{t.companyMgmtDesc}</p>
                <Link to="/login" className="service-link">
                  {t.learnMoreLink} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-image">
                <Package size={70} className="service-icon-lucide" />
                <div className="service-shine"></div>
              </div>
              <div className="service-content">
                <h3>{t.productCat}</h3>
                <p>{t.productCatDesc}</p>
                <Link to="/login" className="service-link">
                  {t.learnMoreLink} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-image">
                <CreditCard size={70} className="service-icon-lucide" />
                <div className="service-shine"></div>
              </div>
              <div className="service-content">
                <h3>{t.financial}</h3>
                <p>{t.financialDesc}</p>
                <Link to="/login" className="service-link">
                  {t.learnMoreLink} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-image">
                <Warehouse size={70} className="service-icon-lucide" />
                <div className="service-shine"></div>
              </div>
              <div className="service-content">
                <h3>{t.stockMgmt}</h3>
                <p>{t.stockMgmtDesc}</p>
                <Link to="/login" className="service-link">
                  {t.learnMoreLink} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-image">
                <FileText size={70} className="service-icon-lucide" />
                <div className="service-shine"></div>
              </div>
              <div className="service-content">
                <h3>{t.reports}</h3>
                <p>{t.reportsDesc}</p>
                <Link to="/login" className="service-link">
                  {t.learnMoreLink} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="service-card">
              <div className="service-image">
                <UserCircle size={70} className="service-icon-lucide" />
                <div className="service-shine"></div>
              </div>
              <div className="service-content">
                <h3>{t.userMgmt}</h3>
                <p>{t.userMgmtDesc}</p>
                <Link to="/login" className="service-link">
                  {t.learnMoreLink} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-image">
              <div className="about-card">
                <div className="about-card-inner">
                  <span className="about-number">10+</span>
                  <span className="about-label">{t.yearsExp}</span>
                </div>
                <div className="about-orb"></div>
              </div>
            </div>
            <div className="about-text">
              <span className="section-tag">{t.aboutTag}</span>
              <h2>{t.aboutTitle}</h2>
              <p>{t.aboutDesc1}</p>
              <p>{t.aboutDesc2}</p>
              <ul className="about-features">
                <li><TrendingUp size={18} /> {t.cloud}</li>
                <li><TrendingUp size={18} /> {t.realtime}</li>
                <li><TrendingUp size={18} /> {t.support}</li>
                <li><TrendingUp size={18} /> {t.security}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-glow"></div>
        <div className="container">
          <div className="cta-content">
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaSubtitle}</p>
            <div className="cta-actions">
              <Link to="/login" className="btn btn-primary btn-lg">{t.ctaButton}</Link>
              <a href="#contact" className="btn btn-outline btn-lg">{t.ctaContact}</a>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header animate-on-scroll" id="contact">
            <span className="section-tag">{t.contactTag}</span>
            <h2 className="section-title">{t.contactTitle}</h2>
            <p className="section-subtitle">{t.contactSubtitle}</p>
          </div>
          
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon live-icon"><MapPin size={40} /></div>
              <h3>{t.address}</h3>
              <p>{t.addressLine}<br />{t.city}</p>
              <div className="contact-map">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.677586195429!2d90.4077273154312!3d23.75042138459745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375421b4d7947153%3A0x7603dd42c82730!2s Dhaka%2C%20Bangladesh!5e0!3m2!1sen!2s!4v1645456789012!5m2!1sen!2s" 
                  width="100%" 
                  height="120" 
                  style={{ border: 0, borderRadius: '8px' }} 
                  allowFullScreen="" 
                  loading="lazy"
                  title="Map"
                ></iframe>
              </div>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon live-icon"><Phone size={40} /></div>
              <h3>{t.phone}</h3>
              <p>
                <a href={`tel:${t.topBarPhone.replace(/\s/g, '')}`} className="contact-link">{t.topBarPhone}</a><br />
                <a href={`tel:${t.phone2.replace(/\s/g, '')}`} className="contact-link">{t.phone2}</a>
              </p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon live-icon"><Mail size={40} /></div>
              <h3>{t.email}</h3>
              <p>
                <a href={`mailto:${t.topBarEmail}`} className="contact-link">{t.topBarEmail}</a><br />
                <a href={`mailto:${t.email2}`} className="contact-link">{t.email2}</a>
              </p>
            </div>
            
            <div className="contact-card">
              <div className="contact-icon live-icon"><Clock size={40} /></div>
              <h3>{t.hours}</h3>
              <p>{t.topBarHours}<br />{t.hoursLine}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="brand-icon">
                  <Package size={20} />
                </span>
                <span className="brand-text">DMS</span>
              </Link>
              <p>{t.footerDesc}</p>
              <div className="footer-social">
                <a href="#">𝕏</a>
                <a href="#">in</a>
                <a href="#">📘</a>
              </div>
            </div>
            
            <div className="footer-links">
              <h4>{t.quickLinks}</h4>
              <a href="#home">{t.navHome}</a>
              <a href="#features">{t.navFeatures}</a>
              <a href="#services">{t.navServices}</a>
              <a href="#about">{t.navAbout}</a>
              <a href="#contact">{t.navContact}</a>
            </div>
            
            <div className="footer-links">
              <h4>{t.services}</h4>
              <a href="#">{t.footerCompany}</a>
              <a href="#">{t.footerProduct}</a>
              <a href="#">{t.footerSales}</a>
              <a href="#">{t.footerPayment}</a>
              <a href="#">{t.footerReports}</a>
            </div>
            
            <div className="footer-links">
              <h4>{t.contactInfo}</h4>
              <p><MapPin size={14} /> {t.addressLine}<br />{t.city}</p>
              <p><Phone size={14} /> {t.topBarPhone}</p>
              <p><Mail size={14} /> {t.topBarEmail}</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>{t.copyright}</p>
            <div className="footer-legal">
              <a href="#">{t.privacy}</a>
              <a href="#">{t.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

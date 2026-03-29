import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Common
    Search: 'Search',
    Loading: 'Loading...',
    Save: 'Save',
    Cancel: 'Cancel',
    Delete: 'Delete',
    Edit: 'Edit',
    Add: 'Add',
    Actions: 'Actions',
    Status: 'Status',
    Active: 'Active',
    Inactive: 'Inactive',
    Yes: 'Yes',
    No: 'No',
    Name: 'Name',
    Code: 'Code',
    Phone: 'Phone',
    Address: 'Address',
    Email: 'Email',
    Date: 'Date',
    Time: 'Time',
    Total: 'Total',
    Amount: 'Amount',
    Quantity: 'Quantity',
    Price: 'Price',
    Type: 'Type',
    Note: 'Note',
    Notes: 'Notes',
    Status: 'Status',
    Error: 'Error',
    Success: 'Success',
    Warning: 'Warning',
    Info: 'Info',
    Required: 'Required',
    Optional: 'Optional',
    NoDataFound: 'No Data Found',
    ConfirmDelete: 'Are you sure you want to delete?',
    DeleteSuccess: 'Deleted successfully',
    SaveSuccess: 'Saved successfully',
    UpdateSuccess: 'Updated successfully',
    DeleteError: 'Failed to delete',
    SaveError: 'Failed to save',

    // Navigation
    Dashboard: 'Dashboard',
    Companies: 'Companies',
    Products: 'Products',
    Retailers: 'Retailers',
    Sales: 'Sales',
    Payments: 'Payments',
    Stock: 'Stock',
    Reports: 'Reports',
    Users: 'Users',
    Settings: 'Settings',
    Menu: 'Menu',
    LoggedInAs: 'Logged in as',
    Logout: 'Logout',
    ChangePassword: 'Change Password',
    English: 'English',
    Bangla: 'Bangla',

    // Dashboard
    WelcomeToDMS: 'Welcome to DMS',
    TodaySales: "Today's Sales",
    TotalSales: 'Total Sales',
    TotalSalesAllTime: 'Total Sales (All Time)',
    TotalOutstanding: 'Total Outstanding',
    TotalProducts: 'Total Products',
    LowStockAlerts: 'Low Stock Alerts',
    RecentSales: 'Recent Sales',
    LowStockProducts: 'Low Stock Products',
    NoSalesToday: 'No sales today',
    AllProductsWellStocked: 'All products are well stocked',
    Collected: 'Collected',
    Due: 'Due',
    Invoice: 'Invoice',
    Retailer: 'Retailer',
    Product: 'Product',

    // Companies
    AddCompany: 'Add Company',
    EditCompany: 'Edit Company',
    CompanyName: 'Company Name',
    ContactPerson: 'Contact Person',
    DueLimit: 'Due Limit',

    // Products
    AddProduct: 'Add Product',
    EditProduct: 'Edit Product',
    ProductName: 'Product Name',
    Category: 'Category',
    Company: 'Company',
    PurchasePrice: 'Purchase Price',
    DealerPrice: 'Dealer Price',
    MRP: 'MRP',
    Stock: 'Stock',
    Unit: 'Unit',
    PackSize: 'Pack Size',
    LowStockAlert: 'Low Stock Alert',
    ExpiryDate: 'Expiry Date',
    ExpiryProducts: 'Expiry Products',
    StockValue: 'Stock Value',
    NoProductsFound: 'No products found',
    InsufficientStock: 'Insufficient stock',

    // Retailers
    AddRetailer: 'Add Retailer',
    EditRetailer: 'Edit Retailer',
    ShopName: 'Shop Name',
    OwnerName: 'Owner Name',
    Area: 'Area',
    CreditLimit: 'Credit Limit',
    Outstanding: 'Outstanding',
    NoRetailersFound: 'No retailers found',

    // Sales
    NewInvoice: 'New Invoice',
    CreateInvoice: 'Create Invoice',
    InvoiceNo: 'Invoice No',
    SelectRetailer: 'Select Retailer',
    SelectProduct: 'Select Product',
    AddItem: 'Add Item',
    Discount: 'Discount',
    DiscountPercent: 'Discount %',
    PaidAmount: 'Paid Amount',
    Subtotal: 'Subtotal',
    DueAmount: 'Due Amount',
    Paid: 'Paid',
    Partial: 'Partial',
    NoInvoicesFound: 'No invoices found',
    SelectRetailerAndAddItems: 'Please select retailer and add items',
    CreditLimitExceeded: 'Credit limit exceeded',

    // Payments
    NewPayment: 'New Payment',
    RecordPayment: 'Record Payment',
    PaymentNo: 'Payment No',
    PaymentMethod: 'Payment Method',
    ReferenceNo: 'Reference No',
    PaymentDate: 'Payment Date',
    CollectedBy: 'Collected By',
    Cash: 'Cash',
    Bank: 'Bank',
    MobileBanking: 'Mobile Banking',
    NoPaymentsFound: 'No payments found',
    SelectRetailer: 'Select Retailer',
    EnterAmount: 'Enter amount',

    // Stock
    StockHistory: 'Stock History',
    PurchaseOrders: 'Purchase Orders',
    NewPurchaseOrder: 'New Purchase Order',
    OrderNo: 'Order No',
    OrderDate: 'Order Date',
    Received: 'Received',
    Pending: 'Pending',
    In: 'In',
    Out: 'Out',
    Adjustment: 'Adjustment',
    Reference: 'Reference',
    NoStockHistory: 'No stock history',
    SelectCompany: 'Select Company',
    OrderDetails: 'Order Details',
    ReceivedQuantity: 'Received Quantity',

    // Reports
    DailySales: 'Daily Sales',
    ProductWise: 'Product-wise',
    CompanyWise: 'Company-wise',
    Profit: 'Profit',
    Due: 'Due',
    DailySalesReport: 'Daily Sales Report',
    ProductWiseSalesReport: 'Product-wise Sales Report',
    CompanyWiseSalesReport: 'Company-wise Sales Report',
    ProfitReport: 'Profit Report',
    StockReport: 'Stock Report',
    DueReport: 'Due Report',
    StartDate: 'Start Date',
    EndDate: 'End Date',
    InvoiceCount: 'Invoice Count',
    Sales: 'Sales',
    Cost: 'Cost',
    ProfitAmount: 'Profit',
    Category: 'Category',
    Invoices: 'Invoices',

    // Users
    AddUser: 'Add User',
    EditUser: 'Edit User',
    Username: 'Username',
    FullName: 'Full Name',
    Role: 'Role',
    Password: 'Password',
    ConfirmPassword: 'Confirm Password',
    SystemAdmin: 'System Admin',
    Admin: 'Admin',
    Manager: 'Manager',
    Salesman: 'Salesman',
    Accountant: 'Accountant',
    Driver: 'Driver',
    Loader: 'Loader',
    NoUsersFound: 'No users found',

    // Settings
    GeneralSettings: 'General Settings',
    CompanyInfo: 'Company Info',
    InvoiceSettings: 'Invoice Settings',
    LowStockThreshold: 'Low Stock Threshold',

    // Auth
    Login: 'Login',
    ForgotPassword: 'Forgot Password?',
    ResetPassword: 'Reset Password',
    CurrentPassword: 'Current Password',
    NewPassword: 'New Password',
    LoginFailed: 'Login failed',
    InvalidCredentials: 'Invalid credentials',
    PasswordChanged: 'Password changed successfully',
    PasswordMismatch: 'Passwords do not match',
    PasswordTooShort: 'Password must be at least 6 characters',
    SendResetLink: 'Send Reset Link',
    BackToLogin: 'Back to Login',
    PasswordResetLinkSent: 'Password reset link has been sent to your email',
    EnterAmount: 'Enter',
    TryAgain: 'Please try again',
    Redirecting: 'Redirecting',
    Access: 'Control',
    Cheque: 'Cheque',
    Or: 'or',
    Default: 'Default',
    AccountDeactivated: 'Your account has been deactivated. Please contact administrator.',
    Page: 'Page',
  },
  bn: {
    // Common
    Search: 'অনুসন্ধান',
    Loading: 'লোড হচ্ছে...',
    Save: 'সংরক্ষণ',
    Cancel: 'বাতিল',
    Delete: 'মুছুন',
    Edit: 'সম্পাদনা',
    Add: 'যোগ করুন',
    Actions: 'পদক্ষেপ',
    Status: 'স্ট্যাটাস',
    Active: 'সক্রিয়',
    Inactive: 'নিষ্ক্রিয়',
    Yes: 'হ্যাঁ',
    No: 'না',
    Name: 'নাম',
    Code: 'কোড',
    Phone: 'ফোন',
    Address: 'ঠিকানা',
    Email: 'ইমেইল',
    Date: 'তারিখ',
    Time: 'সময়',
    Total: 'মোট',
    Amount: 'টাকা',
    Quantity: 'পরিমাণ',
    Price: 'দাম',
    Type: 'ধরন',
    Note: 'নোট',
    Notes: 'নোট',
    Status: 'স্ট্যাটাস',
    Error: 'ত্রুটি',
    Success: 'সফল',
    Warning: 'সতর্কতা',
    Info: 'তথ্য',
    Required: 'আবশ্যক',
    Optional: 'ঐচ্ছিক',
    NoDataFound: 'কোনো তথ্য পাওয়া যায়নি',
    ConfirmDelete: 'আপনি কি মুছতে চান?',
    DeleteSuccess: 'সফলভাবে মুছে ফেলা হয়েছে',
    SaveSuccess: 'সফলভাবে সংরক্ষণ করা হয়েছে',
    UpdateSuccess: 'সফলভাবে আপডেট করা হয়েছে',
    DeleteError: 'মুছতে ব্যর্থ',
    SaveError: 'সংরক্ষণ করতে ব্যর্থ',

    // Navigation
    Dashboard: 'ড্যাশবোর্ড',
    Companies: 'কোম্পানি',
    Products: 'প্রোডাক্ট',
    Retailers: 'রিটেইলার',
    Sales: 'বিক্রয়',
    Payments: 'পেমেন্ট',
    Stock: 'স্টক',
    Reports: 'রিপোর্ট',
    Users: 'ইউজার',
    Settings: 'সেটিংস',
    Menu: 'মেনু',
    LoggedInAs: 'লগইন আছেন',
    Logout: 'লগআউট',
    ChangePassword: 'পাসওয়ার্ড পরিবর্তন',
    English: 'English',
    Bangla: 'বাংলা',

    // Dashboard
    WelcomeToDMS: 'DMS এ স্বাগতম',
    TodaySales: 'আজকের বিক্রয়',
    TotalSales: 'মোট বিক্রয়',
    TotalSalesAllTime: 'সর্বমোট বিক্রয় (আজ পর্যন্ত)',
    TotalOutstanding: 'মোট বকেয়া',
    TotalProducts: 'মোট প্রোডাক্ট',
    LowStockAlerts: 'কম স্টক সতর্কতা',
    RecentSales: 'সাম্প্রতিক বিক্রয়',
    LowStockProducts: 'কম স্টক প্রোডাক্ট',
    NoSalesToday: 'আজ কোনো বিক্রয় নেই',
    AllProductsWellStocked: 'সব প্রোডাক্ট যথেষ্ট স্টকে আছে',
    Collected: 'সংগ্রহিত',
    Due: 'বাকি',
    Invoice: 'ইনভয়েস',
    Retailer: 'রিটেইলার',
    Product: 'প্রোডাক্ট',

    // Companies
    AddCompany: 'কোম্পানি যোগ করুন',
    EditCompany: 'কোম্পানি সম্পাদনা',
    CompanyName: 'কোম্পানির নাম',
    ContactPerson: 'যোগাযোগ ব্যক্তি',
    DueLimit: 'বাকি সীমা',

    // Products
    AddProduct: 'প্রোডাক্ট যোগ করুন',
    EditProduct: 'প্রোডাক্ট সম্পাদনা',
    ProductName: 'প্রোডাক্টের নাম',
    Category: 'ক্যাটাগরি',
    Company: 'কোম্পানি',
    PurchasePrice: 'ক্রয় মূল্য',
    DealerPrice: 'ডিলার দাম',
    MRP: 'এমআরপি',
    Stock: 'স্টক',
    Unit: 'ইউনিট',
    PackSize: 'প্যাক সাইজ',
    LowStockAlert: 'কম স্টক সতর্কতা',
    ExpiryDate: 'মেয়াদ তারিখ',
    ExpiryProducts: 'মেয়াদ উত্তীর্ণ পণ্য',
    StockValue: 'স্টক মূল্য',
    NoProductsFound: 'কোনো প্রোডাক্ট পাওয়া যায়নি',
    InsufficientStock: 'পর্যাপ্ত স্টক নেই',

    // Retailers
    AddRetailer: 'রিটেইলার যোগ করুন',
    EditRetailer: 'রিটেইলার সম্পাদনা',
    ShopName: 'দোকানের নাম',
    OwnerName: 'মালিকের নাম',
    Area: 'এলাকা',
    CreditLimit: 'ক্রেডিট লিমিট',
    Outstanding: 'বকেয়া',
    NoRetailersFound: 'কোনো রিটেইলার পাওয়া যায়নি',

    // Sales
    NewInvoice: 'নতুন ইনভয়েস',
    CreateInvoice: 'ইনভয়েস তৈরি',
    InvoiceNo: 'ইনভয়েস নম্বর',
    SelectRetailer: 'রিটেইলার নির্বাচন',
    SelectProduct: 'প্রোডাক্ট নির্বাচন',
    AddItem: 'আইটেম যোগ',
    Discount: 'ডিসকাউন্ট',
    DiscountPercent: 'ডিসকাউন্ট %',
    PaidAmount: 'পেইড অ্যামাউন্ট',
    Subtotal: 'সাবটোটাল',
    DueAmount: 'বাকি অ্যামাউন্ট',
    Paid: 'পেইড',
    Partial: 'আংশিক',
    NoInvoicesFound: 'কোনো ইনভয়েস পাওয়া যায়নি',
    SelectRetailerAndAddItems: 'রিটেইলার নির্বাচন করুন এবং আইটেম যোগ করুন',
    CreditLimitExceeded: 'ক্রেডিট লিমিট অতিক্রম',

    // Payments
    NewPayment: 'নতুন পেমেন্ট',
    RecordPayment: 'পেমেন্ট রেকর্ড',
    PaymentNo: 'পেমেন্ট নম্বর',
    PaymentMethod: 'পেমেন্ট মেথড',
    ReferenceNo: 'রেফারেন্স নম্বর',
    PaymentDate: 'পেমেন্ট তারিখ',
    CollectedBy: 'সংগ্রহ করেছেন',
    Cash: 'ক্যাশ',
    Bank: 'ব্যাংক',
    MobileBanking: 'মোবাইল ব্যাংকিং',
    NoPaymentsFound: 'কোনো পেমেন্ট পাওয়া যায়নি',
    SelectRetailer: 'রিটেইলার নির্বাচন',
    EnterAmount: 'টাকার পরিমাণ লিখুন',

    // Stock
    StockHistory: 'স্টক ইতিহাস',
    PurchaseOrders: 'পারচেস অর্ডার',
    NewPurchaseOrder: 'নতুন পারচেস অর্ডার',
    OrderNo: 'অর্ডার নম্বর',
    OrderDate: 'অর্ডার তারিখ',
    Received: 'গৃহীত',
    Pending: 'বিচারাধীন',
    In: 'ইন',
    Out: 'আউট',
    Adjustment: 'সমন্বয়',
    Reference: 'রেফারেন্স',
    NoStockHistory: 'কোনো স্টক ইতিহাস নেই',
    SelectCompany: 'কোম্পানি নির্বাচন',
    OrderDetails: 'অর্ডার বিবরণ',
    ReceivedQuantity: 'গৃহীত পরিমাণ',

    // Reports
    DailySales: 'দৈনিক বিক্রয়',
    ProductWise: 'প্রোডাক্ট ওয়াইজ',
    CompanyWise: 'কোম্পানি ওয়াইজ',
    Profit: 'লাভ',
    Due: 'বকেয়া',
    DailySalesReport: 'দৈনিক বিক্রয় রিপোর্ট',
    ProductWiseSalesReport: 'প্রোডাক্ট ওয়াইজ বিক্রয় রিপোর্ট',
    CompanyWiseSalesReport: 'কোম্পানি ওয়াইজ বিক্রয় রিপোর্ট',
    ProfitReport: 'লাভ রিপোর্ট',
    StockReport: 'স্টক রিপোর্ট',
    DueReport: 'বকেয়া রিপোর্ট',
    StartDate: 'শুরুর তারিখ',
    EndDate: 'শেষ তারিখ',
    InvoiceCount: 'ইনভয়েস সংখ্যা',
    Sales: 'বিক্রয়',
    Cost: 'খরচ',
    ProfitAmount: 'লাভ',
    Category: 'ক্যাটাগরি',
    Invoices: 'ইনভয়েস',

    // Users
    AddUser: 'ইউজার যোগ করুন',
    EditUser: 'ইউজার সম্পাদনা',
    Username: 'ইউজারনেম',
    FullName: 'পূর্ণ নাম',
    Role: 'রোল',
    Password: 'পাসওয়ার্ড',
    ConfirmPassword: 'পাসওয়ার্ড নিশ্চিত',
    SystemAdmin: 'সিস্টেম অ্যাডমিন',
    Admin: 'অ্যাডমিন',
    Manager: 'ম্যানেজার',
    Salesman: 'সেলসম্যান',
    Accountant: 'অ্যাকাউন্ট্যান্ট',
    Driver: 'ড্রাইভার',
    Loader: 'লোডার',
    NoUsersFound: 'কোনো ইউজার পাওয়া যায়নি',

    // Settings
    GeneralSettings: 'সাধারণ সেটিংস',
    CompanyInfo: 'কোম্পানি তথ্য',
    InvoiceSettings: 'ইনভয়েস সেটিংস',
    LowStockThreshold: 'কম স্টক থ্রেশহোল্ড',

    // Auth
    Login: 'লগইন',
    ForgotPassword: 'পাসওয়ার্ড ভুলে গেছি?',
    ResetPassword: 'পাসওয়ার্ড রিসেট',
    CurrentPassword: 'বর্তমান পাসওয়ার্ড',
    NewPassword: 'নতুন পাসওয়ার্ড',
    LoginFailed: 'লগইন ব্যর্থ',
    InvalidCredentials: 'ভুল তথ্য',
    PasswordChanged: 'পাসওয়ার্ড সফলভাবে পরিবর্তন',
    PasswordMismatch: 'পাসওয়ার্ড মেলেনি',
    PasswordTooShort: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে',
    SendResetLink: 'রিসেট লিংক পাঠান',
    BackToLogin: 'লগইনে ফিরুন',
    PasswordResetLinkSent: 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে',
    EnterAmount: 'লিখুন',
    TryAgain: 'আবার চেষ্টা করুন',
    Redirecting: 'পুনর্নির্দেশ',
    Access: 'কন্ট্রোল',
    Cheque: 'চেক',
    Or: 'অথবা',
    Default: 'ডিফল্ট',
    AccountDeactivated: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।',
    Page: 'পেজ',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const getInitialLanguage = () => {
    try {
      const saved = localStorage.getItem('dms_language');
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.error('Error reading language:', e);
    }
    return 'bn';
  };
  
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('dms_language', language);
  }, [language]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('dms_language');
      if (saved && saved !== language) {
        setLanguage(saved);
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [language]);

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber, toBanglaNumber }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function formatCurrency(amount, lang = 'en') {
  if (amount === null || amount === undefined || isNaN(amount)) return lang === 'bn' ? '৳ 0' : '৳ 0';
  const formatted = new Intl.NumberFormat('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return (lang === 'bn' ? '৳ ' : '৳ ') + (lang === 'bn' ? toBanglaNumber(formatted) : formatted);
}

export function toBanglaNumber(num) {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (digit) => banglaDigits[digit]);
}

export function formatNumber(num, lang = 'en') {
  if (num === null || num === undefined || isNaN(num)) return lang === 'bn' ? '০' : '0';
  const formatted = new Intl.NumberFormat('en-BD').format(num);
  return lang === 'bn' ? toBanglaNumber(formatted) : formatted;
}

export function formatDate(dateStr, lang = 'en') {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const formatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return lang === 'bn' ? toBanglaNumber(formatted) : formatted;
}

export function formatDateTime(dateStr, lang = 'en') {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const formatted = date.toLocaleString('en-GB', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  return lang === 'bn' ? toBanglaNumber(formatted) : formatted;
}

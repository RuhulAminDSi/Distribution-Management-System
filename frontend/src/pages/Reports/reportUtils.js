import { formatCurrency, formatNumber, formatDate } from '../../context/LanguageContext';

export const tot = (arr, key) => arr.reduce((s, i) => s + Number(i[key]), 0);

export const companyName = 'Ruhana Enterprises';
export const companyAddress = 'Badargonj, Rangpur';

export const getReportTitle = (activeTab) => {
  const titles = {
    daily: 'Daily Sales Report',
    product: 'Product-wise Sales Report',
    company: 'Company-wise Sales Report',
    profit: 'Profit Report',
    stock: 'Stock Report',
    due: 'Due Report'
  };
  return titles[activeTab] || 'Report';
};

export const getBanglaReportTitle = (activeTab) => {
  const titles = {
    daily: 'দৈনিক বিক্রয় রিপোর্ট',
    product: 'প্রোডাক্ট ওয়াইজ বিক্রয় রিপোর্ট',
    company: 'কোম্পানি ওয়াইজ বিক্রয় রিপোর্ট',
    profit: 'লাভ রিপোর্ট',
    stock: 'স্টক রিপোর্ট',
    due: 'বকেয়া রিপোর্ট'
  };
  return titles[activeTab] || 'রিপোর্ট';
};

export const printHeaders = (activeTab, language) => {
  const isBn = language === 'bn';
  const h = {
    daily: [isBn ? 'ইনভয়েস নং' : 'Invoice No', isBn ? 'রিটেইলার' : 'Retailer', isBn ? 'মোট' : 'Total', isBn ? 'পরিশোধিত' : 'Paid', isBn ? 'বাকি' : 'Due', isBn ? 'স্ট্যাটাস' : 'Status'],
    product: [isBn ? 'প্রোডাক্ট' : 'Product', isBn ? 'কোম্পানি' : 'Company', isBn ? 'ক্যাটাগরি' : 'Category', isBn ? 'পরিমাণ' : 'Quantity', isBn ? 'টাকা' : 'Amount'],
    company: [isBn ? 'কোম্পানি' : 'Company', isBn ? 'ইনভয়েস' : 'Invoices', isBn ? 'পরিমাণ' : 'Quantity', isBn ? 'বিক্রয়' : 'Sales', isBn ? 'লাভ' : 'Profit'],
    profit: [isBn ? 'ইনভয়েস নং' : 'Invoice No', isBn ? 'তারিখ' : 'Date', isBn ? 'রিটেইলার' : 'Retailer', isBn ? 'বিক্রয়' : 'Sales', isBn ? 'খরচ' : 'Cost', isBn ? 'লাভ' : 'Profit'],
    stock: [isBn ? 'প্রোডাক্ট' : 'Product', isBn ? 'কোম্পানি' : 'Company', isBn ? 'স্টক' : 'Stock', isBn ? 'স্টক মূল্য' : 'Stock Value', isBn ? 'ডিলার দাম' : 'Dealer Price'],
    due: [isBn ? 'রিটেইলার' : 'Retailer', isBn ? 'ফোন' : 'Phone', isBn ? 'এলাকা' : 'Area', isBn ? 'ক্রেডিট লিমিট' : 'Credit Limit', isBn ? 'বকেয়া' : 'Outstanding', isBn ? 'ইনভয়েস' : 'Invoices'],
    expiry: [isBn ? 'কোড' : 'Code', isBn ? 'নাম' : 'Name', isBn ? 'কোম্পানি' : 'Company', isBn ? 'স্টক' : 'Stock', isBn ? 'মেয়াদ শেষ' : 'Expiry Date', isBn ? 'স্ট্যাটাস' : 'Status']
  };
  return h[activeTab] || [];
};

export const generatePrintRows = (rowsData, activeTab, language) => {
  const isBn = language === 'bn';
  const c = (v) => formatCurrency(v, language);
  const n = (v) => formatNumber(v, language);
  const d = (v) => formatDate(v, language);

  switch (activeTab) {
    case 'daily':
      return rowsData.map(item => ({
        cols: [item.invoice_no, item.retailer_name, c(item.total_amount), c(item.paid_amount), c(item.due_amount), isBn ? (item.status === 'paid' ? 'পরিশোধিত' : item.status === 'partial' ? 'আংশিক' : 'বকেয়া') : item.status]
      }));
    case 'product':
      return rowsData.map(item => ({
        cols: [item.product_name, item.company_name || '-', item.category_name || '-', n(item.total_quantity), c(item.total_amount)]
      }));
    case 'company':
      return rowsData.map(item => ({
        cols: [item.company_name, n(item.total_invoices), n(item.total_quantity), c(item.total_sales), c(item.total_profit)]
      }));
    case 'profit':
      return rowsData.map(item => ({
        cols: [item.invoice_no, d(item.invoice_date), item.retailer_name, c(item.sales_amount), c(item.cost_amount), c(item.profit)]
      }));
    case 'stock':
      return rowsData.map(item => ({
        cols: [item.name, item.company_name || '-', `${n(item.stock_quantity)} ${item.unit}`, c(item.stock_value), c(item.dealer_price)]
      }));
    case 'due':
      return rowsData.map(item => ({
        cols: [item.retailer_name, item.phone, item.area || '-', c(item.credit_limit), c(item.outstanding_balance), n(item.total_invoices)]
      }));
    case 'expiry':
      return rowsData.map(item => {
        const expired = item.expiry_date && new Date(item.expiry_date) <= new Date() && item.stock_quantity > 0;
        const expiring = item.expiry_date && !expired && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && item.stock_quantity > 0;
        const st = expired ? (isBn ? 'মেয়াদ উত্তীর্ণ' : 'Expired') : expiring ? (isBn ? 'শীঘ্রই শেষ' : 'Expiring Soon') : (isBn ? 'বৈধ' : 'Valid');
        return { cols: [item.code, item.name, item.company_name || '-', n(item.stock_quantity), d(item.expiry_date), st] };
      });
    default:
      return [];
  }
};

import { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber, formatDate, formatDateTime } from '../context/LanguageContext';
import { FileText, FileSpreadsheet, ChevronLeft, ChevronRight, DollarSign, Package, Building2, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

export default function Reports() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('daily');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  const fetchSummary = async () => {
    try {
      const response = await reportService.getSummary({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateRange, page, limit]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      switch (activeTab) {
        case 'daily':
          response = await reportService.dailySales({ 
            start_date: dateRange.start_date,
            end_date: dateRange.end_date,
            page,
            limit
          });
          break;
        case 'product':
          response = await reportService.productSales({
            start_date: dateRange.start_date,
            end_date: dateRange.end_date,
            page,
            limit
          });
          break;
        case 'company':
          response = await reportService.companySales({
            start_date: dateRange.start_date,
            end_date: dateRange.end_date,
            page,
            limit
          });
          break;
        case 'profit':
          response = await reportService.profit({
            start_date: dateRange.start_date,
            end_date: dateRange.end_date,
            page,
            limit
          });
          break;
        case 'stock':
          response = await reportService.stock({ page, limit });
          break;
        case 'due':
          response = await reportService.due({ page, limit });
          break;
        case 'expiry':
          response = await reportService.expiry();
          break;
        default:
          break;
      }
      console.log('Report response:', activeTab, response.data);
      const reportData = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || reportData.length || 0;
      setData(reportData);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
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

  const companyName = 'Ruhana Enterprises';
  const companyAddress = 'Badargonj, Rangpur';

  const getBanglaReportTitle = () => {
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = getReportTitle();
    
    doc.setFontSize(20);
    doc.text(companyName, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(companyAddress, 105, 26, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(title, 105, 35, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`Date: ${formatDate(new Date())}`, 14, 44);
    if (dateRange.start_date && dateRange.end_date) {
      doc.text(`Period: ${formatDate(dateRange.start_date)} to ${formatDate(dateRange.end_date)}`, 14, 50);
    }

    let tableData = [];
    let columns = [];

    switch (activeTab) {
      case 'daily':
        columns = [['Invoice No', 'Retailer', 'Total', 'Paid', 'Due', 'Status']];
        tableData = data.map(item => [
          item.invoice_no,
          item.retailer_name,
          formatCurrency(item.total_amount, language),
          formatCurrency(item.paid_amount, language),
          formatCurrency(item.due_amount, language),
          item.total_quantity,
          formatCurrency(item.total_amount, language)
        ]);
        break;
      case 'company':
        columns = [['Company', 'Invoices', 'Quantity', 'Sales', 'Profit']];
        tableData = data.map(item => [
          item.company_name,
          item.total_invoices,
          item.total_quantity,
          formatCurrency(item.total_sales, language),
          formatCurrency(item.total_profit, language),
          formatCurrency(item.sales_amount, language),
          formatCurrency(item.cost_amount, language),
          formatCurrency(item.profit, language)
        ]);
        break;
      case 'stock':
        columns = [['Product', 'Company', 'Stock', 'Stock Value', 'Dealer Price']];
        tableData = data.map(item => [
          item.name,
          item.company_name || '-',
          `${formatNumber(item.stock_quantity, language)} ${item.unit}`,
          formatCurrency(item.stock_value, language),
          formatCurrency(item.dealer_price, language)
        ]);
        break;
      case 'due':
        columns = [['Retailer', 'Phone', 'Area', 'Credit Limit', 'Outstanding', 'Invoices']];
        tableData = data.map(item => [
          item.retailer_name,
          item.phone,
          item.area || '-',
          formatCurrency(item.credit_limit, language),
          formatCurrency(item.outstanding_balance, language),
          formatNumber(item.total_invoices, language)
        ]);
        break;
      case 'expiry':
        columns = [['Code', 'Name', 'Company', 'Stock', 'Expiry Date', 'Status']];
        tableData = data.map(item => {
          const isExpired = item.expiry_date && new Date(item.expiry_date) <= new Date() && item.stock_quantity > 0;
          const isExpiringSoon = item.expiry_date && !isExpired && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && item.stock_quantity > 0;
          return [
            item.code,
            item.name,
            item.company_name || '-',
            formatNumber(item.stock_quantity, language),
            formatDate(item.expiry_date, language),
            isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'
          ];
        });
        break;
      default:
        break;
    }

    autoTable(doc, {
      head: columns,
      body: tableData,
      startY: 50,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [25, 135, 84], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 50 }
    });

    doc.save(`${companyName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToBanglaPDF = () => {
    const banglaCompanyName = 'রুহানা এন্টারপ্রাইজ';
    const banglaCompanyAddress = 'বদরগঞ্জ, রুপুর';
    const title = getBanglaReportTitle();

    const getStatusBangla = (status) => {
      if (status === 'paid') return 'পেইড';
      if (status === 'partial') return 'আংশিক';
      return 'বাকি';
    };

    let tableHTML = '<thead><tr>';
    
    switch (activeTab) {
      case 'daily':
        tableHTML += '<th>ইনভয়েস</th><th>রিটেইলার</th><th>মোট</th><th>পেইড</th><th>বাকি</th><th>স্ট্যাটাস</th></tr></thead><tbody>';
        data.forEach(item => {
          tableHTML += `<tr>
            <td>${item.invoice_no}</td>
            <td>${item.retailer_name}</td>
            <td>${formatCurrency(item.total_amount)}</td>
            <td>${formatCurrency(item.paid_amount)}</td>
            <td>${formatCurrency(item.due_amount)}</td>
            <td>${getStatusBangla(item.status)}</td>
          </tr>`;
        });
        break;
      case 'product':
        tableHTML += '<th>প্রোডাক্ট</th><th>কোম্পানি</th><th>পরিমাণ</th><th>টাকা</th></tr></thead><tbody>';
        data.forEach(item => {
          tableHTML += `<tr>
            <td>${item.product_name}</td>
            <td>${item.company_name || '-'}</td>
            <td>${item.total_quantity}</td>
            <td>${formatCurrency(item.total_amount)}</td>
          </tr>`;
        });
        break;
      case 'company':
        tableHTML += '<th>কোম্পানি</th><th>ইনভয়েস</th><th>পরিমাণ</th><th>বিক্রয়</th><th>লাভ</th></tr></thead><tbody>';
        data.forEach(item => {
          tableHTML += `<tr>
            <td>${item.company_name}</td>
            <td>${item.total_invoices}</td>
            <td>${item.total_quantity}</td>
            <td>${formatCurrency(item.total_sales)}</td>
            <td>${formatCurrency(item.total_profit)}</td>
          </tr>`;
        });
        break;
      case 'profit':
        tableHTML += '<th>ইনভয়েস</th><th>তারিখ</th><th>রিটেইলার</th><th>বিক্রয়</th><th>খরচ</th><th>লাভ</th></tr></thead><tbody>';
        data.forEach(item => {
          tableHTML += `<tr>
            <td>${item.invoice_no}</td>
            <td>${formatDate(item.invoice_date)}</td>
            <td>${item.retailer_name}</td>
            <td>${formatCurrency(item.sales_amount)}</td>
            <td>${formatCurrency(item.cost_amount)}</td>
            <td>${formatCurrency(item.profit)}</td>
          </tr>`;
        });
        break;
      case 'stock':
        tableHTML += '<th>প্রোডাক্ট</th><th>কোম্পানি</th><th>স্টক</th><th>স্টক মূল্য</th><th>ডিলার দাম</th></tr></thead><tbody>';
        data.forEach(item => {
          tableHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.company_name || '-'}</td>
            <td>${item.stock_quantity} ${item.unit}</td>
            <td>${formatCurrency(item.stock_value)}</td>
            <td>${formatCurrency(item.dealer_price)}</td>
          </tr>`;
        });
        break;
      case 'due':
        tableHTML += '<th>রিটেইলার</th><th>ফোন</th><th>এলাকা</th><th>ক্রেডিট লিমিট</th><th>বকেয়া</th><th>ইনভয়েস</th></tr></thead><tbody>';
        data.forEach(item => {
          tableHTML += `<tr>
            <td>${item.retailer_name}</td>
            <td>${item.phone}</td>
            <td>${item.area || '-'}</td>
            <td>${formatCurrency(item.credit_limit)}</td>
            <td>${formatCurrency(item.outstanding_balance)}</td>
            <td>${item.total_invoices}</td>
          </tr>`;
        });
        break;
      case 'expiry':
        tableHTML += '<th>কোড</th><th>নাম</th><th>কোম্পানি</th><th>স্টক</th><th>মেয়াদ তারিখ</th><th>স্ট্যাটাস</th></tr></thead><tbody>';
        data.forEach(item => {
          const isExpired = item.expiry_date && new Date(item.expiry_date) <= new Date() && item.stock_quantity > 0;
          const isExpiringSoon = item.expiry_date && !isExpired && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && item.stock_quantity > 0;
          const status = isExpired ? 'মেয়াদ উত্তীর্ণ' : isExpiringSoon ? 'শীঘ্রই মেয়াদ শেষ' : 'বৈধ';
          tableHTML += `<tr>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.company_name || '-'}</td>
            <td>${item.stock_quantity}</td>
            <td>${formatDate(item.expiry_date)}</td>
            <td>${status}</td>
          </tr>`;
        });
        break;
      default:
        break;
    }
    tableHTML += '</tbody>';

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: 'Noto Sans Bengali', sans-serif; padding: 30px; background: white;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #198754; padding-bottom: 15px;">
          <h1 style="font-size: 28px; margin-bottom: 8px; color: #198754; font-weight: bold;">${banglaCompanyName}</h1>
          <p style="font-size: 14px; color: #666;">${banglaCompanyAddress}</p>
        </div>
        <div style="font-size: 20px; margin: 20px 0; text-align: center; color: #333; font-weight: 600;">${title}</div>
        <div style="font-size: 12px; margin-bottom: 20px; color: #666;">তারিখ: ${formatDate(new Date())}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #ddd;">
          ${tableHTML.replace(/<tbody>/, '<tbody style="border: 1px solid #ddd;">').replace(/<th>/g, '<th style="background: #198754; color: white; padding: 12px 8px; border: 1px solid #157347; text-align: left; font-weight: 600;">').replace(/<td>/g, '<td style="padding: 10px 8px; border: 1px solid #ddd; color: #333;">')}
        </table>
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999;">
          Generated by Distribution Management System
        </div>
      </div>
    `;

    const opt = {
      margin: 5,
      filename: `${banglaCompanyName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const exportToExcel = () => {
    let sheetData = [];
    let sheetName = getReportTitle();

    switch (activeTab) {
      case 'daily':
        sheetData = data.map(item => ({
          'Invoice No': item.invoice_no,
          'Date': formatDate(item.invoice_date),
          'Retailer': item.retailer_name,
          'Total': item.total_amount,
          'Paid': item.paid_amount,
          'Due': item.due_amount,
          'Status': item.status,
          'Created By': item.created_by
        }));
        break;
      case 'product':
        sheetData = data.map(item => ({
          'Product': item.product_name,
          'Code': item.product_code,
          'Category': item.category_name,
          'Company': item.company_name,
          'Quantity': item.total_quantity,
          'Amount': item.total_amount,
          'Invoice Count': item.invoice_count
        }));
        break;
      case 'company':
        sheetData = data.map(item => ({
          'Company': item.company_name,
          'Total Invoices': item.total_invoices,
          'Total Quantity': item.total_quantity,
          'Total Sales': item.total_sales,
          'Total Profit': item.total_profit
        }));
        break;
      case 'profit':
        sheetData = data.map(item => ({
          'Invoice No': item.invoice_no,
          'Date': formatDate(item.invoice_date),
          'Retailer': item.retailer_name,
          'Sales Amount': item.sales_amount,
          'Cost Amount': item.cost_amount,
          'Profit': item.profit,
          'Discount': item.discount_amount
        }));
        break;
      case 'stock':
        sheetData = data.map(item => ({
          'Product': item.name,
          'Code': item.code,
          'Company': item.company_name,
          'Category': item.category_name,
          'Stock Quantity': item.stock_quantity,
          'Unit': item.unit,
          'Purchase Price': item.purchase_price,
          'Dealer Price': item.dealer_price,
          'MRP': item.mrp,
          'Stock Value': item.stock_value,
          'Potential Profit': item.potential_profit
        }));
        break;
      case 'due':
        sheetData = data.map(item => ({
          'Retailer': item.retailer_name,
          'Phone': item.phone,
          'Address': item.address,
          'Area': item.area,
          'Credit Limit': item.credit_limit,
          'Due Limit': item.due_limit,
          'Outstanding Balance': item.outstanding_balance,
          'Total Due': item.total_due,
          'Total Invoices': item.total_invoices
        }));
        break;
      case 'expiry':
        sheetData = data.map(item => {
          const isExpired = item.expiry_date && new Date(item.expiry_date) <= new Date() && item.stock_quantity > 0;
          const isExpiringSoon = item.expiry_date && !isExpired && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && item.stock_quantity > 0;
          return {
            'Code': item.code,
            'Name': item.name,
            'Company': item.company_name,
            'Category': item.category_name,
            'Stock': item.stock_quantity,
            'Unit': item.unit,
            'Expiry Date': item.expiry_date,
            'Status': isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'
          };
        });
        break;
      default:
        break;
    }

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const tabs = [
    { id: 'daily', label: t('DailySales') },
    { id: 'product', label: t('ProductWise') },
    { id: 'company', label: t('CompanyWise') },
    { id: 'profit', label: t('Profit') },
    { id: 'stock', label: t('StockLabel') },
    { id: 'due', label: t('DueLabel') },
    { id: 'expiry', label: t('ExpiryProducts') }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Reports')}</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={exportToPDF} disabled={loading || !data.length}>
            <FileText size={18} /> PDF
          </button>
          <button className="btn btn-secondary" onClick={exportToBanglaPDF} disabled={loading || !data.length}>
            <FileText size={18} /> বাংলা PDF
          </button>
          <button className="btn btn-primary" onClick={exportToExcel} disabled={loading || !data.length}>
            <FileSpreadsheet size={18} /> Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex gap-4 items-center">
            <div>
              <label className="form-label">{t('StartDate')}</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">{t('EndDate')}</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {summary && (
        <div className="stats-grid mb-4">
          {activeTab === 'daily' && (
            <>
              <div className="stat-card">
                <div className="stat-icon blue"><FileText size={24} /></div>
                <div className="stat-label">{t('TotalInvoices') || 'Total Invoices'}</div>
                <div className="stat-value">{formatNumber(summary.daily?.totalInvoices, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><DollarSign size={24} /></div>
                <div className="stat-label">{t('TotalSales') || 'Total Sales'}</div>
                <div className="stat-value">{formatCurrency(summary.daily?.totalAmount, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><CreditCard size={24} /></div>
                <div className="stat-label">{t('Collected') || 'Collected'}</div>
                <div className="stat-value">{formatCurrency(summary.daily?.totalCollected, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red"><AlertTriangle size={24} /></div>
                <div className="stat-label">{t('DueLabel') || 'Due'}</div>
                <div className="stat-value">{formatCurrency(summary.daily?.totalDue, language)}</div>
              </div>
            </>
          )}
          {activeTab === 'product' && (
            <>
              <div className="stat-card">
                <div className="stat-icon blue"><Package size={24} /></div>
                <div className="stat-label">{t('TotalProducts') || 'Total Products'}</div>
                <div className="stat-value">{formatNumber(summary.product?.totalProducts, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><Package size={24} /></div>
                <div className="stat-label">{t('TotalQuantity') || 'Total Quantity'}</div>
                <div className="stat-value">{formatNumber(summary.product?.totalQuantity, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><DollarSign size={24} /></div>
                <div className="stat-label">{t('TotalSales') || 'Total Sales'}</div>
                <div className="stat-value">{formatCurrency(summary.product?.totalAmount, language)}</div>
              </div>
            </>
          )}
          {activeTab === 'company' && (
            <>
              <div className="stat-card">
                <div className="stat-icon blue"><Building2 size={24} /></div>
                <div className="stat-label">{t('TotalCompanies') || 'Total Companies'}</div>
                <div className="stat-value">{formatNumber(summary.company?.totalCompanies, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><DollarSign size={24} /></div>
                <div className="stat-label">{t('TotalSales') || 'Total Sales'}</div>
                <div className="stat-value">{formatCurrency(summary.company?.totalSales, language)}</div>
              </div>
            </>
          )}
          {activeTab === 'profit' && (
            <>
              <div className="stat-card">
                <div className="stat-icon blue"><DollarSign size={24} /></div>
                <div className="stat-label">{t('TotalSales') || 'Total Sales'}</div>
                <div className="stat-value">{formatCurrency(summary.profit?.totalSales, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><TrendingUp size={24} /></div>
                <div className="stat-label">{t('TotalCost') || 'Total Cost'}</div>
                <div className="stat-value">{formatCurrency(summary.profit?.totalCost, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><TrendingUp size={24} /></div>
                <div className="stat-label">{t('TotalProfit') || 'Total Profit'}</div>
                <div className="stat-value">{formatCurrency(summary.profit?.totalProfit, language)}</div>
              </div>
            </>
          )}
          {activeTab === 'stock' && (
            <>
              <div className="stat-card">
                <div className="stat-icon blue"><Package size={24} /></div>
                <div className="stat-label">{t('TotalProducts') || 'Total Products'}</div>
                <div className="stat-value">{formatNumber(summary.stock?.totalProducts, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><Package size={24} /></div>
                <div className="stat-label">{t('TotalQuantity') || 'Total Quantity'}</div>
                <div className="stat-value">{formatNumber(summary.stock?.totalQuantity, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><DollarSign size={24} /></div>
                <div className="stat-label">{t('StockValue') || 'Stock Value'}</div>
                <div className="stat-value">{formatCurrency(summary.stock?.stockValue, language)}</div>
              </div>
            </>
          )}
          {activeTab === 'due' && (
            <>
              <div className="stat-card">
                <div className="stat-icon blue"><Building2 size={24} /></div>
                <div className="stat-label">{t('TotalRetailers') || 'Total Retailers'}</div>
                <div className="stat-value">{formatNumber(summary.due?.totalRetailers, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red"><AlertTriangle size={24} /></div>
                <div className="stat-label">{t('TotalDue') || 'Total Due'}</div>
                <div className="stat-value">{formatCurrency(summary.due?.totalDue, language)}</div>
              </div>
            </>
          )}
          {activeTab === 'expiry' && (
            <>
              <div className="stat-card">
                <div className="stat-icon blue"><Package size={24} /></div>
                <div className="stat-label">{t('TotalProducts') || 'Total Products'}</div>
                <div className="stat-value">{formatNumber(summary.expiry?.totalProducts, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red"><AlertTriangle size={24} /></div>
                <div className="stat-label">{t('Expired') || 'Expired'}</div>
                <div className="stat-value">{formatNumber(summary.expiry?.expired, language)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><AlertTriangle size={24} /></div>
                <div className="stat-label">{t('ExpiringSoon') || 'Expiring Soon'}</div>
                <div className="stat-value">{formatNumber(summary.expiry?.expiringSoon, language)}</div>
              </div>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div>{t('Loading')}</div>
      ) : !data.length ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '40px', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3>{t('NoDataFound')}</h3>
            <p>No {activeTab} sales found for the selected date range.</p>
            {activeTab === 'daily' && (
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                Selected date: {dateRange.start_date}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            {activeTab === 'daily' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('InvoiceNo')}</th>
                    <th>{t('Retailer')}</th>
                    <th className="text-right">{t('Total')}</th>
                    <th className="text-right">{t('Paid')}</th>
                    <th className="text-right">{t('DueLabel')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>{item.invoice_no}</td>
                      <td>{item.retailer_name}</td>
                      <td className="text-right">{formatCurrency(item.total_amount)}</td>
                      <td className="text-right">{formatCurrency(item.paid_amount)}</td>
                      <td className="text-right">{formatCurrency(item.due_amount)}</td>
                      <td><span className={`badge badge-${item.status === 'paid' ? 'success' : item.status === 'partial' ? 'warning' : 'danger'}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'product' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('Product')}</th>
                    <th>{t('Company')}</th>
                    <th>{t('CategoryLabel')}</th>
                    <th className="text-right">{t('Quantity')}</th>
                    <th className="text-right">{t('Amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.product_id}>
                      <td>{item.product_name}</td>
                      <td>{item.company_name || '-'}</td>
                      <td>{item.category_name || '-'}</td>
                      <td className="text-right">{formatNumber(item.total_quantity, language)}</td>
                      <td className="text-right">{formatCurrency(item.total_amount, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'company' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('Company')}</th>
                    <th className="text-right">{t('Invoices')}</th>
                    <th className="text-right">{t('Quantity')}</th>
                    <th className="text-right">{t('Sales')}</th>
                    <th className="text-right">{t('Profit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.company_id}>
                      <td>{item.company_name}</td>
                      <td className="text-right">{formatNumber(item.total_invoices, language)}</td>
                      <td className="text-right">{formatNumber(item.total_quantity, language)}</td>
                      <td className="text-right">{formatCurrency(item.total_sales, language)}</td>
                      <td className="text-right text-success">{formatCurrency(item.total_profit, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'profit' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('InvoiceNo')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Retailer')}</th>
                    <th className="text-right">{t('Sales')}</th>
                    <th className="text-right">{t('Cost')}</th>
                    <th className="text-right">{t('Profit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.invoice_id}>
                      <td>{item.invoice_no}</td>
                      <td>{formatDate(item.invoice_date)}</td>
                      <td>{item.retailer_name}</td>
                      <td className="text-right">{formatCurrency(item.sales_amount, language)}</td>
                      <td className="text-right">{formatCurrency(item.cost_amount, language)}</td>
                      <td className="text-right text-success">{formatCurrency(item.profit, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'stock' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('Product')}</th>
                    <th>{t('Company')}</th>
                    <th className="text-right">{t('StockLabel')}</th>
                    <th className="text-right">{t('StockValue')}</th>
                    <th className="text-right">{t('DealerPrice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.company_name || '-'}</td>
                      <td className="text-right">{formatNumber(item.stock_quantity, language)} {item.unit}</td>
                      <td className="text-right">{formatCurrency(item.stock_value, language)}</td>
                      <td className="text-right">{formatCurrency(item.dealer_price, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'due' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('Retailer')}</th>
                    <th>{t('Phone')}</th>
                    <th>{t('Area')}</th>
                    <th className="text-right">{t('CreditLimit')}</th>
                    <th className="text-right">{t('Outstanding')}</th>
                    <th className="text-right">{t('Invoices')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.retailer_id}>
                      <td>{item.retailer_name}</td>
                      <td>{item.phone}</td>
                      <td>{item.area || '-'}</td>
                      <td className="text-right">{formatCurrency(item.credit_limit)}</td>
                      <td className="text-right text-danger">{formatCurrency(item.outstanding_balance)}</td>
                      <td className="text-right">{item.total_invoices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'expiry' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('Code')}</th>
                    <th>{t('Name')}</th>
                    <th>{t('Company')}</th>
                    <th className="text-right">{t('StockLabel')}</th>
                    <th>{t('ExpiryDate')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => {
                    const isExpired = item.expiry_date && new Date(item.expiry_date) <= new Date() && item.stock_quantity > 0;
                    const isExpiringSoon = item.expiry_date && !isExpired && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && item.stock_quantity > 0;
                    return (
                    <tr key={item.id} className={isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}>
                      <td>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.company_name || '-'}</td>
                      <td className="text-right">{formatNumber(item.stock_quantity, language)}</td>
                      <td>{formatDate(item.expiry_date, language)}</td>
                      <td>{isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px' }}>Show</span>
              <select 
                value={limit} 
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span style={{ fontSize: '14px', marginLeft: 'auto' }}>
                {Math.min((page - 1) * limit + limit, total)} of {total} entries
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '14px' }}>{t('Page')} {page} / {totalPages}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}

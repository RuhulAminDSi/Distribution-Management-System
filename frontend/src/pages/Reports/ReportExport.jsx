import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { reportService } from '../../services/api';
import { formatCurrency, formatNumber, formatDate } from '../../context/LanguageContext';
import { tot, getReportTitle, getBanglaReportTitle, companyName, companyAddress, printHeaders, generatePrintRows } from './reportUtils';

export default function ReportExport({ activeTab, data, dateRange, language, t, loading }) {
  const fetchAllExportData = async () => {
    try {
      let response;
      const params = { start_date: dateRange.start_date, end_date: dateRange.end_date, page: 1, limit: 999999 };
      switch (activeTab) {
        case 'daily':    response = await reportService.dailySales(params); break;
        case 'product':  response = await reportService.productSales(params); break;
        case 'company':  response = await reportService.companySales(params); break;
        case 'profit':   response = await reportService.profit(params); break;
        case 'stock':    response = await reportService.stock({ page: 1, limit: 999999 }); break;
        case 'due':      response = await reportService.due({ page: 1, limit: 999999 }); break;
        case 'expiry':   response = await reportService.expiry(); break;
      }
      return response.data?.data || response.data || [];
    } catch (err) {
      console.error('Failed to fetch export data:', err);
      return data;
    }
  };

  const exportToPDF = async () => {
    const exportData = data.length > 0 ? await fetchAllExportData() : data;
    const title = getReportTitle(activeTab);
    const isLandscape = activeTab === 'stock' || activeTab === 'due' || activeTab === 'expiry';
    const doc = new jsPDF({ orientation: 'portrait' });

    doc.setFontSize(18);
    doc.setTextColor(26, 86, 219);
    doc.text(companyName, doc.internal.pageSize.width / 2, 20, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(companyAddress, doc.internal.pageSize.width / 2, 26, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(50);
    doc.text(title, doc.internal.pageSize.width / 2, 35, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(100);
    let yStart = 42;
    doc.text(`Date: ${formatDate(new Date())}`, 14, yStart);
    if (dateRange.start_date && dateRange.end_date) {
      doc.text(`Period: ${formatDate(dateRange.start_date)} to ${formatDate(dateRange.end_date)}`, 14, yStart + 5);
      yStart += 5;
    }
    yStart += 8;

    let tableData = [];
    let columns = [];

    switch (activeTab) {
      case 'daily':
        columns = [['Invoice No', 'Retailer', 'Total', 'Paid', 'Due', 'Status']];
        tableData = exportData.map(item => [
          item.invoice_no,
          item.retailer_name,
          formatCurrency(item.total_amount, language),
          formatCurrency(item.paid_amount, language),
          formatCurrency(item.due_amount, language),
          item.status
        ]);
        break;
      case 'product':
        columns = [['Product', 'Company', 'Category', 'Quantity', 'Amount']];
        tableData = exportData.map(item => [
          item.product_name,
          item.company_name || '-',
          item.category_name || '-',
          formatNumber(item.total_quantity, language),
          formatCurrency(item.total_amount, language)
        ]);
        break;
      case 'company':
        columns = [['Company', 'Invoices', 'Quantity', 'Sales', 'Profit']];
        tableData = exportData.map(item => [
          item.company_name,
          formatNumber(item.total_invoices, language),
          formatNumber(item.total_quantity, language),
          formatCurrency(item.total_sales, language),
          formatCurrency(item.total_profit, language)
        ]);
        break;
      case 'profit':
        columns = [['Invoice No', 'Date', 'Retailer', 'Sales', 'Cost', 'Profit']];
        tableData = exportData.map(item => [
          item.invoice_no,
          formatDate(item.invoice_date, language),
          item.retailer_name,
          formatCurrency(item.sales_amount, language),
          formatCurrency(item.cost_amount, language),
          formatCurrency(item.profit, language)
        ]);
        break;
      case 'stock':
        columns = [['Product', 'Company', 'Stock', 'Stock Value', 'Dealer Price']];
        tableData = exportData.map(item => [
          item.name,
          item.company_name || '-',
          `${formatNumber(item.stock_quantity, language)} ${item.unit}`,
          formatCurrency(item.stock_value, language),
          formatCurrency(item.dealer_price, language)
        ]);
        break;
      case 'due':
        columns = [['Retailer', 'Phone', 'Area', 'Credit Limit', 'Outstanding', 'Invoices']];
        tableData = exportData.map(item => [
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
        tableData = exportData.map(item => {
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
    }

    let footerData = [];
    switch (activeTab) {
      case 'daily': footerData = [['', 'Total', formatCurrency(tot(exportData, 'total_amount'), language), formatCurrency(tot(exportData, 'paid_amount'), language), formatCurrency(tot(exportData, 'due_amount'), language), '']]; break;
      case 'product': footerData = [['', '', 'Total', formatNumber(tot(exportData, 'total_quantity'), language), formatCurrency(tot(exportData, 'total_amount'), language)]]; break;
      case 'company': footerData = [['Total', formatNumber(tot(exportData, 'total_invoices'), language), formatNumber(tot(exportData, 'total_quantity'), language), formatCurrency(tot(exportData, 'total_sales'), language), formatCurrency(tot(exportData, 'total_profit'), language)]]; break;
      case 'profit': footerData = [['', '', 'Total', formatCurrency(tot(exportData, 'sales_amount'), language), formatCurrency(tot(exportData, 'cost_amount'), language), formatCurrency(tot(exportData, 'profit'), language)]]; break;
      case 'stock': footerData = [['', '', 'Total', formatCurrency(tot(exportData, 'stock_value'), language), '']]; break;
      case 'due': footerData = [['', '', 'Total', formatCurrency(tot(exportData, 'credit_limit'), language), formatCurrency(tot(exportData, 'outstanding_balance'), language), formatNumber(tot(exportData, 'total_invoices'), language)]]; break;
      case 'expiry': footerData = [['', '', 'Total', formatNumber(tot(exportData, 'stock_quantity'), language), '', '']]; break;
    }

    autoTable(doc, {
      head: columns,
      body: tableData,
      foot: footerData,
      startY: yStart,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [26, 86, 219], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [232, 240, 254], fontStyle: 'bold', textColor: [26, 86, 219] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 10 },
      didDrawPage: (data) => {
        const pw = doc.internal.pageSize;
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(isLandscape ? 30 : 20);
        const wm2 = ['Ruhana Enterprise', 'DMS'];
        wm2.forEach((l, i) => {
          doc.text(l, pw.width / 2, pw.height * 0.5 + (i - 0.5) * 12, { align: 'center', angle: -30 });
        });
        doc.restoreGraphicsState();
      }
    });

    doc.save(`${companyName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToBanglaPDF = async () => {
    const exportData = data.length > 0 ? await fetchAllExportData() : data;
    const banglaCompanyName = 'রুহানা এন্টারপ্রাইজ';
    const banglaCompanyAddress = 'বদরগঞ্জ, রংপুর';
    const title = getBanglaReportTitle(activeTab);
    const bn = 'bn';

    const getStatusBangla = (status) => {
      if (status === 'paid') return 'পরিশোধিত';
      if (status === 'partial') return 'আংশিক';
      return 'বকেয়া';
    };

    let tableHTML = '<thead><tr>';

    switch (activeTab) {
      case 'daily':
        tableHTML += '<th>ইনভয়েস নং</th><th>রিটেইলার</th><th>মোট</th><th>পরিশোধিত</th><th>বাকি</th><th>স্ট্যাটাস</th></tr></thead><tbody>';
        exportData.forEach(item => {
          tableHTML += `<tr>
            <td>${item.invoice_no}</td>
            <td>${item.retailer_name}</td>
            <td style="text-align: right;">${formatCurrency(item.total_amount, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.paid_amount, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.due_amount, bn)}</td>
            <td style="text-align: center;">${getStatusBangla(item.status)}</td>
          </tr>`;
        });
        break;
      case 'product':
        tableHTML += '<th>প্রোডাক্ট</th><th>কোম্পানি</th><th>ক্যাটাগরি</th><th style="text-align: right;">পরিমাণ</th><th style="text-align: right;">টাকা</th></tr></thead><tbody>';
        exportData.forEach(item => {
          tableHTML += `<tr>
            <td>${item.product_name}</td>
            <td>${item.company_name || '-'}</td>
            <td>${item.category_name || '-'}</td>
            <td style="text-align: right;">${formatNumber(item.total_quantity, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.total_amount, bn)}</td>
          </tr>`;
        });
        break;
      case 'company':
        tableHTML += '<th>কোম্পানি</th><th style="text-align: right;">ইনভয়েস</th><th style="text-align: right;">পরিমাণ</th><th style="text-align: right;">বিক্রয়</th><th style="text-align: right;">লাভ</th></tr></thead><tbody>';
        exportData.forEach(item => {
          tableHTML += `<tr>
            <td>${item.company_name}</td>
            <td style="text-align: right;">${formatNumber(item.total_invoices, bn)}</td>
            <td style="text-align: right;">${formatNumber(item.total_quantity, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.total_sales, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.total_profit, bn)}</td>
          </tr>`;
        });
        break;
      case 'profit':
        tableHTML += '<th>ইনভয়েস নং</th><th>তারিখ</th><th>রিটেইলার</th><th style="text-align: right;">বিক্রয়</th><th style="text-align: right;">খরচ</th><th style="text-align: right;">লাভ</th></tr></thead><tbody>';
        exportData.forEach(item => {
          tableHTML += `<tr>
            <td>${item.invoice_no}</td>
            <td>${formatDate(item.invoice_date, bn)}</td>
            <td>${item.retailer_name}</td>
            <td style="text-align: right;">${formatCurrency(item.sales_amount, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.cost_amount, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.profit, bn)}</td>
          </tr>`;
        });
        break;
      case 'stock':
        tableHTML += '<th>প্রোডাক্ট</th><th>কোম্পানি</th><th style="text-align: right;">স্টক</th><th style="text-align: right;">স্টক মূল্য</th><th style="text-align: right;">ডিলার দাম</th></tr></thead><tbody>';
        exportData.forEach(item => {
          tableHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.company_name || '-'}</td>
            <td style="text-align: right;">${formatNumber(item.stock_quantity, bn)} ${item.unit}</td>
            <td style="text-align: right;">${formatCurrency(item.stock_value, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.dealer_price, bn)}</td>
          </tr>`;
        });
        break;
      case 'due':
        tableHTML += '<th>রিটেইলার</th><th>ফোন</th><th>এলাকা</th><th style="text-align: right;">ক্রেডিট লিমিট</th><th style="text-align: right;">বকেয়া</th><th style="text-align: right;">ইনভয়েস</th></tr></thead><tbody>';
        exportData.forEach(item => {
          tableHTML += `<tr>
            <td>${item.retailer_name}</td>
            <td>${item.phone}</td>
            <td>${item.area || '-'}</td>
            <td style="text-align: right;">${formatCurrency(item.credit_limit, bn)}</td>
            <td style="text-align: right;">${formatCurrency(item.outstanding_balance, bn)}</td>
            <td style="text-align: right;">${formatNumber(item.total_invoices, bn)}</td>
          </tr>`;
        });
        break;
      case 'expiry':
        tableHTML += '<th>কোড</th><th>নাম</th><th>কোম্পানি</th><th style="text-align: right;">স্টক</th><th>মেয়াদ শেষ</th><th>স্ট্যাটাস</th></tr></thead><tbody>';
        exportData.forEach(item => {
          const isExpired = item.expiry_date && new Date(item.expiry_date) <= new Date() && item.stock_quantity > 0;
          const isExpiringSoon = item.expiry_date && !isExpired && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && item.stock_quantity > 0;
          const status = isExpired ? 'মেয়াদ উত্তীর্ণ' : isExpiringSoon ? 'শীঘ্রই শেষ' : 'বৈধ';
          tableHTML += `<tr>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.company_name || '-'}</td>
            <td style="text-align: right;">${formatNumber(item.stock_quantity, bn)}</td>
            <td>${formatDate(item.expiry_date, bn)}</td>
            <td style="text-align: center;">${status}</td>
          </tr>`;
        });
        break;
    }
    tableHTML += '</tbody>';

    const ftStyle = ' style="font-weight: bold; background: #e8f0fe;"';

    switch (activeTab) {
      case 'daily':
        tableHTML += `<tfoot><tr${ftStyle}><td colspan="2" style="text-align: right; padding-right: 12px;">মোট</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'total_amount'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'paid_amount'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'due_amount'), bn)}</td>
          <td></td></tr></tfoot>`;
        break;
      case 'product':
        tableHTML += `<tfoot><tr${ftStyle}><td colspan="3" style="text-align: right; padding-right: 12px;">মোট</td>
          <td style="text-align: right;">${formatNumber(tot(exportData, 'total_quantity'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'total_amount'), bn)}</td></tr></tfoot>`;
        break;
      case 'company':
        tableHTML += `<tfoot><tr${ftStyle}><td style="text-align: right; padding-right: 12px;">মোট</td>
          <td style="text-align: right;">${formatNumber(tot(exportData, 'total_invoices'), bn)}</td>
          <td style="text-align: right;">${formatNumber(tot(exportData, 'total_quantity'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'total_sales'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'total_profit'), bn)}</td></tr></tfoot>`;
        break;
      case 'profit':
        tableHTML += `<tfoot><tr${ftStyle}><td colspan="3" style="text-align: right; padding-right: 12px;">মোট</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'sales_amount'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'cost_amount'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'profit'), bn)}</td></tr></tfoot>`;
        break;
      case 'stock':
        tableHTML += `<tfoot><tr${ftStyle}><td colspan="3" style="text-align: right; padding-right: 12px;">মোট</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'stock_value'), bn)}</td>
          <td></td></tr></tfoot>`;
        break;
      case 'due':
        tableHTML += `<tfoot><tr${ftStyle}><td colspan="3" style="text-align: right; padding-right: 12px;">মোট</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'credit_limit'), bn)}</td>
          <td style="text-align: right;">${formatCurrency(tot(exportData, 'outstanding_balance'), bn)}</td>
          <td style="text-align: right;">${formatNumber(tot(exportData, 'total_invoices'), bn)}</td></tr></tfoot>`;
        break;
      case 'expiry':
        tableHTML += `<tfoot><tr${ftStyle}><td colspan="3" style="text-align: right; padding-right: 12px;">মোট</td>
          <td style="text-align: right;">${formatNumber(tot(exportData, 'stock_quantity'), bn)}</td>
          <td colspan="2"></td></tr></tfoot>`;
        break;
    }

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif; padding: 30px; background: white; position: relative;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 26px; font-weight: bold; color: rgba(180,180,180,0.4); z-index: 9999; pointer-events: none; text-align: center; line-height: 1.4; font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif;">রুহানা এন্টারপ্রাইজ<br>ডি এম এস</div>
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #1a56db; padding-bottom: 15px;">
          <h1 style="font-size: 28px; margin-bottom: 5px; color: #1a56db; font-weight: bold;">${banglaCompanyName}</h1>
          <p style="font-size: 14px; color: #6b7280;">${banglaCompanyAddress}</p>
        </div>
        <div style="font-size: 18px; margin: 15px 0; text-align: center; color: #333; font-weight: 600;">${title}</div>
        <div style="font-size: 11px; margin-bottom: 15px; color: #6b7280;">
          তারিখ: ${formatDate(new Date(), bn)}
          ${dateRange.start_date && dateRange.end_date ? ` | সময়কাল: ${formatDate(dateRange.start_date, bn)} - ${formatDate(dateRange.end_date, bn)}` : ''}
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          ${tableHTML.replace(/<th/g, '<th style="background: #1a56db; color: white; padding: 10px 8px; border: 1px solid #1a56db; font-weight: 600;"').replace(/<td/g, '<td style="padding: 8px; border: 1px solid #d1d5db; color: #333;"')}
        </table>
        <div style="margin-top: 25px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af;">
          ডিস্ট্রিবিউশন ম্যানেজমেন্ট সিস্টেম দ্বারা জেনারেটেড
        </div>
      </div>
    `;

    const opt = {
      margin: 5,
      filename: `${banglaCompanyName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const exportToExcel = async () => {
    const exportData = data.length > 0 ? await fetchAllExportData() : data;
    let sheetData = [];
    let sheetName = getReportTitle(activeTab);

    switch (activeTab) {
      case 'daily':
        sheetData = exportData.map(item => ({
          'Invoice No': item.invoice_no,
          'Date': formatDate(item.invoice_date, language),
          'Retailer': item.retailer_name,
          'Total': item.total_amount,
          'Paid': item.paid_amount,
          'Due': item.due_amount,
          'Status': item.status,
          'Created By': item.created_by
        }));
        break;
      case 'product':
        sheetData = exportData.map(item => ({
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
        sheetData = exportData.map(item => ({
          'Company': item.company_name,
          'Total Invoices': item.total_invoices,
          'Total Quantity': item.total_quantity,
          'Total Sales': item.total_sales,
          'Total Profit': item.total_profit
        }));
        break;
      case 'profit':
        sheetData = exportData.map(item => ({
          'Invoice No': item.invoice_no,
          'Date': formatDate(item.invoice_date, language),
          'Retailer': item.retailer_name,
          'Sales Amount': item.sales_amount,
          'Cost Amount': item.cost_amount,
          'Profit': item.profit,
          'Discount': item.discount_amount
        }));
        break;
      case 'stock':
        sheetData = exportData.map(item => ({
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
        sheetData = exportData.map(item => ({
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
        sheetData = exportData.map(item => {
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

  const handlePrintReport = async () => {
    const exportData = data.length > 0 ? await fetchAllExportData() : data;
    const isBn = language === 'bn';
    const reportTitle = isBn ? getBanglaReportTitle(activeTab) : getReportTitle(activeTab);
    const company = isBn ? 'রুহানা এন্টারপ্রাইজ' : companyName;
    const address = isBn ? 'বদরগঞ্জ, রংপুর' : companyAddress;
    const period = isBn ? `সময়কাল: ${formatDate(dateRange.start_date, language)} - ${formatDate(dateRange.end_date, language)}` : `Period: ${formatDate(dateRange.start_date)} to ${formatDate(dateRange.end_date)}`;
    const headerRow = printHeaders(activeTab, language);
    const rows = generatePrintRows(exportData, activeTab, language);
    const isLandscape = activeTab === 'stock' || activeTab === 'due' || activeTab === 'expiry';

    const c = (v) => formatCurrency(v, language);
    const n = (v) => formatNumber(v, language);
    let totalCells = [];
    switch (activeTab) {
      case 'daily': totalCells = ['', '', c(tot(exportData, 'total_amount')), c(tot(exportData, 'paid_amount')), c(tot(exportData, 'due_amount')), '']; break;
      case 'product': totalCells = ['', '', '', n(tot(exportData, 'total_quantity')), c(tot(exportData, 'total_amount'))]; break;
      case 'company': totalCells = [isBn ? 'মোট' : 'Total', n(tot(exportData, 'total_invoices')), n(tot(exportData, 'total_quantity')), c(tot(exportData, 'total_sales')), c(tot(exportData, 'total_profit'))]; break;
      case 'profit': totalCells = ['', '', '', c(tot(exportData, 'sales_amount')), c(tot(exportData, 'cost_amount')), c(tot(exportData, 'profit'))]; break;
      case 'stock': totalCells = ['', '', '', c(tot(exportData, 'stock_value')), '']; break;
      case 'due': totalCells = ['', '', '', c(tot(exportData, 'credit_limit')), c(tot(exportData, 'outstanding_balance')), n(tot(exportData, 'total_invoices'))]; break;
      case 'expiry': totalCells = ['', '', '', n(tot(exportData, 'stock_quantity')), '', '']; break;
    }
    const totalRow = `<tfoot><tr style="font-weight: bold; background: #e8f0fe;">${totalCells.map((c, i) => `<td${i > 1 && totalCells[i] !== '' ? ' class="text-right"' : ''}>${c}</td>`).join('')}</tr></tfoot>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>${reportTitle}</title>
      <style>
        @page { size: 210mm 297mm; margin: 10mm; }
        body { font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif; margin: 0; padding: 12px; color: #333; position: relative; }
        body::before {
          content: '${isBn ? 'রুহানা এন্টারপ্রাইজ\\aডি এম এস' : 'Ruhana Enterprise\\aDMS'}';
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: ${isLandscape ? '55px' : '36px'};
          font-weight: bold; color: rgba(180, 180, 180, 0.4);
          pointer-events: none; z-index: 1;
          white-space: pre-wrap; text-align: center; line-height: 1.4;
          font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif;
        }
        .header { position: relative; z-index: 2; text-align: center; margin-bottom: 20px; border-bottom: 3px solid #1a56db; padding-bottom: 12px; }
        .header .company { font-size: 18px; font-weight: bold; color: #1a56db; }
        .header .title { font-size: 14px; color: #333; margin: 6px 0 4px; }
        .header .meta { font-size: 10px; color: #6b7280; }
        .info { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 10px; color: #6b7280; }
        .table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; }
        th { background: #1a56db; color: #fff; padding: 6px 4px; border: 1px solid #1a56db; text-align: center; font-weight: 600; white-space: nowrap; }
        td { padding: 5px 4px; border: 1px solid #d1d5db; color: #333; word-break: break-word; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; }
        @media print { body { padding: 0; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${company}</div>
          <div class="title">${reportTitle}</div>
          <div class="meta">${period}</div>
        </div>
        <div class="table-wrap">
          <table style="${isLandscape ? '' : 'min-width: auto;'}">
            <thead><tr>${headerRow.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r => `<tr>${r.cols.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
            ${totalRow}
          </table>
        </div>
        <div class="footer">${isBn ? 'ডিস্ট্রিবিউশন ম্যানেজমেন্ট সিস্টেম দ্বারা জেনারেটেড' : 'Generated by Distribution Management System'}</div>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const pw = window.open(url, '_blank');
    if (pw) {
      pw.onload = () => { pw.focus(); pw.print(); };
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  return (
    <div className="flex gap-2">
      <button className="btn btn-secondary" onClick={handlePrintReport} disabled={loading || !data.length}>
        <Printer size={18} /> {t('Print')}
      </button>
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
  );
}

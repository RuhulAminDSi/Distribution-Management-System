import { useState, useEffect } from 'react';
import { paymentService, retailerService } from '../services/api';
import { useLanguage, formatCurrency, formatDate } from '../context/LanguageContext';
import DatePicker from '../components/common/DatePicker';
import { X, Plus, Search, ChevronLeft, ChevronRight, Eye, Printer, FileText, Save, Building2, DollarSign, CreditCard } from 'lucide-react';

const bengaliNums = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'উনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাইত্রিশ', 'আটত্রিশ', 'উনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচাল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'উনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বাহান্ন', 'তেপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'উনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'উনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'উনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'উননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

const numberToBengaliWords = (num) => {
  if (num === 0) return 'শূন্য';
  const convertBelow1000 = (n) => {
    if (n === 0) return '';
    if (n < 100) return bengaliNums[n];
    const h = Math.floor(n / 100);
    const r = n % 100;
    return bengaliNums[h] + 'শত ' + (r > 0 ? bengaliNums[r] : '');
  };
  if (num < 1000) return convertBelow1000(num).trim();
  let result = '';
  const crore = Math.floor(num / 10000000);
  if (crore > 0) { result += (crore > 1 ? convertBelow1000(crore) + ' কোটি ' : 'এক কোটি '); num %= 10000000; }
  const lac = Math.floor(num / 100000);
  if (lac > 0) { result += (lac > 1 ? convertBelow1000(lac) + ' লাখ ' : 'এক লাখ '); num %= 100000; }
  const thousand = Math.floor(num / 1000);
  if (thousand > 0) { result += (thousand > 1 ? convertBelow1000(thousand) + ' হাজার ' : 'এক হাজার '); num %= 1000; }
  if (num > 0) result += convertBelow1000(num);
  return result.trim();
};

const amountInBengaliWords = (amount) => {
  const taka = Math.floor(amount);
  const paisa = Math.round((amount - taka) * 100);
  let result = '';
  if (taka > 0) result += numberToBengaliWords(taka) + ' টাকা';
  if (paisa > 0) result += (result ? ' ' : '') + numberToBengaliWords(paisa) + ' পয়সা';
  result += ' মাত্র';
  if (!taka && !paisa) result = 'শূন্য টাকা মাত্র';
  return result;
};

export default function Payments() {
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    retailer_id: '', amount: 0, payment_method: 'cash',
    reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchPayments();
    fetchRetailers();
  }, [search, page, limit]);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getAll({ page, limit, search });
      const data = response.data?.data || response.data || [];
      const totalVal = response.data?.pagination?.total || response.data?.total || data.length || 0;
      setPayments(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRetailers = async () => {
    try {
      const response = await retailerService.getAll({ limit: 100 });
      setRetailers(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch retailers:', error);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await paymentService.getById(id);
      setViewPayment(response.data || response);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
    }
  };

  const handlePrint = (payment) => {
    const isBn = language === 'bn';
    const companyName = isBn ? 'রুহানা এন্টারপ্রাইজ' : 'Ruhana Enterprise';
    const companyAddress = isBn ? 'বদরগঞ্জ, রংপুর' : 'Badarganj, Rangpur';
    const methodLabels = {
      cash: isBn ? 'নগদ' : 'Cash',
      bank: isBn ? 'ব্যাংক' : 'Bank',
      mobile_banking: isBn ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking',
      cheque: isBn ? 'চেক' : 'Cheque'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><title>${t('PaymentReceipt') || 'Payment Receipt'}</title>
      <style>
        body { font-family: 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #1a56db; padding-bottom: 15px; }
        .header .company { font-size: 20px; font-weight: bold; color: #1a56db; }
        .header .title { font-size: 16px; color: #333; margin: 8px 0 4px; }
        .header .meta { font-size: 11px; color: #6b7280; }
        .info { margin-bottom: 15px; font-size: 12px; }
        .info table { width: 100%; border-collapse: collapse; }
        .info td { padding: 4px 8px; border: none; }
        .info td:first-child { font-weight: 600; color: #6b7280; width: 140px; }
        .info td:last-child { color: #333; }
        .highlight { background: #f0f4ff; padding: 12px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .highlight .amount { font-size: 28px; font-weight: bold; color: #1a56db; }
        .highlight .label { font-size: 12px; color: #6b7280; }
        .notes-box { background: #f9fafb; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #1a56db; }
        .footer { text-align: center; margin-top: 25px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${companyName}</div>
          <div class="title">${isBn ? 'পেমেন্ট রসিদ' : 'Payment Receipt'}</div>
          <div class="meta">${payment.payment_no} | ${formatDate(payment.payment_date, language)}</div>
        </div>
        <div class="highlight">
          <div class="label">${isBn ? 'পেমেন্টের পরিমাণ' : 'Payment Amount'}</div>
          <div class="amount">${formatCurrency(payment.amount, language)}</div>
          ${isBn ? `<div style="font-size:13px;color:#6b7280;margin-top:6px;font-style:italic;">${amountInBengaliWords(payment.amount)}</div>` : ''}
        </div>
        <div class="info">
          <table>
            <tr><td>${isBn ? 'রিটেইলার' : 'Retailer'}</td><td>${payment.retailer_name}</td></tr>
            <tr><td>${isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</td><td>${methodLabels[payment.payment_method] || payment.payment_method}</td></tr>
            <tr><td>${isBn ? 'রেফারেন্স নম্বর' : 'Reference No'}</td><td>${payment.reference_no || '-'}</td></tr>
            <tr><td>${isBn ? 'সংগ্রহ করেছেন' : 'Collected By'}</td><td>${payment.collected_by_name}</td></tr>
          </table>
        </div>
        ${payment.notes ? `<div class="notes-box"><strong>${isBn ? 'নোট' : 'Notes'}:</strong> ${payment.notes}</div>` : ''}
        <div class="footer">${isBn ? 'ডিস্ট্রিবিউশন ম্যানেজমেন্ট সিস্টেম দ্বারা জেনারেটেড' : 'Generated by Distribution Management System'}</div>
      </body>
      </html>
    `;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 500);
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};
    if (!formData.retailer_id || formData.retailer_id === '') {
      errors.retailer_id = t('RetailerRequired');
    }
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = t('AmountRequired');
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const paymentData = {
        retailer_id: parseInt(formData.retailer_id),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        reference_no: formData.reference_no || null,
        notes: formData.notes || null,
        payment_date: formData.payment_date
      };
      const result = await paymentService.create(paymentData);
      setShowModal(false);
      fetchPayments();
      fetchRetailers();
      setFormData({
        retailer_id: '', amount: 0, payment_method: 'cash',
        reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: ''
      });
      setFieldErrors({});
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        setFieldErrors(errors);
      } else {
        alert(error.response?.data?.message || error.message || 'Failed to record payment');
      }
    }
  };

  const getMethodBadge = (method) => {
    const map = {
      cash: 'badge-success',
      bank: 'badge-primary',
      mobile_banking: 'badge-warning',
      cheque: 'badge-info'
    };
    return map[method] || 'badge-secondary';
  };

  const getMethodLabel = (method) => {
    const map = {
      cash: t('Cash'),
      bank: t('Bank'),
      mobile_banking: t('MobileBanking'),
      cheque: t('Cheque')
    };
    return map[method] || method;
  };

  if (loading) return <div>{t('Loading')}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Payments')}</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFieldErrors({}); setFormData({ retailer_id: '', amount: 0, payment_method: 'cash', reference_no: '', payment_date: new Date().toISOString().split('T')[0], notes: '' }); }}>
          <Plus size={18} /> {t('RecordPayment')}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder={t('SearchPayments')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{t('PaymentNo')}</th>
                <th>{t('Date')}</th>
                <th>{t('Retailer')}</th>
                <th className="text-right">{t('Amount')}</th>
                <th>{t('PaymentMethod')}</th>
                <th>{t('CollectedBy')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <h3>{t('NoPaymentsFound')}</h3>
                  </td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.payment_no}</td>
                    <td>{formatDate(payment.payment_date, language)}</td>
                    <td>{payment.retailer_name}</td>
                    <td className="text-right text-success">{formatCurrency(payment.amount, language)}</td>
                    <td><span className={`badge ${getMethodBadge(payment.payment_method)}`}>{getMethodLabel(payment.payment_method)}</span></td>
                    <td>{payment.collected_by_name}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" title={t('View')} onClick={() => handleView(payment.id)}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" title={t('Print')} onClick={() => handlePrint(payment)}>
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
              {Math.min((page - 1) * limit + limit, total)} of {total} {t('entries') || 'entries'}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <CreditCard size={24} className="modal-header-icon" />
                <h3>{t('RecordPayment')}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-section">
                <div className="form-section-title">{t('PaymentInformation') || 'Payment Information'}</div>
                <div className="form-group">
                  <label>{t('Retailer')} *</label>
                  <div className="input-with-icon">
                    <Building2 size={18} className="input-icon" />
                    <select
                      className={`form-select ${fieldErrors.retailer_id ? 'input-error' : ''}`}
                      value={formData.retailer_id}
                      onChange={(e) => { setFormData({ ...formData, retailer_id: e.target.value }); setFieldErrors({...fieldErrors, retailer_id: null}); }}
                      required
                      style={{ paddingLeft: '40px' }}
                    >
                      <option value="">{t('SelectRetailerPayment')}</option>
                      {retailers.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} - Due: {formatCurrency(r.outstanding_balance || 0, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.retailer_id && <div className="field-error">{fieldErrors.retailer_id}</div>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Amount')} *</label>
                    <div className="input-with-icon">
                      <DollarSign size={18} className="input-icon" />
                      <input
                        type="number"
                        step="0.01"
                        className={`form-input ${fieldErrors.amount ? 'input-error' : ''}`}
                        value={formData.amount}
                        onChange={(e) => { setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 }); setFieldErrors({...fieldErrors, amount: null}); }}
                        required
                        placeholder="0.00"
                      />
                    </div>
                    {fieldErrors.amount && <div className="field-error">{fieldErrors.amount}</div>}
                  </div>
                  <div className="form-group">
                    <label>{t('PaymentMethod')}</label>
                    <div className="input-with-icon">
                      <CreditCard size={18} className="input-icon" />
                      <select
                        className="form-select"
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        style={{ paddingLeft: '40px' }}
                      >
                        <option value="cash">{t('Cash')}</option>
                        <option value="bank">{t('Bank')}</option>
                        <option value="mobile_banking">{t('MobileBanking')}</option>
                        <option value="cheque">{t('Cheque')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('Date')}</label>
                    <DatePicker
                      value={formData.payment_date}
                      onChange={(v) => setFormData({ ...formData, payment_date: v })}
                      language={language}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('ReferenceNo')}</label>
                    <div className="input-with-icon">
                      <FileText size={18} className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        value={formData.reference_no}
                        onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                        placeholder={t('ReferenceNo')}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('Notes')}</label>
                  <div className="input-with-icon" style={{alignItems: 'flex-start'}}>
                    <FileText size={18} className="input-icon" style={{marginTop: '12px'}} />
                    <input
                      type="text"
                      className="form-input"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('Notes')}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <X size={18} /> {t('Cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {t('RecordPayment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewPayment && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <FileText size={24} className="modal-header-icon" />
                <h3>{t('PaymentDetails') || 'Payment Details'}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowViewModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f0f4ff', padding: '15px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{t('PaymentNo')}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a56db' }}>{viewPayment.payment_no}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{t('Amount')}</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(viewPayment.amount, language)}</div>
                  {language === 'bn' && (
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                      {amountInBengaliWords(viewPayment.amount)}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>{t('Retailer')}</label>
                <div style={{ padding: '8px 0', fontSize: '14px' }}>{viewPayment.retailer_name}</div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>{t('PaymentMethod')}</label>
                  <div style={{ padding: '8px 0', fontSize: '14px' }}>
                    <span className={`badge ${getMethodBadge(viewPayment.payment_method)}`} style={{ fontSize: '13px' }}>
                      {getMethodLabel(viewPayment.payment_method)}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>{t('PaymentDate')}</label>
                  <div style={{ padding: '8px 0', fontSize: '14px' }}>{formatDate(viewPayment.payment_date, language)}</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>{t('ReferenceNo')}</label>
                  <div style={{ padding: '8px 0', fontSize: '14px' }}>{viewPayment.reference_no || '-'}</div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>{t('CollectedBy')}</label>
                  <div style={{ padding: '8px 0', fontSize: '14px' }}>{viewPayment.collected_by_name || '-'}</div>
                </div>
              </div>

              {viewPayment.notes && (
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>{t('Notes')}</label>
                  <div style={{ padding: '10px', fontSize: '14px', background: '#f9fafb', borderRadius: '6px' }}>{viewPayment.notes}</div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>{t('Date')}</label>
                <div style={{ padding: '8px 0', fontSize: '14px', color: '#6b7280' }}>
                  {t('Created')}: {formatDate(viewPayment.created_at, language)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>{t('Close')}</button>
              <button className="btn btn-primary" onClick={() => { setShowViewModal(false); handlePrint(viewPayment); }}>
                <Printer size={16} /> {t('Print')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

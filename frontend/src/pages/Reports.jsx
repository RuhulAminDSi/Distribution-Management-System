import { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { useLanguage, formatCurrency, formatNumber } from '../context/LanguageContext';
import DatePicker from '../components/common/DatePicker';
import { FileText, DollarSign, Package, Building2, TrendingUp, CreditCard, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import ReportExport from './Reports/ReportExport';
import { DailySalesTable, ProductSalesTable, CompanySalesTable, ProfitTable, StockTable, DueTable, ExpiryTable } from './Reports/reportTables';

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

  const tabs = [
    { id: 'daily', label: t('DailySales') },
    { id: 'product', label: t('ProductWise') },
    { id: 'company', label: t('CompanyWise') },
    { id: 'profit', label: t('Profit') },
    { id: 'stock', label: t('StockLabel') },
    { id: 'due', label: t('DueLabel') },
    { id: 'expiry', label: t('ExpiryProducts') }
  ];

  const renderTable = () => {
    switch (activeTab) {
      case 'daily': return <DailySalesTable data={data} language={language} t={t} />;
      case 'product': return <ProductSalesTable data={data} language={language} t={t} />;
      case 'company': return <CompanySalesTable data={data} language={language} t={t} />;
      case 'profit': return <ProfitTable data={data} language={language} t={t} />;
      case 'stock': return <StockTable data={data} language={language} t={t} />;
      case 'due': return <DueTable data={data} language={language} t={t} />;
      case 'expiry': return <ExpiryTable data={data} language={language} t={t} />;
      default: return null;
    }
  };

  const renderSummary = () => {
    if (!summary) return null;
    return (
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
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('Reports')}</h1>
        <ReportExport
          activeTab={activeTab}
          data={data}
          dateRange={dateRange}
          language={language}
          t={t}
          summary={summary}
          loading={loading}
        />
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card mb-4" style={{ overflow: 'visible' }}>
        <div className="card-body">
          <div className="flex gap-4 items-center">
            <div>
              <label className="form-label">{t('StartDate')}</label>
              <DatePicker
                value={dateRange.start_date}
                onChange={(v) => setDateRange({ ...dateRange, start_date: v })}
                language={language}
              />
            </div>
            <div>
              <label className="form-label">{t('EndDate')}</label>
              <DatePicker
                value={dateRange.end_date}
                onChange={(v) => setDateRange({ ...dateRange, end_date: v })}
                language={language}
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

      {renderSummary()}

      {loading ? (
        <div>{t('Loading')}</div>
      ) : !data.length ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '40px', color: 'var(--text-secondary)' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3>{t('NoDataFound')}</h3>
            <p>{t('NoSalesForDateRange', { tab: tabs.find(t => t.id === activeTab)?.label || activeTab })}</p>
            {activeTab === 'daily' && (
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                {t('SelectedDate', { date: dateRange.start_date })}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            {renderTable()}
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

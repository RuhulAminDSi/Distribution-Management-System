import { useState, useEffect } from 'react';
import { useLanguage, formatCurrency, formatNumber } from '../context/LanguageContext';
import { dashboardService } from '../services/api';
import { DollarSign, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await dashboardService.getSummary();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner"></div>
        <span>{t('Loading')}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-loading">
        <span>{t('NoDataFound')}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('WelcomeToDMS')}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-value">{formatCurrency(data?.today?.totalSales, language)}</div>
          <div className="stat-label">{t('TodaySales')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-value">{formatCurrency(data?.allTime?.totalSales, language)}</div>
          <div className="stat-label">{t('TotalSalesAllTime')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <DollarSign size={24} />
          </div>
          <div className="stat-value">{formatCurrency(data?.totalOutstanding, language)}</div>
          <div className="stat-label">{t('TotalOutstanding')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Package size={24} />
          </div>
          <div className="stat-value">{formatNumber(data?.totalProducts, language)}</div>
          <div className="stat-label">{t('TotalProducts')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-value">{formatNumber(data?.lowStockCount, language)}</div>
          <div className="stat-label">{t('LowStockAlerts')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('RecentSales')}</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data?.recentInvoices?.length > 0 ? (
              <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('Invoice')}</th>
                    <th>{t('Retailer')}</th>
                    <th className="text-right">{t('Amount')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentInvoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_no}</td>
                      <td>{invoice.retailer_name}</td>
                      <td className="text-right">{formatCurrency(invoice.total_amount, language)}</td>
                      <td>
                        <span className={`badge badge-${invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'danger'}`}>
                          {invoice.status === 'paid' ? t('Paid') : invoice.status === 'partial' ? t('Partial') : t('Due')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('NoSalesToday')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('LowStockProducts')}</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data?.lowStockProducts?.length > 0 ? (
              <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('Product')}</th>
                    <th>{t('Code')}</th>
                    <th className="text-right">{t('Stock')}</th>
                    <th>{t('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.code}</td>
                      <td className="text-right">{formatNumber(product.stock_quantity, language)}</td>
                      <td>
                        <span className="badge badge-danger">{t('LowStockAlerts')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('AllProductsWellStocked')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

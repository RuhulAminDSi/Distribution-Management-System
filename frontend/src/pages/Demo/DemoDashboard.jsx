import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoDashboard() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('dashboard')}</h1>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('demoSubtitle')}</span>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-value">৳ 12,50,000</div>
          <div className="stat-label">{t('totalSales')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-value">1,250</div>
          <div className="stat-label">{t('totalOrders')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-value">৳ 8,75,000</div>
          <div className="stat-label">{t('totalRevenue')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <DollarSign size={24} />
          </div>
          <div className="stat-value">৳ 2,15,000</div>
          <div className="stat-label">{t('pendingPayments')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('topProducts')}</h3>
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
            <h3 className="card-title">{t('recentSales')}</h3>
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
}

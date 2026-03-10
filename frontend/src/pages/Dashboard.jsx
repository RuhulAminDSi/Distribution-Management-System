import { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { DollarSign, Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
};

export default function Dashboard() {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome to DMS</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-value">{formatCurrency(data?.today?.totalSales)}</div>
          <div className="stat-label">Today's Sales</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <TrendingUp size={24} />
          </div>
          <div className="stat-value">{formatCurrency(data?.totalOutstanding)}</div>
          <div className="stat-label">Total Outstanding</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Package size={24} />
          </div>
          <div className="stat-value">{data?.totalProducts || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-value">{data?.lowStockCount || 0}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Sales</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data?.recentInvoices?.length > 0 ? (
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
                  {data.recentInvoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_no}</td>
                      <td>{invoice.retailer_name}</td>
                      <td className="text-right">{formatCurrency(invoice.total_amount)}</td>
                      <td>
                        <span className={`badge badge-${invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'danger'}`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No sales today</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Low Stock Products</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data?.lowStockProducts?.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th className="text-right">Stock</th>
                    <th>Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.code}</td>
                      <td className="text-right">{product.stock_quantity}</td>
                      <td>
                        <span className="badge badge-danger">Low</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>All products are well stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

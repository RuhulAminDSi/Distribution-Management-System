import { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { FileText, Download } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount || 0);
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'daily':
          response = await reportService.dailySales({ date: dateRange.start_date });
          break;
        case 'product':
          response = await reportService.productSales(dateRange);
          break;
        case 'company':
          response = await reportService.companySales(dateRange);
          break;
        case 'profit':
          response = await reportService.profit(dateRange);
          break;
        case 'stock':
          response = await reportService.stock();
          break;
        case 'due':
          response = await reportService.due();
          break;
        default:
          break;
      }
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily Sales' },
    { id: 'product', label: 'Product-wise' },
    { id: 'company', label: 'Company-wise' },
    { id: 'profit', label: 'Profit' },
    { id: 'stock', label: 'Stock' },
    { id: 'due', label: 'Due' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex gap-4 items-center">
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
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

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card">
          <div className="table-container">
            {activeTab === 'daily' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Retailer</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Paid</th>
                    <th className="text-right">Due</th>
                    <th>Status</th>
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
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'product' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Company</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.product_id}>
                      <td>{item.product_name}</td>
                      <td>{item.company_name || '-'}</td>
                      <td className="text-right">{item.total_quantity}</td>
                      <td className="text-right">{formatCurrency(item.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'company' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th className="text-right">Invoices</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Sales</th>
                    <th className="text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.company_id}>
                      <td>{item.company_name}</td>
                      <td className="text-right">{item.total_invoices}</td>
                      <td className="text-right">{item.total_quantity}</td>
                      <td className="text-right">{formatCurrency(item.total_sales)}</td>
                      <td className="text-right text-success">{formatCurrency(item.total_profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'profit' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Retailer</th>
                    <th className="text-right">Sales</th>
                    <th className="text-right">Cost</th>
                    <th className="text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.invoice_id}>
                      <td>{item.invoice_no}</td>
                      <td>{item.invoice_date}</td>
                      <td>{item.retailer_name}</td>
                      <td className="text-right">{formatCurrency(item.sales_amount)}</td>
                      <td className="text-right">{formatCurrency(item.cost_amount)}</td>
                      <td className="text-right text-success">{formatCurrency(item.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'stock' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Company</th>
                    <th className="text-right">Stock</th>
                    <th className="text-right">Stock Value</th>
                    <th className="text-right">Dealer Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.company_name || '-'}</td>
                      <td className="text-right">{item.stock_quantity} {item.unit}</td>
                      <td className="text-right">{formatCurrency(item.stock_value)}</td>
                      <td className="text-right">{formatCurrency(item.dealer_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'due' && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Retailer</th>
                    <th>Phone</th>
                    <th>Area</th>
                    <th className="text-right">Credit Limit</th>
                    <th className="text-right">Outstanding</th>
                    <th className="text-right">Invoices</th>
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
          </div>
        </div>
      )}
    </div>
  );
}

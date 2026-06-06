import { Plus, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoPayments() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('payments')}</h1>
        <button className="btn btn-primary"><Plus size={18} /> New Payment</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search payments..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Retailer</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
                <th>Method</th>
                <th>Note</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>REC-001</td>
                <td>City Store</td>
                <td>29 Mar 2026</td>
                <td className="text-right">৳ 10,000</td>
                <td>Cash</td>
                <td>Payment for INV-001</td>
                <td><span className="badge badge-success">Paid</span></td>
              </tr>
              <tr>
                <td>REC-002</td>
                <td>Market Plus</td>
                <td>28 Mar 2026</td>
                <td className="text-right">৳ 5,000</td>
                <td>Bank Transfer</td>
                <td>Partial Payment</td>
                <td><span className="badge badge-success">Paid</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

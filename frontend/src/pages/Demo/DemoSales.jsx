import { Plus, Search, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoSales() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('sales')}</h1>
        <button className="btn btn-primary"><Plus size={18} /> New Sale</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ flex: 1, maxWidth: '500px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search invoices..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Retailer</th>
                <th>Date</th>
                <th className="text-right">Total</th>
                <th className="text-right">Discount</th>
                <th className="text-right">Grand Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>INV-001</td>
                <td>City Store</td>
                <td>29 Mar 2026</td>
                <td className="text-right">৳ 16,000</td>
                <td className="text-right">৳ 1,000</td>
                <td className="text-right">৳ 15,000</td>
                <td><span className="badge badge-success">Paid</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>INV-002</td>
                <td>Market Plus</td>
                <td>29 Mar 2026</td>
                <td className="text-right">৳ 9,000</td>
                <td className="text-right">৳ 500</td>
                <td className="text-right">৳ 8,500</td>
                <td><span className="badge badge-warning">Pending</span></td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

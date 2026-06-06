import { BarChart3, Package, CreditCard, Users, TrendingUp, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoReports() {
  const { t } = useLanguage();

  const reports = [
    { icon: BarChart3, name: 'Sales Report', desc: 'Daily, weekly, monthly sales analysis' },
    { icon: Package, name: 'Stock Report', desc: 'Current stock levels and movements' },
    { icon: CreditCard, name: 'Payment Report', desc: 'Payment collection and due tracking' },
    { icon: Users, name: 'Retailer Report', desc: 'Retailer performance and analysis' },
    { icon: TrendingUp, name: 'Profit Report', desc: 'Profit margin and loss analysis' },
    { icon: Building2, name: 'Company Report', desc: 'Company-wise performance' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('reports')}</h1>
      </div>
      <div className="reports-grid">
        {reports.map((r, i) => (
          <div key={i} className="card report-card">
            <r.icon size={32} />
            <h4>{r.name}</h4>
            <p>{r.desc}</p>
            <button className="btn btn-primary btn-sm">View Report</button>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoStock() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('stock')}</h1>
        <button className="btn btn-primary"><Plus size={18} /> Transfer</button>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Dhaka Warehouse</h3>
          </div>
          <div className="card-body">
            <div className="stock-list">
              <div className="stock-item"><span>Rice 25kg</span><span className="text-muted">500 qty</span></div>
              <div className="stock-item"><span>Sugar 1kg</span><span className="text-warning">50 qty</span></div>
              <div className="stock-item"><span>Flour 10kg</span><span className="text-muted">200 qty</span></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Chittagong Warehouse</h3>
          </div>
          <div className="card-body">
            <div className="stock-list">
              <div className="stock-item"><span>Rice 25kg</span><span className="text-muted">300 qty</span></div>
              <div className="stock-item"><span>Sugar 1kg</span><span className="text-muted">150 qty</span></div>
              <div className="stock-item"><span>Oil 5L</span><span className="text-danger">0 qty</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

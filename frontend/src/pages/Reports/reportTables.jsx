import { formatCurrency, formatNumber, formatDate } from '../../context/LanguageContext';
import { tot } from './reportUtils';

export function DailySalesTable({ data, language, t }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('InvoiceNo')}</th>
          <th>{t('Retailer')}</th>
          <th className="text-right">{t('Total')}</th>
          <th className="text-right">{t('Paid')}</th>
          <th className="text-right">{t('DueLabel')}</th>
          <th>{t('Status')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.invoice_no}</td>
            <td>{item.retailer_name}</td>
            <td className="text-right">{formatCurrency(item.total_amount, language)}</td>
            <td className="text-right">{formatCurrency(item.paid_amount, language)}</td>
            <td className="text-right">{formatCurrency(item.due_amount, language)}</td>
            <td><span className={`badge badge-${item.status === 'paid' ? 'success' : item.status === 'partial' ? 'warning' : 'danger'}`}>{item.status}</span></td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
          <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px' }}>{t('Total')}</td>
          <td className="text-right">{formatCurrency(tot(data, 'total_amount'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'paid_amount'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'due_amount'), language)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ProductSalesTable({ data, language, t }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('Product')}</th>
          <th>{t('Company')}</th>
          <th>{t('CategoryLabel')}</th>
          <th className="text-right">{t('Quantity')}</th>
          <th className="text-right">{t('Amount')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.product_id}>
            <td>{item.product_name}</td>
            <td>{item.company_name || '-'}</td>
            <td>{item.category_name || '-'}</td>
            <td className="text-right">{formatNumber(item.total_quantity, language)}</td>
            <td className="text-right">{formatCurrency(item.total_amount, language)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
          <td colSpan={3} style={{ textAlign: 'right', paddingRight: '12px' }}>{t('Total')}</td>
          <td className="text-right">{formatNumber(tot(data, 'total_quantity'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'total_amount'), language)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function CompanySalesTable({ data, language, t }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('Company')}</th>
          <th className="text-right">{t('Invoices')}</th>
          <th className="text-right">{t('Quantity')}</th>
          <th className="text-right">{t('Sales')}</th>
          <th className="text-right">{t('Profit')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.company_id}>
            <td>{item.company_name}</td>
            <td className="text-right">{formatNumber(item.total_invoices, language)}</td>
            <td className="text-right">{formatNumber(item.total_quantity, language)}</td>
            <td className="text-right">{formatCurrency(item.total_sales, language)}</td>
            <td className="text-right text-success">{formatCurrency(item.total_profit, language)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
          <td style={{ textAlign: 'right', paddingRight: '12px' }}>{t('Total')}</td>
          <td className="text-right">{formatNumber(tot(data, 'total_invoices'), language)}</td>
          <td className="text-right">{formatNumber(tot(data, 'total_quantity'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'total_sales'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'total_profit'), language)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ProfitTable({ data, language, t }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('InvoiceNo')}</th>
          <th>{t('Date')}</th>
          <th>{t('Retailer')}</th>
          <th className="text-right">{t('Sales')}</th>
          <th className="text-right">{t('Cost')}</th>
          <th className="text-right">{t('Profit')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.invoice_id}>
            <td>{item.invoice_no}</td>
            <td>{formatDate(item.invoice_date, language)}</td>
            <td>{item.retailer_name}</td>
            <td className="text-right">{formatCurrency(item.sales_amount, language)}</td>
            <td className="text-right">{formatCurrency(item.cost_amount, language)}</td>
            <td className="text-right text-success">{formatCurrency(item.profit, language)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
          <td colSpan={3} style={{ textAlign: 'right', paddingRight: '12px' }}>{t('Total')}</td>
          <td className="text-right">{formatCurrency(tot(data, 'sales_amount'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'cost_amount'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'profit'), language)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function StockTable({ data, language, t }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('Product')}</th>
          <th>{t('Company')}</th>
          <th className="text-right">{t('StockLabel')}</th>
          <th className="text-right">{t('StockValue')}</th>
          <th className="text-right">{t('DealerPrice')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.company_name || '-'}</td>
            <td className="text-right">{formatNumber(item.stock_quantity, language)} {item.unit}</td>
            <td className="text-right">{formatCurrency(item.stock_value, language)}</td>
            <td className="text-right">{formatCurrency(item.dealer_price, language)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
          <td colSpan={3} style={{ textAlign: 'right', paddingRight: '12px' }}>{t('Total')}</td>
          <td className="text-right">{formatCurrency(tot(data, 'stock_value'), language)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  );
}

export function DueTable({ data, language, t }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('Retailer')}</th>
          <th>{t('Phone')}</th>
          <th>{t('Area')}</th>
          <th className="text-right">{t('CreditLimit')}</th>
          <th className="text-right">{t('Outstanding')}</th>
          <th className="text-right">{t('Invoices')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.retailer_id}>
            <td>{item.retailer_name}</td>
            <td>{item.phone}</td>
            <td>{item.area || '-'}</td>
            <td className="text-right">{formatCurrency(item.credit_limit, language)}</td>
            <td className="text-right text-danger">{formatCurrency(item.outstanding_balance, language)}</td>
            <td className="text-right">{formatNumber(item.total_invoices, language)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
          <td colSpan={3} style={{ textAlign: 'right', paddingRight: '12px' }}>{t('Total')}</td>
          <td className="text-right">{formatCurrency(tot(data, 'credit_limit'), language)}</td>
          <td className="text-right">{formatCurrency(tot(data, 'outstanding_balance'), language)}</td>
          <td className="text-right">{formatNumber(tot(data, 'total_invoices'), language)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export function ExpiryTable({ data, language, t }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>{t('Code')}</th>
          <th>{t('Name')}</th>
          <th>{t('Company')}</th>
          <th className="text-right">{t('StockLabel')}</th>
          <th>{t('ExpiryDate')}</th>
          <th>{t('Status')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => {
          const isExpired = item.expiry_date && new Date(item.expiry_date) <= new Date() && item.stock_quantity > 0;
          const isExpiringSoon = item.expiry_date && !isExpired && new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && item.stock_quantity > 0;
          return (
          <tr key={item.id} className={isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}>
            <td>{item.code}</td>
            <td>{item.name}</td>
            <td>{item.company_name || '-'}</td>
            <td className="text-right">{formatNumber(item.stock_quantity, language)}</td>
            <td>{formatDate(item.expiry_date, language)}</td>
            <td>{isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Valid'}</td>
          </tr>
        )})}
      </tbody>
      <tfoot>
        <tr style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>
          <td colSpan={3} style={{ textAlign: 'right', paddingRight: '12px' }}>{t('Total')}</td>
          <td className="text-right">{formatNumber(tot(data, 'stock_quantity'), language)}</td>
          <td colSpan={2}></td>
        </tr>
      </tfoot>
    </table>
  );
}

import type { SalesDashboard } from '../../shared/sales';
import { formatMoney } from '../utils/format';

export function DailyTotal({ dashboard, error }: { dashboard: SalesDashboard | null; error: string }) {
  return <div className="total-summary">
    <div><p className="summary-label">TOTAL SOLD TODAY</p>
      <div className="total" aria-live="polite">{dashboard && !error ? formatMoney(dashboard.total_kobo) : '—'}</div>
      <p className="transaction-count">{dashboard && !error ? `${dashboard.today_count} ${dashboard.today_count === 1 ? 'transaction' : 'transactions'} today` : 'Today’s sales'}</p>
    </div>
    <span className="today-badge">Today</span>
  </div>;
}

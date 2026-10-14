import { useEffect, useState } from 'react';
import type { DashboardState } from '../hooks/useSalesDashboard';
import { DailyTotal } from '../components/DailyTotal';
import { Pagination, SALES_PER_PAGE } from '../components/Pagination';
import { SalesTable } from '../components/SalesTable';

export function DashboardPage({ dashboard, loading, error, refresh }: DashboardState) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil((dashboard?.count ?? 0) / SALES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visibleSales = dashboard?.sales.slice((currentPage - 1) * SALES_PER_PAGE, currentPage * SALES_PER_PAGE) ?? [];
  useEffect(() => { setPage(1); }, [dashboard?.day]);

  return <section className="transactions" aria-labelledby="transactions-heading">
    <DailyTotal dashboard={dashboard} error={error}/>
    <div className="table-heading">
      <h2 id="transactions-heading">Sales history</h2>
      <button type="button" className="refresh" onClick={() => void refresh()} disabled={loading}>{loading ? 'Updating…' : 'Refresh'}</button>
    </div>
    {error ? <div className="table-state" role="alert">
      <strong>Unable to load sales</strong><p>{error}</p><button className="retry" onClick={() => void refresh()}>Try again</button>
    </div> : loading && !dashboard ? <div className="table-state" role="status">Loading sales history…</div> : <>
      <SalesTable sales={visibleSales}/>
      {dashboard?.count === 0 && <div className="table-state">
        <strong>No sales recorded yet</strong><p>Your first sale will appear here.</p><a className="text-link" href="/record">Record a sale</a>
      </div>}
      {!!dashboard?.count && <Pagination page={currentPage} pageCount={pageCount} count={dashboard.count} loading={loading} onPageChange={setPage}/>}
    </>}
  </section>;
}

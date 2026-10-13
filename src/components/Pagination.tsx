export const SALES_PER_PAGE = 5;

interface PaginationProps {
  page: number;
  pageCount: number;
  count: number;
  loading: boolean;
  onPageChange(page: number): void;
}

export function Pagination({ page, pageCount, count, loading, onPageChange }: PaginationProps) {
  return <nav className="pagination" aria-label="Transactions pagination">
    <span className="page-range">Showing {(page - 1) * SALES_PER_PAGE + 1}–{Math.min(page * SALES_PER_PAGE, count)} of {count}</span>
    <div className="page-controls">
      <button type="button" disabled={page === 1 || loading} onClick={() => onPageChange(page - 1)}>Previous</button>
      <span aria-live="polite">Page {page} of {pageCount}</span>
      <button type="button" disabled={page === pageCount || loading} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  </nav>;
}

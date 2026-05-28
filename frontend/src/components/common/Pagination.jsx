import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  limit,
  total,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 25, 50]
}) {
  if (!total || total === 0) return null;

  const getPageNumbers = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let start = Math.max(page - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;
    
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
      <div className="text-xs font-semibold text-slate-500">
        Showing <span className="text-slate-800">{Math.min(total, (page - 1) * limit + 1)}</span> to{' '}
        <span className="text-slate-800">
          {Math.min(page * limit, total)}
        </span>{' '}
        of <span className="text-slate-800">{total}</span> records
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {limitOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={!hasPrev}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition cursor-pointer ${
                page === pageNum
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            disabled={!hasNext}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 disabled:hover:bg-white transition cursor-pointer disabled:cursor-not-allowed"
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

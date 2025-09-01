import { cn } from "../../global/library/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const maxPagesToShow = 5;
  const pages: number[] = [];

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + maxPagesToShow - 1);

  // Adjust start if we are at the end to always show 5 pages
  if (totalPages >= maxPagesToShow && totalPages - currentPage < 2) {
    start = Math.max(1, totalPages - maxPagesToShow + 1);
    end = totalPages;
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const showFirst = start > 1;
  const showLast = end < totalPages;

  return (
    <nav className="flex items-center gap-x-1" aria-label="Pagination">
      {/* Previous button */}
      <button
        type="button"
        className={cn(
          "min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg",
          "text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none",
          "dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
        )}
        aria-label="Previous"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="shrink-0 size-3.5" />
        <span className="sr-only">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-x-1">
        {showFirst && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className={cn(
                "min-h-9.5 min-w-9.5 flex justify-center items-center py-2 px-3 text-sm rounded-lg",
                currentPage === 1
                  ? "bg-gray-200 text-gray-800 dark:bg-neutral-600 dark:text-white"
                  : "text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10",
                "focus:outline-hidden focus:bg-gray-300 dark:focus:bg-neutral-500"
              )}
            >
              1
            </button>
            {start > 2 && <span className="text-muted-foreground text-sm px-1">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={cn(
              "min-h-9.5 min-w-9.5 flex justify-center items-center py-2 px-3 text-sm rounded-lg",
              page === currentPage
                ? "bg-gray-200 text-gray-800 dark:bg-neutral-600 dark:text-white"
                : "text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10",
              "focus:outline-hidden focus:bg-gray-300 dark:focus:bg-neutral-500"
            )}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        {showLast && (
          <>
            {end < totalPages - 1 && <span className="text-muted-foreground text-sm px-1">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={cn(
                "min-h-9.5 min-w-9.5 flex justify-center items-center py-2 px-3 text-sm rounded-lg",
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-800 dark:bg-neutral-600 dark:text-white"
                  : "text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10",
                "focus:outline-hidden focus:bg-gray-300 dark:focus:bg-neutral-500"
              )}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next button */}
      <button
        type="button"
        className={cn(
          "min-h-9.5 min-w-9.5 py-2 px-2.5 inline-flex justify-center items-center gap-x-2 text-sm rounded-lg",
          "text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none",
          "dark:text-white dark:hover:bg-white/10 dark:focus:bg-white/10"
        )}
        aria-label="Next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Next</span>
        <ChevronRight className="shrink-0 size-3.5" />
      </button>
    </nav>
  );
}

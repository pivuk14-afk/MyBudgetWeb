interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange
}: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
      <span>
        Страница {page} из {totalPages}
      </span>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          className="rounded-md border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => canPrev && onPageChange(page - 1)}
        >
          Назад
        </button>
        <button
          type="button"
          disabled={!canNext}
          className="rounded-md border border-slate-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => canNext && onPageChange(page + 1)}
        >
          Вперёд
        </button>
      </div>
    </div>
  );
};


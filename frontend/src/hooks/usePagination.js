import { useState } from 'react';

export function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleSetLimit = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const goToPage = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return {
    page,
    limit,
    totalPages,
    totalCount,
    setPage: goToPage,
    setLimit: handleSetLimit,
    setTotalPages,
    setTotalCount,
    nextPage: () => goToPage(page + 1),
    prevPage: () => goToPage(Math.max(1, page - 1))
  };
}

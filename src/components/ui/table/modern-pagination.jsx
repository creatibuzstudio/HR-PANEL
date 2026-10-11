import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const ModernPagination = ({
  totalItems,
  itemsPerPage,
  totalPages,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  className = "",
}) => {
  const [localItemsPerPage, setLocalItemsPerPage] = useState(itemsPerPage);
  const [inputPage, setInputPage] = useState(currentPage);

  // Sync input with currentPage from parent
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setLocalItemsPerPage(newItemsPerPage);
    if (onItemsPerPageChange) onItemsPerPageChange(newItemsPerPage);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * localItemsPerPage + 1;
  const endItem = Math.min(currentPage * localItemsPerPage, totalItems);
  const itemsPerPageOptions = [10, 25, 50, 100];

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${className}`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Items per page
          </span>
          <select
            value={localItemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {startItem}-{endItem} of {totalItems} items
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Go to first page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Page Input */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={() => {
              const page = parseInt(inputPage, 10);
              if (!isNaN(page) && page >= 1 && page <= totalPages) {
                handlePageChange(page);
              } else {
                setInputPage(currentPage);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const page = parseInt(inputPage, 10);
                if (!isNaN(page) && page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                } else {
                  setInputPage(currentPage);
                }
              }
            }}
            className="w-14 h-8 px-2 text-center text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            of {totalPages}
          </span>
        </div>

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-8 h-8 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Go to last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ModernPagination;

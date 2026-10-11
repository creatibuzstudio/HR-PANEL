import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Download,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import ModernPagination from "./modern-pagination";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import MultiSelectDropdown from "@/components/ui/dropdown/multiSelectDropdown.jsx";

export default function ReusableTable({
  data,
  headers,
  py,
  total,
  isLoading,
  pageSize = 10,
  setPageSize,
  onPageChange,
  currentPage = 1,
  // Enhanced functionality
  enableSearch = false,
  enableSorting = false,
  enableSelection = false,
  enableBulkActions = false,
  onSelectionChange,
  externalSelectedIds,
  onBulkAction,
  searchPlaceholder = "Search...",
  externalSearchTerm = "",
  onSearchChange,
  filters = [], // Array of filters [{type: 'dropdown'|'multi-select', field, options, placeholder}]
  filterValues = {},
  onFilterChange,
  externalTotal = null,
  externalTotalPages = null,
  isPaginated = true,
  enableExport = false,
  onExport,
}) {
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localSearchTerm, setLocalSearchTerm] = useState(externalSearchTerm);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Sync external state
  useEffect(() => setLocalCurrentPage(currentPage), [currentPage]);
  useEffect(() => setLocalSearchTerm(externalSearchTerm), [externalSearchTerm]);

  // Filter + search + sort
  const processedData = useMemo(() => {
    let filteredData = data || [];

    // Apply search
    if (localSearchTerm) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((v) =>
          String(v).toLowerCase().includes(localSearchTerm.toLowerCase()),
        ),
      );
    }

    // Apply sorting
    if (sortConfig.key && enableSorting) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [data, localSearchTerm, sortConfig, enableSorting, filters]);

  const totalPages =
    externalTotalPages || Math.ceil(processedData.length / pageSize);
  const startIndex = (localCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = externalTotal
    ? processedData
    : processedData.slice(startIndex, endIndex);

  // Sync external selected ids (for example, when parent clears selection after an action)
  useEffect(() => {
    if (!externalSelectedIds) return;

    const newSet = new Set(externalSelectedIds);
    setSelectedRows(newSet);
  }, [externalSelectedIds]);

  // Update select-all state based on current page data
  useEffect(() => {
    if (!paginatedData || paginatedData.length === 0) {
      setSelectAll(false);
      return;
    }

    const isAllSelected = paginatedData.every((item) =>
      selectedRows.has(item.id),
    );
    setSelectAll(isAllSelected);
  }, [paginatedData, selectedRows]);

  const handleSearchChange = (value) => {
    setLocalSearchTerm(value);
    setLocalCurrentPage(1);
    if (onSearchChange) onSearchChange(value);
  };

  const handleSort = (key) => {
    if (!enableSorting) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRowSelect = (id) => {
    const newSelection = new Set(selectedRows);
    newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
    setSelectedRows(newSelection);
    setSelectAll(newSelection.size === paginatedData.length);
    if (onSelectionChange) onSelectionChange(Array.from(newSelection));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const allIds = paginatedData.map((item) => item.id);
      setSelectedRows(new Set(allIds));
      setSelectAll(true);
      if (onSelectionChange) onSelectionChange(allIds);
    }
  };

  const handleBulkAction = (action) => {
    if (onBulkAction) onBulkAction(action, Array.from(selectedRows));
  };

  const handlePageChange = (page) => {
    if (page !== localCurrentPage && page > 0 && page <= totalPages) {
      setLocalCurrentPage(page);
      if (onPageChange) onPageChange(page);
    }
  };

  const getSortIcon = (field) => {
    if (!enableSorting) return null;
    if (sortConfig.key !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  return (
    <div className="w-full">
      {/* Search + Filters + Export */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        {enableSearch && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}

        {filters &&
          filters?.length > 0 &&
          filters?.map((filter) => {
            if (filter?.type === "select") {
              return (
                <div key={filter.field} className="w-48 h-fit">
                  <Dropdown
                    size={filter.size || "md"}
                    placeholder={filter.placeholder}
                    options={filter.options}
                    value={filterValues[filter.field] ?? null}
                    onChange={(val) => onFilterChange(filter.field, val)}
                  />
                </div>
              );
            }
            if (filter?.type === "multi-select") {
              return (
                <div key={filter.field} className="w-64 h-fit">
                  <MultiSelectDropdown
                    size={filter.size || "md"}
                    options={filter.options}
                    value={filterValues[filter.field] || []}
                    onChange={(val) => onFilterChange(filter.field, val)}
                    placeholder={filter.placeholder}
                  />
                </div>
              );
            }
            return null;
          })}

        {enableExport && (
          <button
            onClick={onExport}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        )}
      </div>

      {/* Bulk Actions */}
      {enableBulkActions && selectedRows.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedRows.size} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-x-auto relative max-h-[600px] overflow-auto">
        <Table className="min-w-[900px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
            <TableRow className="border-b border-gray-200 dark:border-gray-700">
              {enableSelection && (
                <TableHead className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </TableHead>
              )}
              {headers?.map((cell, index) => (
                <TableHead
                  key={index}
                  className={`${
                    index + 1 === headers?.length ? "text-center" : "text-left"
                  } px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider${
                    enableSorting && cell.field !== "actions"
                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      : ""
                  }`}
                  onClick={() =>
                    enableSorting &&
                    cell.field !== "actions" &&
                    handleSort(cell.field)
                  }
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {cell.header}
                    {getSortIcon(cell.field)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    {enableSelection && (
                      <TableCell className="px-6 py-4">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </TableCell>
                    )}
                    {headers?.map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paginatedData?.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 ${
                      selectedRows.has(item.id)
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    {enableSelection && (
                      <TableCell className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(item.id)}
                          onChange={() => handleRowSelect(item.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </TableCell>
                    )}
                    {headers?.map((header, idx) => (
                      <TableCell
                        key={idx}
                        className={`${py ? py : "py-4"} px-6 ${
                          idx + 1 === headers?.length
                            ? "text-center"
                            : "text-left"
                        } text-sm text-gray-900 dark:text-gray-100`}
                      >
                        {React.isValidElement(item[header.field]) ? (
                          item[header.field]
                        ) : Array.isArray(item[header.field]) ? (
                          item[header.field].join(" ")
                        ) : (
                          <span className="whitespace-nowrap">
                            {String(item[header.field]).replace(/\n/g, " ")}
                          </span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* No data */}
      {!isLoading && processedData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <FolderOpen
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {localSearchTerm ? "No results found" : "No data found"}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            {localSearchTerm
              ? "Try adjusting your search terms"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && processedData.length > 0 && isPaginated && (
        <ModernPagination
          totalItems={externalTotal || processedData.length}
          itemsPerPage={pageSize}
          totalPages={totalPages}
          currentPage={localCurrentPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={(newPageSize) => {
            setPageSize(newPageSize);
            setLocalCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}

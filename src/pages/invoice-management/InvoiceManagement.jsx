import { useState, useEffect } from "react";
import { useGetInvoicesWithSearchQuery } from "@/services/invoice/invoiceApiSlice";
import InvoiceCard from "@/components/invoice/InvoiceCard";
import ModernPagination from "@/components/ui/table/modern-pagination";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import Modal from "@/components/ui/modal";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const INVOICE_STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" }, // Special query value for 'all' or empty

  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },

  { label: "Cancelled", value: "cancelled" },
];

const INVOICE_TYPE_OPTIONS = [
  { label: "All Types", value: "ALL" },
  { label: "One Time", value: "one_time" },
  { label: "Subscription", value: "subscription" },
];

export default function InvoiceManagement() {
  // Local state replaces URL search params
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("ALL");
  const [invoiceType, setInvoiceType] = useState("ALL");

  // Search local state with debounce
  const [localQuery, setLocalQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce localQuery -> debouncedQuery and reset to first page when search changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(localQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [localQuery]);

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  const handleTypeChange = (val) => {
    setInvoiceType(val);
    setPage(1);
  };

  const { data: { data: invoices = [], meta = {} } = {}, isLoading } =
    useGetInvoicesWithSearchQuery({
      query: debouncedQuery,
      limit,
      page,
      status: status === "ALL" ? "" : status,
      type: invoiceType === "ALL" ? "" : invoiceType,
    });

  const totalItems = meta.totalItems || 0;
  const totalPages = meta.totalPages || 0;

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const handleAddNew = () => {
    setModalState({ isOpen: true, type: "add", data: null });
  };

  const handleEdit = (invoice) => {
    setModalState({ isOpen: true, type: "edit", data: invoice });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, type: null, data: null });
  };

  const handleFormSuccess = () => {
    handleModalClose();
    // No refetch here since useGetInvoicesWithSearchQuery will invalidate based on tags, but let's be sure:
    // actually, tags will auto-refetch
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex justify-between items-center w-full lg:w-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invoice Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage customer invoices
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="w-full bg-white sm:w-40">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="w-ful bg-white sm:w-40">
            <Select
              value={invoiceType}
              className="bg-white"
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Type" />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {invoices.length > 0 ? (
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[90px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice, index) => (
                    <InvoiceCard key={index} invoice={invoice} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Filter className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-lg font-medium text-gray-900">
                  No invoices found
                </p>
                <p className="text-sm text-gray-500">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6">
            <ModernPagination
              totalItems={totalItems}
              itemsPerPage={limit}
              totalPages={totalPages}
              currentPage={page}
              onPageChange={(p) => setPage(p)}
              onItemsPerPageChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        </>
      )}

      {/* Add/Edit Invoice Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add" ? "Add New Invoice" : "Edit Invoice"
        }
        size="lg"
      >
        <InvoiceForm
          invoice={modalState.data}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
}

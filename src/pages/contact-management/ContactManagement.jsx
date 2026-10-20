import React, { useEffect, useState, useMemo } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import FollowUpEmailModal from "@/components/contact/FollowUpEmailModal";
import ContactDetailsModal from "@/components/contact/ContactDetailsModal";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Send,
  Eye,
  Trash2,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchContactsQuery,
  useGetAllContactsQuery,
  useDeleteContactMutation,
} from "@/services/contact/contactApiSlice.js";

const STATUS_FILTERS = [
  { id: "ALL", label: "All Inquiries" },
  { id: "PENDING", label: "Pending" },
  { id: "REPLIED", label: "Followed Up / Replied" },
];

export default function ContactManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedItems, setSelectedItems] = useState([]);

  // Follow-up Email Modal state
  const [followUpModalState, setFollowUpModalState] = useState({
    isOpen: false,
    contact: null,
  });

  // Details Modal state
  const [detailsModalState, setDetailsModalState] = useState({
    isOpen: false,
    contact: null,
  });

  // Delete Confirm Modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  // Fetch paginated contacts
  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    isFetching,
    refetch,
  } = useSearchContactsQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
    status: statusFilter,
  });

  // Fetch all contacts for global stats calculation
  const { data: allContacts = [], refetch: refetchAll } =
    useGetAllContactsQuery();

  // Delete mutation
  const [deleteContact] = useDeleteContactMutation();

  useEffect(() => {
    if (
      searchResult?.meta?.currentPage &&
      searchResult.meta.currentPage !== currentPage
    ) {
      setCurrentPage(searchResult.meta.currentPage);
    }
  }, [searchResult?.meta?.currentPage, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (searchResult?.meta?.itemsPerPage) {
      setPageSize(searchResult.meta.itemsPerPage);
    }
  }, [searchResult]);

  const contacts = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  // Compute stats
  const stats = useMemo(() => {
    const list = Array.isArray(allContacts) ? allContacts : [];
    const totalCount = list.length;
    const pendingCount = list.filter(
      (c) => (c.status || "PENDING").toUpperCase() === "PENDING"
    ).length;
    const repliedCount = list.filter(
      (c) => (c.status || "").toUpperCase() === "REPLIED"
    ).length;
    const highBudgetCount = list.filter((c) => {
      const b = (c.budget || "").toLowerCase();
      return (
        b.includes("5k") ||
        b.includes("7k") ||
        b.includes("10k") ||
        b.includes("$3k - $5k") ||
        b.includes("custom")
      );
    }).length;

    return { totalCount, pendingCount, repliedCount, highBudgetCount };
  }, [allContacts]);

  // Headers for ReusableTable
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Client Info", field: "client_info" },
    { header: "WhatsApp", field: "whatsapp" },
    { header: "Budget Setup", field: "budget" },
    { header: "Project Details", field: "product_details" },
    { header: "Status", field: "status" },
    { header: "Received Date", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data for table
  const transformedData = contacts.map((contact, i) => {
    const whatsappClean = contact.whatsapp
      ? contact.whatsapp.replace(/[^0-9+]/g, "")
      : "";

    return {
      sl: (currentPage - 1) * pageSize + i + 1,
      id: contact.id,
      client_info: (
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              contact.fullName || "Lead"
            )}&background=FE5A00&color=fff&size=128`}
            alt={contact.fullName}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
          />
          <div className="text-left leading-tight">
            <div className="font-semibold text-gray-900 dark:text-white">
              {contact.fullName || "N/A"}
            </div>
            <a
              href={`mailto:${contact.email}`}
              className="text-xs text-blue-500 hover:underline mt-0.5 block truncate max-w-[180px]"
            >
              {contact.email || "—"}
            </a>
          </div>
        </div>
      ),
      whatsapp: (
        <div className="text-left">
          {whatsappClean ? (
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-900"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{contact.whatsapp}</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-gray-400">Not provided</span>
          )}
        </div>
      ),
      budget: (
        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20">
          {contact.budget || "N/A"}
        </span>
      ),
      product_details: (
        <div
          onClick={() => handleView(contact)}
          className="text-xs text-gray-600 dark:text-gray-300 max-w-[240px] truncate cursor-pointer hover:text-primary transition"
          title={contact.productDetails}
        >
          {contact.productDetails || "—"}
        </div>
      ),
      status: (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            contact.status === "REPLIED"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {contact.status || "PENDING"}
        </span>
      ),
      created_at: contact.createdAt
        ? moment(contact.createdAt).format("MMM DD, YYYY")
        : "N/A",
      actions: (
        <div className="flex items-center justify-center gap-1.5">
          <IconButton
            icon={Send}
            onClick={() => handleOpenFollowUp(contact)}
            className="text-primary hover:text-primary/80 hover:bg-primary/10"
            title="Write Follow-up Email (Text Editor)"
          />
          <IconButton
            icon={Eye}
            onClick={() => handleView(contact)}
            className="text-blue-600 hover:text-blue-700"
            title="View Full Inquiry Details"
          />
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([contact.id])}
            className="text-rose-600 hover:text-rose-700"
            title="Delete Inquiry"
          />
        </div>
      ),
    };
  });

  // Action handlers
  const handleView = (contact) => {
    setDetailsModalState({
      isOpen: true,
      contact,
    });
  };

  const handleOpenFollowUp = (contact) => {
    setFollowUpModalState({
      isOpen: true,
      contact,
    });
  };

  const handleFollowUpSuccess = () => {
    refetch();
    refetchAll();
  };

  const openDeleteModal = (ids) => {
    setDeleteConfirmState({ isOpen: true, idsToDelete: ids });
  };

  const cancelDelete = () => {
    setDeleteConfirmState({ isOpen: false, idsToDelete: [] });
  };

  const confirmDelete = async () => {
    try {
      for (const id of deleteConfirmState.idsToDelete) {
        await deleteContact(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} inquiry(s) deleted successfully`
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id))
      );
      refetch();
      refetchAll();
    } catch (err) {
      toast.error("Failed to delete contact inquiry");
    } finally {
      cancelDelete();
    }
  };

  const handleBulkDelete = (action, selectedIds) => {
    if (action === "delete" && selectedIds.length > 0) {
      openDeleteModal(selectedIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-primary" />
            <span>Contact Inquiries</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            View website consultation requests, manage leads, and send rich text follow-up emails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              refetch();
              refetchAll();
              toast.success("Inquiries refreshed!");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-primary shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Inquiries
            </span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {stats.totalCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Mail className="w-6 h-6" />
          </div>
        </Card>

        {/* Pending Review */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Pending Review
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        {/* Followed Up */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Followed Up
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.repliedCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        {/* High Budget */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              High Budget ($3K+)
            </span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {stats.highBudgetCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <DollarSign className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <ReusableTable
        headers={headers}
        data={transformedData}
        totalItems={total}
        itemsPerPage={pageSize}
        currentPage={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        searchQuery={searchTerm}
        onSearchChange={(q) => setSearchTerm(q)}
        selectedItems={selectedItems}
        onSelectionChange={(items) => setSelectedItems(items)}
        onBulkAction={handleBulkDelete}
        loading={isLoading || isFetching}
        emptyMessage="No contact inquiries found."
      />

      {/* Follow-up Email Modal (with SimpleRichTextEditor) */}
      <FollowUpEmailModal
        isOpen={followUpModalState.isOpen}
        contact={followUpModalState.contact}
        onClose={() => setFollowUpModalState({ isOpen: false, contact: null })}
        onSuccess={handleFollowUpSuccess}
      />

      {/* Details View Modal */}
      <ContactDetailsModal
        isOpen={detailsModalState.isOpen}
        contact={detailsModalState.contact}
        onClose={() => setDetailsModalState({ isOpen: false, contact: null })}
        onOpenFollowUp={(c) => handleOpenFollowUp(c)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Contact Inquiry"
        message={`Are you sure you want to delete ${deleteConfirmState.idsToDelete.length} selected inquiry(s)? This action cannot be undone.`}
      />
    </div>
  );
}

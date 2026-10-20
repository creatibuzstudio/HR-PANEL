import React, { useEffect, useState, useMemo } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import PackageBookingForm from "@/components/package-booking/PackageBookingForm";
import PackageBookingDetailsModal from "@/components/package-booking/PackageBookingDetailsModal";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchBookingsQuery,
  useGetAllBookingsQuery,
  useDeleteBookingMutation,
} from "@/services/package-booking/packageBookingApiSlice.js";
import { useGetAllPackagesQuery } from "@/services/package/packageApiSlice.js";

const STATUS_FILTERS = [
  { id: "ALL", label: "All Bookings" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function PackageBookingManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedItems, setSelectedItems] = useState([]);

  // Add / Edit Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // Details Modal state
  const [detailsModalState, setDetailsModalState] = useState({
    isOpen: false,
    data: null,
  });

  // Delete Confirm Modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  // Fetch all packages for fallback mapping
  const { data: packages = [] } = useGetAllPackagesQuery();
  const packagesMap = useMemo(() => {
    const map = {};
    packages.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [packages]);

  // Query paginated and filtered bookings
  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useSearchBookingsQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
    status: statusFilter,
  });

  // Fetch all bookings for summary cards
  const { data: allBookings = [] } = useGetAllBookingsQuery();

  const [deleteBooking, { isLoading: deleteLoading }] = useDeleteBookingMutation();

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

  const bookings = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  // Compute stat card metrics
  const stats = useMemo(() => {
    const list = Array.isArray(allBookings) ? allBookings : [];
    const totalCount = list.length;
    const pendingCount = list.filter((b) => (b.status || "PENDING").toUpperCase() === "PENDING").length;
    const confirmedCount = list.filter((b) => (b.status || "").toUpperCase() === "CONFIRMED").length;
    const completedCount = list.filter((b) => (b.status || "").toUpperCase() === "COMPLETED").length;
    return { totalCount, pendingCount, confirmedCount, completedCount };
  }, [allBookings]);

  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Client Info", field: "client_info" },
    { header: "Company", field: "company" },
    { header: "Booked Package", field: "package_info" },
    { header: "Billing Cycle", field: "billing_cycle" },
    { header: "Status", field: "status" },
    { header: "Booking Date", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  const getStatusBadge = (status) => {
    const norm = (status || "PENDING").toUpperCase();
    switch (norm) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-900";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900";
      case "PENDING":
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    }
  };

  // Transform data for ReusableTable
  const transformedData = bookings?.map((booking, i) => {
    // Resolve package from backend joined relation or fallback to package query map
    const pkg = booking.package || packagesMap[booking.packageId];

    return {
      sl: (currentPage - 1) * pageSize + i + 1,
      id: booking.id,
      client_info: (
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              booking.name || "Client"
            )}&background=3b82f6&color=fff&size=128`}
            alt={booking.name}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
          />
          <div className="text-left leading-tight">
            <div className="font-semibold text-gray-900 dark:text-white">
              {booking.name || "N/A"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {booking.userEmail || "—"}
            </div>
          </div>
        </div>
      ),
      company: (
        <div className="text-left leading-tight">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {booking.companyName || "N/A"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {booking.companyEmail || "—"}
          </div>
        </div>
      ),
      package_info: (
        <div className="text-left leading-tight">
          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span>{pkg?.name || "Package ID: " + booking.packageId?.slice(0, 8)}</span>
          </div>
          {pkg?.price !== undefined && (
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary dark:bg-primary/20">
              ${pkg.price}
            </span>
          )}
        </div>
      ),
      billing_cycle: (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
          {booking.billingCycle || "Monthly"}
        </span>
      ),
      status: (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
            booking.status
          )}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {booking.status || "PENDING"}
        </span>
      ),
      created_at: booking.createdAt
        ? moment(booking.createdAt).format("MMM DD, YYYY")
        : "N/A",
      actions: (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            icon={Eye}
            onClick={() => handleView(booking)}
            className="text-blue-600 hover:text-blue-700"
            title="View Booking Details"
          />
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(booking)}
            className="text-emerald-600 hover:text-emerald-700"
            title="Edit Booking"
          />
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([booking.id])}
            className="text-rose-600 hover:text-rose-700"
            title="Delete Booking"
          />
        </div>
      ),
    };
  });

  // Action handlers
  const handleView = (booking) => {
    // Merge resolved package if missing
    const resolvedBooking = {
      ...booking,
      package: booking.package || packagesMap[booking.packageId],
    };
    setDetailsModalState({ isOpen: true, data: resolvedBooking });
  };

  const handleEdit = (booking) => {
    setModalState({ isOpen: true, type: "edit", data: booking });
  };

  const handleAddNew = () => {
    setModalState({ isOpen: true, type: "add", data: null });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, type: null, data: null });
  };

  const handleFormSuccess = () => {
    handleModalClose();
    refetch();
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
        await deleteBooking(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} booking(s) deleted successfully`
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id))
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete booking(s)");
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Package Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Manage customer package bookings, subscription plans, and status reviews
          </p>
        </div>
        <PrimaryButton onClick={handleAddNew} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Booking
        </PrimaryButton>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-primary shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Bookings
            </span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {stats.totalCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="w-6 h-6" />
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
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        {/* Confirmed */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Confirmed
            </span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {stats.confirmedCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Completed
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.completedCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
            <Layers className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 restro_scrollbar">
        {STATUS_FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? "bg-primary text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="p-6">
        <ReusableTable
          data={transformedData}
          headers={headers}
          isLoading={isLoading}
          total={total}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          enableSearch={true}
          enableSorting={true}
          enableSelection={true}
          enableBulkActions={true}
          searchPlaceholder="Search by client name, email, company, or package..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add / Edit Package Booking Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add"
            ? "Add New Package Booking"
            : "Edit Package Booking"
        }
        size="lg"
      >
        <PackageBookingForm
          bookingData={modalState.data}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Package Booking Details Modal */}
      <PackageBookingDetailsModal
        isOpen={detailsModalState.isOpen}
        onClose={() => setDetailsModalState({ isOpen: false, data: null })}
        booking={detailsModalState.data}
        onEdit={(booking) => {
          setDetailsModalState({ isOpen: false, data: null });
          setModalState({ isOpen: true, type: "edit", data: booking });
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        count={deleteConfirmState.idsToDelete.length}
        itemName="package booking"
        loading={deleteLoading}
      />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import PackageForm from "@/components/package/PackageForm";
import PackageDetailsModal from "@/components/package/PackageDetailsModal";

import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchPackagesQuery,
  useDeletePackageMutation,
} from "@/services/package/packageApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card, CardContent } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";
import { Permissions } from "@/constants/permissions.js";

export default function PackageManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // Details modal state
  const [detailsModalState, setDetailsModalState] = useState({
    isOpen: false,
    data: null,
  });

  // Delete modal state & loading
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  const { user, permissions } = useAuth();

  const hasPermission = (perm) => {
    if (
      !perm ||
      user?.type === "Super-Admin" ||
      user?.type === "coo" ||
      user?.role === "admin" ||
      user?.role === "ceo" ||
      user?.role === "cto" ||
      user?.role === "founder" ||
      !permissions ||
      permissions?.length === 0
    ) {
      return true;
    }
    return permissions?.includes?.(perm) ?? true;
  };

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useSearchPackagesQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
  });

  const [deletePackage, { isLoading: deleteLoading }] =
    useDeletePackageMutation();

  useEffect(() => {
    if (
      searchResult?.meta?.currentPage &&
      searchResult.meta.currentPage !== currentPage
    ) {
      setCurrentPage(searchResult.meta.currentPage);
    }
  }, [searchResult.meta.currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (searchResult?.meta?.itemsPerPage) {
      setPageSize(searchResult.meta.itemsPerPage);
    }
  }, [searchResult]);

  const packages = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Package Name", field: "name" },
    { header: "Title / Unit", field: "title" },
    { header: "Category", field: "category" },
    { header: "Price", field: "price" },
    { header: "Duration", field: "duration" },
    { header: "Status", field: "status" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data
  const transformedData = packages?.map((packageData, i) => {
    return {
      sl: (currentPage - 1) * pageSize + i + 1,
      id: packageData.id,
      name: (
        <span className="font-medium text-gray-900 dark:text-white">
          {packageData.name || "N/A"}
        </span>
      ),
      title: packageData.title || "—",
      category: packageData.category?.name || "—",
      price: `$${packageData.price ?? 0}`,
      duration: packageData.duration || "N/A",
      created_at: packageData.createdAt
        ? moment(packageData.createdAt).format("MMM DD, YYYY")
        : "N/A",
      status: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            packageData?.isActive !== false
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {packageData?.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
      actions: (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            icon={Eye}
            onClick={() => handleView(packageData.id)}
            className="text-blue-600 hover:text-blue-700"
            title="View Package Details"
          />

          {hasPermission(Permissions.PACKAGE_UPDATE) && (
            <IconButton
              icon={Edit}
              onClick={() => handleEdit(packageData.id)}
              className="text-green-600 hover:text-green-700"
              title="Edit Package"
            />
          )}

          {hasPermission(Permissions.PACKAGE_DELETE) && (
            <IconButton
              icon={Trash2}
              onClick={() => openDeleteModal([packageData.id])}
              className="text-red-600 hover:text-red-700"
              title="Delete Package"
            />
          )}
        </div>
      ),
    };
  });

  // View handler
  const handleView = (id) => {
    const packageData = packages.find((p) => p.id === id);
    setDetailsModalState({ isOpen: true, data: packageData });
  };

  // Edit handlers
  const handleEdit = (id) => {
    const packageData = packages.find((p) => p.id === id);
    setModalState({ isOpen: true, type: "edit", data: packageData });
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

  // Delete modal open / close
  const openDeleteModal = (ids) => {
    setDeleteConfirmState({ isOpen: true, idsToDelete: ids });
  };

  const cancelDelete = () => {
    setDeleteConfirmState({ isOpen: false, idsToDelete: [] });
  };

  // Confirm delete (single or bulk)
  const confirmDelete = async () => {
    try {
      for (const id of deleteConfirmState.idsToDelete) {
        await deletePackage(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} package(s) deleted successfully`,
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id)),
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete package(s)");
    } finally {
      cancelDelete();
    }
  };

  // Bulk delete handler to open modal
  const handleBulkDelete = (action, selectedIds) => {
    if (action === "delete" && selectedIds.length > 0) {
      openDeleteModal(selectedIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Package Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your packages and pricing
          </p>
        </div>
        {hasPermission(Permissions.PACKAGE_CREATE) && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Package
          </PrimaryButton>
        )}
      </div>

      {/* Table */}
      <Card className="p-8">
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
          searchPlaceholder="Search packages by name..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add/Edit Package Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add"
            ? "Add New Package"
            : "Edit Package"
        }
        size="lg"
      >
        <PackageForm
          packageData={modalState.data}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        count={deleteConfirmState.idsToDelete.length}
        itemName="package"
        loading={deleteLoading}
      />

      {/* Package Details Modal */}
      <PackageDetailsModal
        isOpen={detailsModalState.isOpen}
        onClose={() => setDetailsModalState({ isOpen: false, data: null })}
        packageData={detailsModalState.data}
        onEdit={(pkg) => {
          setDetailsModalState({ isOpen: false, data: null });
          setModalState({ isOpen: true, type: "edit", data: pkg });
        }}
      />
    </div>
  );
}

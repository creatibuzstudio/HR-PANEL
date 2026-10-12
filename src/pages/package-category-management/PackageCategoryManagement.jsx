import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import PackageCategoryForm from "@/components/package-category/PackageCategoryForm";

import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchPackageCategoriesQuery,
  useDeletePackageCategoryMutation,
} from "@/services/package/packageApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";

export default function PackageCategoryManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // Delete modal state
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  const { user, permissions } = useAuth();

  const hasPermission = () => {
    if (
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
    return true;
  };

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useSearchPackageCategoriesQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
  });

  const [deletePackageCategory, { isLoading: deleteLoading }] =
    useDeletePackageCategoryMutation();

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

  const categories = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Category Name", field: "name" },
    { header: "Description", field: "description" },
    { header: "Total Packages", field: "totalPackages" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data
  const transformedData = categories?.map((cat, i) => ({
    sl: (currentPage - 1) * pageSize + i + 1,
    id: cat.id,
    name: <span className="font-medium text-gray-900 dark:text-white">{cat.name || "N/A"}</span>,
    description: (
      <span className="text-sm text-gray-600 dark:text-gray-300 max-w-sm block truncate" title={cat.description}>
        {cat.description || "—"}
      </span>
    ),
    totalPackages: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        {cat.packages?.length || 0} packages
      </span>
    ),
    created_at: cat.createdAt
      ? moment(cat.createdAt).format("MMM DD, YYYY")
      : "N/A",
    actions: (
      <div className="flex items-center justify-center gap-2">
        {hasPermission() && (
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(cat.id)}
            className="text-green-600 hover:text-green-700"
            title="Edit Category"
          />
        )}

        {hasPermission() && (
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([cat.id])}
            className="text-red-600 hover:text-red-700"
            title="Delete Category"
          />
        )}
      </div>
    ),
  }));

  // Edit handlers
  const handleEdit = (id) => {
    const categoryData = categories.find((c) => c.id === id);
    setModalState({ isOpen: true, type: "edit", data: categoryData });
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
        await deletePackageCategory(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} category(s) deleted successfully`
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id))
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete category(s)");
    } finally {
      cancelDelete();
    }
  };

  // Bulk delete handler
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
            Package Category Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your package categories
          </p>
        </div>
        {hasPermission() && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Category
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
          searchPlaceholder="Search categories by name or description..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add"
            ? "Add New Package Category"
            : "Edit Package Category"
        }
        size="md"
      >
        <PackageCategoryForm
          categoryData={modalState.data}
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
        itemName="package category"
        loading={deleteLoading}
      />
    </div>
  );
}

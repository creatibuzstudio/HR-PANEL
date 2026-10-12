import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";

import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import {
  useDeleteDesignationMutation,
  useGetDesignationsWithSearchQuery,
} from "@/services/designation/designationApiSlice.js";
import DesignationForm from "@/components/designation/DesignationForm.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";
import { Permissions } from "@/constants/permissions.js";

export default function RolePermissionManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const { user, permissions } = useAuth();

  const hasPermission = (perm) => {
    if (
      user?.type === "Super-Admin" ||
      user?.role === "admin" ||
      user?.role === "ceo" ||
      !permissions ||
      permissions.length === 0
    ) {
      return true;
    }
    return permissions.includes(perm);
  };

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // Delete modal state & loading
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useGetDesignationsWithSearchQuery({
    query: searchTerm,
    limit: pageSize,
    page: currentPage,
  });

  useEffect(() => {
    if (
      searchResult?.meta?.currentPage &&
      searchResult.meta.currentPage !== currentPage
    ) {
      setCurrentPage(searchResult.meta.currentPage);
    }
  }, [searchResult.meta?.currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (searchResult?.meta?.itemsPerPage) {
      setPageSize(searchResult.meta.itemsPerPage);
    }
  }, [searchResult]);

  const designations = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  const [deleteDesignation, { isLoading: deleteDesignationLoading }] =
    useDeleteDesignationMutation();

  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Designation Title", field: "title" },
    { header: "Level", field: "level" },
    { header: "Description", field: "description" },
    { header: "Status", field: "status" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data
  const transformedData = designations?.map((item, i) => ({
    sl: (currentPage - 1) * pageSize + i + 1,
    id: item.id,
    title: item.title || "N/A",
    level: (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
        {item.level || "Mid"}
      </span>
    ),
    description: item.description || "—",
    status: (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item?.isActive !== false
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        {item?.isActive !== false ? "Active" : "Inactive"}
      </span>
    ),
    created_at: item.createdAt
      ? moment(item.createdAt).format("MMM DD, YYYY")
      : "N/A",
    actions: (
      <div className="flex items-center justify-center gap-2">
        {hasPermission(Permissions.ROLE_UPDATE) && (
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(item.id)}
            className="text-green-600 hover:text-green-700"
            title="Edit Designation"
          />
        )}

        {hasPermission(Permissions.ROLE_DELETE) && (
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([item.id])}
            className="text-red-600 hover:text-red-700"
            title="Delete Designation"
          />
        )}
      </div>
    ),
  }));

  // Edit handlers
  const handleEdit = (id) => {
    const item = designations.find((d) => d.id === id);
    setModalState({ isOpen: true, type: "edit", data: item });
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
        await deleteDesignation(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} designation(s) deleted successfully`,
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id)),
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete designation(s)");
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
            Designation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage company designations and hierarchy levels
          </p>
        </div>
        {hasPermission(Permissions.ROLE_CREATE) && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Designation
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
          searchPlaceholder="Search designations by title or level..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add/Edit Designation Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add"
            ? "Add New Designation"
            : "Edit Designation"
        }
        size="lg"
      >
        <DesignationForm
          designation={modalState.data}
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
        itemName="designation"
        loading={deleteDesignationLoading}
      />
    </div>
  );
}

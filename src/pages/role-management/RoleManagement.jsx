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
  useDeleteDepartmentMutation,
  useGetDepartmentsWithSearchQuery,
} from "@/services/department/departmentApiSlice.js";
import RoleForm from "@/components/role/RoleForm.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";
import { Permissions } from "@/constants/permissions.js";

export default function RoleManagement() {
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
  } = useGetDepartmentsWithSearchQuery({
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

  const departments = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  const [deleteDepartment, { isLoading: deleteDepartmentLoading }] =
    useDeleteDepartmentMutation();

  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Department Name", field: "name" },
    { header: "Description", field: "description" },
    { header: "Status", field: "status" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data
  const transformedData = departments?.map((dept, i) => ({
    sl: (currentPage - 1) * pageSize + i + 1,
    id: dept.id,
    name: dept.name || "N/A",
    description: dept.description || "—",
    status: (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          dept?.isActive !== false
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        {dept?.isActive !== false ? "Active" : "Inactive"}
      </span>
    ),
    created_at: dept.createdAt
      ? moment(dept.createdAt).format("MMM DD, YYYY")
      : "N/A",
    actions: (
      <div className="flex items-center justify-center gap-2">
        {hasPermission(Permissions.ROLE_UPDATE) && (
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(dept.id)}
            className="text-green-600 hover:text-green-700"
            title="Edit Department"
          />
        )}

        {hasPermission(Permissions.ROLE_DELETE) && (
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([dept.id])}
            className="text-red-600 hover:text-red-700"
            title="Delete Department"
          />
        )}
      </div>
    ),
  }));

  // Edit handlers
  const handleEdit = (id) => {
    const dept = departments.find((d) => d.id === id);
    setModalState({ isOpen: true, type: "edit", data: dept });
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
        await deleteDepartment(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} department(s) deleted successfully`,
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id)),
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete department(s)");
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
            Department Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your organization departments
          </p>
        </div>
        {hasPermission(Permissions.ROLE_CREATE) && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Department
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
          searchPlaceholder="Search departments by name..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add/Edit Department Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add"
            ? "Add New Department"
            : "Edit Department"
        }
        size="lg"
      >
        <RoleForm
          role={modalState.data}
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
        itemName="department"
        loading={deleteDepartmentLoading}
      />
    </div>
  );
}

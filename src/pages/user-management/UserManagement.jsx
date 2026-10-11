import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import UserForm from "@/components/user/UserForm"; // adjust path

import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useGetUserWithSearchQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/services/user/userApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CardHeader from "@/components/ui/headers/card-header";
import useAuth from "@/hooks/useAuth.js";
import { Permissions } from "@/constants/permissions.js";

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
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

  const { user, permissions } = useAuth();

  const hasPermission = (perm) => {
    if (user?.type === "Super-Admin") return true;
    return permissions.includes(perm);
  };

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useGetUserWithSearchQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
    types: "Admin",
  });

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

  const users = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;
  // const pageSize = Number(searchResult.meta?.itemsPerPage) || 10;

  const [deleteUser, { isLoading: deleteUserLoading }] =
    useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();



  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "Name", field: "name" },
    { header: "Email", field: "email" },
    { header: "Phone", field: "phone" },
    { header: "Type", field: "type" },
    { header: "Roles", field: "roles" },

    { header: "Created At", field: "created_at" },
    { header: "Status", field: "status" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data
  const transformedData = users?.map((user, i) => ({
    sl: i + 1,
    id: user.id,
    name: user.nameEn || user.nameBn || user.name || "N/A",
    email: user.email || "N/A",
    phone: user.phone || "N/A",
    type: user.type || "N/A",
    status: (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user?.status === 1
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        {user?.status === 1 ? "Active" : "Inactive"}
      </span>
    ),
    roles: user.roles?.map((role) => role.name).join(", ") || "N/A",
    created_at: user.createdAt
      ? moment(user.createdAt).format("MMM DD, YYYY")
      : "N/A",
    actions: (
      <div className="flex items-center justify-center gap-2">
        {hasPermission(Permissions.USER_UPDATE) && (
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(user.id)}
            className="text-green-600 hover:text-green-700"
            title="Edit User"
          />
        )}
        


        {hasPermission(Permissions.USER_DELETE) && (
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([user.id])}
            className="text-red-600 hover:text-red-700"
            title="Delete User"
          />
        )}
      </div>
    ),
  }));

  // Edit handlers
  const handleEdit = (id) => {
    const user = users.find((u) => u.id === id);
    setModalState({ isOpen: true, type: "edit", data: user });
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
        await deleteUser(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} user(s) deleted successfully`,
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id)),
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete user(s)");
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
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your users
          </p>
        </div>
        {hasPermission(Permissions.USER_CREATE) && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New User
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
          searchPlaceholder="Search users by name, email, or phone..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={modalState.type === "add" ? "Add New User" : "Edit User"}
        size="lg"
      >
        <UserForm
          user={modalState.data}
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
        itemName="user"
        loading={deleteUserLoading}
      />
    </div>
  );
}

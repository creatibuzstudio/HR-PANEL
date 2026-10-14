import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import UserForm from "@/components/user/UserForm"; // adjust path

import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Share2, Download } from "lucide-react";
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
    if (
      user?.type === "coo" ||
      user?.role === "cto" ||
      user?.role === "ceo" ||
      !permissions ||
      permissions.length === 0
    ) {
      return true;
    }
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

  const users = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  const [deleteUser, { isLoading: deleteUserLoading }] =
    useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Table headers
  const headers = [
    { header: "SL", field: "sl" },
    { header: "User", field: "user_info" },
    { header: "Order", field: "order" },
    { header: "Phone", field: "phone" },
    { header: "Role", field: "role" },
    { header: "Department", field: "department" },
    { header: "Designation", field: "designation" },
    { header: "Birthday", field: "dateOfBirth" },
    { header: "Joined Date", field: "joiningDate" },
    { header: "Website Preview", field: "isPreview" },
    { header: "Actions", field: "actions" },
  ];

  // Transform data
  const transformedData = users?.map((user, i) => ({
    sl: (currentPage - 1) * pageSize + i + 1,
    id: user.id,
    user_info: (
      <div className="flex items-center gap-3">
        <div className="relative group/avatar flex-shrink-0">
          <img
            src={
              user.picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}&background=0D8ABC&color=fff&size=256`
            }
            alt={user.name || "User"}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}&background=0D8ABC&color=fff&size=256`;
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadPhoto(user);
            }}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer shadow-sm"
            title="Download User Photo"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-left leading-tight">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {user.name || user.nameEn || user.nameBn || "N/A"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {user.email || "—"}
          </div>
        </div>
      </div>
    ),
    order: (
      <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
        #{user.order || 0}
      </span>
    ),
    email: user.email || "N/A",
    phone: user.phone || "—",
    role: (
      <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
        {user.role || "N/A"}
      </span>
    ),
    department: user.department?.name || "N/A",
    designation: user.designation?.title || "N/A",
    dateOfBirth: user.dateOfBirth ? (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-md border border-pink-200 dark:border-pink-800/50">
        🎂 {moment(user.dateOfBirth).format("MMM DD")}
      </span>
    ) : (
      <span className="text-xs text-gray-400 italic">Not set</span>
    ),
    joiningDate: user.joiningDate ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
        🚀 {moment(user.joiningDate).format("MMM DD, YYYY")}
      </span>
    ) : user.createdAt ? (
      <span className="text-xs text-gray-500 font-mono">
        {moment(user.createdAt).format("MMM DD, YYYY")}
      </span>
    ) : (
      <span className="text-xs text-gray-400">—</span>
    ),
    isPreview: (
      <button
        type="button"
        onClick={async () => {
          try {
            await updateUser({ id: user.id, isPreview: !user.isPreview }).unwrap();
            toast.success(
              !user.isPreview
                ? "User enabled for website preview"
                : "User hidden from website preview"
            );
            refetch();
          } catch {
            toast.error("Failed to update preview status");
          }
        }}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
          user.isPreview
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400"
        }`}
        title="Toggle preview on website"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            user.isPreview ? "bg-emerald-500" : "bg-gray-400"
          }`}
        />
        <span>{user.isPreview ? "Previewing" : "Hidden"}</span>
      </button>
    ),
    actions: (
      <div className="flex items-center justify-center gap-2">
        <IconButton
          icon={Download}
          onClick={() => handleDownloadPhoto(user)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          title="Download User Photo"
        />

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

  // Download Photo handler
  const handleDownloadPhoto = async (targetUser) => {
    const photoUrl =
      targetUser.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        targetUser.name || "User"
      )}&background=0D8ABC&color=fff&size=512`;

    const sanitizedName = (targetUser.name || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const filename = `${sanitizedName}_photo.jpg`;

    toast.loading("Downloading photo...", { id: "photo-download" });

    try {
      const response = await fetch(photoUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Photo downloaded successfully!", { id: "photo-download" });
    } catch (error) {
      try {
        const link = document.createElement("a");
        link.href = photoUrl;
        link.target = "_blank";
        link.download = filename;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Opened photo for download!", { id: "photo-download" });
      } catch (err) {
        toast.error("Failed to download photo.", { id: "photo-download" });
      }
    }
  };

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
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/register`;
              navigator.clipboard.writeText(url);
              toast.success("Employee Registration link copied! Share it with new joiners.");
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy shareable link for employee self-registration"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Registration Link
          </button>

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

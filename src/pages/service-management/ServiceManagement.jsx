import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import ServiceForm from "@/components/service/ServiceForm";

import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchServicesQuery,
  useDeleteServiceMutation,
} from "@/services/service/serviceApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";
import { Permissions } from "@/constants/permissions.js";

export default function ServiceManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

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
  } = useSearchServicesQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
  });

  const [deleteService, { isLoading: deleteLoading }] =
    useDeleteServiceMutation();

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

  const services = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  const headers = [
    { header: "SL", field: "sl" },
    { header: "Name", field: "name" },
    { header: "Slug", field: "slug" },
    { header: "Credit Cost", field: "creditCost" },
    { header: "Check Type", field: "checkType" },
    { header: "Created At", field: "created_at" },
    { header: "Status", field: "status" },
    { header: "Actions", field: "actions" },
  ];

  const transformedData = services?.map((serviceData, i) => ({
    sl: i + 1,
    id: serviceData.id,
    name: serviceData.name || "N/A",
    slug: serviceData.slug || "N/A",
    creditCost: serviceData.creditCost ?? "N/A",
    checkType: serviceData.checkType ? (
      <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-xs font-semibold uppercase whitespace-nowrap">
        {serviceData.checkType.replace(/_/g, " ")}
      </span>
    ) : (
      "N/A"
    ),
    created_at: serviceData.createdAt
      ? moment(serviceData.createdAt).format("MMM DD, YYYY")
      : "N/A",
    status: (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          serviceData?.status === 1
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}
      >
        {serviceData?.status === 1 ? "Active" : "Inactive"}
      </span>
    ),
    actions: (
      <div className="flex items-center justify-center gap-2">
        {hasPermission(Permissions.SERVICE_UPDATE) && (
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(serviceData.id)}
            className="text-green-600 hover:text-green-700"
            title="Edit Service"
          />
        )}

        {hasPermission(Permissions.SERVICE_DELETE) && (
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([serviceData.id])}
            className="text-red-600 hover:text-red-700"
            title="Delete Service"
          />
        )}
      </div>
    ),
  }));

  const handleEdit = (id) => {
    const serviceData = services.find((p) => p.id === id);
    setModalState({ isOpen: true, type: "edit", data: serviceData });
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
        await deleteService(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} service(s) deleted successfully`,
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id)),
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete service(s)");
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your API services
          </p>
        </div>
        {hasPermission(Permissions.SERVICE_CREATE) && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </PrimaryButton>
        )}
      </div>

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
          searchPlaceholder="Search services by name or slug..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      <Modal
        isOpen={
          modalState.isOpen &&
          (modalState.type === "add" || modalState.type === "edit")
        }
        onClose={handleModalClose}
        title={
          modalState.type === "add"
            ? "Add New Service"
            : "Edit Service"
        }
        size="lg"
      >
        <ServiceForm
          serviceData={modalState.data}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        count={deleteConfirmState.idsToDelete.length}
        itemName="service"
        loading={deleteLoading}
      />
    </div>
  );
}

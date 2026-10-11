import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import CustomerForm from "@/components/customer/CustomerForm";

import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useSearchCustomersQuery,
  useDeleteCustomerMutation,
} from "@/services/customer/customerApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";

// You can create a permission for this later if needed, we'll use a dummy placeholder for now
const Permissions = {
  CUSTOMER_CREATE: "customer.create",
  CUSTOMER_UPDATE: "customer.update",
  CUSTOMER_DELETE: "customer.destroy"
};

export default function CustomerManagement() {
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

  const { user } = useAuth();
  
  // For now let's allow access, you can tie this into your permission system later
  const hasPermission = () => true;

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useSearchCustomersQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
  });

  const [deleteCustomer, { isLoading: deleteLoading }] = useDeleteCustomerMutation();

  useEffect(() => {
    if (
      searchResult?.meta?.currentPage &&
      searchResult.meta.currentPage !== currentPage
    ) {
      setCurrentPage(searchResult.meta.currentPage);
    }
  }, [searchResult.meta.currentPage, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (searchResult?.meta?.itemsPerPage) {
      setPageSize(searchResult.meta.itemsPerPage);
    }
  }, [searchResult]);

  const customers = searchResult.items || [];
  const total = searchResult.meta?.totalItems || 0;

  const headers = [
    { header: "SL", field: "sl" },
    { header: "Name", field: "name" },
    { header: "Email", field: "email" },
    { header: "Phone", field: "phone" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  const transformedData = customers?.map((customer, i) => ({
    sl: i + 1,
    id: customer.id,
    name: customer.name || "N/A",
    email: customer.email || "N/A",
    phone: customer.phone || "N/A",
    created_at: customer.created_at
      ? moment(customer.created_at).format("MMM DD, YYYY")
      : "N/A",
    actions: (
      <div className="flex items-center justify-center gap-2">
        {hasPermission(Permissions.CUSTOMER_UPDATE) && (
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(customer.id)}
            className="text-green-600 hover:text-green-700"
            title="Edit Customer"
          />
        )}

        {hasPermission(Permissions.CUSTOMER_DELETE) && (
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([customer.id])}
            className="text-red-600 hover:text-red-700"
            title="Delete Customer"
          />
        )}
      </div>
    ),
  }));

  const handleEdit = (id) => {
    const customer = customers.find((c) => c.id === id);
    setModalState({ isOpen: true, type: "edit", data: customer });
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
        await deleteCustomer(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} customer(s) deleted successfully`,
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id)),
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete customer(s)");
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
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your customers
          </p>
        </div>
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
          searchPlaceholder="Search customers by name or email..."
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
            ? "Add New Customer"
            : "Edit Customer"
        }
        size="lg"
      >
        <CustomerForm
          customer={modalState.data}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        count={deleteConfirmState.idsToDelete.length}
        itemName="customer"
        loading={deleteLoading}
      />
    </div>
  );
}

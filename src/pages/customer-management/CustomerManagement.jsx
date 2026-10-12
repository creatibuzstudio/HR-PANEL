import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import CustomerForm from "@/components/customer/CustomerForm";
import CustomerDetailsModal from "@/components/customer/CustomerDetailsModal";

import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useGetClientsQuery,
  useDeleteUserMutation,
} from "@/services/user/userApiSlice.js";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";

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

  const [detailsState, setDetailsState] = useState({
    isOpen: false,
    data: null,
  });

  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  const { user } = useAuth();
  const hasPermission = () => true;

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useGetClientsQuery({
    page: currentPage,
    limit: pageSize,
    query: searchTerm,
  });

  const [deleteCustomer, { isLoading: deleteLoading }] = useDeleteUserMutation();

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
    { header: "Customer", field: "customer_info" },
    { header: "Email", field: "email" },
    { header: "Phone", field: "phone" },
    { header: "Location", field: "location" },
    { header: "Joined", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  const transformedData = customers?.map((customer, i) => ({
    sl: (currentPage - 1) * pageSize + i + 1,
    id: customer.id,
    customer_info: (
      <div className="flex items-center gap-3">
        <img
          src={
            customer.picture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              customer.name || "Customer"
            )}&background=0D8ABC&color=fff&size=128`
          }
          alt={customer.name || "Customer"}
          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              customer.name || "Customer"
            )}&background=0D8ABC&color=fff&size=128`;
          }}
        />
        <div className="text-left leading-tight">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {customer.name || "N/A"}
          </div>
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Client
          </span>
        </div>
      </div>
    ),
    email: customer.email || "—",
    phone: customer.phone || "—",
    location: customer.location || customer.address || "—",
    created_at: customer.createdAt
      ? moment(customer.createdAt).format("MMM DD, YYYY")
      : "N/A",
    actions: (
      <div className="flex items-center justify-center gap-2">
        <IconButton
          icon={Eye}
          onClick={() => handleViewDetails(customer)}
          className="text-blue-600 hover:text-blue-700"
          title="View Details"
        />

        <IconButton
          icon={Edit}
          onClick={() => handleEdit(customer.id)}
          className="text-green-600 hover:text-green-700"
          title="Edit Customer"
        />

        <IconButton
          icon={Trash2}
          onClick={() => openDeleteModal([customer.id])}
          className="text-red-600 hover:text-red-700"
          title="Delete Customer"
        />
      </div>
    ),
  }));

  const handleViewDetails = (customer) => {
    setDetailsState({ isOpen: true, data: customer });
  };

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
            Manage your registered clients and customer accounts
          </p>
        </div>
        <PrimaryButton
          onClick={handleAddNew}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Customer
        </PrimaryButton>
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
          searchPlaceholder="Search customers by name, email, or phone..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
          setPageSize={setPageSize}
        />
      </Card>

      {/* Add / Edit Customer Modal */}
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

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={detailsState.isOpen}
        onClose={() => setDetailsState({ isOpen: false, data: null })}
        customer={detailsState.data}
        onEdit={(cust) => handleEdit(cust.id)}
      />

      {/* Delete Confirmation Modal */}
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

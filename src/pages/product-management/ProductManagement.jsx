import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import ProductForm from "@/components/product/ProductForm";
import Modal from "@/components/ui/modal.jsx";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal.jsx";
import { Card } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth.js";
import { Permissions } from "@/constants/permissions.js";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import {
  useGetProductsWithSearchQuery,
  useDeleteProductMutation,
} from "@/services/product/productApiSlice.js";

export default function ProductManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'add' or 'edit'
    data: null,
  });

  // Delete modal state & loading
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    idsToDelete: [],
  });

  const [pageSize, setPageSize] = useState(10);
  const { user, permissions } = useAuth();

  const hasPermission = (perm) => {
    if (user?.type === "Super-Admin") return true;
    return permissions.includes(perm);
  };

  const {
    data: searchResult = { items: [], meta: {} },
    isLoading,
    refetch,
  } = useGetProductsWithSearchQuery({
    query: searchTerm,
    limit: pageSize,
    page: currentPage,
  });

  const products = searchResult.items || [];

  const total = searchResult.meta?.totalItems || 0;

  useEffect(() => {
    if (searchResult?.meta?.itemsPerPage) {
      setPageSize(searchResult.meta.itemsPerPage);
    }
  }, [searchResult]);

  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const [deleteProduct, { isLoading: deleteProductLoading }] =
    useDeleteProductMutation();

  const headers = [
    { header: "SL", field: "sl" },
    { header: "Name", field: "name" },
    // { header: "Slug", field: "slug" },
    { header: "Type", field: "product_type" },
    { header: "Price Unit", field: "price_unit" },
    { header: "Price", field: "price" },
    { header: "Purchase Type", field: "purchase_type" },
    { header: "Delivery Method", field: "delivery_method" },
    { header: "Sort Order", field: "sort_order" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  const transformedData = products.map((product, i) => ({
    sl: (currentPage - 1) * pageSize + i + 1,
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: `${product.price} ${product.currency}`,
    price_unit: (
      <span className="capitalize whitespace-nowrap px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-yellow-800 text-xs ">
        {product.price_unit === "per_unit"
          ? "Per Unit"
          : product?.price_unit === "per_month"
            ? "Per Month"
            : "Per Year"}
      </span>
    ),

    product_type: (
      <span className="capitalize whitespace-nowrap px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs ">
        {product.product_type?.replace(/_/g, " ")}
      </span>
    ),
    purchase_type: (
      <span className="capitalize whitespace-nowrap px-2 py-1 rounded bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 text-xs font-medium">
        {product.purchase_type?.replace(/_/g, " ")}
      </span>
    ),
    delivery_method: product.delivery_method ? (
      <span className="capitalize whitespace-nowrap px-2 py-1 rounded bg-green-50 text-green-700 text-xs">
        {product.delivery_method?.replace(/_/g, " ")}
      </span>
    ) : (
      "-"
    ),
    sort_order: product.sort_order,
    created_at: product.created_at
      ? moment(product.created_at).format("MMM DD, YYYY")
      : "N/A",
    actions: (
      <div className="flex items-center justify-center gap-2">
        {hasPermission(Permissions.PRODUCT_UPDATE) && (
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(product.id)}
            className="text-green-600 hover:text-green-700"
            title="Edit Product"
          />
        )}
        {hasPermission(Permissions.PRODUCT_DELETE) && (
          <IconButton
            icon={Trash2}
            onClick={() => openDeleteModal([product.id])}
            className="text-red-600 hover:text-red-700"
            title="Delete Product"
          />
        )}
      </div>
    ),
  }));

  const handleEdit = (id) => {
    const product = products.find((p) => p.id === id);
    setModalState({ isOpen: true, type: "edit", data: product });
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
        await deleteProduct(id).unwrap();
      }
      toast.success(
        `${deleteConfirmState.idsToDelete.length} product(s) deleted successfully`,
      );
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteConfirmState.idsToDelete.includes(id)),
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete product(s)");
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
            Product Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your products and their details
          </p>
        </div>
        {hasPermission(Permissions.PRODUCT_CREATE) && (
          <PrimaryButton
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Product
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
          setPageSize={setPageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          enableSearch={true}
          enableSorting={true}
          enableSelection={true}
          enableBulkActions={true}
          searchPlaceholder="Search products..."
          externalSearchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectionChange={setSelectedItems}
          onBulkAction={handleBulkDelete}
          externalTotal={total}
          externalTotalPages={searchResult.meta?.totalPages}
        />
      </Card>

      <Modal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        title={modalState.type === "add" ? "Add New Product" : "Edit Product"}
        size="xl"
        className="max-h-[90vh] overflow-y-auto"
      >
        <ProductForm
          product={modalState.data}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        count={deleteConfirmState.idsToDelete.length}
        itemName="product"
        loading={deleteProductLoading}
      />
    </div>
  );
}

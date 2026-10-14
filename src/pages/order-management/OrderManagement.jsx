import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import ReusableTable from "@/components/ui/table/reusable-table";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import Modal from "@/components/ui/modal";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal";
import OrderForm from "@/components/order/OrderForm";
import OrderInvoiceModal from "@/components/order/OrderInvoiceModal";
import RecordPaymentModal from "@/components/order/RecordPaymentModal";
import {
  useGetOrdersQuery,
  useDeleteOrderMutation,
} from "@/services/order/orderApiSlice";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Receipt,
  UserCheck,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STATUS_TABS = [
  { label: "All Orders", value: "ALL" },
  { label: "Onboard", value: "onboard" },
  { label: "Ongoing", value: "ongoing" },
  { label: "QA Test", value: "qa test" },
  { label: "Delivery", value: "delivery" },
  { label: "Delivered", value: "delivered" },
];

const PAYMENT_STATUS_TABS = [
  { label: "All Payments", value: "ALL" },
  { label: "Paid", value: "paid" },
  { label: "Partial", value: "partial" },
  { label: "Unpaid", value: "unpaid" },
];

export default function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedItems, setSelectedItems] = useState([]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // "add" | "edit"
    data: null,
  });

  const [invoiceModalState, setInvoiceModalState] = useState({
    isOpen: false,
    order: null,
  });

  const [paymentModalState, setPaymentModalState] = useState({
    isOpen: false,
    order: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    ids: [],
  });

  const { data: orders = [], isLoading, refetch } = useGetOrdersQuery({
    query: searchQuery,
    status: statusFilter,
    paymentStatus: paymentFilter,
  });

  const [deleteOrder] = useDeleteOrderMutation();

  // Financial statistics
  const stats = useMemo(() => {
    let totalBudget = 0;
    let totalAdvance = 0;

    orders.forEach((o) => {
      const disc = Number(o.discount || 0);
      const tx = Number(o.tax || 0);
      const sub =
        o.subtotal !== undefined && o.subtotal !== null
          ? Number(o.subtotal)
          : Math.max(0, Number(o.budget || 0) + disc - tx);
      const tot =
        o.budget !== undefined && o.budget !== null
          ? Number(o.budget)
          : Math.max(0, sub - disc + tx);

      const pStatus = String(o.paymentStatus || "").toLowerCase();
      const pmtSum = Array.isArray(o.payments)
        ? o.payments.reduce((s, p) => s + Number(p.amount || 0), 0)
        : 0;
      const orderPaid =
        pStatus === "paid"
          ? Math.max(tot, Number(o.advance || 0), pmtSum)
          : Math.max(Number(o.advance || 0), pmtSum);

      totalBudget += tot;
      totalAdvance += orderPaid;
    });

    const totalDue = Math.max(0, totalBudget - totalAdvance);

    return {
      totalOrders: orders.length,
      totalBudget,
      totalAdvance,
      totalDue,
    };
  }, [orders]);

  const handleAddNew = () => {
    setModalState({ isOpen: true, type: "add", data: null });
  };

  const handleEdit = (order) => {
    setModalState({ isOpen: true, type: "edit", data: order });
  };

  const handleViewInvoice = (order) => {
    setInvoiceModalState({ isOpen: true, order });
  };

  const handleRecordPayment = (order) => {
    setPaymentModalState({ isOpen: true, order });
  };

  const handleDelete = (id) => {
    setDeleteModalState({ isOpen: true, ids: [id] });
  };

  const confirmDelete = async () => {
    try {
      for (const id of deleteModalState.ids) {
        await deleteOrder(id).unwrap();
      }
      toast.success("Order deleted successfully");
      setSelectedItems((prev) =>
        prev.filter((id) => !deleteModalState.ids.includes(id))
      );
      refetch();
    } catch (err) {
      toast.error("Failed to delete order");
    } finally {
      setDeleteModalState({ isOpen: false, ids: [] });
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 capitalize">
            Delivered
          </span>
        );
      case "delivery":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 capitalize">
            Delivery
          </span>
        );
      case "qa test":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 capitalize">
            QA Test
          </span>
        );
      case "ongoing":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 capitalize">
            Ongoing
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 capitalize">
            Onboard
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 uppercase">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 uppercase">
            <Clock className="w-3 h-3" /> Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400 uppercase">
            <AlertCircle className="w-3 h-3" /> Unpaid
          </span>
        );
    }
  };

  const headers = [
    { header: "SL", field: "sl" },
    { header: "Invoice #", field: "invoiceNumber" },
    { header: "Project & Category", field: "project" },
    { header: "Client", field: "client" },
    { header: "Subtotal", field: "subtotal" },
    { header: "Total Bill", field: "budget" },
    { header: "Paid", field: "advance" },
    { header: "Due Balance", field: "due" },
    { header: "Payment", field: "paymentStatus" },
    { header: "Order Status", field: "status" },
    { header: "Actions", field: "actions" },
  ];

  const transformedData = orders.map((order, index) => {
    const discount = Number(order.discount || 0);
    const tax = Number(order.tax || 0);
    const subtotal =
      order.subtotal !== undefined && order.subtotal !== null
        ? Number(order.subtotal)
        : Math.max(0, Number(order.budget || 0) + discount - tax);
    const total =
      order.budget !== undefined && order.budget !== null
        ? Number(order.budget)
        : Math.max(0, subtotal - discount + tax);
    const pStatus = String(order.paymentStatus || "").toLowerCase();
    const pmtSum = Array.isArray(order.payments)
      ? order.payments.reduce((s, p) => s + Number(p.amount || 0), 0)
      : 0;
    const advance =
      pStatus === "paid"
        ? Math.max(total, Number(order.advance || 0), pmtSum)
        : Math.max(Number(order.advance || 0), pmtSum);
    const due = Math.max(0, total - advance);

    const clientName =
      order.client?.name || order.clientName || "Valued Client";
    const clientEmail =
      order.client?.email || order.clientEmail || "";

    const invoiceNum =
      order.invoiceNumber || `INV-${order.id?.slice(0, 8).toUpperCase()}`;

    return {
      id: order.id,
      sl: (
        <span className="text-gray-500 font-medium font-mono">
          #{index + 1}
        </span>
      ),
      invoiceNumber: (
        <button
          type="button"
          onClick={() => handleViewInvoice(order)}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary hover:underline"
          title="Click to view & print invoice"
        >
          <Receipt className="w-3.5 h-3.5" />
          {invoiceNum}
        </button>
      ),
      project: (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-semibold text-gray-900 dark:text-white truncate">
            {order.projectName}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {order.category?.name || "Digital Service"}
            {order.duration ? ` • ${order.duration}` : ""}
          </span>
        </div>
      ),
      client: (
        <div className="flex flex-col max-w-[170px]">
          <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
            {clientName}
          </span>
          {clientEmail && (
            <span className="text-xs text-gray-500 truncate">
              {clientEmail}
            </span>
          )}
        </div>
      ),
      subtotal: (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      budget: (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-gray-900 dark:text-white">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          {(discount > 0 || tax > 0) && (
            <span className="text-[10px] text-gray-400">
              {discount > 0 ? `-$${discount} ` : ""}{tax > 0 ? `+$${tax}` : ""}
            </span>
          )}
        </div>
      ),
      advance: (
        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
          ${advance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      due: (
        <span
          className={`font-mono font-bold ${
            due === 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          ${due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      paymentStatus: getPaymentStatusBadge(order.paymentStatus),
      status: getOrderStatusBadge(order.status),
      actions: (
        <div className="flex items-center space-x-1">
          {due > 0 && (
            <IconButton
              icon={DollarSign}
              onClick={() => handleRecordPayment(order)}
              className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
              title="Collect / Receive Due Payment"
            />
          )}
          <IconButton
            icon={FileText}
            onClick={() => handleViewInvoice(order)}
            className="text-primary hover:text-primary/80"
            title="View / Print Invoice"
          />
          <IconButton
            icon={Edit}
            onClick={() => handleEdit(order)}
            className="text-green-600 hover:text-green-700"
            title="Edit Order"
          />
          <IconButton
            icon={Trash2}
            onClick={() => handleDelete(order.id)}
            className="text-red-600 hover:text-red-700"
            title="Delete Order"
          />
        </div>
      ),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order & Invoice Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track client project orders, budgets, payments, and generate printable invoices
          </p>
        </div>
        <PrimaryButton onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Order
        </PrimaryButton>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Total Orders
            </span>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.totalOrders}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Total Invoiced Budget
            </span>
            <h3 className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1">
              ${stats.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Total Paid / Revenue
            </span>
            <h3 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              ${stats.totalAdvance.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Outstanding Balance
            </span>
            <h3 className="text-2xl font-bold font-mono text-amber-500 mt-1">
              ${stats.totalDue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, invoice #, client..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium mr-1">Status:</span>
            {ORDER_STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  statusFilter === tab.value
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium mr-1">Payment:</span>
            {PAYMENT_STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setPaymentFilter(tab.value)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  paymentFilter === tab.value
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <ReusableTable
          data={transformedData}
          headers={headers}
          isLoading={isLoading}
          total={orders.length}
          pagination={false}
          showCheckbox={false}
        />
      </Card>

      {/* Add / Edit Order Form Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: null, data: null })}
        title={modalState.type === "edit" ? "Edit Order & Invoice" : "Create New Order & Invoice"}
        size="xl"
      >
        <OrderForm
          order={modalState.data}
          onSuccess={() => {
            setModalState({ isOpen: false, type: null, data: null });
            refetch();
          }}
          onCancel={() =>
            setModalState({ isOpen: false, type: null, data: null })
          }
        />
      </Modal>

      {/* Collect / Receive Due Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModalState.isOpen}
        onClose={() => setPaymentModalState({ isOpen: false, order: null })}
        order={paymentModalState.order}
        onPaymentSuccess={(updatedOrder) => {
          refetch();
          setInvoiceModalState({ isOpen: true, order: updatedOrder });
        }}
      />

      {/* Order Invoice View & Print Modal */}
      <OrderInvoiceModal
        isOpen={invoiceModalState.isOpen}
        onClose={() => setInvoiceModalState({ isOpen: false, order: null })}
        order={invoiceModalState.order}
        onRecordPayment={(order) => {
          setPaymentModalState({ isOpen: true, order });
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, ids: [] })}
        onConfirm={confirmDelete}
        count={deleteModalState.ids.length}
        itemName="order"
      />
    </div>
  );
}

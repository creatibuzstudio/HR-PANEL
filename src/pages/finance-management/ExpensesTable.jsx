import React, { useState } from "react";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal";
import ExpenseVoucherModal from "./ExpenseVoucherModal";
import { useDeleteExpenseMutation } from "@/services/finance/financeApiSlice";
import toast from "react-hot-toast";
import {
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Tag,
  Building,
  FileText,
} from "lucide-react";
import moment from "moment";

export default function ExpensesTable({
  expenses = [],
  isLoading,
  onRequestExpense,
  onReviewExpense,
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: null,
  });

  const [voucherModalState, setVoucherModalState] = useState({
    isOpen: false,
    expense: null,
  });

  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const filteredExpenses = expenses.filter((e) => {
    if (statusFilter === "ALL") return true;
    return e.status === statusFilter;
  });

  const handleDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      await deleteExpense(deleteModalState.id).unwrap();
      toast.success("Expense requisition removed successfully");
      setDeleteModalState({ isOpen: false, id: null });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete expense");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Disbursed
          </span>
        );
      case "ceo_approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" /> CEO Approved (Needs COO)
          </span>
        );
      case "coo_approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Clock className="w-3.5 h-3.5" /> COO Approved (Needs CEO)
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" /> Awaiting Dual Approvals
          </span>
        );
    }
  };

  const renderApprovalBadge = (approval, roleTitle) => {
    if (!approval) {
      return (
        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    if (approval.approved) {
      return (
        <span
          className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold"
          title={`Approved by ${approval.userName || roleTitle} on ${moment(approval.date).format("MMM DD, YYYY")}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    return (
      <span
        className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-semibold"
        title={`Rejected by ${approval.userName || roleTitle}`}
      >
        <XCircle className="w-3.5 h-3.5" /> Rejected
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Table Header and Controls */}
      <div className="p-5 border-b dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-500" />
            Company Expenses & Dual Approval System
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Every cost purchase requires formal approvals from both <strong>CEO</strong> and <strong>COO</strong> before deduction
          </p>
        </div>
        <PrimaryButton onClick={onRequestExpense} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Request Company Cost
        </PrimaryButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-5 py-3 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 overflow-x-auto text-xs">
        {[
          { label: "All Expenses", value: "ALL" },
          { label: "Pending Approvals", value: "pending" },
          { label: "CEO Approved", value: "ceo_approved" },
          { label: "COO Approved", value: "coo_approved" },
          { label: "Fully Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table content */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            No expenses found
          </h4>
          <p className="text-xs text-gray-500">
            Click "Request Company Cost" to submit a purchase requisition for CEO & COO review.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Voucher #</th>
                <th className="px-5 py-3.5">Title & Category</th>
                <th className="px-5 py-3.5">Amount ($)</th>
                <th className="px-5 py-3.5">Vendor / Payee</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">CEO Approval</th>
                <th className="px-5 py-3.5">COO Approval</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredExpenses.map((expense) => {
                const voucherNo =
                  expense.voucherNumber ||
                  `EXP-${expense.id?.slice(0, 8).toUpperCase()}`;
                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {voucherNo}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {expense.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {expense.category}
                        </span>
                        {expense.receiptUrl && (
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            Receipt <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-base text-gray-900 dark:text-white">
                      ${Number(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-700 dark:text-gray-300">
                      {expense.vendor || "N/A"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {expense.expenseDate || moment(expense.createdAt).format("YYYY-MM-DD")}
                    </td>
                    <td className="px-5 py-3.5">
                      {renderApprovalBadge(expense.ceoApproval, "CEO")}
                    </td>
                    <td className="px-5 py-3.5">
                      {renderApprovalBadge(expense.cooApproval, "COO")}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton
                          icon={FileText}
                          onClick={() =>
                            setVoucherModalState({ isOpen: true, expense })
                          }
                          className="text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20"
                          title="View / Print Official Payment Voucher Invoice"
                        />
                        <button
                          onClick={() => onReviewExpense(expense)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1"
                          title="Review and submit CEO / COO approval decision"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Review
                        </button>
                        <IconButton
                          icon={Trash2}
                          onClick={() =>
                            setDeleteModalState({ isOpen: true, id: expense.id })
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete Expense Requisition"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Voucher Invoice Modal */}
      <ExpenseVoucherModal
        isOpen={voucherModalState.isOpen}
        expense={voucherModalState.expense}
        onClose={() => setVoucherModalState({ isOpen: false, expense: null })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Expense Requisition"
        message="Are you sure you want to remove this company expense record? This action cannot be undone."
        loading={isDeleting}
      />
    </div>
  );
}

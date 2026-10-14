import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import { useApproveExpenseMutation } from "@/services/finance/financeApiSlice";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Clock, ShieldCheck, User, MessageSquare, DollarSign, Calendar, Tag, ExternalLink } from "lucide-react";
import moment from "moment";

export default function ApproveExpenseModal({ isOpen, onClose, expense }) {
  const { user } = useAuth();
  const [approveExpense, { isLoading }] = useApproveExpenseMutation();

  // Determine initial role
  const initialRole =
    user?.role === "ceo" || user?.type === "ceo"
      ? "ceo"
      : user?.role === "coo" || user?.type === "coo"
      ? "coo"
      : "ceo";

  const [actingRole, setActingRole] = useState(initialRole);
  const [comment, setComment] = useState("");

  if (!expense) return null;

  const handleDecision = async (approved) => {
    try {
      await approveExpense({
        id: expense.id,
        role: actingRole,
        approved,
        comment: comment?.trim() || undefined,
        userId: user?.id || undefined,
        userName: user?.name || (actingRole === "ceo" ? "CEO" : "COO"),
      }).unwrap();

      toast.success(
        approved
          ? `Expense approved as ${actingRole.toUpperCase()}!`
          : `Expense rejected by ${actingRole.toUpperCase()}`
      );
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit approval decision");
    }
  };

  const isCeoApproved = expense.ceoApproval?.approved === true;
  const isCeoRejected = expense.ceoApproval?.approved === false;
  const isCooApproved = expense.cooApproval?.approved === true;
  const isCooRejected = expense.cooApproval?.approved === false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dual Executive Review & Approval"
      size="lg"
    >
      <div className="space-y-5">
        {/* Expense Quick Summary */}
        <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 mb-1">
                {expense.category}
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {expense.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Requested Amount</span>
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${Number(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t dark:border-gray-700">
            <div>
              <span className="text-gray-400 block">Vendor / Payee:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {expense.vendor || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Date Requested:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {expense.expenseDate || moment(expense.createdAt).format("YYYY-MM-DD")}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Receipt:</span>
              {expense.receiptUrl ? (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  View Receipt <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-gray-400">No link attached</span>
              )}
            </div>
          </div>

          {expense.notes && (
            <div className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900/50 p-2.5 rounded border border-gray-200 dark:border-gray-800">
              <span className="font-semibold text-gray-700 dark:text-gray-200 block mb-1">
                Description / Justification:
              </span>
              {expense.notes}
            </div>
          )}
        </div>

        {/* Current Dual Approval Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CEO Status */}
          <div
            className={`p-3.5 rounded-xl border ${
              isCeoApproved
                ? "bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800"
                : isCeoRejected
                ? "bg-red-50/70 border-red-300 dark:bg-red-950/30 dark:border-red-800"
                : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                CEO Approval
              </span>
              {isCeoApproved ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
              ) : isCeoRejected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300">
                  <XCircle className="w-3 h-3" /> Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
            {expense.ceoApproval ? (
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <p>
                  By: <strong className="text-gray-900 dark:text-gray-100">{expense.ceoApproval.userName || "CEO"}</strong>
                </p>
                {expense.ceoApproval.date && (
                  <p>Date: {moment(expense.ceoApproval.date).format("MMM DD, YYYY h:mm A")}</p>
                )}
                {expense.ceoApproval.comment && (
                  <p className="italic bg-white/70 dark:bg-gray-900/50 p-1.5 rounded mt-1">
                    "{expense.ceoApproval.comment}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Awaiting review from CEO</p>
            )}
          </div>

          {/* COO Status */}
          <div
            className={`p-3.5 rounded-xl border ${
              isCooApproved
                ? "bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800"
                : isCooRejected
                ? "bg-red-50/70 border-red-300 dark:bg-red-950/30 dark:border-red-800"
                : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-500" />
                COO Approval
              </span>
              {isCooApproved ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
              ) : isCooRejected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300">
                  <XCircle className="w-3 h-3" /> Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
            {expense.cooApproval ? (
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <p>
                  By: <strong className="text-gray-900 dark:text-gray-100">{expense.cooApproval.userName || "COO"}</strong>
                </p>
                {expense.cooApproval.date && (
                  <p>Date: {moment(expense.cooApproval.date).format("MMM DD, YYYY h:mm A")}</p>
                )}
                {expense.cooApproval.comment && (
                  <p className="italic bg-white/70 dark:bg-gray-900/50 p-1.5 rounded mt-1">
                    "{expense.cooApproval.comment}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Awaiting review from COO</p>
            )}
          </div>
        </div>

        {/* Action Form */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Executive Decision Panel
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Acting as Role:
              </label>
              <select
                value={actingRole}
                onChange={(e) => setActingRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ceo">Chief Executive Officer (CEO)</option>
                <option value="coo">Chief Operating Officer (COO)</option>
                <option value="admin">Admin (Dual Simultaneous Approval)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                Reviewer:
              </label>
              <input
                type="text"
                disabled
                value={user?.name || (actingRole === "ceo" ? "CEO" : "COO")}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              Approval Notes / Reason (Optional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Budget approved under Q4 hardware expansion..."
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDecision(false)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Reject Expense
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDecision(true)}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve as {actingRole.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

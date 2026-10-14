import React, { useRef } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import DualExecutiveSignature from "@/components/invoice/DualExecutiveSignature";
import { Printer, Copy, CheckCircle2, XCircle, Clock, ShieldCheck, Building, Tag, FileText } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { printElement } from "@/utils/printHelper";

export default function ExpenseVoucherModal({ isOpen, onClose, expense }) {
  const printRef = useRef(null);

  if (!expense) return null;

  const voucherNumber =
    expense.voucherNumber || `EXP-${expense.id?.slice(0, 8).toUpperCase()}`;

  const copyVoucherNumber = () => {
    navigator.clipboard.writeText(voucherNumber);
    toast.success("Voucher number copied to clipboard");
  };

  const handlePrint = () => {
    printElement(printRef.current || "printable-expense-voucher", `Expense-Voucher-${voucherNumber}`);
  };

  const amount = Number(expense.amount || 0);
  const isCeoApproved = expense.ceoApproval?.approved === true;
  const isCooApproved = expense.cooApproval?.approved === true;
  const isFullyApproved = expense.status === "approved";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-5">
        {/* Printable Area */}
        <div
          ref={printRef}
          id="printable-expense-voucher"
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-xl space-y-7 text-gray-900 dark:text-gray-100"
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-1.5">
              <img
                src="/creatibuz-logo.png"
                alt="Creatibuz Studio"
                className="h-10 sm:h-12 w-auto object-contain max-w-[240px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Accounts Payable & Operational Expenditure
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Fund Source: Company Cost Fund (Disbursed)
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400 block">
                PAYMENT DISBURSEMENT VOUCHER
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-start sm:justify-end">
                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {voucherNumber}
                </span>
                <button
                  type="button"
                  onClick={copyVoucherNumber}
                  title="Copy"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {isFullyApproved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> FULLY APPROVED & DISBURSED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mt-1">
                  <Clock className="w-3 h-3" /> DUAL APPROVAL IN PROGRESS
                </span>
              )}
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                PAYEE / VENDOR
              </span>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                {expense.vendor || "Designated Vendor / Service Provider"}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Expense Category:{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {expense.category}
                </span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Disbursement Account: Company Cost Fund
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                REQUISITION TIMESTAMPS
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Expense Date:{" "}
                <strong className="text-gray-900 dark:text-white">
                  {expense.expenseDate || moment(expense.createdAt).format("MMM DD, YYYY")}
                </strong>
              </p>
              {expense.disbursedDate && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Disbursed Date:{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {moment(expense.disbursedDate).format("MMM DD, YYYY")}
                  </strong>
                </p>
              )}
              {expense.receiptUrl && (
                <p className="text-xs text-primary font-medium">
                  Verified Electronic Receipt Attached
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3">Expense Title & Description</th>
                  <th className="px-4 py-3 text-center">Category</th>
                  <th className="px-4 py-3 text-right">Disbursed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {expense.title}
                    </div>
                    {expense.notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        {expense.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-bold text-base text-gray-900 dark:text-white">
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Gross Expense Amount:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700">
                <span>Net Fund Deduction:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Dual Executive Approvals Block */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
              DUAL EXECUTIVE AUTHORIZATION
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CEO Block */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> CEO Approval
                  </strong>
                  {isCeoApproved ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Pending</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  By: {expense.ceoApproval?.userName || "Chief Executive Officer"}
                </p>
                {expense.ceoApproval?.date && (
                  <p className="text-gray-400">
                    Timestamp: {moment(expense.ceoApproval.date).format("MMM DD, YYYY h:mm A")}
                  </p>
                )}
                {expense.ceoApproval?.comment && (
                  <p className="italic text-gray-500 pt-0.5">
                    "{expense.ceoApproval.comment}"
                  </p>
                )}
              </div>

              {/* COO Block */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-violet-700 dark:text-violet-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> COO Approval
                  </strong>
                  {isCooApproved ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Pending</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  By: {expense.cooApproval?.userName || "Chief Operating Officer"}
                </p>
                {expense.cooApproval?.date && (
                  <p className="text-gray-400">
                    Timestamp: {moment(expense.cooApproval.date).format("MMM DD, YYYY h:mm A")}
                  </p>
                )}
                {expense.cooApproval?.comment && (
                  <p className="italic text-gray-500 pt-0.5">
                    "{expense.cooApproval.comment}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Executive Authorization: Dual CEO & COO Signatures (Dynamically resolved from User API) */}
          <DualExecutiveSignature date={expense.createdAt} />
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <PrimaryButton onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print / Save Voucher
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import {
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";
import { useWithdrawExecutiveMutation } from "@/services/payroll/payrollApiSlice";
import toast from "react-hot-toast";

export default function ExecutiveWithdrawalModal({
  isOpen,
  onClose,
  monthYear,
  monthName,
  role, // "ceo" | "coo"
  executiveData, // { user, percent, amount, isWithdrawn, item }
  onSuccess,
}) {
  const [withdrawExecutive, { isLoading }] = useWithdrawExecutiveMutation();

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !executiveData) return null;

  const isCeo = role?.toLowerCase() === "ceo";
  const user = executiveData.user || {};
  const amount = Number(executiveData.amount || 0);
  const percent = Number(executiveData.percent || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await withdrawExecutive({
        monthYear,
        role: isCeo ? "ceo" : "coo",
        paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success(
        res.message ||
          `${isCeo ? "CEO" : "COO"} monthly share of $${amount.toLocaleString()} withdrawn successfully!`
      );
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to process executive withdrawal. Please check requirements."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        {/* Header Banner */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isCeo
                ? "bg-gradient-to-br from-amber-500 to-amber-600"
                : "bg-gradient-to-br from-violet-500 to-violet-600"
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Executive Monthly Share Withdrawal
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {monthName} ({monthYear}) • {isCeo ? "Chief Executive Officer (CEO)" : "Chief Operating Officer (COO)"}
            </p>
          </div>
        </div>

        {/* Executive Info & Amount Card */}
        <div
          className={`p-4 rounded-xl border ${
            isCeo
              ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-950 dark:text-amber-100"
              : "bg-violet-50/60 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/40 text-violet-950 dark:text-violet-100"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                />
              ) : (
                <div
                  className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-base ${
                    isCeo ? "bg-amber-500" : "bg-violet-500"
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase() || (isCeo ? "CEO" : "COO")}
                </div>
              )}
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  {user.name || (isCeo ? "CEO Executive" : "COO Executive")}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email || "executive@creatibuzstudio.com"}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isCeo
                  ? "bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                  : "bg-violet-200/80 text-violet-900 dark:bg-violet-900 dark:text-violet-200"
              }`}
            >
              {percent}% of Revenue
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-gray-300 dark:border-gray-700/60 flex justify-between items-baseline">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Monthly Entitled Payout:
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Once a Month Warning Notice */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Once-A-Month Withdrawal Policy:
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
              Executive profit dividends can only be withdrawn <strong>once per calendar month</strong>. Once processed, an official voucher will be generated and logged to the financial audit books.
            </p>
          </div>
        </div>

        {/* Payment Details Form */}
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="bank_transfer">Bank Wire / Account Transfer</option>
              <option value="bkash">bKash / Mobile Banking</option>
              <option value="cheque">Bank Cheque</option>
              <option value="cash">Direct Cash</option>
              <option value="other">Corporate Dividend Account</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Transaction Reference / Account Number (Optional)
            </label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="e.g. Bank Trx #98234 or City Bank A/C 12345"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Notes / Voucher Reference (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Authorized by board resolution / executive dividend..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            className="text-xs px-5 flex items-center gap-1.5"
          >
            <span>Confirm & Withdraw ${amount.toLocaleString()}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

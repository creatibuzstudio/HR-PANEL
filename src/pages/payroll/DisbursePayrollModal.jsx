import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import {
  Banknote,
  CheckCircle2,
  AlertCircle,
  Building,
  Users,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useDisbursePayrollMutation } from "@/services/payroll/payrollApiSlice";
import toast from "react-hot-toast";

export default function DisbursePayrollModal({
  isOpen,
  onClose,
  monthYear,
  monthName,
  summaryData,
  onSuccess,
}) {
  const [disbursePayroll, { isLoading }] = useDisbursePayrollMutation();

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen || !summaryData) return null;

  const totalEmployees = summaryData.employees?.length || 0;
  const totalBase = Number(summaryData.summary?.totalBaseSalaries || 0);
  const totalProfitShare = Number(summaryData.pools?.employeePool?.amount || 0);
  const grossPayout = Number(
    summaryData.summary?.totalEmployeePayrollGross || totalBase + totalProfitShare
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await disbursePayroll({
        monthYear,
        paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success(
        res.message ||
          `Employee payroll for ${monthName} successfully disbursed to ${totalEmployees} employees!`
      );
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.message ||
          "Failed to disburse payroll. Please check records."
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Disburse Monthly Employee Payroll
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Period: {monthName} ({monthYear}) • {totalEmployees} eligible employee(s)
            </p>
          </div>
        </div>

        {/* Payout Breakdown Card */}
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400">Total Active Employees:</span>
            <span className="font-bold text-gray-900 dark:text-white font-mono">
              {totalEmployees} Members
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400">Total Monthly Employee Pool:</span>
            <span className="font-bold text-gray-900 dark:text-white font-mono">
              ${totalProfitShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Total Allocated Across Employees:
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {summaryData?.summary?.totalAllocatedPercent || 0}% of Pool
            </span>
          </div>

          <div className="pt-2 border-t border-dashed border-emerald-300 dark:border-emerald-800/60 flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Total Payroll Payout:
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ${grossPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Disburse Inputs */}
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Disbursement Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="bank_transfer">Corporate Bank Transfer / Direct Deposit</option>
              <option value="bkash">bKash / Mobile Payroll</option>
              <option value="cash">Direct Cash Disbursement</option>
              <option value="cheque">Company Cheque</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Batch Transaction Reference (Optional)
            </label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="e.g. BATCH-PAYROLL-202610"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Internal Payroll Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Authorized for monthly payroll dispatches..."
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
            <span>Confirm & Disburse All (${grossPayout.toLocaleString()})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

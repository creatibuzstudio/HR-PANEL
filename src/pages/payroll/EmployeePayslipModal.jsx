import React, { useRef } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import {
  Printer,
  Copy,
  CheckCircle2,
  Clock,
  Building,
  User,
  DollarSign,
  TrendingUp,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { printElement } from "@/utils/printHelper";

export default function EmployeePayslipModal({
  isOpen,
  onClose,
  employee, // item object
  monthName,
  monthYear,
}) {
  const printRef = useRef(null);

  if (!isOpen || !employee) return null;

  const voucherNumber =
    employee.voucherNumber ||
    `PAY-${monthYear?.replace("-", "") || "202610"}-${employee.userId?.slice(-4) || "1001"}`;

  const copyVoucherNumber = () => {
    navigator.clipboard.writeText(voucherNumber);
    toast.success("Payslip number copied to clipboard");
  };

  const handlePrint = () => {
    printElement(
      printRef.current || "printable-employee-payslip",
      `Payslip-${employee.name?.replace(/\s+/g, "_")}-${monthYear}`
    );
  };

  const isPaid =
    String(employee.paymentStatus).toLowerCase() === "paid" ||
    String(employee.paymentStatus).toLowerCase() === "withdrawn";

  const baseSalary = Number(employee.baseSalary || 0);
  const profitShare = Number(employee.profitShareAmount || 0);
  const bonus = Number(employee.bonus || 0);
  const deductions = Number(employee.deductions || 0);
  const netPayable = Number(
    employee.netPayable || baseSalary + profitShare + bonus - deductions
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-5">
        {/* Printable Payslip Card */}
        <div
          ref={printRef}
          id="printable-employee-payslip"
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-xl space-y-6 text-gray-900 dark:text-gray-100"
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-1.5">
              <img
                src="/creatibuz-logo.png"
                alt="Creatibuz Studio"
                className="h-10 sm:h-12 w-auto object-contain max-w-[220px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Official Monthly Salary & Profit Share Statement
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Creatibuz Studio Inc. • HR & Finance Division
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-widest font-bold text-primary block">
                EMPLOYEE PAYSLIP
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
              <div className="mt-1 flex items-center justify-start sm:justify-end gap-2">
                <span className="text-xs text-gray-500 font-semibold">
                  Period: {monthName}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  {isPaid ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> PAID
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" /> PENDING
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Employee Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="flex items-start gap-3.5">
              {employee.picture ? (
                <img
                  src={employee.picture}
                  alt={employee.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                  {employee.name?.charAt(0).toUpperCase() || "E"}
                </div>
              )}
              <div className="space-y-0.5">
                <span className="inline-block px-2 py-0.5 text-[11px] font-bold uppercase rounded-md mb-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {employee.designation || employee.role || "Team Member"}
                </span>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {employee.name}
                </h3>
                <p className="text-xs text-gray-500">{employee.email}</p>
                {employee.phone && (
                  <p className="text-xs text-gray-400">{employee.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 sm:text-right text-xs">
              <div>
                <span className="text-gray-400 block">Department:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {employee.department || "General"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Payment Method:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 uppercase">
                  {employee.paymentMethod || "Bank Transfer"}
                </span>
              </div>
              {employee.transactionReference && (
                <div>
                  <span className="text-gray-400 block">Transaction Reference:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {employee.transactionReference}
                  </span>
                </div>
              )}
              {employee.paidAt && (
                <div>
                  <span className="text-gray-400 block">Disbursement Date:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {moment(employee.paidAt).format("MMMM DD, YYYY")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Earnings Breakdown Table */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              <span>Compensation Component</span>
              <span>Amount ($)</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm">
              <div className="p-3.5 flex justify-between items-center bg-emerald-50/40 dark:bg-emerald-950/20">
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Finance Employee Pool Allocation ({employee.poolSharePercent || employee.baseSalary || 0}%)
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    Calculated strictly as {employee.poolSharePercent || employee.baseSalary || 0}% of the Finance Employee Pool for {monthName}
                  </p>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                  ${profitShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {bonus > 0 && (
                <div className="p-3.5 flex justify-between items-center bg-blue-50/40 dark:bg-blue-950/20">
                  <div>
                    <p className="font-semibold text-blue-700 dark:text-blue-400">
                      Performance Bonus / Incentive
                    </p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                      Additional monthly performance recognition
                    </p>
                  </div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    +${bonus.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {deductions > 0 && (
                <div className="p-3.5 flex justify-between items-center bg-rose-50/40 dark:bg-rose-950/20">
                  <div>
                    <p className="font-semibold text-rose-700 dark:text-rose-400">
                      Adjustments & Deductions
                    </p>
                    <p className="text-xs text-rose-600/80">Tax / advance withholdings</p>
                  </div>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    -${deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Total Net Payable Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t-2 border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Net Disbursed Take-Home Pay
                </span>
                <span className="text-xs text-gray-400">
                  Total Monthly Earnings Credited
                </span>
              </div>
              <span className="text-2xl font-mono font-extrabold text-primary">
                ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Dual Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs">
            <div className="space-y-8">
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif italic text-gray-400 text-sm">
                  Authorized Signatory
                </span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-700 pt-1.5">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  Head of HR & Finance
                </p>
                <p className="text-[11px] text-gray-400">Creatibuz Studio Executive Board</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif italic text-gray-400 text-sm">
                  {employee.name}
                </span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-700 pt-1.5">
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  Employee Signature
                </p>
                <p className="text-[11px] text-gray-400">Acknowledged & Received</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            Close
          </button>
          <PrimaryButton
            onClick={handlePrint}
            className="text-xs px-5 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Official Payslip
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

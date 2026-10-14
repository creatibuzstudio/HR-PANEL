import React, { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useGetMyPayslipsQuery } from "@/services/payroll/payrollApiSlice";
import EmployeePayslipModal from "@/pages/payroll/EmployeePayslipModal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import {
  FileText,
  Printer,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  Copy,
  Building,
  User,
  ShieldCheck,
  ChevronRight,
  Info,
  Sparkles,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { printElement } from "@/utils/printHelper";

export default function MyPayslips() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const userEmail = user?.email;

  const { data, isLoading, isFetching, refetch } = useGetMyPayslipsQuery(
    { userId, email: userEmail },
    { skip: !user }
  );

  const payslips = data?.payslips || (Array.isArray(data) ? data : []);
  const currentMonthEstimate = data?.currentMonthEstimate;

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  // Financial aggregates
  const totalPaidEarnings = payslips
    .filter(
      (p) =>
        String(p.paymentStatus).toLowerCase() === "paid" ||
        String(p.paymentStatus).toLowerCase() === "withdrawn"
    )
    .reduce((sum, p) => sum + Number(p.netPayable || 0), 0);

  const totalPaidMonths = payslips.filter(
    (p) =>
      String(p.paymentStatus).toLowerCase() === "paid" ||
      String(p.paymentStatus).toLowerCase() === "withdrawn"
  ).length;

  const userSalaryShare = Number(user?.salary || 0);

  const handleOpenPayslip = (item) => {
    setSelectedPayslip(item);
    setIsPayslipModalOpen(true);
  };

  const handleQuickPrint = (item, e) => {
    e.stopPropagation();
    setSelectedPayslip(item);
    setIsPayslipModalOpen(true);
    // Modal will render and user can click print or we can let modal handle it
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6 pb-12 pt-2">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        {/* Card 1: Assigned Pool Share */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Salary Share %
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {userSalaryShare}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Of company Finance Employee Pool
            </p>
          </div>
        </div>

        {/* Card 2: Total Earnings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Earnings Paid
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ${totalPaidEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Disbursed to your account to date
            </p>
          </div>
        </div>

        {/* Card 3: Paid Months */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Paid Statements
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {totalPaidMonths} Months
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Official monthly payroll disbursements
            </p>
          </div>
        </div>

        {/* Card 4: Current Month Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active Month Forecast
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {currentMonthEstimate ? (
              <>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                  ${Number(currentMonthEstimate.estimatedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Est. for {currentMonthEstimate.monthName} ({currentMonthEstimate.poolSharePercent}%)
                </p>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {payslips[0]?.monthlyPayroll?.monthName || "Up to Date"}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Statements current
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Payslips History Table */}
      <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Payroll Statements History</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Click any statement or use the download button to print your official payslip
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
              {payslips.length} Total Statement{payslips.length === 1 ? "" : "s"}
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Refresh Statements"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>


        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading your payslip history...</p>
          </div>
        ) : payslips.length === 0 ? (
          <div className="p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                No Payslips Issued Yet
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                When monthly payroll is disbursed by HR and leadership, your official
                downloadable payslip vouchers will automatically appear here.
              </p>
            </div>

            {currentMonthEstimate && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Current Month Forecast ({currentMonthEstimate.monthName})</span>
                </div>
                <div className="flex justify-between items-center text-amber-900 dark:text-amber-200 font-mono">
                  <span>Assigned Pool Share:</span>
                  <span className="font-bold">{currentMonthEstimate.poolSharePercent}%</span>
                </div>
                <div className="flex justify-between items-center text-amber-900 dark:text-amber-200 font-mono">
                  <span>Estimated Payout:</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    ${Number(currentMonthEstimate.estimatedAmount || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 pt-1 border-t border-amber-200 dark:border-amber-800/40">
                  Status: Pending monthly leadership disburse execution.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                  <th className="py-3.5 px-4 sm:px-6">Voucher #</th>
                  <th className="py-3.5 px-4">Period / Month</th>
                  <th className="py-3.5 px-4">Pool Share</th>
                  <th className="py-3.5 px-4 font-mono">Net Paid ($)</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Disbursed Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payslips.map((item, index) => {
                  const isPaid =
                    String(item.paymentStatus).toLowerCase() === "paid" ||
                    String(item.paymentStatus).toLowerCase() === "withdrawn";

                  const voucherNum =
                    item.voucherNumber ||
                    `PAY-${item.monthlyPayroll?.monthYear?.replace("-", "") || "202610"}-${item.userId?.slice(-4) || "1001"}`;

                  const poolPercent =
                    item.profitSharePercent ??
                    item.baseSalary ??
                    userSalaryShare;

                  return (
                    <tr
                      key={item.id || index}
                      onClick={() => handleOpenPayslip(item)}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Voucher # */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{voucherNum}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyText(voucherNum, "Voucher number");
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title="Copy Voucher #"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Period / Month */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.monthlyPayroll?.monthName || item.monthYear || "Monthly Statement"}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          {item.monthlyPayroll?.monthYear}
                        </div>
                      </td>

                      {/* Pool Share */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          <TrendingUp className="w-3 h-3" />
                          {poolPercent}%
                        </span>
                      </td>

                      {/* Net Paid */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        ${Number(item.netPayable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 capitalize text-xs">
                        {item.paymentMethod || "Bank Transfer"}
                        {item.transactionReference && (
                          <div className="text-[11px] text-gray-400 font-mono truncate max-w-[120px]" title={item.transactionReference}>
                            Ref: {item.transactionReference}
                          </div>
                        )}
                      </td>

                      {/* Disbursed Date */}
                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {item.paidAt
                          ? moment(item.paidAt).format("MMM DD, YYYY")
                          : item.monthlyPayroll?.disbursedAt
                          ? moment(item.monthlyPayroll.disbursedAt).format("MMM DD, YYYY")
                          : "Pending"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Pending
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => handleQuickPrint(item, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-sm transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download / Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <EmployeePayslipModal
          isOpen={isPayslipModalOpen}
          onClose={() => {
            setIsPayslipModalOpen(false);
            setSelectedPayslip(null);
          }}
          employee={selectedPayslip}
          monthName={selectedPayslip.monthlyPayroll?.monthName}
          monthYear={selectedPayslip.monthlyPayroll?.monthYear}
        />
      )}
    </div>
  );
}

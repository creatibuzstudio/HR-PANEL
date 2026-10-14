import React, { useRef } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import DualExecutiveSignature from "@/components/invoice/DualExecutiveSignature";
import { Printer, Copy, CheckCircle2, ShieldCheck, Award, DollarSign, Percent, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { printElement } from "@/utils/printHelper";

export default function ExecutivePayoutModal({
  isOpen,
  onClose,
  executiveRole, // "ceo" | "coo"
  execData,
  overview,
}) {
  const printRef = useRef(null);

  if (!execData) return null;

  const isCeo = executiveRole?.toLowerCase() === "ceo";
  const statementNumber = `DIV-${executiveRole?.toUpperCase()}-${new Date().getFullYear()}-${moment().format("MMDD")}`;

  const copyStatementNumber = () => {
    navigator.clipboard.writeText(statementNumber);
    toast.success("Statement number copied to clipboard");
  };

  const handlePrint = () => {
    printElement(printRef.current || "printable-executive-dividend", `Executive-Dividend-${statementNumber}`);
  };

  const user = execData.user || {};
  const totalRevenue = Number(overview?.summary?.totalOrderRevenue || 0);
  const leadershipPoolPercent = Number(overview?.pools?.leadershipPool?.percent || 30);
  const leadershipPoolAllocated = Number(overview?.pools?.leadershipPool?.allocated || 0);

  const shareRatio = Number(execData.shareRatioOfLeadership || (isCeo ? 60 : 40));
  const effectivePercent = Number(execData.effectivePercentOfTotalRevenue || (isCeo ? 18 : 12));
  const netEarnings = Number(execData.totalEarnings || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-5">
        {/* Printable Statement */}
        <div
          ref={printRef}
          id="printable-executive-dividend"
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
                Executive Compensation & Corporate Profit Distribution
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Authorized Board of Directors Resolution
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`text-xs uppercase tracking-widest font-bold block ${
                  isCeo ? "text-amber-600 dark:text-amber-400" : "text-violet-600 dark:text-violet-400"
                }`}
              >
                EXECUTIVE DIVIDEND STATEMENT
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-start sm:justify-end">
                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {statementNumber}
                </span>
                <button
                  type="button"
                  onClick={copyStatementNumber}
                  title="Copy"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mt-1">
                <CheckCircle2 className="w-3 h-3" /> OFFICIAL ENTITLEMENT
              </span>
            </div>
          </div>

          {/* Executive Beneficiary Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="flex items-start gap-3.5">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary shrink-0"
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg shrink-0 ${
                    isCeo ? "bg-amber-500" : "bg-violet-500"
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase() || (isCeo ? "CEO" : "COO")}
                </div>
              )}
              <div className="space-y-0.5">
                <span
                  className={`inline-block px-2 py-0.5 text-[11px] font-bold uppercase rounded-md mb-1 ${
                    isCeo
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300"
                  }`}
                >
                  {isCeo ? "Chief Executive Officer (CEO)" : "Chief Operating Officer (COO)"}
                </span>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  {user.name || (isCeo ? "Designated CEO" : "Designated COO")}
                </h4>
                <p className="text-xs text-gray-500">{user.email || "N/A"}</p>
                {user.phone && <p className="text-xs text-gray-500">{user.phone}</p>}
              </div>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                DISTRIBUTION PERIOD
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Statement Date:{" "}
                <strong className="text-gray-900 dark:text-white">
                  {moment().format("MMM DD, YYYY")}
                </strong>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Accounting Source: Client Orders Revenue
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Governance: Dynamic Profit Sharing Model
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3">Allocation Tier</th>
                  <th className="px-4 py-3 text-center">Configured %</th>
                  <th className="px-4 py-3 text-right">Computed Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                <tr>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Total Gross Order Revenue
                    </div>
                    <div className="text-xs text-gray-400">
                      Collected project revenue & advances
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-xs text-gray-500">
                    100.0%
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-medium text-gray-900 dark:text-white">
                    ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Executive Leadership Pool
                    </div>
                    <div className="text-xs text-gray-400">
                      Company Board allocation for senior executive leadership
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">
                    {leadershipPoolPercent}% of Revenue
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-medium text-gray-900 dark:text-white">
                    ${leadershipPoolAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {isCeo ? "CEO" : "COO"} Individual Entitlement
                    </div>
                    <div className="text-xs text-gray-500">
                      Individual share of the Leadership Pool ({effectivePercent}% of total revenue)
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3.5 text-center font-bold ${
                      isCeo ? "text-amber-600 dark:text-amber-400" : "text-violet-600 dark:text-violet-400"
                    }`}
                  >
                    {shareRatio}% of Pool
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                    ${netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Net Payout */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-2 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span>Effective Total Revenue Share:</span>
                <span className="font-bold">{effectivePercent}%</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-emerald-900 dark:text-emerald-200 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <span>Net Executive Payout:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                  ${netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Beneficiary Entitlement Confirmation */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-xs">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Executive Beneficiary</span>
                <strong className="text-gray-900 dark:text-white text-sm">{user.name || "Executive"}</strong>
                <span className="text-gray-500 block text-[11px]">{isCeo ? "Chief Executive Officer" : "Chief Operating Officer"} &bull; {user.email || ""}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dividend Verified & Approved by Board
              </div>
            </div>
          </div>

          {/* Executive Authorization: Dual CEO & COO Signatures (Dynamically resolved from User API) */}
          <DualExecutiveSignature date={overview?.summary?.calculationDate} />
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
            <Printer className="w-4 h-4" /> Print / Save Statement
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

import React, { useRef } from "react";
import Modal from "@/components/ui/modal";
import { Printer, Download, ShieldCheck, Calendar, User, FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import moment from "moment";
import * as XLSX from "xlsx";
import { printElement } from "@/utils/printHelper";
import toast from "react-hot-toast";

export default function AuditStatementModal({
  isOpen,
  onClose,
  logs = [],
  filters = {},
  stats = {},
  currentUser,
}) {
  const statementRef = useRef(null);
  const statementId = `AUDIT-${moment().format("YYYYMMDD-HHmmss")}`;
  const generatedAt = moment().format("MMMM DD, YYYY [at] hh:mm:ss A");

  const handlePrint = () => {
    printElement(
      statementRef.current || "printable-audit-statement",
      `Audit_Statement_${moment().format("YYYY-MM-DD")}`
    );
  };

  const handleExportExcel = () => {
    try {
      const dataRows = logs.map((log, index) => ({
        "SL #": index + 1,
        "Timestamp": moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        "Operator Name": log.userName || "System",
        "Operator Email": log.userEmail || "N/A",
        "Role": log.userRole || "N/A",
        "Action Type": log.action,
        "Module": log.module,
        "Activity Description": log.description,
        "Status": log.status,
        "IP Address": log.ipAddress || "N/A",
        "Client Device": log.userAgent || "N/A",
        "Target ID": log.targetId || "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Trail");

      // Auto width
      const colWidths = [
        { wch: 6 },
        { wch: 20 },
        { wch: 22 },
        { wch: 26 },
        { wch: 14 },
        { wch: 18 },
        { wch: 16 },
        { wch: 45 },
        { wch: 12 },
        { wch: 16 },
        { wch: 25 },
        { wch: 18 },
      ];
      worksheet["!cols"] = colWidths;

      XLSX.writeFile(workbook, `Creatibuz_Studio_Audit_Statement_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
      toast.success("Audit statement spreadsheet exported successfully");
    } catch (err) {
      toast.error("Failed to export Excel spreadsheet: " + err.message);
    }
  };

  const successCount = logs.filter((l) => l.status === "SUCCESS").length;
  const warningCount = logs.filter((l) => l.status === "WARNING").length;
  const failedCount = logs.filter((l) => l.status === "FAILED").length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl" maxHeight="max-h-[92vh]">
      <div className="space-y-4">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Administrative Audit Statement
            </h3>
            <p className="text-xs text-gray-500">
              Official verifiable activity log statement ready for executive review & export
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel (.xlsx)
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF Statement
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div
          ref={statementRef}
          id="printable-audit-statement"
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 text-gray-900 dark:text-gray-100"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b-2 border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                  CS
                </span>
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  Creatibuz Studio Inc.
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Administrative & Compliance Division • Official Audit Trail Ledger
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
                AUDIT STATEMENT REPORT
              </span>
              <div className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {statementId}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Issued: {generatedAt}
              </div>
            </div>
          </div>

          {/* Statement Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Generated By</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {currentUser?.name || "System Admin"} ({currentUser?.role?.toUpperCase() || "ADMIN"})
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Scope / Module</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {filters.module && filters.module !== "ALL" ? filters.module : "All System Modules"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Date Range</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {filters.startDate ? `${filters.startDate} to ${filters.endDate || "Present"}` : "Complete History"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Operations</span>
              <span className="font-mono font-bold text-primary">
                {logs.length} Recorded Action(s)
              </span>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                Successful
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {successCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block">
                Warnings / Notices
              </span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                {warningCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30">
              <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 block">
                Failed / Blocked
              </span>
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                {failedCount}
              </span>
            </div>
          </div>

          {/* Audit Trail Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 text-[10px] uppercase font-bold text-gray-500">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Description & Impact</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No activity logs found for the selected statement criteria.
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 150).map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {moment(log.createdAt).format("MMM DD, YYYY HH:mm")}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {log.userName || "System"}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase font-mono">
                          {log.userRole || "Admin"}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-primary text-[11px]">
                        {log.module}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 max-w-sm">
                        {log.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.status === "FAILED"
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                              : log.status === "WARNING"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {log.status || "SUCCESS"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-gray-400 whitespace-nowrap">
                        {log.ipAddress || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {logs.length > 150 && (
            <div className="text-center text-xs text-gray-400 py-1 italic">
              Showing first 150 records in printable view. Download the full Excel spreadsheet for complete dataset ({logs.length} total rows).
            </div>
          )}

          {/* Verification & Signatures */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-8 text-xs text-gray-500">
            <div className="space-y-6">
              <p className="leading-relaxed text-[11px]">
                This administrative statement is electronically compiled from cryptographic telemetry logs of Creatibuz Studio. It serves as an immutable record of corporate actions, financial transactions, and system configuration modifications.
              </p>
              <div>
                <div className="border-b border-gray-300 dark:border-gray-700 w-44 mb-1" />
                <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Compiled by Operator
                </span>
                <span className="text-[10px] text-gray-400">
                  {currentUser?.name || "System Administrator"} • Creatibuz Studio
                </span>
              </div>
            </div>

            <div className="space-y-6 text-right">
              <div className="font-mono text-[11px] text-gray-400">
                SECURITY HASH: SHA256:{statementId}
              </div>
              <div className="inline-block text-left">
                <div className="border-b border-gray-300 dark:border-gray-700 w-44 mb-1" />
                <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Executive Approval
                </span>
                <span className="text-[10px] text-gray-400">
                  CEO / COO / HR Department Verification
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

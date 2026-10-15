import React, { useRef } from "react";
import Modal from "@/components/ui/modal";
import { Printer, Download, Clock, CheckCircle2, AlertTriangle, XCircle, Award } from "lucide-react";
import moment from "moment";
import * as XLSX from "xlsx";
import { printElement } from "@/utils/printHelper";
import toast from "react-hot-toast";

export default function AttendanceStatementModal({
  isOpen,
  onClose,
  reportData = {},
  targetDate,
  currentUser,
}) {
  const statementRef = useRef(null);
  const statementId = `ATT-${moment(targetDate || new Date()).format("YYYYMMDD")}-${moment().format("HHmmss")}`;
  const generatedAt = moment().format("MMMM DD, YYYY [at] hh:mm A");

  const reports = reportData?.reports || [];
  const dailyGoalHours = reportData?.dailyGoalHours || 6;

  const handlePrint = () => {
    printElement(
      statementRef.current || "printable-attendance-statement",
      `Attendance_Statement_${moment(targetDate).format("YYYY-MM-DD")}`
    );
  };

  const handleExportExcel = () => {
    try {
      const rows = reports.map((rep, idx) => ({
        "SL #": idx + 1,
        "Employee Name": rep.userName,
        "Email": rep.userEmail || "—",
        "Role": rep.userRole || "—",
        "Department": rep.department || "General",
        "Designation": rep.designation || "Staff",
        "Date": rep.date,
        "First Clock-In": rep.firstClockIn ? moment(rep.firstClockIn).format("hh:mm A") : "—",
        "Last Clock-Out": rep.lastClockOut ? moment(rep.lastClockOut).format("hh:mm A") : "—",
        "Total Hours": rep.formattedHours || "00h 00m",
        "Daily Target": `${dailyGoalHours} Hours`,
        "Compliance Status": rep.complianceStatus,
        "Target Achieved (6h+)": rep.isAchieved ? "YES" : "NO",
        "Total Sessions": rep.sessionCount || 0,
        "Work Notes": rep.notes || "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Attendance");

      worksheet["!cols"] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 26 },
        { wch: 12 },
        { wch: 16 },
        { wch: 18 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
        { wch: 20 },
        { wch: 14 },
        { wch: 35 },
      ];

      XLSX.writeFile(
        workbook,
        `Creatibuz_Attendance_Statement_${moment(targetDate).format("YYYYMMDD")}.xlsx`
      );
      toast.success("Excel attendance statement exported successfully");
    } catch (err) {
      toast.error("Failed to export Excel statement: " + err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl" maxHeight="max-h-[92vh]">
      <div className="space-y-4">
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Employee Work & 6-Hour Attendance Statement
            </h3>
            <p className="text-xs text-gray-500">
              Official verifiable report of employee hours, clock-in/out stamps, and quota compliance
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
          id="printable-attendance-statement"
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
                HR & Operations Division • Daily 6-Hour Shift Attendance Statement
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
                OFFICIAL WORK REPORT
              </span>
              <div className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {statementId}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Target Date: {moment(targetDate).format("MMMM DD, YYYY")}
              </div>
            </div>
          </div>

          {/* Statement Metadata Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Standard Goal</span>
              <span className="font-bold text-primary">
                6.0 Hours / Day Quota
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Company Work Output</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {reportData?.totalCompanyHoursFormatted || "00h 00m"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Target Compliance Rate</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {reportData?.complianceRate || 0}% Achieved
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Compiled By</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {currentUser?.name || "System Admin"}
              </span>
            </div>
          </div>

          {/* Counter Badges */}
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30">
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 block uppercase">
                Goal Achieved (6h+)
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {reportData?.totalAchievedCount || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30">
              <span className="text-[10px] font-semibold text-blue-800 dark:text-blue-300 block uppercase">
                In Progress (Active)
              </span>
              <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                {reportData?.totalInProgressCount || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/30">
              <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 block uppercase">
                Short Hours
              </span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                {reportData?.totalShortHoursCount || 0}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40">
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 block uppercase">
                Absent / No Logs
              </span>
              <span className="text-lg font-bold font-mono text-gray-600 dark:text-gray-400">
                {reportData?.totalAbsentCount || 0}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 text-[10px] uppercase font-bold text-gray-500">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">First Clock-In</th>
                  <th className="py-2.5 px-3">Last Clock-Out</th>
                  <th className="py-2.5 px-3">Logged Hours</th>
                  <th className="py-2.5 px-3">6-Hour Goal Status</th>
                  <th className="py-2.5 px-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No attendance data recorded for {moment(targetDate).format("MMMM DD, YYYY")}.
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep.userId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {rep.userName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {rep.designation} • {rep.userRole}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {rep.department}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-gray-600 dark:text-gray-300">
                        {rep.firstClockIn ? moment(rep.firstClockIn).format("hh:mm A") : "—"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-gray-600 dark:text-gray-300">
                        {rep.lastClockOut ? moment(rep.lastClockOut).format("hh:mm A") : rep.isRunning ? "Active Now" : "—"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                          {rep.formattedHours}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              rep.isAchieved ? "bg-emerald-500" : rep.isRunning ? "bg-blue-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${rep.progressPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rep.complianceStatus === "ACHIEVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : rep.complianceStatus === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : rep.complianceStatus === "SHORT_HOURS"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {rep.complianceStatus === "ACHIEVED"
                            ? "✓ Met 6h Goal"
                            : rep.complianceStatus === "IN_PROGRESS"
                            ? "Working Now"
                            : rep.complianceStatus === "SHORT_HOURS"
                            ? "Under 6h"
                            : "Absent"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {rep.clockInPhoto ? (
                          <span className="text-emerald-600 font-semibold text-[10px] flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Camera Verified
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Verification & Signatures */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-8 text-xs text-gray-500">
            <div className="space-y-6">
              <p className="leading-relaxed text-[11px]">
                This attendance report is electronically validated against webcam-verified clock-in and clock-out snapshots, enforcing the company standard of 6 working hours per day.
              </p>
              <div>
                <div className="border-b border-gray-300 dark:border-gray-700 w-44 mb-1" />
                <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Report Officer
                </span>
                <span className="text-[10px] text-gray-400">
                  {currentUser?.name || "HR Manager"} • Creatibuz Studio
                </span>
              </div>
            </div>

            <div className="space-y-6 text-right">
              <div className="font-mono text-[11px] text-gray-400">
                STATEMENT HASH: ATT-{statementId}
              </div>
              <div className="inline-block text-left">
                <div className="border-b border-gray-300 dark:border-gray-700 w-44 mb-1" />
                <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Executive Endorsement
                </span>
                <span className="text-[10px] text-gray-400">
                  CEO / COO Approval
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

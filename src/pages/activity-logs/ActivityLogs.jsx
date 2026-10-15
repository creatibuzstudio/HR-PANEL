import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Globe,
  SlidersHorizontal,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react";
import moment from "moment";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import {
  useGetActivityLogsQuery,
  useGetActivityLogStatsQuery,
  useLazyGetActivityLogsExportQuery,
} from "@/services/activity-logs/activityLogApiSlice";
import AuditStatementModal from "./AuditStatementModal";
import ActivityLogDetailsModal from "./ActivityLogDetailsModal";

export default function ActivityLogs() {
  const { user: currentUser } = useAuth();

  // Filters State
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modals State
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [selectedLogForDetails, setSelectedLogForDetails] = useState(null);

  // Query Params
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim(),
      module,
      action,
      status,
      startDate,
      endDate,
    }),
    [page, limit, search, module, action, status, startDate, endDate]
  );

  // API Hooks
  const {
    data: logsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetActivityLogsQuery(queryParams);

  const { data: statsData } = useGetActivityLogStatsQuery();

  const [triggerExportQuery, { isFetching: isExporting }] =
    useLazyGetActivityLogsExportQuery();

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const totalPages = logsData?.totalPages || 1;
  const stats = statsData || {};

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setModule("ALL");
    setAction("ALL");
    setStatus("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Date Presets
  const applyDatePreset = (preset) => {
    const today = moment().format("YYYY-MM-DD");
    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "7days") {
      setStartDate(moment().subtract(6, "days").format("YYYY-MM-DD"));
      setEndDate(today);
    } else if (preset === "month") {
      setStartDate(moment().startOf("month").format("YYYY-MM-DD"));
      setEndDate(today);
    } else if (preset === "all") {
      setStartDate("");
      setEndDate("");
    }
    setPage(1);
  };

  // Direct Excel Export Handler
  const handleDirectExcelExport = async () => {
    try {
      toast.loading("Compiling complete audit records for export...", { id: "export-load" });
      const exportRes = await triggerExportQuery(queryParams).unwrap();
      const exportLogs = Array.isArray(exportRes) ? exportRes : exportRes?.data || logs;

      const rows = exportLogs.map((log, index) => ({
        "SL #": index + 1,
        "Timestamp": moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        "Operator": log.userName || "System",
        "Email": log.userEmail || "N/A",
        "Role": log.userRole || "N/A",
        "Action": log.action,
        "Module": log.module,
        "Description": log.description,
        "Status": log.status,
        "IP Address": log.ipAddress || "N/A",
        "Device": log.userAgent || "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Statement");

      worksheet["!cols"] = [
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
      ];

      XLSX.writeFile(
        workbook,
        `Creatibuz_Audit_Trail_${moment().format("YYYYMMDD_HHmm")}.xlsx`
      );
      toast.success("Excel audit statement downloaded successfully!", { id: "export-load" });
    } catch (err) {
      toast.error("Failed to export Excel statement: " + err.message, { id: "export-load" });
    }
  };

  // Badge Color Helper for Actions
  const getActionBadgeColor = (actionType) => {
    const act = String(actionType || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("REGISTER")) {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    }
    if (act.includes("DELETE") || act.includes("REJECT") || act.includes("PURGE")) {
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800";
    }
    if (act.includes("DISBURSE") || act.includes("WITHDRAW") || act.includes("APPROVE")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800";
    }
    if (act.includes("LOGIN") || act.includes("AUTH")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
    if (act.includes("SETTINGS")) {
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700";
  };

  // Module Tag Helper
  const getModuleTag = (moduleName) => {
    const mod = String(moduleName || "").toUpperCase();
    switch (mod) {
      case "PAYROLL":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
      case "FINANCE":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
      case "USERS":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300";
      case "ORDERS":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
      case "AUTH":
        return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary via-orange-600 to-amber-600 text-white p-6 rounded-2xl shadow-lg shadow-primary/15 border border-orange-400/30 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-black/20 text-white border border-white/20 backdrop-blur-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrative Audit Ledger
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200 font-semibold bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
            System Activity & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-orange-50/90 max-w-2xl font-normal leading-relaxed">
            Immutable tracking of administrative actions, user changes, payroll disbursements, and financial approvals with verifiable statement downloads.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition-all border border-white/20 shadow-xs cursor-pointer"
            title="Refresh Live Audit Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleDirectExcelExport}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            {isExporting ? "Exporting..." : "Excel Export"}
          </button>

          <button
            type="button"
            onClick={() => setIsStatementModalOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-orange-50 active:scale-95 text-primary font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            Download Statement
          </button>
        </div>

        {/* Ambient background glows */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-indigo-400 dark:hover:border-indigo-800 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                Total Audit Records
              </span>
              <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
                {(stats.totalLogs || total || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
            <span>Historical administrative operations</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-800 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                Activities Today
              </span>
              <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {(stats.todayLogs || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
            <span>Actions executed since 12:00 AM</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-800 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                Active Operators
              </span>
              <h3 className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats.uniqueUsers || 1} Members
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
            <span>Unique team members initiating actions</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-800 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                Top Active Category
              </span>
              <h3 className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                {Object.keys(stats.byModule || {})[0] || "PAYROLL"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
            <span>Highest operation frequency module</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by actor name, email, action, module, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyDatePreset("today")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("7days")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset("month")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Dropdowns & Date Pickers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t dark:border-gray-800/80 text-xs">
          {/* Module Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Module
            </label>
            <select
              value={module}
              onChange={(e) => {
                setModule(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">All Modules</option>
              <option value="AUTH">Authentication</option>
              <option value="USERS">User Management</option>
              <option value="PAYROLL">Payroll & Salary</option>
              <option value="FINANCE">Finance & Pools</option>
              <option value="ORDERS">Client Orders</option>
              <option value="BLOGS">Blogs</option>
              <option value="CASE_STUDIES">Case Studies</option>
              <option value="PACKAGES">Packages</option>
              <option value="SETTINGS">System Settings</option>
              <option value="SYSTEM">System Engine</option>
            </select>
          </div>

          {/* Action Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Action Type
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE">Create Record</option>
              <option value="UPDATE">Update Record</option>
              <option value="DELETE">Delete Record</option>
              <option value="DISBURSE_PAYROLL">Disburse Payroll</option>
              <option value="WITHDRAW_SHARE">Withdraw Share</option>
              <option value="APPROVE_EXPENSE">Approve Expense</option>
              <option value="UPDATE_SETTINGS">Update Settings</option>
              <option value="EXPORT_REPORT">Export Report</option>
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Result Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Activity Logs Table */}
      <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Stream & Event Ledger
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {logs.length} of {total} operations recorded
            </p>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
              <tr>
                <th className="px-5 py-3">Operator</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Module</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">IP & Device</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    Loading real-time audit ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center px-4 space-y-2">
                    <ShieldAlert className="w-8 h-8 text-gray-400 mx-auto" />
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No activity logs match your filter criteria
                    </div>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Try clearing search keywords or resetting module and date filters to see more results.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors mt-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                    </button>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Operator */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                          {log.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {log.userName || "System User"}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                            {log.userEmail || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${getModuleTag(
                          log.module
                        )}`}
                      >
                        {log.module}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 max-w-xs md:max-w-md">
                      <p className="line-clamp-2 leading-relaxed">
                        {log.description}
                      </p>
                    </td>

                    {/* IP & Device */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-gray-500">
                      <div>{log.ipAddress || "127.0.0.1"}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[120px]" title={log.userAgent}>
                        {log.userAgent ? (log.userAgent.includes("Mac") ? "Mac OS" : log.userAgent.includes("Win") ? "Windows" : "Mobile / Web") : "Web Console"}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                        {moment(log.createdAt).format("MMM DD, YYYY")}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {moment(log.createdAt).format("hh:mm A")}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          log.status === "FAILED"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : log.status === "WARNING"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}
                      >
                        {log.status === "FAILED" ? (
                          <XCircle className="w-3 h-3" />
                        ) : log.status === "WARNING" ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {log.status || "SUCCESS"}
                      </span>
                    </td>

                    {/* Details Action */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedLogForDetails(log)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-700 dark:text-gray-300 transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="View Full Payload Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing{" "}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {logs.length > 0 ? (page - 1) * limit + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-bold text-gray-800 dark:text-gray-200">{total}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-gray-800 dark:text-gray-200">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Statement Modal (Printable & Excel) */}
      <AuditStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        logs={logs}
        filters={{ module, action, status, startDate, endDate }}
        stats={stats}
        currentUser={currentUser}
      />

      {/* Deep-Dive Inspection Modal */}
      <ActivityLogDetailsModal
        isOpen={!!selectedLogForDetails}
        onClose={() => setSelectedLogForDetails(null)}
        log={selectedLogForDetails}
      />
    </div>
  );
}

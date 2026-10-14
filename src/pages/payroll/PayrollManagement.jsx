import React, { useState, useMemo } from "react";
import {
  useGetPayrollSummaryQuery,
  useGeneratePayrollMutation,
  useGetPayrollHistoryQuery,
} from "@/services/payroll/payrollApiSlice";
import { useGetFinanceOverviewQuery } from "@/services/finance/financeApiSlice";
import ExecutiveWithdrawalModal from "./ExecutiveWithdrawalModal";
import EmployeePayslipModal from "./EmployeePayslipModal";
import DisbursePayrollModal from "./DisbursePayrollModal";
import PayrollHistoryModal from "./PayrollHistoryModal";

import PrimaryButton from "@/components/ui/buttons/primary-button";
import {
  DollarSign,
  TrendingUp,
  Banknote,
  ShieldCheck,
  Building,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Briefcase,
  History,
  Printer,
  Search,
  AlertCircle,
  FileText,
  ShieldAlert,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import moment from "moment";

export default function PayrollManagement() {
  const { user } = useAuth();

  // Restrict to CEO and COO
  const isExecutive =
    user?.role?.toLowerCase() === "ceo" ||
    user?.role?.toLowerCase() === "coo" ||
    user?.type?.toLowerCase() === "ceo" ||
    user?.type?.toLowerCase() === "coo";

  // Selected Month (Default to current month 'YYYY-MM')
  const defaultMonth = useMemo(() => {
    return moment().format("YYYY-MM");
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [withdrawalModalState, setWithdrawalModalState] = useState({
    isOpen: false,
    role: "ceo",
    data: null,
  });

  const [payslipModalState, setPayslipModalState] = useState({
    isOpen: false,
    employee: null,
  });

  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Queries & Mutations
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useGetPayrollSummaryQuery(selectedMonth);

  const {
    data: historyData = [],
    refetch: refetchHistory,
  } = useGetPayrollHistoryQuery();

  const {
    data: financeOverview,
    refetch: refetchFinance,
  } = useGetFinanceOverviewQuery();

  const [generatePayroll, { isLoading: isGenerating }] =
    useGeneratePayrollMutation();

  const handleRefresh = () => {
    refetchSummary();
    refetchHistory();
    refetchFinance();
    toast.success("Payroll data refreshed");
  };

  const handlePrevMonth = () => {
    const prev = moment(selectedMonth, "YYYY-MM").subtract(1, "month").format("YYYY-MM");
    setSelectedMonth(prev);
  };

  const handleNextMonth = () => {
    const next = moment(selectedMonth, "YYYY-MM").add(1, "month").format("YYYY-MM");
    setSelectedMonth(next);
  };

  const handleGenerateSnapshot = async () => {
    try {
      await generatePayroll({
        monthYear: selectedMonth,
        monthName: summaryData?.monthName,
      }).unwrap();
      toast.success(
        `Payroll snapshot for ${summaryData?.monthName || selectedMonth} generated successfully!`
      );
      refetchSummary();
      refetchHistory();
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || "Failed to generate payroll snapshot"
      );
    }
  };

  // Calculations & Helpers
  const monthName = summaryData?.monthName || moment(selectedMonth, "YYYY-MM").format("MMMM YYYY");
  const isPaid = summaryData?.status === "paid";
  const revenueBasis = Number(summaryData?.revenueBasis?.effectiveMonthlyRevenue || 0);

  const pools = summaryData?.pools || {};
  const employeePool = pools.employeePool || {};
  const leadershipPool = pools.leadershipPool || {};

  const executives = summaryData?.executives || {};
  const ceo = executives.ceo || {};
  const coo = executives.coo || {};

  const employees = summaryData?.employees || [];

  // Filter employees by search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  if (!isExecutive) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center bg-white dark:bg-[#1a191b] rounded-2xl border border-red-200 dark:border-red-900/40 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Executive Access Only
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            The Monthly Payroll & Profit Share Distribution portal is strictly accessible only to users with the <strong>CEO</strong> and <strong>COO</strong> roles.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Month Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payroll & Profit Distribution
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Monthly Cycle Engine
            </span>
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              1 Withdrawal / Month Policy
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
            Distribute Finance Employee Pool % on top of base salaries & process CEO/COO monthly withdrawals
          </p>
        </div>

        {/* Month Selector Bar & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month Controller */}
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-bold bg-transparent border-none text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {selectedMonth !== defaultMonth && (
            <button
              onClick={() => setSelectedMonth(defaultMonth)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Current Month
            </button>
          )}

          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Refresh Summary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-indigo-500" />
            Archives
          </button>

          <PrimaryButton
            onClick={handleGenerateSnapshot}
            isLoading={isGenerating}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Month Snapshot
          </PrimaryButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Month Revenue Basis */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                {monthName} Revenue Basis
              </span>
              <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
                ${revenueBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
            <span>Collected order payments</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                isPaid
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              }`}
            >
              {isPaid ? "Disbursed" : "Draft Cycle"}
            </span>
          </div>
        </div>

        {/* Employee Pool */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                Employee Profit Pool ({employeePool.percent || 30}%)
              </span>
              <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ${Number(employeePool.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
            <span>{employeePool.totalEligibleCount || employees.length} active employee(s)</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              Allocated: {summaryData?.summary?.totalAllocatedPercent || employeePool.totalAllocatedPercent || 0}% of Pool
            </span>
          </div>
        </div>

        {/* CEO Monthly Share */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 block font-semibold">
                CEO Share ({ceo.percent || 20}% of Revenue)
              </span>
              <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
                ${Number(ceo.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Monthly Entitlement</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                ceo.isWithdrawn
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              }`}
            >
              {ceo.isWithdrawn ? "Withdrawn" : "Available"}
            </span>
          </div>
        </div>

        {/* COO Monthly Share */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400 block font-semibold">
                COO Share ({coo.percent || 40}% of Revenue)
              </span>
              <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
                ${Number(coo.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Monthly Entitlement</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                coo.isWithdrawn
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300"
              }`}
            >
              {coo.isWithdrawn ? "Withdrawn" : "Available"}
            </span>
          </div>
        </div>
      </div>

      {/* Executive Monthly Withdrawal Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Executive Monthly Dividends & Withdrawals
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Each executive can withdraw their calculated percentage share <strong>once per calendar month</strong>
            </p>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Cycle: {monthName}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* CEO Card */}
          <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/15 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {ceo.user?.picture ? (
                  <img
                    src={ceo.user.picture}
                    alt={ceo.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
                    {ceo.user?.name?.charAt(0).toUpperCase() || "C"}
                  </div>
                )}
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    Chief Executive Officer (CEO)
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                    {ceo.user?.name || "CEO Not Assigned"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ceo.user?.email || "ceo@creatibuzstudio.com"}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                {ceo.percent || 20}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-amber-200/60 dark:border-amber-800/30 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-gray-500 block">Monthly Share:</span>
                <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${Number(ceo.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                {ceo.isWithdrawn ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Withdrawn
                    </span>
                    {ceo.item?.paidAt && (
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {moment(ceo.item.paidAt).format("MMM DD, YYYY")}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setWithdrawalModalState({
                        isOpen: true,
                        role: "ceo",
                        data: ceo,
                      })
                    }
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow flex items-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Withdraw Share
                  </button>
                )}
              </div>
            </div>

            {ceo.isWithdrawn && ceo.item && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between border-t border-amber-200/50 dark:border-amber-900/40 pt-2">
                <span className="font-mono text-[11px]">
                  Voucher: {ceo.item.voucherNumber || "DIV-CEO"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPayslipModalState({
                      isOpen: true,
                      employee: {
                        ...ceo.item,
                        name: ceo.user?.name || "CEO Executive",
                        role: "CEO",
                        department: "Executive Board",
                        designation: "Chief Executive Officer",
                        baseSalary: 0,
                        profitShareAmount: ceo.amount,
                        netPayable: ceo.amount,
                      },
                    })
                  }
                  className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> View Voucher
                </button>
              </div>
            )}
          </div>

          {/* COO Card */}
          <div className="p-5 rounded-xl border border-violet-200 dark:border-violet-800/40 bg-violet-50/40 dark:bg-violet-950/15 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {coo.user?.picture ? (
                  <img
                    src={coo.user.picture}
                    alt={coo.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-violet-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-lg">
                    {coo.user?.name?.charAt(0).toUpperCase() || "O"}
                  </div>
                )}
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-violet-200 text-violet-900 dark:bg-violet-900 dark:text-violet-200">
                    Chief Operating Officer (COO)
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                    {coo.user?.name || "COO Not Assigned"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {coo.user?.email || "coo@creatibuzstudio.com"}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200">
                {coo.percent || 40}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-violet-200/60 dark:border-violet-800/30 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-gray-500 block">Monthly Share:</span>
                <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${Number(coo.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                {coo.isWithdrawn ? (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Withdrawn
                    </span>
                    {coo.item?.paidAt && (
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {moment(coo.item.paidAt).format("MMM DD, YYYY")}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setWithdrawalModalState({
                        isOpen: true,
                        role: "coo",
                        data: coo,
                      })
                    }
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow flex items-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Withdraw Share
                  </button>
                )}
              </div>
            </div>

            {coo.isWithdrawn && coo.item && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between border-t border-violet-200/50 dark:border-violet-900/40 pt-2">
                <span className="font-mono text-[11px]">
                  Voucher: {coo.item.voucherNumber || "DIV-COO"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPayslipModalState({
                      isOpen: true,
                      employee: {
                        ...coo.item,
                        name: coo.user?.name || "COO Executive",
                        role: "COO",
                        department: "Executive Board",
                        designation: "Chief Operating Officer",
                        baseSalary: 0,
                        profitShareAmount: coo.amount,
                        netPayable: coo.amount,
                      },
                    })
                  }
                  className="text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> View Voucher
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Payroll Table Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        {/* Table Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Employee Payroll & Profit Pool Distribution
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Finance Employee Pool ({employeePool.percent || 30}%) distributed strictly by each employee's configured %
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Disburse All Button */}
            <PrimaryButton
              onClick={() => setIsDisburseModalOpen(true)}
              disabled={isPaid || employees.length === 0}
              className={`text-xs px-4 flex items-center gap-1.5 ${
                isPaid ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              {isPaid ? "Payroll Disbursed" : "Disburse Employee Payroll"}
            </PrimaryButton>
          </div>
        </div>

        {/* Employee Table */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Salary Share (%)</th>
                <th className="py-3 px-4">Employee Pool Basis</th>
                <th className="py-3 px-4 font-bold text-gray-900 dark:text-white">Net Monthly Payout ($)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-gray-700 dark:text-gray-300">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    No employees found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const empPaid =
                    emp.paymentStatus === "paid" || emp.paymentStatus === "withdrawn" || isPaid;
                  return (
                    <tr
                      key={emp.userId || index}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          {emp.picture ? (
                            <img
                              src={emp.picture}
                              alt={emp.name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                              {emp.name?.charAt(0).toUpperCase() || "E"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-normal">
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="capitalize inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {emp.designation || emp.role}
                          </span>
                          <span className="text-[11px] text-gray-400 block">
                            {emp.department}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                          {Number(emp.poolSharePercent ?? emp.baseSalary ?? 0)}% of Pool
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-500 dark:text-gray-400">
                        ${Number(employeePool.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-primary">
                        ${Number(emp.netPayable || emp.profitShareAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            empPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {empPaid ? (
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

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setPayslipModalState({
                              isOpen: true,
                              employee: {
                                ...emp,
                                paymentStatus: empPaid ? "paid" : "pending",
                              },
                            })
                          }
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors inline-flex items-center gap-1.5"
                          title="Generate printable payslip"
                        >
                          <Printer className="w-3.5 h-3.5 text-primary" />
                          <span>Payslip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExecutiveWithdrawalModal
        isOpen={withdrawalModalState.isOpen}
        onClose={() =>
          setWithdrawalModalState({ isOpen: false, role: "ceo", data: null })
        }
        monthYear={selectedMonth}
        monthName={monthName}
        role={withdrawalModalState.role}
        executiveData={withdrawalModalState.data}
        onSuccess={() => {
          refetchSummary();
          refetchHistory();
        }}
      />

      <EmployeePayslipModal
        isOpen={payslipModalState.isOpen}
        onClose={() => setPayslipModalState({ isOpen: false, employee: null })}
        employee={payslipModalState.employee}
        monthName={monthName}
        monthYear={selectedMonth}
      />

      <DisbursePayrollModal
        isOpen={isDisburseModalOpen}
        onClose={() => setIsDisburseModalOpen(false)}
        monthYear={selectedMonth}
        monthName={monthName}
        summaryData={summaryData}
        onSuccess={() => {
          refetchSummary();
          refetchHistory();
        }}
      />

      <PayrollHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={historyData}
        onSelectMonth={(m) => setSelectedMonth(m)}
      />
    </div>
  );
}

import React, { useState } from "react";
import {
  useGetFinanceOverviewQuery,
  useGetFinanceSettingsQuery,
  useGetFinanceExecutivesQuery,
  useGetCapitalsQuery,
  useGetExpensesQuery,
} from "@/services/finance/financeApiSlice";
import FinancePieChart from "./FinancePieChart";
import ExecutiveTable from "./ExecutiveTable";
import ExpensesTable from "./ExpensesTable";
import CapitalsTable from "./CapitalsTable";
import DistributionSettings from "./DistributionSettings";
import AddCapitalModal from "./AddCapitalModal";
import AddExpenseModal from "./AddExpenseModal";
import ApproveExpenseModal from "./ApproveExpenseModal";
import QuickAdjustPercentagesModal from "./QuickAdjustPercentagesModal";

import PrimaryButton from "@/components/ui/buttons/primary-button";
import {
  DollarSign,
  TrendingUp,
  Coins,
  ShieldCheck,
  Building,
  Users,
  Sliders,
  Plus,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Briefcase,
  Edit,
  ShieldAlert,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function FinanceManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("executives");

  // Strictly enforce role CEO or COO only
  const isExecutive =
    user?.role?.toLowerCase() === "ceo" ||
    user?.role?.toLowerCase() === "coo" ||
    user?.type?.toLowerCase() === "ceo" ||
    user?.type?.toLowerCase() === "coo";

  // Modals state
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isQuickAdjustModalOpen, setIsQuickAdjustModalOpen] = useState(false);
  const [reviewExpenseModalState, setReviewExpenseModalState] = useState({
    isOpen: false,
    expense: null,
  });

  // Queries
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useGetFinanceOverviewQuery();

  const {
    data: settings,
    isLoading: isSettingsLoading,
    refetch: refetchSettings,
  } = useGetFinanceSettingsQuery();

  const {
    data: executivesData,
    isLoading: isExecutivesLoading,
    refetch: refetchExecutives,
  } = useGetFinanceExecutivesQuery();

  const {
    data: capitals = [],
    isLoading: isCapitalsLoading,
    refetch: refetchCapitals,
  } = useGetCapitalsQuery();

  const {
    data: expenses = [],
    isLoading: isExpensesLoading,
    refetch: refetchExpenses,
  } = useGetExpensesQuery();

  const handleRefreshAll = () => {
    refetchOverview();
    refetchSettings();
    refetchExecutives();
    refetchCapitals();
    refetchExpenses();
  };

  const summary = overview?.summary || {};
  const pools = overview?.pools || {};
  const executives = overview?.executives || {};

  const totalRevenue = Number(summary.totalOrderRevenue || 0);
  const totalCapital = Number(summary.totalInvestorCapital || 0);
  const totalApprovedExpenses = Number(summary.totalApprovedExpenses || 0);
  const totalTreasury = Number(summary.totalTreasuryBalance || 0);
  const pendingCount = Number(summary.pendingExpenseCount || 0);

  const costAllocated = Number(pools.companyCost?.allocated || 0);
  const costSpent = Number(pools.companyCost?.spent || 0);
  const costRemaining = Number(pools.companyCost?.netBalance || 0);
  const costSpendPercent =
    costAllocated > 0 ? Math.min(100, (costSpent / costAllocated) * 100) : 0;

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
            The Company Finance, Cost Approval, and Profit Sharing portal is confidential and strictly accessible only to users with the <strong>CEO</strong> and <strong>COO</strong> roles.
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Finance & Dynamic Profit Sharing
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              Live Real-Time Engine
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
            Dynamic revenue split (Company Cost, Employees, CEO & COO), dual executive expense approvals & investor capital
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshAll}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Refresh All Financial Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsQuickAdjustModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            title="Dynamically edit company cost %, employee pool %, leadership % and CEO/COO share ratios"
          >
            <Sliders className="w-4 h-4 text-primary" />
            Adjust % Split
          </button>
          <button
            onClick={() => setIsCapitalModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors flex items-center gap-1.5"
          >
            <Coins className="w-4 h-4 text-emerald-500" />
            + Record Capital
          </button>
          <PrimaryButton
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" />
            Request Expense Requisition
          </PrimaryButton>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Order Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                Total Order Revenue
              </span>
              <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <span>Collected advance & order payments</span>
          </p>
        </div>

        {/* Total Investor Capital */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                Investor Capital
              </span>
              <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ${totalCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
            <span>{capitals.length} recorded equity / capital tranche(s)</span>
          </p>
        </div>

        {/* Approved Company Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                Approved Company Costs
              </span>
              <h3 className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
                ${totalApprovedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-3 flex items-center justify-between">
            <span>Deducted from Cost Fund</span>
            {pendingCount > 0 && (
              <span className="text-amber-600 font-semibold">
                {pendingCount} pending review
              </span>
            )}
          </p>
        </div>

        {/* Net Treasury Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white shadow-sm relative overflow-hidden border border-indigo-800/60">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-indigo-200 block">
                Total Company Treasury
              </span>
              <h3 className="text-2xl font-mono font-bold text-white mt-1">
                ${totalTreasury.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 text-white">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-indigo-300 mt-3">
            Capital + Revenue - Approved Costs
          </p>
        </div>
      </div>

      {/* Visual Dynamic Allocation: Pie Chart & Pool Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Dynamic Pie Chart */}
        <div className="lg:col-span-7">
          <FinancePieChart overview={overview} />
        </div>

        {/* Right: Pool Breakdown Cards */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              Dynamic Pool Allocations
            </span>
            <button
              type="button"
              onClick={() => setIsQuickAdjustModalOpen(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1"
            >
              <Edit className="w-3 h-3" /> Adjust Percentages
            </button>
          </div>

          {/* Company Cost Fund Card */}
          <div
            onClick={() => setIsQuickAdjustModalOpen(true)}
            className="p-4 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
            title="Click to adjust percentage"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  Company Cost Fund ({pools.companyCost?.percent || 40}%)
                  <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                </h4>
              </div>
              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                ${costAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Spent vs Remaining Progress */}
            <div className="space-y-1">
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${costSpendPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Spent: ${costSpent.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Remaining: ${costRemaining.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Employee Pool Card */}
          <div
            onClick={() => setIsQuickAdjustModalOpen(true)}
            className="p-4 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group"
            title="Click to adjust percentage"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  Employee Profit Pool ({pools.employeePool?.percent || 30}%)
                  <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
                </h4>
              </div>
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                ${Number(pools.employeePool?.allocated || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Accumulated profit share reserve designated for company staff & engineering teams
            </p>
          </div>

          {/* Executive Leadership Pool Card */}
          <div
            onClick={() => setIsQuickAdjustModalOpen(true)}
            className="p-4 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-2.5 cursor-pointer hover:border-amber-300 dark:hover:border-amber-800 transition-all group"
            title="Click to adjust CEO & COO percentages"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  Executive Leadership Pool ({pools.leadershipPool?.percent || 30}%)
                  <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-500 transition-opacity" />
                </h4>
              </div>
              <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                ${Number(pools.leadershipPool?.allocated || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Visual dual dynamic ratio split bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 flex overflow-hidden">
                <div
                  className="bg-amber-500 h-2 transition-all duration-500"
                  style={{ width: `${executives.ceo?.shareRatioOfLeadership || 50}%` }}
                  title={`CEO: ${executives.ceo?.percent || executives.ceo?.effectivePercentOfTotalRevenue || 20}% of revenue (${executives.ceo?.shareRatioOfLeadership || 50}% of pool)`}
                />
                <div
                  className="bg-violet-500 h-2 transition-all duration-500"
                  style={{ width: `${executives.coo?.shareRatioOfLeadership || 50}%` }}
                  title={`COO: ${executives.coo?.percent || executives.coo?.effectivePercentOfTotalRevenue || 40}% of revenue (${executives.coo?.shareRatioOfLeadership || 50}% of pool)`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  CEO: {executives.ceo?.percent || executives.ceo?.effectivePercentOfTotalRevenue || 20}% of revenue ({executives.ceo?.shareRatioOfLeadership || 50}% of pool)
                </span>
                <span className="text-violet-600 dark:text-violet-400 font-semibold">
                  COO: {executives.coo?.percent || executives.coo?.effectivePercentOfTotalRevenue || 40}% of revenue ({executives.coo?.shareRatioOfLeadership || 50}% of pool)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t dark:border-gray-800">
              <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 text-xs">
                <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold block">
                  CEO ({executives.ceo?.percent || executives.ceo?.effectivePercentOfTotalRevenue || 20}% of revenue)
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${Number(executives.ceo?.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-violet-50/60 dark:bg-violet-950/20 text-xs">
                <span className="text-[11px] text-violet-800 dark:text-violet-300 font-semibold block">
                  COO ({executives.coo?.percent || executives.coo?.effectivePercentOfTotalRevenue || 40}% of revenue)
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${Number(executives.coo?.totalEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b dark:border-gray-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("executives")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "executives"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          Executive Table (Role: CEO & COO)
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "expenses"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Building className="w-4 h-4 text-indigo-500" />
          Company Costs & Dual Approvals
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("capitals")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "capitals"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-500" />
          Investor Capital Portfolio
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Sliders className="w-4 h-4 text-primary" />
          Distribution & User API Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "executives" && (
          <ExecutiveTable
            overview={overview}
            executivesData={executivesData}
            onOpenSettings={() => setActiveTab("settings")}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTable
            expenses={expenses}
            isLoading={isExpensesLoading}
            onRequestExpense={() => setIsExpenseModalOpen(true)}
            onReviewExpense={(expense) =>
              setReviewExpenseModalState({ isOpen: true, expense })
            }
          />
        )}

        {activeTab === "capitals" && (
          <CapitalsTable
            capitals={capitals}
            isLoading={isCapitalsLoading}
            onAddCapital={() => setIsCapitalModalOpen(true)}
          />
        )}

        {activeTab === "settings" && (
          <DistributionSettings
            settings={settings}
            executivesData={executivesData}
            onRefetch={handleRefreshAll}
          />
        )}
      </div>

      {/* Modals */}
      <AddCapitalModal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <ApproveExpenseModal
        isOpen={reviewExpenseModalState.isOpen}
        expense={reviewExpenseModalState.expense}
        onClose={() =>
          setReviewExpenseModalState({ isOpen: false, expense: null })
        }
      />

      <QuickAdjustPercentagesModal
        isOpen={isQuickAdjustModalOpen}
        onClose={() => setIsQuickAdjustModalOpen(false)}
        settings={settings}
        overview={overview}
        onUpdated={handleRefreshAll}
      />
    </div>
  );
}

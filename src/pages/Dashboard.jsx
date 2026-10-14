import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetDashboardStatsQuery } from "@/services/stats/statsApiSlice";
import useAuth from "@/hooks/useAuth";
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
  Layers,
  FileText,
  Package,
  Award,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Cake,
  Gift,
  UserPlus,
  Calendar,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: statsData, isLoading, refetch, isFetching } = useGetDashboardStatsQuery();

  const [activeChartTab, setActiveChartTab] = useState("revenue"); // "revenue" | "orders"

  const overview = statsData?.overview || {};
  const charts = statsData?.charts || {};
  const recentOrders = statsData?.recentOrders || [];
  const upcomingBirthdays = statsData?.upcomingBirthdays || [];
  const newJoiners = statsData?.newJoiners || [];

  const revenueTrend = charts.revenueTrend || [];
  const orderStatusDistribution = charts.orderStatusDistribution || [];
  const profitDistribution = charts.profitDistribution || [];

  const isExecutive =
    user?.role?.toLowerCase() === "ceo" ||
    user?.role?.toLowerCase() === "coo" ||
    user?.type?.toLowerCase() === "ceo" ||
    user?.type?.toLowerCase() === "coo";

  const totalRevenue = Number(overview.totalRevenue || 0);
  const totalInvoiced = Number(overview.totalInvoiced || 0);
  const totalDue = Number(overview.totalDue || 0);
  const totalTreasury = Number(overview.totalTreasury || 0);
  const totalOrders = Number(overview.totalOrders || 0);
  const completedOrders = Number(overview.completedOrders || 0);
  const ongoingOrders = Number(overview.ongoingOrders || 0);
  const totalClients = Number(overview.totalClients || 0);
  const totalEmployees = Number(overview.totalEmployees || 0);
  const totalBlogs = Number(overview.totalBlogs || 0);
  const totalCaseStudies = Number(overview.totalCaseStudies || 0);

  const pools = overview.pools || {};
  const leadershipPool = pools.leadershipPool || {};

  const getOrderStatusBadge = (status) => {
    const st = String(status || "").toLowerCase();
    switch (st) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800";
      case "qa test":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800";
      case "delivery":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }
  };

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[160px]">
          <p className="font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-1">
            {label} Trend
          </p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center gap-3">
              <span className="flex items-center gap-1.5 text-gray-500">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {entry.name.toLowerCase().includes("order")
                  ? entry.value
                  : `$${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl shadow-sm border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/10 text-indigo-200 border border-white/20">
              Enterprise Dashboard
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Executive"}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
            Live operations, financial collections, project pipeline, and dynamic profit distribution engine.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
            title="Refresh Live Statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          {isExecutive && (
            <Link
              to="/finance"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" /> Finance & Profit Sharing
            </Link>
          )}
          {isExecutive && (
            <Link
              to="/orders"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> New Order
            </Link>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Core Statistics Cards */}
      {isExecutive ? (
        <>
          {/* Executive Tier: Confidential Financial Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Collected Revenue */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-indigo-400 dark:hover:border-indigo-800 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                    Collected Revenue (Inflow)
                  </span>
                  <h3 className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-1">
                    ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
                <span>Invoiced: ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Due: ${totalDue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Total Client Orders */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-800 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                    Total Client Orders
                  </span>
                  <h3 className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {totalOrders}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {completedOrders} Delivered
                </span>
                <span>{ongoingOrders} In Progress</span>
              </div>
            </div>

            {/* Corporate Treasury Balance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-800 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                    Total Company Treasury
                  </span>
                  <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ${totalTreasury.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
                <span>Capital: ${Number(overview.totalInvestorCapital || 0).toLocaleString()}</span>
                <span className="text-rose-600 dark:text-rose-400">
                  Costs: ${Number(overview.totalApprovedExpenses || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Executive Leadership Pool (CEO & COO) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-800 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                    Leadership Pool ({leadershipPool.percent || 30}%)
                  </span>
                  <h3 className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                    ${Number(leadershipPool.allocated || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
                <span className="text-amber-700 dark:text-amber-400 font-semibold">
                  CEO: {leadershipPool.ceoPercent ?? (leadershipPool.percent ? Number((leadershipPool.percent * 0.5).toFixed(1)) : 15)}% (${Number(leadershipPool.ceoAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })})
                </span>
                <span className="text-violet-700 dark:text-violet-400 font-semibold">
                  COO: {leadershipPool.cooPercent ?? (leadershipPool.percent ? Number((leadershipPool.percent * 0.5).toFixed(1)) : 15)}% (${Number(leadershipPool.cooAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })})
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Operational Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Active Clients</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                  {totalClients}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Team Experts</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                  {totalEmployees}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Case Studies</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                  {totalCaseStudies}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Published Blogs</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                  {totalBlogs}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Operational Tier: Non-Executive Staff Dashboard (Confidential financial pools hidden) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-800 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                  Project Deliverables
                </span>
                <h3 className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {totalOrders}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {completedOrders} Delivered
              </span>
              <span>{ongoingOrders} Ongoing</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-indigo-400 dark:hover:border-indigo-800 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                  Active Clients
                </span>
                <h3 className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {totalClients}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
              <span>Managed by engineering teams</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-800 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                  Team Experts
                </span>
                <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {totalEmployees}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
              <span>Staff & Developers Active</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-800 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                  Published Content
                </span>
                <h3 className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {totalCaseStudies + totalBlogs}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
              <span>{totalCaseStudies} Case Studies</span>
              <span>{totalBlogs} Blogs</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Revenue & Orders Inflow Trends Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Revenue & Financial Collections Inflow
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Monthly revenue collections (advance payments) vs total invoiced client order values
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {isExecutive && (
                <button
                  type="button"
                  onClick={() => setActiveChartTab("revenue")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    activeChartTab === "revenue"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Revenue Flow ($)
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveChartTab("orders")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeChartTab === "orders" || !isExecutive
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Order Volume
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === "revenue" ? (
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Collected Revenue"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiced"
                    name="Invoiced Project Value"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#invoicedGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="orders" name="Order Deliveries Count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Order Status Distribution & Dynamic Allocation */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-500" />
              Order Pipeline Distribution
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live status breakdown of all client contracts & deliverables
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} orders`, name]}
                  contentStyle={{
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                    color: "#fff",
                    border: "none",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Chips */}
          <div className="space-y-1.5 pt-2 border-t dark:border-gray-800">
            {orderStatusDistribution.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">{item.value} order(s)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Milestones & People Hub: Upcoming Birthdays & Recent Joins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (6 cols): Upcoming Birthdays */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-pink-500/5 via-rose-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-sm border border-pink-200 dark:border-pink-800/60">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    Upcoming Birthdays
                    {upcomingBirthdays.some((b) => b.isToday) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-500 text-white animate-bounce shadow-sm">
                        🎉 Birthday Today!
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Team members' special days countdown from user records
                  </p>
                </div>
              </div>

              <Link
                to="/user-management/all-users"
                className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                title="Manage employee birthdays"
              >
                Team List <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 divide-y divide-gray-100 dark:divide-gray-800/80">
              {upcomingBirthdays.length === 0 ? (
                <div className="py-8 text-center px-4 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-400 flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    No Upcoming Birthdays Registered
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Add birth dates to user profiles in User Management to see live upcoming birthday celebrations and alerts here.
                  </p>
                  <Link
                    to="/user-management/all-users"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 hover:bg-pink-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Set Birthdays in User Management
                  </Link>
                </div>
              ) : (
                upcomingBirthdays.map((item) => (
                  <div
                    key={item.id}
                    className={`py-3 flex items-center justify-between gap-3 transition-colors rounded-xl px-2.5 ${
                      item.isToday
                        ? "bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-transparent border border-pink-500/30 shadow-sm"
                        : "hover:bg-gray-50/70 dark:hover:bg-gray-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={
                            item.picture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.name || "User"
                            )}&background=EC4899&color=fff&size=128`
                          }
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-pink-300 dark:border-pink-700 flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.name || "User"
                            )}&background=EC4899&color=fff&size=128`;
                          }}
                        />
                        {item.isToday && (
                          <span className="absolute -bottom-1 -right-1 text-xs">
                            🎂
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                          {item.name}
                          <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {item.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.designation} • {item.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200 flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3 text-pink-500" />
                        {item.formattedDate}
                      </div>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isToday
                            ? "bg-pink-500 text-white animate-pulse shadow-sm"
                            : item.daysRemaining === 1
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                            : "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                        }`}
                      >
                        {item.statusText}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50/60 dark:bg-gray-800/30 border-t dark:border-gray-800 text-[11px] text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Automated milestone alerts
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {upcomingBirthdays.length} birthday(s) upcoming
            </span>
          </div>
        </div>

        {/* Right (6 cols): Recent Team Joiners */}
        <div className="lg:col-span-6 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm border border-indigo-200 dark:border-indigo-800/60">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    Recent Team Joiners
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Real-time Feed
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Newly onboarded members with exact date & timestamp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/register`;
                    navigator.clipboard.writeText(url);
                    toast.success("Employee Registration link copied! Share it with new joiners.");
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center gap-1 cursor-pointer"
                  title="Copy shareable link for employee registration"
                >
                  <Share2 className="w-3 h-3" />
                  Copy Join Link
                </button>
                <Link
                  to="/user-management/all-users"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  title="View all users"
                >
                  All Users <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="p-4 divide-y divide-gray-100 dark:divide-gray-800/80">
              {newJoiners.length === 0 ? (
                <div className="py-8 text-center px-4 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    No Team Members Recorded
                  </div>
                  <p className="text-xs text-gray-500">
                    Newly added team members will automatically appear here with their joining timestamp.
                  </p>
                </div>
              ) : (
                newJoiners.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors rounded-xl px-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={
                            item.picture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.name || "User"
                            )}&background=4F46E5&color=fff&size=128`
                          }
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-800 flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.name || "User"
                            )}&background=4F46E5&color=fff&size=128`;
                          }}
                        />
                        {item.isNew && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" title="New Joiner" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                          {item.name}
                          <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {item.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.designation} • {item.department}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-0.5">
                      <div className="text-xs font-semibold text-gray-900 dark:text-white flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {item.relativeTime}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400" title="Exact Join Timestamp">
                        {item.fullDateTime}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-gray-50/60 dark:bg-gray-800/30 border-t dark:border-gray-800 text-[11px] text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Directly synced from User Registry
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {newJoiners.length} latest member(s)
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Live Table & Fast Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Live Client Orders */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Recent Client Orders & Projects
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time feed of active contracts, collected advance, and progress
              </p>
            </div>
            {isExecutive && (
              <Link
                to="/orders"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All Orders <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3">Project / Client</th>
                  <th className="px-5 py-3">Invoice</th>
                  {isExecutive && <th className="px-5 py-3">Budget</th>}
                  {isExecutive && <th className="px-5 py-3">Collected</th>}
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={isExecutive ? 5 : 3} className="px-5 py-8 text-center text-xs text-gray-400">
                      No client orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {ord.projectName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ord.clientName} {ord.clientEmail !== "N/A" && `• ${ord.clientEmail}`}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                        {ord.invoiceNumber}
                      </td>
                      {isExecutive && (
                        <td className="px-5 py-3.5 font-mono font-medium text-gray-900 dark:text-white">
                          ${ord.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      {isExecutive && (
                        <td className="px-5 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${ord.advance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      )}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border ${getOrderStatusBadge(
                            ord.status,
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Action Hub */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Quick Action Management Hub
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct access to company management modules
            </p>
          </div>

          <div className="space-y-2.5">
            {isExecutive && (
              <Link
                to="/orders"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-primary transition-colors">
                      Client Orders & Advances
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Record payments, budgets, invoices
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
              </Link>
            )}

            {isExecutive && (
              <Link
                to="/finance"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-amber-600 transition-colors">
                      Finance & Profit Sharing
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Dual approvals, leadership split, vouchers
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </Link>
            )}

            {isExecutive && (
              <Link
                to="/user-management/all-users"
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-indigo-600 transition-colors">
                      User & Team Management
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Manage CEO, COO, staff, clients
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </Link>
            )}

            <Link
              to="/service"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-emerald-600 transition-colors">
                    Services & Packages
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Service catalog & pricing tiers
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </Link>

            <Link
              to="/case-studies"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:bg-purple-500/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-purple-600 transition-colors">
                    Case Studies & Portfolio
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Completed showcase deliveries
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

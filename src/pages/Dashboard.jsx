import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetDashboardStatsQuery,
  useUpdateAboutStatsMutation,
} from "@/services/stats/statsApiSlice";
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
  Eye,
  Globe,
  BookOpen,
  Flame,
  ExternalLink,
  Edit,
  X,
  Save,
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
  const runningMonthName = statsData?.runningMonthName || "This Month";

  const revenueTrend = charts.revenueTrend || [];
  const orderStatusDistribution = charts.orderStatusDistribution || [];
  const profitDistribution = charts.profitDistribution || [];

  const isExecutive =
    user?.role?.toLowerCase() === "ceo" ||
    user?.role?.toLowerCase() === "coo" ||
    user?.type?.toLowerCase() === "ceo" ||
    user?.type?.toLowerCase() === "coo";

  const canManageAboutStats =
    isExecutive ||
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "ceo" ||
    user?.role?.toLowerCase() === "coo";

  const [isAboutStatsModalOpen, setIsAboutStatsModalOpen] = useState(false);
  const [updateAboutStats, { isLoading: isUpdatingAboutStats }] = useUpdateAboutStatsMutation();
  const [aboutForm, setAboutForm] = useState({
    projectDeliveries: 400,
    inHouseExperts: 15,
    satisfiedClients: 99,
    businessPartners: 40,
  });

  const handleOpenAboutStatsModal = () => {
    setAboutForm({
      projectDeliveries: statsData?.aboutStats?.projectDeliveries ?? statsData?.projectDeliveries ?? 400,
      inHouseExperts: statsData?.aboutStats?.inHouseExperts ?? statsData?.inHouseExperts ?? 15,
      satisfiedClients: statsData?.aboutStats?.satisfiedClients ?? statsData?.satisfiedClients ?? 99,
      businessPartners: statsData?.aboutStats?.businessPartners ?? statsData?.businessPartners ?? 40,
    });
    setIsAboutStatsModalOpen(true);
  };

  const handleSaveAboutStats = async (e) => {
    e.preventDefault();
    try {
      await updateAboutStats({
        projectDeliveries: Number(aboutForm.projectDeliveries),
        inHouseExperts: Number(aboutForm.inHouseExperts),
        satisfiedClients: Number(aboutForm.satisfiedClients),
        businessPartners: Number(aboutForm.businessPartners),
      }).unwrap();
      toast.success("Landing Page [ About Us ] stats updated successfully!");
      setIsAboutStatsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update About Us stats");
    }
  };

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

  // Live Website & Blog Visitors Telemetry
  const totalWebsiteVisitors = Number(overview.totalWebsiteVisitors || statsData?.totalWebsiteVisitors || 0);
  const todayWebsiteVisitors = Number(overview.todayWebsiteVisitors || statsData?.todayWebsiteVisitors || 0);
  const totalBlogReaders = Number(overview.totalBlogReaders || statsData?.totalBlogReaders || 0);
  const todayBlogVisitors = Number(overview.todayBlogVisitors || statsData?.todayBlogVisitors || 0);
  const uniqueVisitorsCount = Number(overview.uniqueVisitorsCount || statsData?.uniqueVisitorsCount || 0);
  const topViewedBlogs = overview.topViewedBlogs || statsData?.topViewedBlogs || [];
  const visitorTrend = charts.visitorTrend || statsData?.visitorTrend || [];

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

  const CustomVisitorTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <p className="font-bold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-1 flex items-center justify-between">
            <span>{label} Traffic</span>
            <span className="text-[10px] text-gray-400 font-normal">Daily</span>
          </p>
          {payload.map((entry, index) => (
            <div key={`vis-item-${index}`} className="flex justify-between items-center gap-3">
              <span className="flex items-center gap-1.5 text-gray-500">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {entry.value} {entry.value === 1 ? "visitor" : "visitors"}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary via-orange-600 to-amber-600 text-white p-6 rounded-2xl shadow-lg shadow-primary/15 border border-orange-400/30 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-black/20 text-white border border-white/20 backdrop-blur-xs">
              Enterprise Dashboard
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200 font-semibold bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
            Welcome back, {user?.name || "Executive"}!
          </h1>
          <p className="text-xs sm:text-sm text-orange-50/90 max-w-xl font-normal leading-relaxed">
            Live operations, financial collections, project pipeline, and dynamic profit distribution engine.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition-all border border-white/20 shadow-xs"
            title="Refresh Live Statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/my-payslips"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-200" /> My Payslips
          </Link>
          {isExecutive && (
            <Link
              to="/finance"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-black/20 hover:bg-black/30 active:scale-95 text-white border border-white/20 shadow-xs flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" /> Finance & Profit Sharing
            </Link>
          )}
          {isExecutive && (
            <Link
              to="/orders"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-orange-50 active:scale-95 text-primary font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> New Order
            </Link>
          )}
        </div>

        {/* Decorative background ambient glows */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
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

          <Link
            to="/my-payslips"
            className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-800 transition-all block"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                  My Pool Share & Payslips
                </span>
                <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {user?.salary || 0}% Share
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                View & Download Statements <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>


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

      {/* Live Website Traffic & Blog Readership Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Website Visitors */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-sky-50/40 dark:from-blue-950/20 dark:via-[#1a191b] dark:to-sky-950/10 border border-blue-200/80 dark:border-blue-900/50 shadow-sm relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-700 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Total Website Visitors
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </div>
              <h3 className="text-3xl font-mono font-bold text-gray-900 dark:text-white mt-1.5">
                {totalWebsiteVisitors.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2.5 border-t border-blue-100 dark:border-gray-800">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{todayWebsiteVisitors} today
            </span>
            <span className="text-gray-400">
              {uniqueVisitorsCount} Unique IPs
            </span>
          </div>
        </div>

        {/* Card 2: Blog Readership & View Count */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-amber-950/20 dark:via-[#1a191b] dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-900/50 shadow-sm relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-700 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Blog Readers & Views
                </span>
                <Flame className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h3 className="text-3xl font-mono font-bold text-gray-900 dark:text-white mt-1.5">
                {totalBlogReaders.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2.5 border-t border-amber-100 dark:border-gray-800">
            <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{todayBlogVisitors} today
            </span>
            <span className="text-gray-400">
              {totalBlogs} Published Posts
            </span>
          </div>
        </div>

        {/* Card 3: Readership Conversion Ratio */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-700 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Readership Ratio
              </span>
              <h3 className="text-3xl font-mono font-bold text-gray-900 dark:text-white mt-1.5">
                {totalWebsiteVisitors > 0 ? ((totalBlogReaders / totalWebsiteVisitors) * 100).toFixed(1) : 0}%
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
            <span>Website traffic reading blogs</span>
            <span className="text-emerald-600 font-medium">Reader Engagement</span>
          </div>
        </div>

        {/* Card 4: Most Read Blog Quick Preview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-purple-400 dark:hover:border-purple-700 transition-all">
          <div className="flex justify-between items-start">
            <div className="truncate mr-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Most Read Article
              </span>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mt-1.5 truncate" title={topViewedBlogs[0]?.title || "No blog posts yet"}>
                {topViewedBlogs[0]?.title || "No blog posts yet"}
              </h4>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2.5 border-t dark:border-gray-800">
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {topViewedBlogs[0]?.views || 0} views
            </span>
            <a
              href={topViewedBlogs[0]?.slug ? `https://creatibuzstudio.com/blogs/${topViewedBlogs[0]?.slug}` : "#"}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Read Live <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Landing Page [ About Us ] Dynamic Stats Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Landing Page [ About Us ] Dynamic Stats
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                Live on creatibuzstudio.com
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              These live metrics dynamically feed the landing page About Us section count-up counters.
            </p>
          </div>
          {canManageAboutStats && (
            <button
              type="button"
              onClick={handleOpenAboutStatsModal}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary hover:bg-orange-600 active:scale-95 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Edit className="w-3.5 h-3.5" /> Edit About Stats
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80">
            <span className="text-[11px] text-gray-500 font-medium block">Project Deliveries</span>
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
              {(statsData?.aboutStats?.projectDeliveries ?? statsData?.projectDeliveries ?? 400)}+
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">Showcased completions</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80">
            <span className="text-[11px] text-gray-500 font-medium block">In-House Experts</span>
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
              {(statsData?.aboutStats?.inHouseExperts ?? statsData?.inHouseExperts ?? 15)}+
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">Dedicated specialists</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80">
            <span className="text-[11px] text-gray-500 font-medium block">Satisfied Clients</span>
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
              {(statsData?.aboutStats?.satisfiedClients ?? statsData?.satisfiedClients ?? 99)}%
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">Client retention rate</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80">
            <span className="text-[11px] text-gray-500 font-medium block">Business Partner</span>
            <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
              {(statsData?.aboutStats?.businessPartners ?? statsData?.businessPartners ?? 40)}+
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">Active strategic alliances</span>
          </div>
        </div>
      </div>

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
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${activeChartTab === "revenue"
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
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${activeChartTab === "orders" || !isExecutive
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

      {/* Website Traffic & Blog Readership Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 7-Day Visitor Traffic vs Blog Readership Trend */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Website Visitors & Blog Readership Trend
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Daily visitor traffic comparison: Total site visitors vs users reading blog posts (Last 7 days)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Site Visitors: {visitorTrend.reduce((sum, v) => sum + (v.websiteVisitors || 0), 0)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Blog Reads: {visitorTrend.reduce((sum, v) => sum + (v.blogVisitors || 0), 0)}
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="blogReadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
                <XAxis dataKey="day" stroke="#888888" fontSize={11} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomVisitorTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="websiteVisitors"
                  name="Website Visitors"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#visitorGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="blogVisitors"
                  name="Blog Readers"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#blogReadGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Top Viewed / Trending Blogs */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Most Read Blogs
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Highest reader engagement articles
                  </p>
                </div>
              </div>
              <Link
                to="/blog-management"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                All Blogs <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800/80 mt-2">
              {topViewedBlogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                  <p>No blog reader activity recorded yet.</p>
                </div>
              ) : (
                topViewedBlogs.map((blog, idx) => (
                  <div key={blog.id || idx} className="py-2.5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                          : idx === 1
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-500"
                      }`}>
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <a
                          href={`https://creatibuzstudio.com/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors truncate block group-hover:underline"
                          title={blog.title}
                        >
                          {blog.title}
                        </a>
                        <span className="text-[10px] text-gray-400 block truncate">
                          /{blog.slug}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md shrink-0">
                      <Eye className="w-3 h-3" />
                      {Number(blog.views || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t dark:border-gray-800 flex justify-between items-center text-xs text-gray-500">
            <span>Total Blog Readers:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {totalBlogReaders.toLocaleString()} reads
            </span>
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                      {runningMonthName}
                    </span>
                    {upcomingBirthdays.some((b) => b.isToday) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-pink-500 text-white animate-bounce shadow-sm">
                        🎉 Birthday Today!
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Team members celebrating birthdays in {runningMonthName}
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
                    No Birthdays in {runningMonthName}
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    No registered birthdays for team members in {runningMonthName}. Update user birth dates in User Management.
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
                    className={`py-3 flex items-center justify-between gap-3 transition-colors rounded-xl px-2.5 ${item.isToday
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
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${item.isToday
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
              {upcomingBirthdays.length} birthday(s) in {runningMonthName}
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

      {/* Modal for Editing About Stats */}
      {isAboutStatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Edit [ About Us ] Stats
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update the 4 dynamic numbers displayed on the landing page
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAboutStatsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAboutStats} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Project Deliveries (e.g. 400+)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={aboutForm.projectDeliveries}
                  onChange={(e) => setAboutForm({ ...aboutForm, projectDeliveries: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  In-House Experts (e.g. 15+)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={aboutForm.inHouseExperts}
                  onChange={(e) => setAboutForm({ ...aboutForm, inHouseExperts: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Satisfied Clients (e.g. 99%)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={aboutForm.satisfiedClients}
                  onChange={(e) => setAboutForm({ ...aboutForm, satisfiedClients: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Business Partner (e.g. 40+)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={aboutForm.businessPartners}
                  onChange={(e) => setAboutForm({ ...aboutForm, businessPartners: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAboutStatsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAboutStats}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-orange-600 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isUpdatingAboutStats ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Clock,
  Camera,
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  User,
  Users,
  Search,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award,
  Sparkles,
  Zap,
  Target,
  FileSpreadsheet,
  Globe,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import moment from "moment";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import {
  useClockInMutation,
  useClockOutMutation,
  useGetActiveSessionQuery,
  useGetMyWorkReportQuery,
  useGetAdminLiveSessionsQuery,
  useGetAdminAllSessionsQuery,
  useGetAdminDailyReportQuery,
} from "@/services/time-tracker/timeTrackerApiSlice";
import WebcamCaptureModal from "@/components/time-tracker/WebcamCaptureModal";
import PhotoPreviewModal from "@/components/time-tracker/PhotoPreviewModal";
import AttendanceStatementModal from "./AttendanceStatementModal";

export default function TimeTracker() {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.userId;

  // Determine if user has managerial/admin privileges
  const isAdmin = useMemo(() => {
    const role = (currentUser?.role || currentUser?.type || "").toLowerCase();
    return ["ceo", "coo", "hr", "admin"].includes(role);
  }, [currentUser]);

  // Tab State: for admins, options are "LIVE" | "DAILY_REPORT" | "ALL_SESSIONS" | "MY_SHIFT"
  const [activeTab, setActiveTab] = useState(isAdmin ? "DAILY_REPORT" : "MY_SHIFT");

  // Selected date for daily report (defaults to today)
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));

  // Admin All Sessions Filter State
  const [search, setSearch] = useState("");
  const [filterUserId, setFilterUserId] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Camera Modal State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraModalType, setCameraModalType] = useState("CLOCK_IN"); // "CLOCK_IN" | "CLOCK_OUT"

  // Photo Inspection Modal State
  const [previewPhotoData, setPreviewPhotoData] = useState(null);

  // Statement Report Modal State
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // API Mutations
  const [clockInMutation, { isLoading: isClockingIn }] = useClockInMutation();
  const [clockOutMutation, { isLoading: isClockingOut }] = useClockOutMutation();

  // API Queries
  const {
    data: activeSessionData,
    refetch: refetchActive,
  } = useGetActiveSessionQuery(currentUserId, { skip: !currentUserId, pollingInterval: 15000 });

  const {
    data: myReportData,
    isLoading: isLoadingMyReport,
    refetch: refetchMyReport,
  } = useGetMyWorkReportQuery(
    { userId: currentUserId, date: selectedDate },
    { skip: !currentUserId }
  );

  const {
    data: adminLiveData,
    isLoading: isLoadingAdminLive,
    refetch: refetchAdminLive,
  } = useGetAdminLiveSessionsQuery(undefined, { skip: !isAdmin, pollingInterval: 10000 });

  const {
    data: adminDailyReportData,
    isLoading: isLoadingAdminDaily,
    refetch: refetchAdminDaily,
  } = useGetAdminDailyReportQuery(selectedDate, { skip: !isAdmin });

  const {
    data: adminAllSessionsData,
    isLoading: isLoadingAdminAll,
    refetch: refetchAdminAll,
  } = useGetAdminAllSessionsQuery(
    {
      page,
      limit,
      search,
      userId: filterUserId,
      status: filterStatus,
      date: selectedDate,
    },
    { skip: !isAdmin }
  );

  // Active Session & Live Ticking Timer State (strictly validate status and session id)
  const rawActive = activeSessionData || myReportData?.activeSession;
  const activeSession =
    rawActive && rawActive.id && (rawActive.status === "RUNNING" || (!rawActive.status && rawActive.clockInTime && !rawActive.clockOutTime))
      ? rawActive
      : null;
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);

  useEffect(() => {
    if (activeSession && activeSession.clockInTime) {
      const initialElapsed = Math.max(
        0,
        Math.round((Date.now() - new Date(activeSession.clockInTime).getTime()) / 1000)
      );
      setLiveElapsedSeconds(initialElapsed);

      const interval = setInterval(() => {
        setLiveElapsedSeconds((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setLiveElapsedSeconds(0);
    }
  }, [activeSession]);

  // Daily 6-hour goal calculations for employee
  const dailyGoalSeconds = 6 * 3600; // 21,600s
  const completedSecondsToday = (myReportData?.todayTotalSeconds || 0) - (activeSession?.currentElapsedSeconds || 0);
  const totalSecondsTodayWithLive = completedSecondsToday + (activeSession ? liveElapsedSeconds : 0);
  const goalProgressPercent = Math.min(100, Math.round((totalSecondsTodayWithLive / dailyGoalSeconds) * 100));
  const isGoalAchieved = totalSecondsTodayWithLive >= dailyGoalSeconds;
  const remainingSeconds = Math.max(0, dailyGoalSeconds - totalSecondsTodayWithLive);

  // Format seconds to HH:MM:SS
  const formatSecondsToHMS = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format seconds to e.g. "06h 15m"
  const formatSecondsToHM = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m`;
  };

  // Clock In Action Handler
  const handleClockInSubmit = async ({ photo, note }) => {
    if (!currentUserId) {
      toast.error("User ID not loaded yet. Please wait a moment or refresh.");
      return;
    }
    try {
      await clockInMutation({
        userId: currentUserId,
        userName: currentUser?.name || currentUser?.nameEn || "Team Member",
        userEmail: currentUser?.email,
        userRole: currentUser?.role || "employee",
        photo,
        note,
      }).unwrap();

      toast.success("Shift successfully started with camera verification!");
      setIsCameraModalOpen(false);
      refetchActive();
      refetchMyReport();
      if (isAdmin) {
        refetchAdminLive();
        refetchAdminDaily();
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to clock in");
    }
  };

  // Clock Out Action Handler
  const handleClockOutSubmit = async ({ photo, note }) => {
    if (!currentUserId) {
      toast.error("User ID not loaded yet. Please wait a moment or refresh.");
      return;
    }
    try {
      await clockOutMutation({
        userId: currentUserId,
        sessionId: activeSession?.id,
        photo,
        note,
      }).unwrap();

      toast.success("Shift ended and attendance session logged successfully!");
      setIsCameraModalOpen(false);
      refetchActive();
      refetchMyReport();
      if (isAdmin) {
        refetchAdminLive();
        refetchAdminDaily();
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to clock out");
    }
  };

  // Direct Excel Export Handler for Admin Daily Report
  const handleExportDailyExcel = () => {
    try {
      const reports = adminDailyReportData?.reports || [];
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
        "Total Logged": rep.formattedHours || "00h 00m",
        "Daily Target": "6.0 Hours",
        "6h Goal Status": rep.complianceStatus,
        "Target Achieved": rep.isAchieved ? "YES" : "NO",
        "Camera Verified": rep.clockInPhoto ? "YES" : "NO",
        "Notes": rep.notes || "—",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Attendance");

      XLSX.writeFile(workbook, `Creatibuz_Attendance_${selectedDate}.xlsx`);
      toast.success("Excel attendance statement exported successfully");
    } catch (err) {
      toast.error("Failed to export Excel report: " + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary via-orange-600 to-amber-600 text-white p-6 rounded-2xl shadow-lg shadow-primary/15 border border-orange-400/30 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-black/20 text-white border border-white/20 backdrop-blur-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Employee Work Telemetry
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-200 font-semibold bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Standard Target: 6 Hours/Day
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
            {isAdmin ? "Work Hours & Attendance Management" : "My Work Hours & Time Tracker"}
          </h1>
          <p className="text-xs sm:text-sm text-orange-50/90 max-w-2xl font-normal leading-relaxed">
            Webcam identity verification system with automated face snapshots, real-time live timer, and 6-hour daily quota compliance tracking.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              refetchActive();
              refetchMyReport();
              if (isAdmin) {
                refetchAdminLive();
                refetchAdminDaily();
                refetchAdminAll();
              }
            }}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition-all border border-white/20 shadow-xs cursor-pointer"
            title="Refresh Live Attendance Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={handleExportDailyExcel}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                Excel Export
              </button>

              <button
                type="button"
                onClick={() => setIsStatementModalOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-orange-50 active:scale-95 text-primary font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                Download Statement
              </button>
            </>
          )}
        </div>

        {/* Ambient background glows */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Admin Multi-Tab Navigation Bar */}
      {isAdmin && (
        <div className="flex items-center gap-2 border-b dark:border-gray-800 pb-3 overflow-x-auto restro_scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("DAILY_REPORT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "DAILY_REPORT"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white dark:bg-[#1a191b] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-primary"
            }`}
          >
            <Target className="w-4 h-4" />
            Daily 6-Hour Attendance Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("LIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "LIVE"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white dark:bg-[#1a191b] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-primary"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Team Monitor ({(adminLiveData || []).length} Active)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ALL_SESSIONS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "ALL_SESSIONS"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white dark:bg-[#1a191b] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-primary"
            }`}
          >
            <Clock className="w-4 h-4" />
            All Sessions History
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("MY_SHIFT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "MY_SHIFT"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white dark:bg-[#1a191b] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-primary"
            }`}
          >
            <User className="w-4 h-4" />
            My Personal Shift Timer
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 1: MY SHIFT (EMPLOYEE / PERSONAL TIMER & 6H GOAL PROGRESS) */}
      {/* ============================================================== */}
      {(!isAdmin || activeTab === "MY_SHIFT") && (
        <div className="space-y-6">
          {/* Main Hero Shift Timer & 6-Hour Target Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Live Clock In / Clock Out Control Station */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Work Session Control Station
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      activeSession
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeSession ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    />
                    {activeSession ? "Clocked In & Active" : "Shift Inactive / Clocked Out"}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {activeSession ? "Shift in Progress" : "Ready to Start Today's Shift?"}
                </h2>
                <p className="text-xs text-gray-500">
                  Daily target is 6 hours. Every session requires a live camera snapshot on both clock-in and clock-out.
                </p>
              </div>

              {/* Big Digital Clock Display */}
              <div className="py-6 px-4 rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#141416] border border-gray-200 dark:border-gray-800 text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold block">
                  {activeSession ? "Current Session Timer" : "Shift Inactive"}
                </span>

                <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                  {activeSession ? formatSecondsToHMS(liveElapsedSeconds) : "00:00:00"}
                </div>

                {activeSession && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                    <span>Started at {moment(activeSession.clockInTime).format("hh:mm A")}</span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPhotoData({
                          photo: activeSession.clockInPhoto,
                          userName: currentUser?.name,
                          type: "CLOCK_IN",
                          timestamp: activeSession.clockInTime,
                          note: activeSession.note,
                        })
                      }
                      className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Clock-In Snap
                    </button>
                  </div>
                )}
              </div>

              {/* Clock In / Out CTA Button */}
              <div>
                {activeSession ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCameraModalType("CLOCK_OUT");
                      setIsCameraModalOpen(true);
                    }}
                    disabled={isClockingOut}
                    className="w-full py-4 rounded-xl text-sm font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] text-white shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    Stop Shift with Camera (Clock Out)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCameraModalType("CLOCK_IN");
                      setIsCameraModalOpen(true);
                    }}
                    disabled={isClockingIn}
                    className="w-full py-4 rounded-xl text-sm font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    Start Shift with Camera (Clock In)
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Daily 6-Hour Goal Progress Telemetry */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Daily 6-Hour Quota
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Progress toward today's mandatory 6 working hours
                  </p>
                </div>

                {isGoalAchieved ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-xs">
                    <Award className="w-3.5 h-3.5" /> 6h Goal Met!
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    {goalProgressPercent}% Completed
                  </span>
                )}
              </div>

              {/* Progress Visual Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-gray-500">Hours Completed Today:</span>
                  <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                    {formatSecondsToHM(totalSecondsTodayWithLive)}{" "}
                    <span className="text-xs text-gray-400 font-normal">/ 06h 00m</span>
                  </span>
                </div>

                <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isGoalAchieved
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-primary to-amber-500"
                    }`}
                    style={{ width: `${goalProgressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1">
                  <span>0 hrs</span>
                  <span>{isGoalAchieved ? "Goal completed 🎉" : `${formatSecondsToHM(remainingSeconds)} remaining`}</span>
                  <span>6.0 hrs goal</span>
                </div>
              </div>

              {/* Today's Shift Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t dark:border-gray-800">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Sessions Today</span>
                  <span className="font-mono font-bold text-base text-gray-900 dark:text-white mt-0.5 block">
                    {(myReportData?.sessions || []).filter((s) => s.date === moment().format("YYYY-MM-DD")).length} Session(s)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Verification Status</span>
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Face Camera Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Work Sessions Table with Clock In & Clock Out Camera Snapshots */}
          <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  My Work Sessions & Verification Snapshots
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record of your clocked shifts with photographic camera verification
                </p>
              </div>

              <span className="text-xs font-semibold text-gray-500">
                {(myReportData?.sessions || []).length} Recorded Session(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Clock-In Time & Photo</th>
                    <th className="px-5 py-3">Clock-Out Time & Photo</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Work Summary / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {(myReportData?.sessions || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        No work sessions logged yet today. Click "Start Shift with Camera" above to begin.
                      </td>
                    </tr>
                  ) : (
                    (myReportData?.sessions || []).map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {moment(session.clockInTime).format("MMM DD, YYYY")}
                        </td>

                        {/* Clock In */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {session.clockInPhoto && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewPhotoData({
                                    photo: session.clockInPhoto,
                                    userName: currentUser?.name,
                                    type: "CLOCK_IN",
                                    timestamp: session.clockInTime,
                                    note: session.note,
                                    date: session.date,
                                  })
                                }
                                className="w-10 h-10 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-primary transition-all flex-shrink-0 cursor-pointer"
                                title="Click to view full photo"
                              >
                                <img
                                  src={session.clockInPhoto}
                                  alt="Clock-in"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            )}
                            <div>
                              <span className="font-mono font-bold text-gray-900 dark:text-white block">
                                {moment(session.clockInTime).format("hh:mm A")}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                ✓ Verified
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Clock Out */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {session.clockOutTime ? (
                            <div className="flex items-center gap-2">
                              {session.clockOutPhoto && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhotoData({
                                      photo: session.clockOutPhoto,
                                      userName: currentUser?.name,
                                      type: "CLOCK_OUT",
                                      timestamp: session.clockOutTime,
                                      note: session.note,
                                      date: session.date,
                                    })
                                  }
                                  className="w-10 h-10 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-purple-500 transition-all flex-shrink-0 cursor-pointer"
                                  title="Click to view full photo"
                                >
                                  <img
                                    src={session.clockOutPhoto}
                                    alt="Clock-out"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}
                              <div>
                                <span className="font-mono font-bold text-gray-900 dark:text-white block">
                                  {moment(session.clockOutTime).format("hh:mm A")}
                                </span>
                                <span className="text-[10px] text-purple-600 font-semibold">
                                  ✓ Verified
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Running Now
                            </span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {session.status === "RUNNING"
                            ? formatSecondsToHM(liveElapsedSeconds)
                            : formatSecondsToHM(session.durationSeconds || 0)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              session.status === "RUNNING"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {session.status}
                          </span>
                        </td>

                        {/* Note */}
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {session.note || "Standard daily development work"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: ADMIN - DAILY 6-HOUR ATTENDANCE COMPLIANCE REPORT */}
      {/* ============================================================== */}
      {isAdmin && activeTab === "DAILY_REPORT" && (
        <div className="space-y-5">
          {/* Top Date Selection & Summary Statistics */}
          <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Daily 6-Hour Shift Compliance Matrix
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verifying all company employees against the standard 6-hour daily quota with clock-in/out snapshots
                </p>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Metric Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t dark:border-gray-800">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                  Met 6h Goal
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {adminDailyReportData?.totalAchievedCount || 0}{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    / {adminDailyReportData?.totalEmployees || 0}
                  </span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <span className="text-xs text-blue-800 dark:text-blue-300 font-semibold block">
                  Active (Working Now)
                </span>
                <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {adminDailyReportData?.totalInProgressCount || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block">
                  Under 6h (Short Hours)
                </span>
                <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {adminDailyReportData?.totalShortHoursCount || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
                <span className="text-xs text-gray-500 font-semibold block">
                  Total Company Hours
                </span>
                <span className="text-2xl font-mono font-bold text-primary mt-0.5 block">
                  {adminDailyReportData?.totalCompanyHoursFormatted || "00h 00m"}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Compliance Ledger Table */}
          <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                  <tr>
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Clock-In & Photo</th>
                    <th className="px-5 py-3">Clock-Out & Photo</th>
                    <th className="px-5 py-3">Logged Duration</th>
                    <th className="px-5 py-3">6-Hour Goal Status</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {isLoadingAdminDaily ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                        Compiling daily employee compliance report...
                      </td>
                    </tr>
                  ) : (adminDailyReportData?.reports || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400">
                        No employee records found for this date.
                      </td>
                    </tr>
                  ) : (
                    (adminDailyReportData?.reports || []).map((rep) => (
                      <tr key={rep.userId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        {/* Employee Name */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                              {rep.userName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {rep.userName}
                              </div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[140px]">
                                {rep.designation} • {rep.userRole}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {rep.department}
                        </td>

                        {/* First Clock In */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {rep.firstClockIn ? (
                            <div className="flex items-center gap-2">
                              {rep.clockInPhoto && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhotoData({
                                      photo: rep.clockInPhoto,
                                      userName: rep.userName,
                                      type: "CLOCK_IN",
                                      timestamp: rep.firstClockIn,
                                      date: rep.date,
                                    })
                                  }
                                  className="w-9 h-9 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-primary transition-all flex-shrink-0 cursor-pointer"
                                  title="View clock-in photo"
                                >
                                  <img
                                    src={rep.clockInPhoto}
                                    alt="Clock-in"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}
                              <div>
                                <span className="font-mono font-bold text-gray-900 dark:text-white block">
                                  {moment(rep.firstClockIn).format("hh:mm A")}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-semibold">
                                  ✓ Verified
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Last Clock Out */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {rep.lastClockOut ? (
                            <div className="flex items-center gap-2">
                              {rep.clockOutPhoto && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhotoData({
                                      photo: rep.clockOutPhoto,
                                      userName: rep.userName,
                                      type: "CLOCK_OUT",
                                      timestamp: rep.lastClockOut,
                                      date: rep.date,
                                    })
                                  }
                                  className="w-9 h-9 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-purple-500 transition-all flex-shrink-0 cursor-pointer"
                                  title="View clock-out photo"
                                >
                                  <img
                                    src={rep.clockOutPhoto}
                                    alt="Clock-out"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}
                              <div>
                                <span className="font-mono font-bold text-gray-900 dark:text-white block">
                                  {moment(rep.lastClockOut).format("hh:mm A")}
                                </span>
                                <span className="text-[10px] text-purple-600 font-semibold">
                                  ✓ Verified
                                </span>
                              </div>
                            </div>
                          ) : rep.isRunning ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active Shift
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Logged Duration */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                            {rep.formattedHours}
                          </span>
                          <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${
                                rep.isAchieved ? "bg-emerald-500" : rep.isRunning ? "bg-blue-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${rep.progressPercent}%` }}
                            />
                          </div>
                        </td>

                        {/* 6-Hour Goal Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              rep.complianceStatus === "ACHIEVED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : rep.complianceStatus === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                                : rep.complianceStatus === "SHORT_HOURS"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {rep.complianceStatus === "ACHIEVED"
                              ? "✓ Met 6h Goal"
                              : rep.complianceStatus === "IN_PROGRESS"
                              ? "Working (In Progress)"
                              : rep.complianceStatus === "SHORT_HOURS"
                              ? "Short (<6h)"
                              : "Absent"}
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={rep.notes}>
                          {rep.notes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: ADMIN - LIVE ACTIVE TEAM MONITOR (WHO IS WORKING NOW) */}
      {/* ============================================================== */}
      {isAdmin && activeTab === "LIVE" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-[#1a191b] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Active Work Sessions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time monitor of employees currently clocked in with live session counters
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
              {(adminLiveData || []).length} Team Members Clocked In
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(adminLiveData || []).length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  No team members are currently clocked in.
                </p>
                <p className="text-xs text-gray-500">
                  Active sessions with live webcam snapshots will appear here in real time.
                </p>
              </div>
            ) : (
              (adminLiveData || []).map((session) => (
                <div
                  key={session.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1a191b] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 hover:border-emerald-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-orange-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {session.userName?.charAt(0) || "U"}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                          {session.userName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {session.designation} • {session.department}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Clock-In Photo & Live Timer */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Live Duration
                      </span>
                      <span className="font-mono font-bold text-base text-gray-900 dark:text-white mt-0.5 block">
                        {formatSecondsToHMS(session.currentElapsedSeconds || 0)}
                      </span>
                    </div>

                    {session.clockInPhoto && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPhotoData({
                            photo: session.clockInPhoto,
                            userName: session.userName,
                            type: "CLOCK_IN",
                            timestamp: session.clockInTime,
                            note: session.note,
                            date: session.date,
                          })
                        }
                        className="w-12 h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                        title="Click to view webcam snapshot"
                      >
                        <img
                          src={session.clockInPhoto}
                          alt="Webcam snap"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t dark:border-gray-800">
                    <span>Clocked in at {moment(session.clockInTime).format("hh:mm A")}</span>
                    <span className="font-mono text-gray-400">{session.ipAddress || "127.0.0.1"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 4: ADMIN - ALL WORK SESSIONS HISTORY LEDGER */}
      {/* ============================================================== */}
      {isAdmin && activeTab === "ALL_SESSIONS" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-[#1a191b] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sessions by employee, department, notes..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                  <tr>
                    <th className="px-5 py-3">Employee</th>
                    <th className="px-5 py-3">Clock-In & Photo</th>
                    <th className="px-5 py-3">Clock-Out & Photo</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {(adminAllSessionsData?.sessions || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
                        No work sessions found matching the query.
                      </td>
                    </tr>
                  ) : (
                    (adminAllSessionsData?.sessions || []).map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {session.userName}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {session.department} • {session.designation}
                          </div>
                        </td>

                        {/* Clock In */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {session.clockInPhoto && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewPhotoData({
                                    photo: session.clockInPhoto,
                                    userName: session.userName,
                                    type: "CLOCK_IN",
                                    timestamp: session.clockInTime,
                                    note: session.note,
                                    date: session.date,
                                  })
                                }
                                className="w-9 h-9 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-primary transition-all flex-shrink-0 cursor-pointer"
                              >
                                <img
                                  src={session.clockInPhoto}
                                  alt="Clock-in"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            )}
                            <div>
                              <span className="font-mono font-bold text-gray-900 dark:text-white block">
                                {moment(session.clockInTime).format("hh:mm A")}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                ✓ Verified
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Clock Out */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {session.clockOutTime ? (
                            <div className="flex items-center gap-2">
                              {session.clockOutPhoto && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhotoData({
                                      photo: session.clockOutPhoto,
                                      userName: session.userName,
                                      type: "CLOCK_OUT",
                                      timestamp: session.clockOutTime,
                                      note: session.note,
                                      date: session.date,
                                    })
                                  }
                                  className="w-9 h-9 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 hover:ring-2 hover:ring-purple-500 transition-all flex-shrink-0 cursor-pointer"
                                >
                                  <img
                                    src={session.clockOutPhoto}
                                    alt="Clock-out"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              )}
                              <div>
                                <span className="font-mono font-bold text-gray-900 dark:text-white block">
                                  {moment(session.clockOutTime).format("hh:mm A")}
                                </span>
                                <span className="text-[10px] text-purple-600 font-semibold">
                                  ✓ Verified
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-emerald-500 font-semibold">Running</span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-3.5 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {formatSecondsToHM(session.durationSeconds || 0)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              session.status === "RUNNING"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {session.status}
                          </span>
                        </td>

                        {/* Note */}
                        <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate" title={session.note}>
                          {session.note || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Webcam Snap Modal */}
      <WebcamCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        type={cameraModalType}
        userName={currentUser?.name || "Employee"}
        onSubmit={cameraModalType === "CLOCK_IN" ? handleClockInSubmit : handleClockOutSubmit}
        isSubmitting={isClockingIn || isClockingOut}
      />

      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        isOpen={!!previewPhotoData}
        onClose={() => setPreviewPhotoData(null)}
        data={previewPhotoData}
      />

      {/* Attendance Statement Report Modal */}
      <AttendanceStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        reportData={adminDailyReportData}
        targetDate={selectedDate}
        currentUser={currentUser}
      />
    </div>
  );
}

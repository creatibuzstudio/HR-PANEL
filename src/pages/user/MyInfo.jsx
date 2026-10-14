import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import {
  useGetSingleUserQuery,
  useUpdateUserMutation,
  useUploadImageMutation,
} from "@/services/user/userApiSlice";
import { useDispatch } from "react-redux";
import { userDetailsFetched } from "@/services/auth/authSlice";
import { setAuthLocalStorage } from "@/hooks/useLocal";
import { getTokens, setSessionToken } from "@/hooks/useToken";
import { printElement } from "@/utils/printHelper";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  TrendingUp,
  Briefcase,
  Building,
  ShieldCheck,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Printer,
  Download,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  Save,
  ArrowRight,
  Crown,
  Heart,
  Palette,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

export default function MyInfo() {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || authUser?._id;
  const dispatch = useDispatch();

  const {
    data: fetchedUser,
    isLoading: isFetchingUser,
    refetch,
  } = useGetSingleUserQuery(userId, {
    skip: !userId,
  });

  const currentUser = fetchedUser || authUser || {};

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  // Background style theme for the hanging ID Card showcase
  const [cardTheme, setCardTheme] = useState("teal"); // "teal" | "crimson" | "dark"

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);
  const idBadgeRef = useRef(null);

  // Synchronize form when user details are fetched
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setLocation(currentUser.location || "");
      setDateOfBirth(currentUser.dateOfBirth || "");
      setAvatarPreview(currentUser.picture || "");
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      toast.success("Photo selected! Click 'Save Profile Changes' to persist.");
    }
  };

  const handlePrintBadge = () => {
    printElement(
      idBadgeRef.current || "printable-id-badge",
      `ID_Badge_${(currentUser.name || "Employee").replace(/\s+/g, "_")}`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      let pictureUrl = currentUser.picture || "";

      // 1. Upload picture if a new file was chosen
      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        const uploadRes = await uploadImage(formData).unwrap();
        if (uploadRes?.url) {
          pictureUrl = uploadRes.url;
        }
      }

      // 2. Prepare payload
      const payload = {
        id: userId,
        name: name.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        picture: pictureUrl || undefined,
      };

      if (password.trim()) {
        if (password.trim().length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        payload.password = password.trim();
      }

      // 3. Update user via API
      const res = await updateUser(payload).unwrap();
      const updated = res?.data || res;

      // 4. Update Redux state and local storage
      const fullUpdatedUser = {
        ...currentUser,
        ...updated,
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        dateOfBirth,
        picture: pictureUrl,
      };

      dispatch(userDetailsFetched(fullUpdatedUser));

      // Also persist to storage so refresh retains updated avatar/name
      try {
        const tokens = getTokens();
        if (tokens.accessToken) {
          setAuthLocalStorage({
            accessToken: tokens.accessToken,
            user: fullUpdatedUser,
          });
          setSessionToken(tokens.accessToken, tokens.refreshToken, fullUpdatedUser);
        }
      } catch (storageErr) {
        // ignore
      }

      setPassword("");
      setAvatarFile(null);
      toast.success("Profile information updated successfully!");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update profile information");
    }
  };

  const userSalaryShare = Number(currentUser.salary || 0);
  const designationTitle =
    currentUser.designation?.title ||
    currentUser.designation?.name ||
    currentUser.role ||
    "Team Member";
  const departmentName =
    currentUser.department?.name ||
    currentUser.department?.title ||
    "Creatibuz Studio";

  // Themes for the hanging badge backdrop
  const themeStyles = {
    teal: {
      canvas: "bg-gradient-to-br from-[#022c36] via-[#053c48] to-[#01181f]",
      border: "border-teal-700/40",
      accent: "text-teal-300",
      doodleColor: "text-teal-200/90",
      badgePill: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    },
    crimson: {
      canvas: "bg-gradient-to-br from-[#7a0c1e] via-[#9e1027] to-[#45050f]",
      border: "border-rose-700/40",
      accent: "text-rose-200",
      doodleColor: "text-white/90",
      badgePill: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    },
    dark: {
      canvas: "bg-gradient-to-br from-[#121316] via-[#1a1c23] to-[#0a0b0d]",
      border: "border-gray-700/50",
      accent: "text-indigo-300",
      doodleColor: "text-gray-200/90",
      badgePill: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    },
  };

  const currentTheme = themeStyles[cardTheme] || themeStyles.teal;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-primary/20 text-teal-300 border border-teal-400/30">
              Employee Identity & Profile
            </span>
            <span className="text-xs text-indigo-200/80">
              Creatibuz Studio Member Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Info & Official ID Card
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
            View your official Creatibuz Studio ID badge, compensation share,
            assigned department, and update your personal contact details.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintBadge}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Badge</span>
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetchingUser}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/15"
            title="Refresh Details"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetchingUser ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Hanging ID Card Showcase | Right = Details & Update Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: HANGING ID CARD (EXACT STYLE OF USER'S REFERENCE IMAGE) */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {/* Card Showcase Canvas */}
          <div
            className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl border ${currentTheme.canvas} ${currentTheme.border} min-h-[580px] flex flex-col items-center justify-between select-none`}
            style={{
              backgroundImage: `radial-gradient(circle at 50% 20%, rgba(255,255,255,0.08) 0%, transparent 65%)`,
            }}
          >
            {/* Background Texture Overlay */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Handwritten Doodles Around Badge (Matching Reference Image) */}
            {/* Top Left: Welcome To Our Team with Party Popper */}
            <div className="absolute top-6 left-5 sm:left-6 z-10 pointer-events-none transform -rotate-6">
              <span
                className={`font-['Caveat',cursive] text-2xl sm:text-3xl font-bold ${currentTheme.doodleColor} leading-tight drop-shadow-sm block`}
              >
                Welcome
                <br />
                To Our
                <br />
                Team
              </span>
              <span className="text-xl inline-block mt-0.5 animate-bounce">
                🎉
              </span>
            </div>

            {/* Top Right: Role Tag with Arrow */}
            <div className="absolute top-8 right-5 sm:right-6 z-10 pointer-events-none text-right transform rotate-3">
              <span
                className={`font-['Caveat',cursive] text-xl sm:text-2xl font-bold ${currentTheme.doodleColor} drop-shadow-sm`}
              >
                {designationTitle}
              </span>
              {/* Hand-drawn arrow SVG pointing towards the badge */}
              <div className="flex justify-end mt-1">
                <svg
                  className="w-10 h-7 text-white/80"
                  viewBox="0 0 60 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M50,5 C40,25 25,30 5,28 M15,20 L5,28 L15,36" />
                </svg>
              </div>
            </div>

            {/* Side Doodle: Handshake outline */}
            <div className="absolute top-[48%] right-4 z-10 pointer-events-none transform -rotate-12 bg-white/10 backdrop-blur-xs p-2 rounded-xl border border-white/20">
              <span className="text-xl">🤝</span>
            </div>

            {/* Bottom Doodles: #neverboring & handle */}
            <div className="absolute bottom-4 left-6 z-10 pointer-events-none">
              <span className="font-mono text-xs tracking-wider text-white/60">
                #neverboring • #creatibuz
              </span>
            </div>
            <div className="absolute bottom-4 right-6 z-10 pointer-events-none">
              <span className="font-mono text-xs tracking-wider text-white/60">
                @creatibuzstudio
              </span>
            </div>

            {/* TOP METALLIC CLIP (Authentic Lanyard Clamp) */}
            <div className="relative z-20 flex flex-col items-center -mb-3 pt-1">
              {/* Metal Hook Loop Ring */}
              <div className="w-5 h-7 rounded-t-full border-[3px] border-slate-300 dark:border-slate-300 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-sm" />
              {/* Chrome Metal Alligator Clamp Body */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border border-slate-400 shadow-md flex items-center justify-center -mt-1 relative z-30">
                {/* Clamp Screw/Rivet center */}
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 border border-slate-500 shadow-inner flex items-center justify-center">
                  <div className="w-1.5 h-0.5 bg-slate-300 transform rotate-45" />
                </div>
              </div>
              {/* Clip clamping tongue extending downward into badge slot */}
              <div className="w-4 h-4 bg-gradient-to-b from-slate-400 to-slate-600 rounded-b shadow-xs -mt-1 z-30" />
            </div>

            {/* THE WHITE LAMINATED ID BADGE */}
            <div
              ref={idBadgeRef}
              id="printable-id-badge"
              className="relative z-20 w-[285px] sm:w-[315px] bg-white rounded-[26px] p-5 pb-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center text-gray-900 transition-transform duration-300 hover:scale-[1.01]"
            >
              {/* PUNCHED OVAL SLOT AT TOP OF BADGE */}
              <div className="w-12 h-3 rounded-full bg-slate-800/80 shadow-inner -mt-1.5 mb-3 border border-slate-900" />

              {/* Creatibuz Studio Logo & Sub-banner */}
              <div className="w-full flex items-center justify-center gap-1.5 pb-2 border-b border-gray-100">
                <img
                  src="/creatibuz-logo.png"
                  alt="Creatibuz Studio"
                  className="h-7 w-auto object-contain max-w-[150px]"
                />
              </div>

              {/* Photo Frame Container with party hat decoration */}
              <div className="relative mt-4 mb-3 w-48 h-56 rounded-2xl p-1 bg-gradient-to-b from-gray-100 to-gray-200 shadow-inner flex items-center justify-center overflow-hidden border border-gray-200">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={currentUser.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-50 to-teal-50 flex flex-col items-center justify-center text-primary">
                    <User className="w-16 h-16 opacity-40 mb-1" />
                    <span className="text-xs font-semibold text-gray-400">
                      No Photo Added
                    </span>
                  </div>
                )}

                {/* Subtle Party Popper Doodle on Corner of Photo */}
                <div className="absolute top-1.5 left-1.5 text-base filter drop-shadow">
                  🎉
                </div>
              </div>

              {/* Crown Doodle 👑 above Name */}
              <div className="text-rose-500 mb-0.5 animate-pulse">
                <svg
                  className="w-7 h-5 mx-auto"
                  viewBox="0 0 24 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 14 L4 3 L9 9 L12 2 L15 9 L20 3 L22 14 Z" />
                </svg>
              </div>

              {/* Employee Name in Signature/Cursive Typography (like reference image) */}
              <h2 className="font-['Dancing_Script',cursive] text-2xl sm:text-3xl font-extrabold text-[#11243b] tracking-wide leading-tight px-2">
                {name || currentUser.name || "Team Member"}
              </h2>

              {/* Designation & Role Pill */}
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                  {designationTitle}
                </span>
              </div>

              {/* Department & Pool Share Badges */}
              <div className="mt-2 text-xs space-y-1 w-full px-2">
                <p className="text-gray-500 font-medium">
                  {departmentName}
                </p>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400">
                    ID: CBZ-{userId?.slice(-4) || "1001"}
                  </span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {userSalaryShare}% Pool Share
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom spacer */}
            <div className="h-4" />
          </div>

          {/* Badge Showcase Footer Controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 flex items-center gap-1 font-semibold">
                <Palette className="w-3.5 h-3.5 text-primary" /> Card Theme:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCardTheme("teal")}
                  className={`w-5 h-5 rounded-full bg-[#053c48] border-2 transition-all ${
                    cardTheme === "teal"
                      ? "border-primary scale-110 shadow-sm"
                      : "border-transparent"
                  }`}
                  title="Creatibuz Dark Teal"
                />
                <button
                  type="button"
                  onClick={() => setCardTheme("crimson")}
                  className={`w-5 h-5 rounded-full bg-[#9e1027] border-2 transition-all ${
                    cardTheme === "crimson"
                      ? "border-primary scale-110 shadow-sm"
                      : "border-transparent"
                  }`}
                  title="Crimson Classic"
                />
                <button
                  type="button"
                  onClick={() => setCardTheme("dark")}
                  className={`w-5 h-5 rounded-full bg-[#1a1c23] border-2 transition-all ${
                    cardTheme === "dark"
                      ? "border-primary scale-110 shadow-sm"
                      : "border-transparent"
                  }`}
                  title="Midnight Obsidian"
                />
              </div>
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={handlePrintBadge}
              className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download Badge</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: EMPLOYMENT METRICS & EDIT PROFILE FORM */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          {/* 1. Official Studio Employment & Compensation Records (Read-Only) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Official Studio Employment Records</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Verified HR credentials and Finance profit share allocation
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Staff
              </span>
            </div>

            {/* Employment Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Metric 1: Salary Share */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/70 dark:border-emerald-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Salary Pool Share (%)
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                    {userSalaryShare}%
                  </div>
                  <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/80 mt-0.5">
                    Monthly payout strictly from Finance Employee Pool
                  </p>
                </div>
                <Link
                  to="/my-payslips"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <span>View Payslip History</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Metric 2: Designation */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Official Designation
                  </span>
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {designationTitle}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Assigned by Executive Leadership
                  </p>
                </div>
              </div>

              {/* Metric 3: Department */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Department
                  </span>
                  <Building className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {departmentName}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Creatibuz Studio Division
                  </p>
                </div>
              </div>

              {/* Metric 4: Joining Date & Role */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Joining Date
                  </span>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {currentUser.joiningDate
                      ? moment(currentUser.joiningDate).format("MMM DD, YYYY")
                      : "Active Member"}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    System Role: <span className="uppercase font-semibold">{currentUser.role}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Personal Information & Profile Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm space-y-5"
          >
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>Update Personal Details</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update your contact details, profile photo, and security password
              </p>
            </div>

            {/* Photo Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl border-2 border-primary/40">
                    {name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Badge Photo
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recommended square photo (JPG, PNG). Changes reflect on your ID badge instantly.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    Upload New Photo
                  </button>
                  {avatarFile && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready to save
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Rayna Tasfiah Chowdhury"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-gray-400 font-normal">(Registered)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={currentUser.email || ""}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 text-xs sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Date of Birth <span className="text-gray-400 font-normal">(For birthday announcements)</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location / City */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Change */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  New Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating || isUploadingImage}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating || isUploadingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
  CheckCircle2,
  RefreshCw,
  Save,
  ArrowRight,
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

  // Background style theme for the hanging ID Card showcase (Default is crimson matching reference image)
  const [cardTheme, setCardTheme] = useState("crimson"); // "crimson" | "teal" | "dark"

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
      toast.success("Photo selected! Click 'Save Profile Changes' to update.");
    }
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

  // Split name for artistic 2-line handwritten signature (like reference image)
  const displayName = (name || currentUser.name || "Team Member").trim();
  const nameParts = displayName.split(" ");
  const firstLineName =
    nameParts.length > 2
      ? nameParts.slice(0, 2).join(" ")
      : nameParts[0] || displayName;
  const secondLineName =
    nameParts.length > 2
      ? nameParts.slice(2).join(" ")
      : nameParts.length === 2
      ? nameParts[1]
      : "";

  return (
    <div className="space-y-6 pb-16 pt-2">
      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* =================================================================== */}
        {/* LEFT COLUMN: PIXEL-PERFECT HANGING ID CARD (SAME TO SAME DESIGN)    */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3">
          {/* The Textured Canvas Container */}
          <div
            className={`relative rounded-3xl overflow-hidden shadow-2xl border min-h-[580px] sm:min-h-[620px] flex flex-col items-center justify-between p-6 sm:p-8 select-none transition-all duration-300 ${
              cardTheme === "teal"
                ? "border-teal-700/50 bg-[#05323e]"
                : cardTheme === "dark"
                ? "border-gray-800 bg-[#121316]"
                : "border-rose-950 bg-[#8c1024]"
            }`}
            style={{
              backgroundImage:
                cardTheme === "crimson"
                  ? "url('/crimson-badge-bg.jpg')"
                  : cardTheme === "teal"
                  ? "radial-gradient(circle at 50% 30%, #0a4d5e 0%, #03232b 100%)"
                  : "radial-gradient(circle at 50% 30%, #1f232b 0%, #0a0b0d 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Subtle Textured Vignette Shadow for Realism */}
            <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/30 pointer-events-none" />

            {/* ------------------------------------------------------------- */}
            {/* 1. TOP-LEFT DOODLES: "Welcome To Our Team" + Party Horn + Arrow */}
            {/* ------------------------------------------------------------- */}
            <div className="absolute top-5 sm:top-8 left-4 sm:left-6 z-10 select-none pointer-events-none transform -rotate-6">
              <h3 className="font-['Caveat',cursive] text-3xl sm:text-4xl lg:text-[40px] font-bold text-white leading-[0.92] drop-shadow-md">
                Welcome
                <br />
                To Our
                <br />
                Team
              </h3>

              {/* Red-outlined Party Horn Doodle with 3 Confetti Circles */}
              <div className="mt-1.5 ml-2">
                <svg
                  className="w-10 h-10 text-red-400 drop-shadow-sm"
                  viewBox="0 0 36 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Horn body */}
                  <path d="M6 26 L22 10" stroke="#fca5a5" />
                  <path d="M4 18 L16 30" stroke="#fca5a5" />
                  <path d="M4 18 C10 14 18 6 22 10 C26 14 18 22 16 30" stroke="#ef4444" fill="rgba(255,255,255,0.15)" />
                  <path d="M8 24 L10 21" stroke="#fca5a5" />
                  <path d="M12 28 L14 25" stroke="#fca5a5" />
                  {/* Confetti dots */}
                  <circle cx="28" cy="8" r="1.8" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                  <circle cx="31" cy="15" r="1.8" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                  <circle cx="23" cy="4" r="1.8" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                </svg>
              </div>

              {/* Curly Hand-drawn Arrow Pointing toward Badge Photo */}
              <div className="ml-5 -mt-1">
                <svg
                  className="w-14 h-12 text-white/95 drop-shadow"
                  viewBox="0 0 60 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M12 10 C28 8 46 16 42 32 C38 40 26 42 16 38" />
                  <path d="M24 30 L16 38 L25 45" />
                </svg>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 2. TOP-RIGHT DOODLES: 4-Petal Flower + Role + Curly Arrow    */}
            {/* ------------------------------------------------------------- */}
            <div className="absolute top-5 sm:top-8 right-4 sm:right-6 z-10 select-none pointer-events-none text-right">
              {/* 4-Petal Flower Doodle */}
              <div className="flex justify-end mb-1 pr-2">
                <svg
                  className="w-7 h-7 text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="6" r="3.2" />
                  <circle cx="12" cy="18" r="3.2" />
                  <circle cx="6" cy="12" r="3.2" />
                  <circle cx="18" cy="12" r="3.2" />
                  <circle cx="12" cy="12" r="1.8" fill="#dc2626" />
                </svg>
              </div>

              {/* Designation / Role in White Cursive Script with subtle tilt */}
              <span className="font-['Caveat',cursive] text-2xl sm:text-3xl lg:text-[34px] font-bold text-white drop-shadow-md block transform rotate-3">
                {designationTitle}
              </span>

              {/* Curly Hand-drawn Arrow Pointing down-left to the Badge */}
              <div className="flex justify-end mt-1 pr-1">
                <svg
                  className="w-14 h-12 text-white/95 drop-shadow"
                  viewBox="0 0 60 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M48 10 C34 8 16 16 20 32 C24 40 36 42 45 38" />
                  <path d="M38 30 L45 38 L37 45" />
                </svg>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 3. RIGHT SIDE DOODLE: Red & White Handshake Outline Badge     */}
            {/* ------------------------------------------------------------- */}
            <div className="absolute top-[48%] right-3 sm:right-5 z-10 select-none pointer-events-none transform -rotate-12">
              <svg
                className="w-12 h-12 drop-shadow-md"
                viewBox="0 0 44 44"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Badge Outline */}
                <rect
                  x="6"
                  y="8"
                  width="32"
                  height="26"
                  rx="7"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  fill="#ffffff"
                />
                {/* Handshake line art */}
                <path d="M12 18 L18 24 L22 20 L27 25" stroke="#dc2626" strokeWidth="2.4" />
                <path d="M18 24 L25 17" stroke="#dc2626" strokeWidth="2.4" />
                <path d="M10 15 L13 18" stroke="#dc2626" strokeWidth="2.2" />
                <path d="M30 22 L33 25" stroke="#dc2626" strokeWidth="2.2" />
                {/* Radiating Spark Lines */}
                <path d="M3 13 L6 15" stroke="#ffffff" strokeWidth="2" />
                <path d="M38 13 L41 15" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 4. BOTTOM DOODLES: Pampas Grass Fronds, Hashtag & Handle      */}
            {/* ------------------------------------------------------------- */}
            {/* Pampas grass illustration bottom-left */}
            <div className="absolute bottom-2 left-2 sm:left-4 z-10 pointer-events-none">
              <svg
                className="w-24 sm:w-28 h-28 sm:h-32 text-white/70 drop-shadow-xs"
                viewBox="0 0 80 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M10 95 Q35 70 45 20" />
                <path d="M15 95 Q40 60 60 30" />
                <path d="M45 20 Q55 15 65 18" />
                <path d="M42 28 Q55 24 68 28" />
                <path d="M38 38 Q52 34 65 38" />
                <path d="M34 48 Q48 45 60 50" />
                <path d="M30 58 Q45 56 55 62" />
                <path d="M25 68 Q38 66 48 72" />
              </svg>
            </div>

            <div className="absolute bottom-4 left-6 z-10 pointer-events-none">
              <span className="font-mono text-xs font-semibold text-white/85 tracking-wider drop-shadow-sm">
                #neverboring
              </span>
            </div>

            <div className="absolute bottom-4 right-6 z-10 pointer-events-none">
              <span className="font-mono text-xs font-semibold text-white/85 tracking-wider drop-shadow-sm">
                @creatibuzstudio
              </span>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 5. TOP LANYARD STRAP & CHROME METALLIC ALLIGATOR BADGE CLIP   */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-20 flex flex-col items-center -mb-3 pt-0">
              {/* Black woven fabric lanyard strap extending from top */}
              <div className="w-8 h-8 bg-gradient-to-b from-[#111] via-[#1f1f1f] to-[#111] border-x border-[#333] shadow-md -mt-8 relative overflow-hidden">
                {/* Woven strap texture lines */}
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_4px)]" />
              </div>

              {/* Curved Metallic Wire Loop Ring */}
              <div className="w-5 h-6 rounded-t-full border-[3px] border-slate-300 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 shadow-sm -mt-0.5" />

              {/* Chrome Metal Clamp Body with Center Round Hole (Exactly like image!) */}
              <div className="w-10 h-11 rounded-md bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400 border border-slate-400 shadow-xl flex items-center justify-center -mt-1 relative z-30">
                {/* Shiny chrome highlight line */}
                <div className="absolute top-1 left-1 right-1 h-[2px] bg-white/80 rounded-full" />
                {/* Dark Center Circular Hole with metallic rim (Unmistakable detail from the photo!) */}
                <div className="w-4 h-4 rounded-full bg-[#202731] border-2 border-slate-200 shadow-inner flex items-center justify-center" />
              </div>

              {/* Lower clamping jaws passing down over the card slot */}
              <div className="w-5 h-4 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 rounded-b shadow-sm -mt-1 z-30" />
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 6. THE WHITE POLAROID ID BADGE CARD (EXACT PURITY & PROPORTION) */}
            {/* ------------------------------------------------------------- */}
            <div
              id="printable-id-badge"
              className="relative z-20 w-[275px] sm:w-[310px] bg-white rounded-[32px] p-4 sm:p-5 pt-3 pb-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center text-gray-900 transition-transform duration-300 hover:scale-[1.01]"
            >
              {/* Punched Oval Slot at Top of Badge (Through which the clip clamps) */}
              <div className="w-14 h-3.5 rounded-full bg-[#1b2331] shadow-inner -mt-1 mb-3 border border-slate-800" />

              {/* Big High-Res Portrait Photo (Clean Polaroid Border, No Clutter) */}
              <div className="relative w-full aspect-[4/4.1] rounded-2xl bg-gray-100 overflow-hidden shadow-inner border border-gray-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-teal-50 flex flex-col items-center justify-center text-primary">
                    <User className="w-16 h-16 opacity-40 mb-1" />
                    <span className="text-xs font-semibold text-gray-400">
                      No Photo Added
                    </span>
                  </div>
                )}
              </div>

              {/* Name Area with Red Crown Doodle 👑 */}
              <div className="relative w-full mt-4 sm:mt-5 text-center">
                {/* Red Hand-Drawn Crown Doodle 👑 on Top-Right of Name */}
                <div className="absolute -top-3.5 right-4 sm:right-6 text-red-500 transform rotate-12 pointer-events-none">
                  <svg
                    className="w-8 h-6"
                    viewBox="0 0 32 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19 L4 8 L10 13 L16 4 L22 13 L28 8 L28 19 Z" />
                    <path d="M4 19 Q16 21 28 19" />
                  </svg>
                </div>

                {/* Flowing Dark Blue / Indigo Cursive Script Name (Like Reference Photo) */}
                <h2 className="font-['Dancing_Script',cursive] text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#172554] tracking-wide leading-[1.08] px-2">
                  <div>{firstLineName}</div>
                  {secondLineName && <div>{secondLineName}</div>}
                </h2>
              </div>
            </div>

            {/* Bottom spacer inside canvas */}
            <div className="h-2" />
          </div>

          {/* Theme Palette Toggle Controls */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 flex items-center gap-1 font-semibold">
                <Palette className="w-3.5 h-3.5 text-primary" /> Badge Canvas Theme:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCardTheme("crimson")}
                  className={`w-5 h-5 rounded-full bg-[#8c1024] border-2 transition-all ${
                    cardTheme === "crimson"
                      ? "border-primary scale-110 shadow-sm ring-2 ring-primary/30"
                      : "border-transparent"
                  }`}
                  title="Crimson Classic (Exact Image Match)"
                />
                <button
                  type="button"
                  onClick={() => setCardTheme("teal")}
                  className={`w-5 h-5 rounded-full bg-[#05323e] border-2 transition-all ${
                    cardTheme === "teal"
                      ? "border-primary scale-110 shadow-sm ring-2 ring-primary/30"
                      : "border-transparent"
                  }`}
                  title="Creatibuz Dark Teal"
                />
                <button
                  type="button"
                  onClick={() => setCardTheme("dark")}
                  className={`w-5 h-5 rounded-full bg-[#121316] border-2 transition-all ${
                    cardTheme === "dark"
                      ? "border-primary scale-110 shadow-sm ring-2 ring-primary/30"
                      : "border-transparent"
                  }`}
                  title="Midnight Obsidian"
                />
              </div>
            </div>

            <span className="text-[11px] text-gray-400 font-mono">
              Live Preview
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: EMPLOYMENT DATA RECORDS & PROFILE UPDATE FORM         */}
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
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Member
                </span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetchingUser}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  title="Refresh Details"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isFetchingUser ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
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
                  <span>View Monthly Payslips</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Metric 2: Designation */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Designation
                  </span>
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-2">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {designationTitle}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Appointed Role in Studio Operations
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
                    Assigned Operational Division
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
                Update your contact details, badge photo, and password
              </p>
            </div>

            {/* Photo Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/60">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-primary shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl border-2 border-primary/40">
                    {displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Badge Portrait Photo
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a clear portrait picture. It immediately updates on your ID badge.
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
                    Select New Photo
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

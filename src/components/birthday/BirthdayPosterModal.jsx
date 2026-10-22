import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Copy,
  Sparkles,
  Upload,
  Check,
  Share2,
  Palette,
  User,
  MessageSquare,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import BirthdayCardPreview from "./BirthdayCardPreview";
import {
  THEME_PALETTES,
  downloadBirthdayPosterPNG,
  copyBirthdayPosterToClipboard,
  renderBirthdayPoster,
} from "./BirthdayPosterCanvas";

const WISH_PRESETS = [
  {
    title: "Warm & Inspiring",
    text: "Wishing you another wonderful year of happiness, great achievements, and vibrant health! Thank you for your passion, creativity, and invaluable contributions to Creatibuz Studio.",
  },
  {
    title: "Leadership & Growth",
    text: "May this special day bring you immense joy and open new doors of leadership, wisdom, and remarkable success. We are proud to have you inspiring the Creatibuz Studio team every day!",
  },
  {
    title: "Energetic & Fun",
    text: "Happy Birthday! Wishing you a day filled with laughter, great celebrations, and another fantastic year of crushing milestones together with the Creatibuz family!",
  },
];

export default function BirthdayPosterModal({
  isOpen,
  onClose,
  initialEmployee = null,
  allEmployees = [],
}) {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [theme, setTheme] = useState("creatibuz");
  const [customWish, setCustomWish] = useState(WISH_PRESETS[0].text);
  const [customPhoto, setCustomPhoto] = useState("");
  const [showLogo, setShowLogo] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Role permissions check (coo, ceo, hr, admin can download)
  const userRole = (
    typeof user?.role === "string"
      ? user?.role
      : user?.role?.name || user?.role?.title || user?.type || ""
  )
    .toLowerCase()
    .trim();

  const canDownload =
    userRole === "ceo" ||
    userRole === "coo" ||
    userRole === "hr" ||
    userRole === "admin" ||
    userRole === "superadmin" ||
    userRole.includes("ceo") ||
    userRole.includes("coo") ||
    userRole.includes("hr");

  // Sync initial employee
  useEffect(() => {
    if (initialEmployee) {
      setSelectedEmployee(initialEmployee);
      setCustomPhoto(initialEmployee.picture || initialEmployee.profilePicture || "");
    } else if (allEmployees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(allEmployees[0]);
      setCustomPhoto(allEmployees[0].picture || allEmployees[0].profilePicture || "");
    }
  }, [initialEmployee, allEmployees]);

  if (!isOpen) return null;

  const currentName = selectedEmployee?.name || "Team Member";
  const currentDesignation =
    selectedEmployee?.designation?.title ||
    selectedEmployee?.designation ||
    selectedEmployee?.role ||
    "Team Member";
  const currentDepartment =
    selectedEmployee?.department?.name ||
    selectedEmployee?.department ||
    "Creatibuz Studio";

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomPhoto(event.target.result);
        toast.success("Custom photo applied for poster!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Build options object
  const posterOptions = {
    name: currentName,
    designation: currentDesignation,
    department: currentDepartment,
    picture: customPhoto,
    wishMessage: customWish,
    theme: theme,
    showLogo: showLogo,
    logoUrl: "/creatibuz-logo.png",
  };

  // Download High-Res PNG
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const toastId = toast.loading("Rendering high-res 1080x1080px Facebook poster...");
      const success = await downloadBirthdayPosterPNG(posterOptions);
      toast.dismiss(toastId);
      if (success) {
        toast.success("🎉 Birthday Poster downloaded successfully!");
      } else {
        toast.error("Failed to generate poster. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating poster");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      setIsExporting(true);
      await copyBirthdayPosterToClipboard(posterOptions);
      setIsCopied(true);
      toast.success("📋 Poster copied to clipboard! Paste directly to Facebook or Chat.");
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Direct clipboard copy not supported on this browser. Use Download PNG instead.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Facebook Post Caption
  const handleCopyCaption = () => {
    const caption = `🎉 Happy Birthday to our wonderful team member, ${currentName}! 🎂✨\n\n"${customWish}"\n\nWishing you an amazing year of growth, joy, and prosperity! 🚀💫\n\n#HappyBirthday #CreatibuzStudio #TeamCelebration #CreatibuzFamily`;
    navigator.clipboard.writeText(caption);
    toast.success("Facebook post caption copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#18181B] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Facebook Birthday Poster Studio
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  1080 x 1080 Square Post (1:1)
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate, customize, and export ready-to-post Facebook birthday cards matching our brand theme.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Preview, Right Controls */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left (5 cols): Live Card Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4">
            <div className="w-full max-w-sm mx-auto sticky top-0">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Live Card Preview</span>
                <span className="text-[11px] text-orange-600 dark:text-orange-400 font-mono">
                  1080 × 1080 (1:1)
                </span>
              </div>

              {/* The Visual Card Preview */}
              <BirthdayCardPreview
                name={currentName}
                designation={currentDesignation}
                department={currentDepartment}
                picture={customPhoto}
                wishMessage={customWish}
                theme={theme}
                showLogo={showLogo}
              />

              {/* Quick Action below preview */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {canDownload ? (
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 active:scale-95 text-white shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Download Facebook Post (1080x1080)
                  </button>
                ) : (
                  <div className="flex-1 text-center py-2 px-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-[11px] text-gray-500 font-medium">
                    Download enabled for CEO, COO & HR
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium transition-colors"
                  title="Copy Facebook Caption text"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right (7 cols): Customization Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Employee Selection */}
            {allEmployees.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-orange-500" />
                  Select Celebrating Employee
                </label>
                <select
                  value={selectedEmployee?.id || selectedEmployee?._id || ""}
                  onChange={(e) => {
                    const found = allEmployees.find(
                      (emp) => (emp.id || emp._id) === e.target.value
                    );
                    if (found) {
                      setSelectedEmployee(found);
                      setCustomPhoto(found.picture || found.profilePicture || "");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  {allEmployees.map((emp) => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.name} — {emp.designation?.title || emp.designation || emp.role || "Member"} {emp.isToday ? "🎉 (Birthday Today!)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. Brand Theme Palette */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-orange-500" />
                Color Theme & Brand Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.values(THEME_PALETTES).map((pal) => {
                  const isSelected = theme === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setTheme(pal.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 ring-2 ring-orange-500/20"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-zinc-900/40"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs border border-white/50"
                        style={{ backgroundColor: pal.accent }}
                      />
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {pal.name.split(" ")[0]}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Employee Photo Customizer */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                Poster Portrait Photo
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-dashed border-gray-300 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-orange-500" />
                  Upload High-Res Portrait Photo
                </button>

                {customPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPhoto(
                        selectedEmployee?.picture || selectedEmployee?.profilePicture || ""
                      );
                      toast.success("Reset to user's default photo");
                    }}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Recommended: Square or portrait image. Will automatically crop and frame seamlessly.
              </p>
            </div>

            {/* 4. Birthday Wish Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  Birthday Greeting & Wish Message
                </label>
                <span className="text-[11px] text-gray-400">
                  {customWish.length} characters
                </span>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {WISH_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomWish(preset.text)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 dark:bg-zinc-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={customWish}
                onChange={(e) => setCustomWish(e.target.value)}
                placeholder="Enter heartfelt birthday wish text..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 leading-relaxed resize-none"
              />
            </div>

            {/* 5. Brand Watermark Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  Creatibuz Studio Watermark
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Include official Creatibuz Studio badge and announcement tagline
                </div>
              </div>
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 dark:bg-zinc-900/50">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Standard Facebook Feed dimensions: 1080 x 1080px (1:1 square ratio)
          </div>

          <div className="flex items-center gap-2.5">
            {canDownload ? (
              <>
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {isCopied ? "Copied!" : "Copy Image"}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 active:scale-95 text-white shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Rendering..." : "Download Poster (1080x1080 PNG)"}
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-400 font-medium italic">
                Download reserved for CEO, COO & HR roles
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

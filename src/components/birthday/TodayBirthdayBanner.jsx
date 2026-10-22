import React, { useState } from "react";
import { Cake, Sparkles, Download, Palette, Copy, Share2, ChevronLeft, ChevronRight, Gift } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import BirthdayCardPreview from "./BirthdayCardPreview";
import { downloadBirthdayPosterPNG } from "./BirthdayPosterCanvas";

export default function TodayBirthdayBanner({
  todayBirthdays = [],
  onOpenStudio = () => {},
}) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if current logged in user has role ceo, coo, hr, or admin
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

  if (!todayBirthdays || todayBirthdays.length === 0) {
    return null;
  }

  const currentEmployee = todayBirthdays[currentIndex] || todayBirthdays[0];
  const totalCount = todayBirthdays.length;

  const currentName = currentEmployee?.name || "Team Member";
  const currentDesignation =
    currentEmployee?.designation?.title ||
    currentEmployee?.designation ||
    currentEmployee?.role ||
    "Team Member";
  const currentDepartment =
    currentEmployee?.department?.name ||
    currentEmployee?.department ||
    "Creatibuz Studio";
  const currentPicture = currentEmployee?.picture || currentEmployee?.profilePicture || "";

  // 1-Click Fast Download Facebook Post
  const handleFastDownload = async () => {
    try {
      setIsDownloading(true);
      const toastId = toast.loading(`Generating Facebook Poster for ${currentName}...`);
      const success = await downloadBirthdayPosterPNG({
        name: currentName,
        designation: currentDesignation,
        department: currentDepartment,
        picture: currentPicture,
        theme: "creatibuz",
        showLogo: true,
      });
      toast.dismiss(toastId);
      if (success) {
        toast.success(`🎉 ${currentName}'s Facebook Poster downloaded!`);
      } else {
        toast.error("Failed to download poster");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating poster");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyWish = () => {
    const wish = `🎉 Wishing a very Happy Birthday to our awesome ${currentName}! May this year bring you immense joy, great milestones, and success in everything you do! 🎂🚀 #CreatibuzStudio`;
    navigator.clipboard.writeText(wish);
    toast.success("Birthday greeting message copied!");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 p-1 shadow-xl shadow-orange-500/15 border border-orange-400/40">
      {/* Background festive celebration overlay */}
      <div className="relative rounded-[22px] bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md p-5 sm:p-7 overflow-hidden">
        {/* Subtle decorative glowing sparkles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-400/10 dark:bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-rose-400/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Interactive Mini Birthday Card Preview (Facebook Post 1:1) */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-[270px] sm:max-w-[310px] transform hover:scale-[1.02] transition-transform duration-300 shadow-xl rounded-2xl overflow-hidden ring-4 ring-orange-500/20">
              <BirthdayCardPreview
                name={currentName}
                designation={currentDesignation}
                department={currentDepartment}
                picture={currentPicture}
                theme="creatibuz"
                showLogo={true}
              />
            </div>
          </div>

          {/* Right Column: Celebratory Information & Instant Download Actions */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500 text-white shadow-md shadow-orange-500/30 animate-bounce">
                  <Cake className="w-4 h-4" /> 🎉 Birthday Today!
                </span>
                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                  Team Celebration
                </span>
              </div>

              {/* Multi-birthday navigation if > 1 */}
              {totalCount > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {currentIndex + 1} of {totalCount} Celebrating
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1))
                      }
                      className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0))
                      }
                      className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Greeting Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Today is {currentName}&apos;s Birthday!
                <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0" />
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {currentDesignation}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xl leading-relaxed">
                A custom Facebook post poster has been dynamically generated with our Creatibuz Studio theme. You can instantly download it or customize the design to share across Facebook, LinkedIn, and social channels!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {canDownload && (
                <button
                  type="button"
                  onClick={handleFastDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 active:scale-95 text-white shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? "Generating..." : "Download Facebook Poster (1080x1080 PNG)"}
                </button>
              )}

              {canDownload && (
                <button
                  type="button"
                  onClick={() => onOpenStudio(currentEmployee)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-orange-300 dark:border-orange-800 bg-orange-50/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition-colors"
                >
                  <Palette className="w-4 h-4 text-orange-500" />
                  Customize & Themes
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyWish}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors"
                title="Copy Birthday Greeting for Slack or Facebook"
              >
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                Copy Greeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

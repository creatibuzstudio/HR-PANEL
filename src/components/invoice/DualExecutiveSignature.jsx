import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useGetFinanceExecutivesQuery, useGetFinanceSettingsQuery } from "@/services/finance/financeApiSlice";
import { useGetUserWithSearchQuery } from "@/services/user/userApiSlice";
import moment from "moment";

export default function DualExecutiveSignature({
  date = null,
  showCertification = true,
  className = "",
}) {
  const { data: executivesData } = useGetFinanceExecutivesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: financeSettings } = useGetFinanceSettingsQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: usersData } = useGetUserWithSearchQuery({ page: 1, limit: 100 });

  const allUsers = usersData?.items || [];

  // Dynamically resolve CEO user from User API (role === 'ceo')
  const ceoUser =
    executivesData?.ceos?.[0] ||
    financeSettings?.ceoUser ||
    allUsers.find((u) => u.role?.toLowerCase() === "ceo" || u.type?.toLowerCase() === "ceo") ||
    null;

  // Dynamically resolve COO user from User API (role === 'coo')
  const cooUser =
    executivesData?.coos?.[0] ||
    financeSettings?.cooUser ||
    allUsers.find((u) => u.role?.toLowerCase() === "coo" || u.type?.toLowerCase() === "coo") ||
    null;

  const displayDate = date
    ? moment(date).format("MMM DD, YYYY")
    : moment().format("MMM DD, YYYY");

  return (
    <div className={`pt-6 border-t border-gray-200 dark:border-gray-800 ${className}`}>
      <div className="grid grid-cols-2 gap-6 sm:gap-12 text-center">
        {/* CEO Signature Block */}
        <div className="flex flex-col items-center">
          <div className="h-12 sm:h-14 flex items-end justify-center pb-1">
            <span
              style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
              className="text-xl sm:text-2xl font-bold tracking-wider text-indigo-950 dark:text-indigo-200 select-none transform -rotate-1"
            >
              {ceoUser?.name || "Chief Executive Officer"}
            </span>
          </div>
          <div className="w-40 sm:w-56 border-b-2 border-gray-400 dark:border-gray-600 mb-1.5" />
          <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
            {ceoUser?.name || "Authorized Executive"}
          </h5>
          <p className="text-[11px] sm:text-xs font-semibold text-primary uppercase tracking-wider">
            Chief Executive Officer (CEO)
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
            Creatibuz Studio
          </p>
          {ceoUser?.email && (
            <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
              {ceoUser.email}
            </p>
          )}
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Digitally Authorized
          </div>
        </div>

        {/* COO Signature Block */}
        <div className="flex flex-col items-center">
          <div className="h-12 sm:h-14 flex items-end justify-center pb-1">
            <span
              style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
              className="text-xl sm:text-2xl font-bold tracking-wider text-indigo-950 dark:text-indigo-200 select-none transform -rotate-1"
            >
              {cooUser?.name || "Chief Operating Officer"}
            </span>
          </div>
          <div className="w-40 sm:w-56 border-b-2 border-gray-400 dark:border-gray-600 mb-1.5" />
          <h5 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
            {cooUser?.name || "Authorized Executive"}
          </h5>
          <p className="text-[11px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Chief Operating Officer (COO)
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
            Creatibuz Studio
          </p>
          {cooUser?.email && (
            <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
              {cooUser.email}
            </p>
          )}
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Digitally Authorized
          </div>
        </div>
      </div>

      {/* Official Verification Bar */}
      {showCertification && (
        <div className="mt-6 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Verified Official Corporate Instrument &bull; Creatibuz Studio Executive Authority
          </span>
          <span className="font-mono">
            Date: {displayDate}
          </span>
        </div>
      )}
    </div>
  );
}

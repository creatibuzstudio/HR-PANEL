import React, { useState } from "react";
import ExecutivePayoutModal from "./ExecutivePayoutModal";
import { Link } from "react-router-dom";
import {
  UserCheck,
  ShieldCheck,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Percent,
  Award,
  ArrowUpRight,
  FileText,
  UserPlus,
} from "lucide-react";
import { useGetUserWithSearchQuery } from "@/services/user/userApiSlice";

export default function ExecutiveTable({ overview, executivesData, onOpenSettings }) {
  const [payoutModalState, setPayoutModalState] = useState({
    isOpen: false,
    role: "ceo",
    execData: null,
  });

  const { data: usersData } = useGetUserWithSearchQuery({ page: 1, limit: 100 });
  const rawApiUsers = usersData?.items || [];
  const execAllUsers = executivesData?.allUsers || [];
  const combinedMap = new Map();

  [...execAllUsers, ...rawApiUsers].forEach((u) => {
    if (u && u.id && !combinedMap.has(u.id)) {
      combinedMap.set(u.id, u);
    }
  });

  const allSystemUsers = Array.from(combinedMap.values());

  // Filter users by role from User API
  const ceos = allSystemUsers.filter(
    (u) => u.role?.toLowerCase() === "ceo" || u.type?.toLowerCase() === "ceo"
  );
  const coos = allSystemUsers.filter(
    (u) => u.role?.toLowerCase() === "coo" || u.type?.toLowerCase() === "coo"
  );
  const allExecutives = [...ceos, ...coos];

  const ceoInfo = overview?.executives?.ceo;
  const cooInfo = overview?.executives?.coo;
  const leadershipPool = overview?.pools?.leadershipPool || {};
  const settingsData = overview?.settings || {};
  const totalRevenue = Number(overview?.summary?.totalOrderRevenue || 0);

  // Dynamically resolve CEO User
  const effectiveCeoUser =
    ceoInfo?.user ||
    ceos[0] ||
    executivesData?.ceos?.[0] ||
    null;

  // Dynamically resolve COO User
  const effectiveCooUser =
    cooInfo?.user ||
    coos[0] ||
    executivesData?.coos?.[0] ||
    null;

  const ceoRevPercent =
    ceoInfo?.effectivePercentOfTotalRevenue ??
    leadershipPool?.ceoPercent ??
    settingsData?.ceoPercent ??
    (settingsData?.leadershipPoolPercent ? Number((Number(settingsData.leadershipPoolPercent) * 0.6).toFixed(1)) : 18);

  const cooRevPercent =
    cooInfo?.effectivePercentOfTotalRevenue ??
    leadershipPool?.cooPercent ??
    settingsData?.cooPercent ??
    (settingsData?.leadershipPoolPercent ? Number((Number(settingsData.leadershipPoolPercent) * 0.4).toFixed(1)) : 12);

  const totalExecPercent = Number(ceoRevPercent) + Number(cooRevPercent);

  // Dynamic CEO and COO pool share ratios (Default 60% CEO & 40% COO, or dynamically split)
  const computedCeoRatio =
    totalExecPercent > 0
      ? Number(((Number(ceoRevPercent) / totalExecPercent) * 100).toFixed(1))
      : 60;

  const computedCooRatio =
    totalExecPercent > 0
      ? Number(((Number(cooRevPercent) / totalExecPercent) * 100).toFixed(1))
      : 40;

  const ceoRatio =
    ceoInfo?.shareRatioOfLeadership ??
    leadershipPool?.ceoShareRatio ??
    settingsData?.ceoShareRatio ??
    computedCeoRatio;

  const cooRatio =
    cooInfo?.shareRatioOfLeadership ??
    leadershipPool?.cooShareRatio ??
    settingsData?.cooShareRatio ??
    computedCooRatio;

  const ceoEarnings =
    ceoInfo?.totalEarnings !== undefined
      ? Number(ceoInfo.totalEarnings)
      : leadershipPool?.ceoShareAmount !== undefined
      ? Number(leadershipPool.ceoShareAmount)
      : Number((totalRevenue * (Number(ceoRevPercent) / 100)).toFixed(2));

  const cooEarnings =
    cooInfo?.totalEarnings !== undefined
      ? Number(cooInfo.totalEarnings)
      : leadershipPool?.cooShareAmount !== undefined
      ? Number(leadershipPool.cooShareAmount)
      : Number((totalRevenue * (Number(cooRevPercent) / 100)).toFixed(2));

  const handleOpenPayout = (role, userObj, ratio, revPercent, earnings) => {
    setPayoutModalState({
      isOpen: true,
      role,
      execData: {
        user: userObj,
        shareRatioOfLeadership: ratio,
        effectivePercentOfTotalRevenue: revPercent,
        totalEarnings: earnings,
      },
    });
  };

  // Build the list of rows for the dynamic executive table
  const tableRows = [];
  if (ceos.length > 0) {
    ceos.forEach((u) => {
      tableRows.push({
        id: u.id,
        user: u,
        role: "ceo",
        roleTitle: "Chief Executive Officer (CEO)",
        poolShareRatio: ceoRatio,
        revenueSharePercent: ceoRevPercent,
        earnings: ceoEarnings,
      });
    });
  } else if (effectiveCeoUser) {
    tableRows.push({
      id: effectiveCeoUser.id || "ceo-def",
      user: effectiveCeoUser,
      role: "ceo",
      roleTitle: "Chief Executive Officer (CEO)",
      poolShareRatio: ceoRatio,
      revenueSharePercent: ceoRevPercent,
      earnings: ceoEarnings,
    });
  }

  if (coos.length > 0) {
    coos.forEach((u) => {
      tableRows.push({
        id: u.id,
        user: u,
        role: "coo",
        roleTitle: "Chief Operating Officer (COO)",
        poolShareRatio: cooRatio,
        revenueSharePercent: cooRevPercent,
        earnings: cooEarnings,
      });
    });
  } else if (effectiveCooUser) {
    tableRows.push({
      id: effectiveCooUser.id || "coo-def",
      user: effectiveCooUser,
      role: "coo",
      roleTitle: "Chief Operating Officer (COO)",
      poolShareRatio: cooRatio,
      revenueSharePercent: cooRevPercent,
      earnings: cooEarnings,
    });
  }

  return (
    <div className="space-y-6">
      {/* Executive Highlights (CEO & COO Profile Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CEO Highlight Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-6 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-32 h-32 text-amber-500" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              {effectiveCeoUser?.picture ? (
                <img
                  src={effectiveCeoUser.picture}
                  alt={effectiveCeoUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {effectiveCeoUser?.name ? effectiveCeoUser.name.charAt(0).toUpperCase() : "CEO"}
                </div>
              )}
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Chief Executive Officer (CEO)
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {effectiveCeoUser?.name || "CEO Not Assigned"}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>{effectiveCeoUser?.email || "Assign in User Management"}</span>
                  {effectiveCeoUser?.phone && <span>• {effectiveCeoUser.phone}</span>}
                </p>
                {effectiveCeoUser?.designation?.title && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1">
                    {effectiveCeoUser.designation.title} {effectiveCeoUser.department?.name ? `• ${effectiveCeoUser.department.name}` : ""}
                  </p>
                )}
              </div>
            </div>

            {effectiveCeoUser && (
              <button
                type="button"
                onClick={() => handleOpenPayout("ceo", effectiveCeoUser, ceoRatio, ceoRevPercent, ceoEarnings)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                title="View & Print Official CEO Dividend Slip"
              >
                <FileText className="w-3.5 h-3.5" /> Payout Slip
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-amber-500/20 relative z-10">
            <div className="bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-amber-500/10">
              <span className="text-[11px] text-gray-500 block">Leadership Pool Ratio</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {ceoRatio}%
              </span>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-amber-500/10">
              <span className="text-[11px] text-gray-500 block">Revenue Share</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {ceoRevPercent}%
              </span>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-amber-500/10">
              <span className="text-[11px] text-gray-500 block">Real-time Earnings</span>
              <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${ceoEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* COO Highlight Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent border border-violet-500/30 dark:border-violet-500/20 rounded-2xl p-6 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-32 h-32 text-violet-500" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              {effectiveCooUser?.picture ? (
                <img
                  src={effectiveCooUser.picture}
                  alt={effectiveCooUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-violet-500 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {effectiveCooUser?.name ? effectiveCooUser.name.charAt(0).toUpperCase() : "COO"}
                </div>
              )}
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-500/30 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Chief Operating Officer (COO)
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {effectiveCooUser?.name || "COO Not Assigned"}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>{effectiveCooUser?.email || "Assign in User Management"}</span>
                  {effectiveCooUser?.phone && <span>• {effectiveCooUser.phone}</span>}
                </p>
                {effectiveCooUser?.designation?.title && (
                  <p className="text-[11px] text-violet-700 dark:text-violet-400 font-medium mt-1">
                    {effectiveCooUser.designation.title} {effectiveCooUser.department?.name ? `• ${effectiveCooUser.department.name}` : ""}
                  </p>
                )}
              </div>
            </div>

            {effectiveCooUser && (
              <button
                type="button"
                onClick={() => handleOpenPayout("coo", effectiveCooUser, cooRatio, cooRevPercent, cooEarnings)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                title="View & Print Official COO Dividend Slip"
              >
                <FileText className="w-3.5 h-3.5" /> Payout Slip
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-violet-500/20 relative z-10">
            <div className="bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-violet-500/10">
              <span className="text-[11px] text-gray-500 block">Leadership Pool Ratio</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {cooRatio}%
              </span>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-violet-500/10">
              <span className="text-[11px] text-gray-500 block">Revenue Share</span>
              <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                {cooRevPercent}%
              </span>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-violet-500/10">
              <span className="text-[11px] text-gray-500 block">Real-time Earnings</span>
              <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${cooEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Executive Table (Pulled from User API with role ceo & coo) */}
      <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Executive Table (Role: CEO & COO from User API)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live executive list automatically filtered by user role (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">role: 'ceo'</code> and <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">role: 'coo'</code>)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/user-management"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> Manage Users
            </Link>
            <button
              onClick={onOpenSettings}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              Adjust Ratios <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {tableRows.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">
              No users with CEO or COO roles registered yet
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please go to <strong>User Management</strong> to create a user or update an existing profile with the role <strong>CEO</strong> or <strong>COO</strong>.
            </p>
            <div className="pt-2">
              <Link
                to="/user-management"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" /> Go to User Management
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5">Executive</th>
                  <th className="px-6 py-3.5">System Role</th>
                  <th className="px-6 py-3.5">Designation / Dept</th>
                  <th className="px-6 py-3.5">Pool Share %</th>
                  <th className="px-6 py-3.5">Total Revenue %</th>
                  <th className="px-6 py-3.5">Net Payout ($)</th>
                  <th className="px-6 py-3.5 text-center">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tableRows.map((row) => {
                  const isCeo = row.role === "ceo";
                  const u = row.user;
                  return (
                    <tr
                      key={row.id}
                      className={
                        isCeo
                          ? "hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors"
                          : "hover:bg-violet-50/30 dark:hover:bg-violet-950/10 transition-colors"
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img
                              src={u.picture}
                              alt={u.name}
                              className={`w-10 h-10 rounded-full object-cover border ${
                                isCeo ? "border-amber-300" : "border-violet-300"
                              }`}
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${
                                isCeo ? "bg-amber-500" : "bg-violet-500"
                              }`}
                            >
                              {u.name?.charAt(0).toUpperCase() || (isCeo ? "C" : "O")}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {u.name || "Unnamed Executive"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <span>{u.email || "No email"}</span>
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                            isCeo
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                              : "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border-violet-300 dark:border-violet-700"
                          }`}
                        >
                          {row.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {u.designation?.title || (isCeo ? "Chief Executive Officer" : "Chief Operating Officer")}
                        </div>
                        <div className="text-gray-400">
                          {u.department?.name || (isCeo ? "Executive Leadership" : "Operations")}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {row.poolShareRatio}% of Pool
                      </td>
                      <td
                        className={`px-6 py-4 font-bold ${
                          isCeo ? "text-amber-600 dark:text-amber-400" : "text-violet-600 dark:text-violet-400"
                        }`}
                      >
                        {row.revenueSharePercent}% Total
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                        ${row.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            handleOpenPayout(row.role, u, row.poolShareRatio, row.revenueSharePercent, row.earnings)
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 ${
                            isCeo
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                              : "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900"
                          }`}
                          title={`View / Print Official ${row.role.toUpperCase()} Dividend Statement`}
                        >
                          <FileText className="w-3.5 h-3.5" /> Payout Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Slip / Statement Modal */}
      <ExecutivePayoutModal
        isOpen={payoutModalState.isOpen}
        executiveRole={payoutModalState.role}
        execData={payoutModalState.execData}
        overview={overview}
        onClose={() =>
          setPayoutModalState({ isOpen: false, role: "ceo", execData: null })
        }
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import { useUpdateFinanceSettingsMutation } from "@/services/finance/financeApiSlice";
import { useGetUserWithSearchQuery } from "@/services/user/userApiSlice";
import toast from "react-hot-toast";
import {
  Sliders,
  Percent,
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Save,
  Sparkles,
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  Building,
} from "lucide-react";

export default function DistributionSettings({ settings, executivesData, onRefetch }) {
  const [updateSettings, { isLoading }] = useUpdateFinanceSettingsMutation();
  const { data: usersData, refetch: refetchUsers } = useGetUserWithSearchQuery({ page: 1, limit: 100 });

  const [formData, setFormData] = useState({
    companyCostPercent: 40,
    employeePoolPercent: 30,
    leadershipPoolPercent: 30,
    ceoPercent: 18,
    cooPercent: 12,
    ceoShareRatio: 60,
    cooShareRatio: 40,
    ceoUserId: "",
    cooUserId: "",
    autoDeductCostFromCompanyFund: true,
  });

  // Combine and deduplicate users from User API and executivesData
  const rawApiUsers = usersData?.items || [];
  const execAllUsers = executivesData?.allUsers || [];
  const combinedMap = new Map();

  [...execAllUsers, ...rawApiUsers].forEach((u) => {
    if (u && u.id && !combinedMap.has(u.id)) {
      combinedMap.set(u.id, u);
    }
  });

  const allSystemUsers = Array.from(combinedMap.values());

  // Strictly filter only users with role 'ceo' and role 'coo' from the User API
  const ceos = allSystemUsers.filter(
    (u) => u.role?.toLowerCase() === "ceo" || u.type?.toLowerCase() === "ceo",
  );
  const coos = allSystemUsers.filter(
    (u) => u.role?.toLowerCase() === "coo" || u.type?.toLowerCase() === "coo",
  );

  useEffect(() => {
    if (settings) {
      const lead = Number(settings.leadershipPoolPercent || 30);
      let cPct =
        settings.ceoPercent !== undefined && settings.ceoPercent !== null
          ? Number(settings.ceoPercent)
          : Number(((lead * Number(settings.ceoShareRatio || 60)) / 100).toFixed(1));
      let oPct =
        settings.cooPercent !== undefined && settings.cooPercent !== null
          ? Number(settings.cooPercent)
          : Number(((lead * Number(settings.cooShareRatio || 40)) / 100).toFixed(1));

      if (lead === 60 && Math.abs(cPct + oPct - lead) > 0.05) {
        cPct = 20;
        oPct = 40;
      }

      const activeCeoId =
        settings.ceoUserId ||
        settings.ceoUser?.id ||
        (ceos.length > 0 ? ceos[0].id : "");

      const activeCooId =
        settings.cooUserId ||
        settings.cooUser?.id ||
        (coos.length > 0 ? coos[0].id : "");

      setFormData({
        companyCostPercent: Number(settings.companyCostPercent || 40),
        employeePoolPercent: Number(settings.employeePoolPercent || 30),
        leadershipPoolPercent: lead,
        ceoPercent: cPct,
        cooPercent: oPct,
        ceoShareRatio: Number(settings.ceoShareRatio || 60),
        cooShareRatio: Number(settings.cooShareRatio || 40),
        ceoUserId: activeCeoId,
        cooUserId: activeCooId,
        autoDeductCostFromCompanyFund:
          settings.autoDeductCostFromCompanyFund !== false,
      });
    }
  }, [settings, ceos.length, coos.length]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const handleCeoPercentChange = (val) => {
    const num = Math.max(0, Math.min(100, parseFloat(val) || 0));
    const lead = formData.leadershipPoolPercent;
    const remaining = Math.max(0, Number((lead - num).toFixed(1)));
    setFormData((prev) => ({
      ...prev,
      ceoPercent: num,
      cooPercent: remaining,
    }));
  };

  const handleCooPercentChange = (val) => {
    const num = Math.max(0, Math.min(100, parseFloat(val) || 0));
    const lead = formData.leadershipPoolPercent;
    const remaining = Math.max(0, Number((lead - num).toFixed(1)));
    setFormData((prev) => ({
      ...prev,
      cooPercent: num,
      ceoPercent: remaining,
    }));
  };

  const handleLeadershipPoolChange = (val) => {
    const newLead = Math.max(0, Math.min(100, parseFloat(val) || 0));
    if (newLead === 60) {
      setFormData((prev) => ({
        ...prev,
        leadershipPoolPercent: newLead,
        ceoPercent: 20,
        cooPercent: 40,
      }));
    } else {
      const currentSum = formData.ceoPercent + formData.cooPercent || 1;
      const ratio = formData.ceoPercent / currentSum;
      const newCeo = Number((newLead * ratio).toFixed(1));
      const newCoo = Number((newLead - newCeo).toFixed(1));
      setFormData((prev) => ({
        ...prev,
        leadershipPoolPercent: newLead,
        ceoPercent: newCeo,
        cooPercent: newCoo,
      }));
    }
  };

  const applyPreset = (cCost, ePool, lPool, cPct, oPct) => {
    setFormData((prev) => ({
      ...prev,
      companyCostPercent: cCost,
      employeePoolPercent: ePool,
      leadershipPoolPercent: lPool,
      ceoPercent: cPct,
      cooPercent: oPct,
    }));
  };

  const poolSum =
    Number(formData.companyCostPercent || 0) +
    Number(formData.employeePoolPercent || 0) +
    Number(formData.leadershipPoolPercent || 0);

  const executiveSum =
    Number(formData.ceoPercent || 0) + Number(formData.cooPercent || 0);

  const isPoolSumValid = Math.abs(poolSum - 100) < 0.05;
  const isExecutiveSumValid =
    Math.abs(executiveSum - formData.leadershipPoolPercent) < 0.05;

  const ceoRatioOfPool =
    formData.leadershipPoolPercent > 0
      ? Number(((formData.ceoPercent / formData.leadershipPoolPercent) * 100).toFixed(1))
      : 50;

  const cooRatioOfPool =
    formData.leadershipPoolPercent > 0
      ? Number(((formData.cooPercent / formData.leadershipPoolPercent) * 100).toFixed(1))
      : 50;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPoolSumValid) {
      toast.error(`Main pools must sum to 100%! Current total: ${poolSum.toFixed(1)}%`);
      return;
    }
    if (!isExecutiveSumValid) {
      toast.error(
        `CEO + COO (${executiveSum.toFixed(1)}%) must equal Leadership Pool (${formData.leadershipPoolPercent}%)!`,
      );
      return;
    }

    try {
      await updateSettings({
        companyCostPercent: Number(formData.companyCostPercent),
        employeePoolPercent: Number(formData.employeePoolPercent),
        leadershipPoolPercent: Number(formData.leadershipPoolPercent),
        ceoPercent: Number(formData.ceoPercent),
        cooPercent: Number(formData.cooPercent),
        ceoShareRatio: ceoRatioOfPool,
        cooShareRatio: cooRatioOfPool,
        ceoUserId: formData.ceoUserId || undefined,
        cooUserId: formData.cooUserId || undefined,
        autoDeductCostFromCompanyFund: formData.autoDeductCostFromCompanyFund,
      }).unwrap();

      toast.success("Financial distribution settings successfully updated!");
      if (onRefetch) onRefetch();
      refetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update financial settings");
    }
  };

  // Find active designated user objects
  const activeCeoUser =
    ceos.find((u) => u.id === formData.ceoUserId) ||
    (formData.ceoUserId ? allSystemUsers.find((u) => u.id === formData.ceoUserId) : null) ||
    ceos[0] ||
    settings?.ceoUser;

  const activeCooUser =
    coos.find((u) => u.id === formData.cooUserId) ||
    (formData.cooUserId ? allSystemUsers.find((u) => u.id === formData.cooUserId) : null) ||
    coos[0] ||
    settings?.cooUser;

  return (
    <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b dark:border-gray-800">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Dynamic Profit Distribution & Executive Setup
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Configure dynamic split percentages from order revenue and designate CEO & COO users strictly pulled from the User API.
          </p>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          Recommended Split Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset(30, 10, 60, 20, 40)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-50 shadow-sm transition-colors"
          >
            ⭐ 60% Leadership (20% CEO / 40% COO)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(30, 10, 60, 30, 30)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 hover:bg-indigo-50 shadow-sm transition-colors"
          >
            ⚖️ 60% Leadership (30% CEO / 30% COO)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(40, 30, 30, 18, 12)}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 shadow-sm transition-colors"
          >
            🏢 30% Leadership (18% CEO / 12% COO)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Main Revenue Pools */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-indigo-500" />
              1. Main Revenue Pools (Must Total 100%)
            </h4>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                isPoolSumValid
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isPoolSumValid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Total: {poolSum.toFixed(1)}%
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> Total: {poolSum.toFixed(1)}% (Needs 100%)
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Company Cost Fund */}
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Company Cost Fund
                </label>
                <span className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-400">
                  {formData.companyCostPercent}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.companyCostPercent}
                onChange={(e) =>
                  handleChange("companyCostPercent", parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.companyCostPercent}
                onChange={(e) =>
                  handleChange("companyCostPercent", parseFloat(e.target.value) || 0)
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Covers office rent, hardware, software, server bills, and operational expenses.
              </p>
            </div>

            {/* Employee Profit Pool */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Employee Pool
                </label>
                <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                  {formData.employeePoolPercent}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.employeePoolPercent}
                onChange={(e) =>
                  handleChange("employeePoolPercent", parseFloat(e.target.value) || 0)
                }
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.employeePoolPercent}
                onChange={(e) =>
                  handleChange("employeePoolPercent", parseFloat(e.target.value) || 0)
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Shared among company employees and developers as performance bonuses.
              </p>
            </div>

            {/* Executive Leadership Pool */}
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Leadership Pool (CEO & COO)
                </label>
                <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                  {formData.leadershipPoolPercent}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.leadershipPoolPercent}
                onChange={(e) => handleLeadershipPoolChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.leadershipPoolPercent}
                onChange={(e) => handleLeadershipPoolChange(e.target.value)}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Allocated to top executive leadership and divided between CEO & COO.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Executive Ratio Split (CEO vs COO) */}
        <div className="space-y-4 pt-3 border-t dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                2. Executive Leadership Individual Split (Must Total {formData.leadershipPoolPercent}%)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Direct revenue percentage for CEO & COO (e.g. 20% CEO & 40% COO = 60% Leadership Pool)
              </p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                isExecutiveSumValid
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isExecutiveSumValid ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Total: {executiveSum.toFixed(1)}% / {formData.leadershipPoolPercent}%
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> Total: {executiveSum.toFixed(1)}% ≠ {formData.leadershipPoolPercent}%
                </>
              )}
            </span>
          </div>

          {/* Dual range slider */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
              <span className="text-amber-600 dark:text-amber-400">CEO: {formData.ceoPercent}%</span>
              <span>Leadership Pool: {formData.leadershipPoolPercent}%</span>
              <span className="text-violet-600 dark:text-violet-400">COO: {formData.cooPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max={formData.leadershipPoolPercent || 100}
              step="1"
              value={formData.ceoPercent}
              onChange={(e) => handleCeoPercentChange(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CEO Share Ratio */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  CEO Individual Revenue %
                </span>
                <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                  {formData.ceoPercent}% of Revenue
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={formData.leadershipPoolPercent || 100}
                  step="1"
                  value={formData.ceoPercent}
                  onChange={(e) => handleCeoPercentChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-base font-bold border rounded-lg bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700 font-mono text-amber-900 dark:text-amber-200"
                />
                <span className="font-bold text-sm text-gray-500">%</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-amber-500/20">
                <span>Share of Leadership Pool:</span>
                <strong className="text-amber-700 dark:text-amber-300">
                  {ceoRatioOfPool}% of Pool
                </strong>
              </div>
            </div>

            {/* COO Share Ratio */}
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-violet-900 dark:text-violet-300">
                  COO Individual Revenue %
                </span>
                <span className="font-mono font-bold text-sm text-violet-700 dark:text-violet-400">
                  {formData.cooPercent}% of Revenue
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={formData.leadershipPoolPercent || 100}
                  step="1"
                  value={formData.cooPercent}
                  onChange={(e) => handleCooPercentChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-base font-bold border rounded-lg bg-white dark:bg-gray-800 border-violet-300 dark:border-violet-700 font-mono text-violet-900 dark:text-violet-200"
                />
                <span className="font-bold text-sm text-gray-500">%</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-violet-500/20">
                <span>Share of Leadership Pool:</span>
                <strong className="text-violet-700 dark:text-violet-300">
                  {cooRatioOfPool}% of Pool
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Executive User Designation (Pulled from User API) */}
        <div className="space-y-4 pt-3 border-t dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                3. Dynamic Executive User Designation (Pulled from User API)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Designate senior executives from the User API strictly filtered by role (<code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-amber-600 font-bold">role: 'ceo'</code> and <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-violet-600 font-bold">role: 'coo'</code>).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                {ceos.length} CEO User(s)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 font-bold">
                {coos.length} COO User(s)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CEO User Select & Live Card */}
            <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Designated Chief Executive Officer (CEO)
                  </span>
                  <span className="text-[11px] font-mono text-amber-600">
                    User API Role: 'ceo'
                  </span>
                </label>
                {ceos.length > 0 ? (
                  <select
                    value={formData.ceoUserId}
                    onChange={(e) => handleChange("ceoUserId", e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="">-- Auto-detect primary user with role 'ceo' --</option>
                    {ceos.map((u) => (
                      <option key={u.id} value={u.id}>
                        ★ {u.name} ({u.email}) • {u.designation?.title || "CEO"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      No user with <strong>role: 'ceo'</strong> found in User API. Please assign role <strong>CEO</strong> to an executive in User Management.
                    </span>
                  </div>
                )}
              </div>

              {/* Active CEO Live Card */}
              {activeCeoUser && (
                <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3 shadow-xs">
                  {activeCeoUser.picture ? (
                    <img
                      src={activeCeoUser.picture}
                      alt={activeCeoUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      {activeCeoUser.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {activeCeoUser.name}
                      </h5>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                        CEO
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" /> {activeCeoUser.email}
                      </span>
                      {activeCeoUser.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {activeCeoUser.phone}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-3">
                      <span>Designation: <strong className="text-gray-600 dark:text-gray-300">{activeCeoUser.designation?.title || "Chief Executive Officer"}</strong></span>
                      <span>Dept: <strong className="text-gray-600 dark:text-gray-300">{activeCeoUser.department?.name || "Executive"}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* COO User Select & Live Card */}
            <div className="p-4 rounded-xl bg-violet-50/40 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/50 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-violet-900 dark:text-violet-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-500" />
                    Designated Chief Operating Officer (COO)
                  </span>
                  <span className="text-[11px] font-mono text-violet-600">
                    User API Role: 'coo'
                  </span>
                </label>
                {coos.length > 0 ? (
                  <select
                    value={formData.cooUserId}
                    onChange={(e) => handleChange("cooUserId", e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-violet-300 dark:border-violet-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  >
                    <option value="">-- Auto-detect primary user with role 'coo' --</option>
                    {coos.map((u) => (
                      <option key={u.id} value={u.id}>
                        ★ {u.name} ({u.email}) • {u.designation?.title || "COO"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      No user with <strong>role: 'coo'</strong> found in User API. Please assign role <strong>COO</strong> to an executive in User Management.
                    </span>
                  </div>
                )}
              </div>

              {/* Active COO Live Card */}
              {activeCooUser && (
                <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-violet-200 dark:border-violet-800 flex items-start gap-3 shadow-xs">
                  {activeCooUser.picture ? (
                    <img
                      src={activeCooUser.picture}
                      alt={activeCooUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-violet-500 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      {activeCooUser.name?.charAt(0).toUpperCase() || "O"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {activeCooUser.name}
                      </h5>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold uppercase bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-500/30">
                        COO
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" /> {activeCooUser.email}
                      </span>
                      {activeCooUser.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {activeCooUser.phone}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-3">
                      <span>Designation: <strong className="text-gray-600 dark:text-gray-300">{activeCooUser.designation?.title || "Chief Operating Officer"}</strong></span>
                      <span>Dept: <strong className="text-gray-600 dark:text-gray-300">{activeCooUser.department?.name || "Operations"}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Operational Rules */}
        <div className="pt-3 border-t dark:border-gray-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoDeductCostFromCompanyFund}
              onChange={(e) =>
                handleChange("autoDeductCostFromCompanyFund", e.target.checked)
              }
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 block">
                Auto-deduct approved expenses from Company Cost Fund
              </span>
              <span className="text-xs text-gray-500">
                When both CEO and COO approve an expense requisition, its dollar amount is automatically deducted from the Company Cost Pool.
              </span>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t dark:border-gray-800">
          <PrimaryButton
            type="submit"
            disabled={isLoading || !isPoolSumValid || !isExecutiveSumValid}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving Settings..." : "Save Distribution Settings"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

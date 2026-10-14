import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import { useUpdateFinanceSettingsMutation } from "@/services/finance/financeApiSlice";
import toast from "react-hot-toast";
import {
  Sliders,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function QuickAdjustPercentagesModal({
  isOpen,
  onClose,
  settings,
  overview,
  onUpdated,
}) {
  const [updateSettings, { isLoading }] = useUpdateFinanceSettingsMutation();

  const [companyCostPercent, setCompanyCostPercent] = useState(40);
  const [employeePoolPercent, setEmployeePoolPercent] = useState(30);
  const [leadershipPoolPercent, setLeadershipPoolPercent] = useState(30);

  const [ceoPercent, setCeoPercent] = useState(18);
  const [cooPercent, setCooPercent] = useState(12);

  useEffect(() => {
    if (settings || overview) {
      const cost = Number(
        settings?.companyCostPercent ?? overview?.pools?.companyCost?.percent ?? 40,
      );
      const emp = Number(
        settings?.employeePoolPercent ?? overview?.pools?.employeePool?.percent ?? 30,
      );
      const lead = Number(
        settings?.leadershipPoolPercent ?? overview?.pools?.leadershipPool?.percent ?? 30,
      );

      let cPct =
        settings?.ceoPercent !== undefined && settings?.ceoPercent !== null
          ? Number(settings.ceoPercent)
          : Number(
              overview?.executives?.ceo?.percent ??
                overview?.executives?.ceo?.effectivePercentOfTotalRevenue ??
                lead * 0.6,
            );

      let oPct =
        settings?.cooPercent !== undefined && settings?.cooPercent !== null
          ? Number(settings.cooPercent)
          : Number(
              overview?.executives?.coo?.percent ??
                overview?.executives?.coo?.effectivePercentOfTotalRevenue ??
                lead * 0.4,
            );

      // If they don't sum to lead and lead is 60, default to 20/40
      if (Math.abs(cPct + oPct - lead) > 0.05 && lead > 0) {
        if (lead === 60) {
          cPct = 20;
          oPct = 40;
        } else {
          cPct = Number((lead * 0.6).toFixed(1));
          oPct = Number((lead - cPct).toFixed(1));
        }
      }

      setCompanyCostPercent(cost);
      setEmployeePoolPercent(emp);
      setLeadershipPoolPercent(lead);
      setCeoPercent(Number(cPct.toFixed(1)));
      setCooPercent(Number(oPct.toFixed(1)));
    }
  }, [settings, overview, isOpen]);

  // Handlers
  const handleCeoChange = (val) => {
    const num = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setCeoPercent(num);
    const remaining = Math.max(0, Number((leadershipPoolPercent - num).toFixed(1)));
    setCooPercent(remaining);
  };

  const handleCooChange = (val) => {
    const num = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setCooPercent(num);
    const remaining = Math.max(0, Number((leadershipPoolPercent - num).toFixed(1)));
    setCeoPercent(remaining);
  };

  const handleLeadershipPoolChange = (val) => {
    const newLead = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setLeadershipPoolPercent(newLead);
    if (newLead === 60) {
      setCeoPercent(20);
      setCooPercent(40);
    } else {
      const currentSum = ceoPercent + cooPercent || 1;
      const ratio = ceoPercent / currentSum;
      const newCeo = Number((newLead * ratio).toFixed(1));
      const newCoo = Number((newLead - newCeo).toFixed(1));
      setCeoPercent(newCeo);
      setCooPercent(newCoo);
    }
  };

  const applyPreset = (cCost, ePool, lPool, cPct, oPct) => {
    setCompanyCostPercent(cCost);
    setEmployeePoolPercent(ePool);
    setLeadershipPoolPercent(lPool);
    setCeoPercent(cPct);
    setCooPercent(oPct);
  };

  // Validation
  const poolSum =
    Number(companyCostPercent || 0) +
    Number(employeePoolPercent || 0) +
    Number(leadershipPoolPercent || 0);

  const execSum = Number(ceoPercent || 0) + Number(cooPercent || 0);

  const isPoolSumValid = Math.abs(poolSum - 100) < 0.05;
  const isExecSumValid = Math.abs(execSum - leadershipPoolPercent) < 0.05;

  // Real-time calculation preview
  const totalRevenue = Number(overview?.summary?.totalOrderRevenue || 0);
  const leadershipAllocated = totalRevenue * (Number(leadershipPoolPercent || 0) / 100);
  const ceoAmount = totalRevenue * (Number(ceoPercent || 0) / 100);
  const cooAmount = totalRevenue * (Number(cooPercent || 0) / 100);

  const ceoRatioOfPool =
    leadershipPoolPercent > 0
      ? Number(((ceoPercent / leadershipPoolPercent) * 100).toFixed(1))
      : 50;
  const cooRatioOfPool =
    leadershipPoolPercent > 0
      ? Number(((cooPercent / leadershipPoolPercent) * 100).toFixed(1))
      : 50;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isPoolSumValid) {
      toast.error(`Main pools must sum to 100%. Current: ${poolSum.toFixed(1)}%`);
      return;
    }
    if (!isExecSumValid) {
      toast.error(
        `CEO + COO (${execSum.toFixed(1)}%) must equal Leadership Pool (${leadershipPoolPercent}%)!`,
      );
      return;
    }

    try {
      await updateSettings({
        companyCostPercent: Number(companyCostPercent),
        employeePoolPercent: Number(employeePoolPercent),
        leadershipPoolPercent: Number(leadershipPoolPercent),
        ceoPercent: Number(ceoPercent),
        cooPercent: Number(cooPercent),
        ceoShareRatio: ceoRatioOfPool,
        cooShareRatio: cooRatioOfPool,
      }).unwrap();

      toast.success(
        `Percentages updated! Leadership: ${leadershipPoolPercent}% (CEO: ${ceoPercent}%, COO: ${cooPercent}%)`,
      );
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update percentages");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dynamic Percentage & Profit Allocation Engine"
      size="lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300">
          Set the dynamic revenue allocation. If <strong>Leadership Pool is 60%</strong>, you can individually assign <strong>CEO: 20%</strong> and <strong>COO: 40%</strong> (or any individual percentages summing to 60%).
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Split Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset(30, 10, 60, 20, 40)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              ⭐ 60% Leadership (20% CEO / 40% COO)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(30, 10, 60, 30, 30)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              ⚖️ 60% Leadership (30% CEO / 30% COO)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(40, 30, 30, 18, 12)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              🏢 30% Leadership (18% CEO / 12% COO)
            </button>
          </div>
        </div>

        {/* 1. Main Revenue Pools */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-primary" />
              1. Main Revenue Split (Must Equal 100%)
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isPoolSumValid
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isPoolSumValid ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> {poolSum.toFixed(0)}%
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" /> {poolSum.toFixed(0)}% / 100%
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cost Pool */}
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  Company Cost
                </span>
                <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {companyCostPercent}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={companyCostPercent}
                onChange={(e) => setCompanyCostPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={companyCostPercent}
                onChange={(e) => setCompanyCostPercent(parseFloat(e.target.value) || 0)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Employee Pool */}
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Employee Pool
                </span>
                <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {employeePoolPercent}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={employeePoolPercent}
                onChange={(e) => setEmployeePoolPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={employeePoolPercent}
                onChange={(e) => setEmployeePoolPercent(parseFloat(e.target.value) || 0)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Leadership Pool */}
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Leadership Pool
                </span>
                <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                  {leadershipPoolPercent}%
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={leadershipPoolPercent}
                onChange={(e) => handleLeadershipPoolChange(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={leadershipPoolPercent}
                onChange={(e) => handleLeadershipPoolChange(e.target.value)}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Executive Individual Split (CEO % & COO %) */}
        <div className="space-y-3 pt-3 border-t dark:border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                2. Individual CEO & COO Share (Must Equal {leadershipPoolPercent}%)
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Direct revenue percentage for each executive (e.g. 20% CEO & 40% COO = 60% Leadership Pool)
              </p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                isExecSumValid
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
              }`}
            >
              {isExecSumValid ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> {execSum.toFixed(0)}% / {leadershipPoolPercent}%
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3" /> {execSum.toFixed(0)}% ≠ {leadershipPoolPercent}%
                </>
              )}
            </span>
          </div>

          {/* Dual range slider */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
              <span className="text-amber-600 dark:text-amber-400">CEO: {ceoPercent}%</span>
              <span>Leadership Pool: {leadershipPoolPercent}%</span>
              <span className="text-violet-600 dark:text-violet-400">COO: {cooPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max={leadershipPoolPercent || 100}
              step="1"
              value={ceoPercent}
              onChange={(e) => handleCeoChange(e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CEO Input Card */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  CEO Individual Revenue %
                </span>
                <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">
                  {ceoPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={leadershipPoolPercent || 100}
                  step="1"
                  value={ceoPercent}
                  onChange={(e) => handleCeoChange(e.target.value)}
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
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Estimated Earnings:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  ${ceoAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* COO Input Card */}
            <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-violet-800 dark:text-violet-300">
                  COO Individual Revenue %
                </span>
                <span className="font-mono font-bold text-sm text-violet-700 dark:text-violet-400">
                  {cooPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={leadershipPoolPercent || 100}
                  step="1"
                  value={cooPercent}
                  onChange={(e) => handleCooChange(e.target.value)}
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
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Estimated Earnings:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  ${cooAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Live Dynamic Split Calculation Preview Box */}
        <div className="p-3.5 bg-gradient-to-r from-amber-50/80 via-white to-violet-50/80 dark:from-amber-950/20 dark:via-gray-900 dark:to-violet-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-2">
          <div className="flex justify-between items-center font-bold text-gray-800 dark:text-gray-200">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Leadership Pool Dynamic Split Preview:
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              ${leadershipAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({leadershipPoolPercent}% of Revenue)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-[11px] pt-1">
            <div className="p-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-amber-300 dark:border-amber-800">
              <span className="font-bold text-amber-700 dark:text-amber-300 block">
                CEO: {ceoPercent}% of Revenue
              </span>
              <span className="text-gray-500 text-[10px] block">
                = {ceoRatioOfPool}% of Leadership Pool
              </span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm block mt-1">
                ${ceoAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <div className="p-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-violet-300 dark:border-violet-800">
              <span className="font-bold text-violet-700 dark:text-violet-300 block">
                COO: {cooPercent}% of Revenue
              </span>
              <span className="text-gray-500 text-[10px] block">
                = {cooRatioOfPool}% of Leadership Pool
              </span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm block mt-1">
                ${cooAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <PrimaryButton
            type="submit"
            disabled={isLoading || !isPoolSumValid || !isExecSumValid}
          >
            {isLoading ? "Saving..." : "Save & Apply Dynamic Split"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

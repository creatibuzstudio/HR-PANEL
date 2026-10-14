import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, PieChart as PieIcon, TrendingUp, Info } from "lucide-react";

export default function FinancePieChart({ overview }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!overview) return null;

  const totalOrderRevenue = Number(overview?.summary?.totalOrderRevenue || 0);
  const companyCostPercent = Number(overview?.pools?.companyCost?.percent || 40);
  const employeePoolPercent = Number(overview?.pools?.employeePool?.percent || 30);
  const ceoEffectivePercent = Number(
    overview?.executives?.ceo?.effectivePercentOfTotalRevenue || 18
  );
  const cooEffectivePercent = Number(
    overview?.executives?.coo?.effectivePercentOfTotalRevenue || 12
  );

  const companyCostAmount = Number(overview?.pools?.companyCost?.allocated || 0);
  const employeePoolAmount = Number(overview?.pools?.employeePool?.allocated || 0);
  const ceoAmount = Number(overview?.executives?.ceo?.totalEarnings || 0);
  const cooAmount = Number(overview?.executives?.coo?.totalEarnings || 0);

  const data = [
    {
      name: "Company Cost Fund",
      value: companyCostPercent,
      amount: companyCostAmount,
      color: "#4F46E5", // Indigo
      subtext: `Spent: $${Number(overview?.pools?.companyCost?.spent || 0).toLocaleString()} | Remaining: $${Number(overview?.pools?.companyCost?.netBalance || 0).toLocaleString()}`,
    },
    {
      name: "Employee Profit Pool",
      value: employeePoolPercent,
      amount: employeePoolAmount,
      color: "#10B981", // Emerald
      subtext: "Distributed across eligible team members",
    },
    {
      name: "CEO Executive Share",
      value: ceoEffectivePercent,
      amount: ceoAmount,
      color: "#F59E0B", // Amber
      subtext: `${overview?.executives?.ceo?.shareRatioOfLeadership || 60}% of Leadership Pool`,
    },
    {
      name: "COO Executive Share",
      value: cooEffectivePercent,
      amount: cooAmount,
      color: "#8B5CF6", // Violet
      subtext: `${overview?.executives?.coo?.shareRatioOfLeadership || 40}% of Leadership Pool`,
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {item.name}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-1 border-t dark:border-gray-800">
            <span className="text-gray-500">Allocation:</span>
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              {item.value}%
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-gray-500">Dollar Amount:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          {item.subtext && (
            <p className="text-[11px] text-gray-400 pt-1 italic">
              {item.subtext}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#1a191b] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-lg">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Dynamic Profit & Revenue Allocation (Pie)
            </h3>
            <p className="text-xs text-gray-500">
              Real-time revenue split across Company Cost, Employees, CEO & COO
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">Total Revenue</span>
          <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
            ${totalOrderRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="py-4 h-[270px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter:
                      activeIndex === index
                        ? `drop-shadow(0 0 8px ${entry.color}88)`
                        : "none",
                    transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                    transformOrigin: "center center",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Legend & Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t dark:border-gray-800">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate" title={item.name}>
                {item.name}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {item.value}%
              </span>
              <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                ${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import Modal from "@/components/ui/modal";
import {
  Calendar,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import moment from "moment";

export default function PayrollHistoryModal({
  isOpen,
  onClose,
  history = [],
  onSelectMonth,
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-5 p-1">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Payroll & Payout Cycle Archives
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Historical record of finalized and draft monthly distribution runs
            </p>
          </div>
        </div>

        {/* History Table */}
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            <Calendar className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
            No previous monthly payroll snapshots saved yet. Generate one to start archiving.
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4">Cycle Month</th>
                  <th className="py-3 px-4">Revenue Basis</th>
                  <th className="py-3 px-4">Employee Pool</th>
                  <th className="py-3 px-4">Paid Employees</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-gray-700 dark:text-gray-300">
                {history.map((item) => {
                  const isPaid = item.status === "paid";
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{item.monthName || item.monthYear}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        ${Number(item.totalOrderRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ${Number(item.employeePoolAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {item.totalEmployeesPaid || item.items?.filter((i) => i.type === "employee" && i.paymentStatus === "paid").length || 0} Paid
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Disbursed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectMonth) onSelectMonth(item.monthYear);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

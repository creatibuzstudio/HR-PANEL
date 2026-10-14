import React, { useState } from "react";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import IconButton from "@/components/ui/buttons/icon-button";
import DeleteConfirmModal from "@/components/ui/modal/DeleteConfirmModal";
import CapitalInvoiceModal from "./CapitalInvoiceModal";
import { useDeleteCapitalMutation } from "@/services/finance/financeApiSlice";
import toast from "react-hot-toast";
import { Plus, Coins, Trash2, Mail, Phone, Calendar, Percent, AlertCircle, FileText, UserCheck } from "lucide-react";
import moment from "moment";

export default function CapitalsTable({
  capitals = [],
  isLoading,
  onAddCapital,
}) {
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: null,
  });

  const [invoiceModalState, setInvoiceModalState] = useState({
    isOpen: false,
    capital: null,
  });

  const [deleteCapital, { isLoading: isDeleting }] = useDeleteCapitalMutation();

  const handleDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      await deleteCapital(deleteModalState.id).unwrap();
      toast.success("Investor capital record deleted successfully");
      setDeleteModalState({ isOpen: false, id: null });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete investor capital");
    }
  };

  const totalCapital = capitals.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0
  );

  return (
    <div className="bg-white dark:bg-[#1a191b] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-500" />
            Investor Capital & Equity Portfolio
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Total Injected Capital:{" "}
            <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              ${totalCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </p>
        </div>
        <PrimaryButton onClick={onAddCapital} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Record Investor Capital
        </PrimaryButton>
      </div>

      {capitals.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <Coins className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            No investor capital recorded yet
          </h4>
          <p className="text-xs text-gray-500">
            Click "Record Investor Capital" to log an investment tranche or equity contribution with an official invoice.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 dark:bg-gray-800/40 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Investor Name</th>
                <th className="px-5 py-3.5">Amount ($)</th>
                <th className="px-5 py-3.5">Equity Share</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5">Investment Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {capitals.map((item) => {
                const invNo =
                  item.invoiceNumber || `INV-CAP-${item.id?.slice(0, 8).toUpperCase()}`;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-xs text-primary">
                        {invNo}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {item.investorName}
                        {item.user && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                            title="Linked with System User API"
                          >
                            <UserCheck className="w-2.5 h-2.5 mr-0.5" /> API
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        {item.investorEmail && <span>{item.investorEmail}</span>}
                        {item.investorPhone && <span>• {item.investorPhone}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                      ${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-700 dark:text-gray-300">
                      {item.equityPercentage ? `${item.equityPercentage}%` : "Non-equity"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                        {item.paymentMethod || "Bank Transfer"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {item.investmentDate || moment(item.createdAt).format("YYYY-MM-DD")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          icon={FileText}
                          onClick={() =>
                            setInvoiceModalState({ isOpen: true, capital: item })
                          }
                          className="text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20"
                          title="View / Print Official Investment Invoice"
                        />
                        <IconButton
                          icon={Trash2}
                          onClick={() =>
                            setDeleteModalState({ isOpen: true, id: item.id })
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete Investor Capital Record"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal */}
      <CapitalInvoiceModal
        isOpen={invoiceModalState.isOpen}
        capital={invoiceModalState.capital}
        onClose={() => setInvoiceModalState({ isOpen: false, capital: null })}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Investor Capital Record"
        message="Are you sure you want to delete this investor capital entry? This will update the company total treasury balance."
        loading={isDeleting}
      />
    </div>
  );
}

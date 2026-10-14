import React, { useRef } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import DualExecutiveSignature from "@/components/invoice/DualExecutiveSignature";
import { Printer, Copy, CheckCircle2, Coins, Calendar, DollarSign, Percent, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { printElement } from "@/utils/printHelper";

export default function CapitalInvoiceModal({ isOpen, onClose, capital }) {
  const printRef = useRef(null);

  if (!capital) return null;

  const invoiceNumber =
    capital.invoiceNumber || `INV-CAP-${capital.id?.slice(0, 8).toUpperCase()}`;

  const copyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoiceNumber);
    toast.success("Invoice number copied to clipboard");
  };

  const handlePrint = () => {
    printElement(printRef.current || "printable-capital-invoice", `Capital-Receipt-${invoiceNumber}`);
  };

  const amount = Number(capital.amount || 0);
  const equity = capital.equityPercentage ? Number(capital.equityPercentage) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-5">
        {/* Printable Area */}
        <div
          ref={printRef}
          id="printable-capital-invoice"
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-xl space-y-7 text-gray-900 dark:text-gray-100"
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-1.5">
              <img
                src="/creatibuz-logo.png"
                alt="Creatibuz Studio"
                className="h-10 sm:h-12 w-auto object-contain max-w-[240px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Corporate Treasury & Equity Management Department
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Email: finance@creatibuz.com | Web: creatibuzstudio.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 block">
                OFFICIAL INVESTMENT RECEIPT
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-start sm:justify-end">
                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {invoiceNumber}
                </span>
                <button
                  type="button"
                  onClick={copyInvoiceNumber}
                  title="Copy"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mt-1">
                <CheckCircle2 className="w-3 h-3" /> CAPITAL INJECTED
              </span>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            {/* Investor info */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                INVESTOR INFORMATION
              </span>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                {capital.investorName}
              </h4>
              {capital.user && (
                <p className="text-xs text-primary font-medium">
                  Verified System Account (ID: {capital.user.id?.slice(0, 8)})
                </p>
              )}
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Email: {capital.investorEmail || capital.user?.email || "N/A"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Phone: {capital.investorPhone || capital.user?.phone || "N/A"}
              </p>
            </div>

            {/* Investment Meta */}
            <div className="space-y-1 sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">
                TRANCHE & METHOD
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Date:{" "}
                <strong className="text-gray-900 dark:text-white">
                  {capital.investmentDate || moment(capital.createdAt).format("MMM DD, YYYY")}
                </strong>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Payment Channel:{" "}
                <strong className="text-gray-900 dark:text-white">
                  {capital.paymentMethod || "Bank Wire"}
                </strong>
              </p>
              {capital.reference && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Ref / Txn ID:{" "}
                  <strong className="font-mono text-gray-900 dark:text-white">
                    {capital.reference}
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* Capital Statement Table */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-semibold text-gray-500 border-b dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Equity / Share</th>
                  <th className="px-4 py-3 text-right">Investment Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">
                      Company Capital Investment Contribution
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Tranche allocated to Creatibuz Studio Corporate Capital Reserve
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {equity > 0 ? `${equity}% Equity` : "Non-equity Capital"}
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-bold text-base text-gray-900 dark:text-white">
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Total Injected Capital:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Equity Issued:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {equity}%
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700">
                <span>Net Treasury Credit:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {capital.notes && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
              <strong className="text-gray-700 dark:text-gray-300 block mb-0.5">
                Terms & Conditions:
              </strong>
              {capital.notes}
            </div>
          )}

          {/* Investor Acknowledgement & Verification */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-xs">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Investor Beneficiary</span>
                <strong className="text-gray-900 dark:text-white text-sm">{capital.investorName}</strong>
                <span className="text-gray-500 block text-[11px]">{capital.investorEmail || "Shareholder"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Capital Received & Credited to Treasury
              </div>
            </div>
          </div>

          {/* Executive Authorization: Dual CEO & COO Signatures (Dynamically resolved from User API) */}
          <DualExecutiveSignature date={capital.createdAt} />
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <PrimaryButton onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

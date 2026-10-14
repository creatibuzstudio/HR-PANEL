import React, { useRef } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import DualExecutiveSignature from "@/components/invoice/DualExecutiveSignature";
import {
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Receipt,
  CreditCard,
  Calendar,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { printElement } from "@/utils/printHelper";

export default function OrderInvoiceModal({
  isOpen,
  onClose,
  order,
  onRecordPayment,
}) {
  const printRef = useRef(null);

  if (!order) return null;

  const discount = Number(order.discount || 0);
  const tax = Number(order.tax || 0);

  // Base subtotal
  const subtotal =
    order.subtotal !== undefined && order.subtotal !== null
      ? Number(order.subtotal)
      : Math.max(0, Number(order.budget || 0) + discount - tax);

  // Invoiced total = Subtotal - Discount + Tax
  const total =
    order.budget !== undefined && order.budget !== null
      ? Number(order.budget)
      : Math.max(0, subtotal - discount + tax);

  const payments = Array.isArray(order.payments) ? order.payments : [];
  const pStatus = String(order.paymentStatus || "").toLowerCase();
  const pmtSum = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const advance =
    pStatus === "paid"
      ? Math.max(total, Number(order.advance || 0), pmtSum)
      : Math.max(Number(order.advance || 0), pmtSum);
  const balanceDue = Math.max(0, total - advance);

  const clientName =
    order.client?.name || order.clientName || "Valued Client";
  const clientEmail =
    order.client?.email || order.clientEmail || "client@creatibuz.com";
  const clientPhone =
    order.client?.phone || order.clientPhone || "N/A";
  const clientAddress =
    order.client?.location || order.clientAddress || "Remote / Global";

  const invoiceNumber =
    order.invoiceNumber || `INV-${order.id?.slice(0, 8).toUpperCase()}`;

  const createdDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  const dueDate = order.dueDate
    ? new Date(order.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Upon Delivery";

  const handlePrint = () => {
    printElement(printRef.current || "printable-order-invoice", `Invoice-${invoiceNumber}`);
  };

  const copyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoiceNumber);
    toast.success("Invoice number copied to clipboard");
  };

  const getPaymentBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" /> PAID IN FULL
        </span>
      );
    }
    if (s === "partial") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800">
          <Clock className="w-3.5 h-3.5" /> PARTIALLY PAID
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800">
        <AlertCircle className="w-3.5 h-3.5" /> UNPAID
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-6">
        {/* Printable Invoice Container */}
        <div
          ref={printRef}
          id="printable-order-invoice"
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-xl space-y-8 text-gray-900 dark:text-gray-100"
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
                UI/UX, Full-Stack Software & Digital Product Engineering
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Email: hello@creatibuz.com | Web: creatibuzstudio.com
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 block">
                OFFICIAL INVOICE
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-start sm:justify-end">
                <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {invoiceNumber}
                </span>
                <button
                  type="button"
                  onClick={copyInvoiceNumber}
                  title="Copy"
                  className="p-1 hover:text-primary transition-colors text-gray-400 print:hidden"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center sm:justify-end">
                {getPaymentBadge(order.paymentStatus)}
              </div>
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 text-xs">
            <div>
              <span className="text-gray-500 uppercase tracking-wider block font-semibold">
                Billed To:
              </span>
              <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                {clientName}
              </p>
              <p className="text-gray-600 dark:text-gray-400">{clientEmail}</p>
              {clientPhone !== "N/A" && (
                <p className="text-gray-600 dark:text-gray-400">{clientPhone}</p>
              )}
              <p className="text-gray-500 italic mt-0.5">{clientAddress}</p>
            </div>

            <div>
              <span className="text-gray-500 uppercase tracking-wider block font-semibold">
                Date Issued:
              </span>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mt-1">
                {createdDate}
              </p>
              <span className="text-gray-500 uppercase tracking-wider block font-semibold mt-3">
                Due Date:
              </span>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                {dueDate}
              </p>
            </div>

            <div>
              <span className="text-gray-500 uppercase tracking-wider block font-semibold">
                Category / Service:
              </span>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mt-1">
                {order.category?.name || "Digital Engineering"}
              </p>
              <span className="text-gray-500 uppercase tracking-wider block font-semibold mt-3">
                Timeline / Duration:
              </span>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                {order.duration || "N/A"}
              </p>
            </div>

            <div>
              <span className="text-gray-500 uppercase tracking-wider block font-semibold">
                Project Status:
              </span>
              <p className="font-bold text-sm capitalize text-primary mt-1">
                {order.status || "Onboard"}
              </p>
              <span className="text-gray-500 uppercase tracking-wider block font-semibold mt-3">
                Project Progress:
              </span>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                {order.projectProgress || "0%"}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-2">Description / Project Deliverables</th>
                  <th className="py-3 px-2 text-center">Service Category</th>
                  <th className="py-3 px-2 text-center">Duration</th>
                  <th className="py-3 px-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                <tr>
                  <td className="py-4 px-2">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {order.projectName}
                    </p>
                    {order.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                        {order.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center text-gray-600 dark:text-gray-300">
                    {order.category?.name || "General Service"}
                  </td>
                  <td className="py-4 px-2 text-center text-gray-600 dark:text-gray-300">
                    {order.duration || "Standard"}
                  </td>
                  <td className="py-4 px-2 text-right font-mono font-semibold text-gray-900 dark:text-white">
                    ${subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-2 max-w-sm text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                Payment Instructions:
              </span>
              <p>
                Please include invoice number{" "}
                <span className="font-mono font-semibold text-primary">{invoiceNumber}</span>{" "}
                on your wire or payment reference.
              </p>
              <p>
                All deliverables and intellectual property transfer upon final settlement of the outstanding balance.
              </p>
            </div>

            <div className="w-full sm:w-80 space-y-2 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">
                  ${subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs">
                  <span>Discount:</span>
                  <span className="font-mono font-semibold">
                    -${discount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {tax > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 text-xs">
                  <span>Tax:</span>
                  <span className="font-mono font-semibold">
                    +${tax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Total Invoiced:</span>
                <span className="font-mono text-base">
                  ${total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span>Total Paid:</span>
                <span className="font-mono">
                  ${advance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="pt-2 border-t border-dashed border-gray-300 dark:border-gray-700 flex justify-between items-center text-base font-extrabold">
                <span className="text-gray-900 dark:text-white">Balance Due:</span>
                <span
                  className={`font-mono ${
                    balanceDue === 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  ${balanceDue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Receipts & Transaction Log (If payments recorded) */}
          {payments.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <Receipt className="w-4 h-4 text-primary" />
                <span>Payment Receipts & Transaction History</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="py-2.5 px-3">Receipt #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Reference / Note</th>
                      <th className="py-2.5 px-3 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono">
                    {payments.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-2.5 px-3 font-bold text-primary">
                          {p.receiptNumber || `REC-${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400 font-sans">
                          {p.paymentDate || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-sans capitalize">
                          {p.paymentMethod || "Bank Transfer"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 font-sans italic">
                          {p.transactionId ? `Ref: ${p.transactionId} ` : ""}
                          {p.note || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          +${Number(p.amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Executive Authorization: Dual CEO & COO Signatures (Dynamically resolved from User API) */}
          <DualExecutiveSignature date={order.createdAt} />

          {/* Footer note */}
          <div className="pt-2 text-center text-xs text-gray-400">
            Thank you for partnering with Creatibuz Studio. We build high-impact digital experiences.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-2 print:hidden">
          <div className="flex items-center gap-2">
            {balanceDue > 0 && onRecordPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordPayment(order);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Receive Due Payment (${balanceDue.toLocaleString()})</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton type="button" variant="secondary" onClick={onClose}>
              Close
            </PrimaryButton>
            <PrimaryButton
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

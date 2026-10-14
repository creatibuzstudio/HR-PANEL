import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import TextareaField from "@/components/ui/input/TextareaField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecordPaymentMutation } from "@/services/order/orderApiSlice";
import {
  DollarSign,
  Receipt,
  CreditCard,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Credit / Debit Card",
  "Cash",
  "Stripe",
  "PayPal",
  "Wire Transfer",
  "Cheque",
  "Other",
];

export default function RecordPaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}) {
  const [recordPayment, { isLoading }] = useRecordPaymentMutation();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");

  const discount = Number(order?.discount || 0);
  const tax = Number(order?.tax || 0);
  const subtotal =
    order?.subtotal !== undefined && order?.subtotal !== null
      ? Number(order.subtotal)
      : Math.max(0, Number(order?.budget || 0) + discount - tax);
  const total =
    order?.budget !== undefined && order?.budget !== null
      ? Number(order.budget)
      : Math.max(0, subtotal - discount + tax);
  const pStatus = String(order?.paymentStatus || "").toLowerCase();
  const pmtSum = Array.isArray(order?.payments)
    ? order.payments.reduce((s, p) => s + Number(p.amount || 0), 0)
    : 0;
  const advance =
    pStatus === "paid"
      ? Math.max(total, Number(order?.advance || 0), pmtSum)
      : Math.max(Number(order?.advance || 0), pmtSum);
  const currentDue = Math.max(0, total - advance);

  const generateReceiptNum = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    const num = `REC-${year}-${rand}`;
    setReceiptNumber(num);
    return num;
  };

  useEffect(() => {
    if (order && isOpen) {
      setAmount(currentDue > 0 ? String(currentDue) : "");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("Bank Transfer");
      setTransactionId("");
      setNote("");
      generateReceiptNum();
    }
  }, [order, isOpen, currentDue]);

  if (!order) return null;

  const enteredAmount = Number(amount || 0);
  const projectedRemaining = Math.max(0, currentDue - enteredAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      const payload = {
        amount: Number(amount),
        paymentMethod,
        paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        receiptNumber: receiptNumber || generateReceiptNum(),
        transactionId: transactionId.trim() || undefined,
        note: note.trim() || undefined,
      };

      const result = await recordPayment({
        id: order.id,
        paymentData: payload,
      }).unwrap();

      toast.success("Payment recorded and receipt generated!");
      onClose();
      onPaymentSuccess?.(result?.data?.order || { ...order, advance: advance + Number(amount) });
    } catch (err) {
      const msg = err?.data?.message;
      toast.error(
        typeof msg === "string"
          ? msg
          : Array.isArray(msg)
          ? msg[0]
          : "Failed to record payment"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Due Payment / Collect Payment"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order & Financial Overview Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-gray-900 to-[#1e1510] text-white border border-primary/20 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10 text-xs">
            <span className="font-semibold text-primary uppercase tracking-wider">
              {order.projectName}
            </span>
            <span className="font-mono text-gray-300">
              {order.invoiceNumber || `INV-${order.id?.slice(0, 8)}`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 text-center">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Total Invoiced
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-gray-200">
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Already Paid
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                ${advance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Outstanding Due
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-amber-400">
                ${currentDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Input Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount to Pay */}
            <div>
              <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
                Payment Amount ($) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                <span>Remaining after this:</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                  ${projectedRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-black font-[500] dark:text-white/75 text-[14px]">
                Payment Method *
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Date */}
            <div>
              <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Receipt Number (Auto Generated) */}
            <div>
              <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
                Receipt Number (Auto Generated)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="e.g. REC-2026-104928"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold text-primary"
                />
                <button
                  type="button"
                  onClick={generateReceiptNum}
                  title="Generate New Receipt Number"
                  className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1 text-xs shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reference / Transaction ID */}
          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Transaction Ref / Check # (Optional)
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN-9482749, Wire Ref #10293, Cheque #004"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Payment Notes */}
          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Payment Remarks / Notes (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Milestone 2 settlement received via wire transfer..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-800">
          <div className="text-xs text-gray-500">
            Receipt will be recorded in the order's invoice history.
          </div>
          <div className="flex items-center space-x-3">
            <PrimaryButton type="button" onClick={onClose} variant="secondary">
              Cancel
            </PrimaryButton>
            <PrimaryButton type="submit" disabled={isLoading} className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{isLoading ? "Recording..." : "Record Payment & Generate Invoice"}</span>
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}

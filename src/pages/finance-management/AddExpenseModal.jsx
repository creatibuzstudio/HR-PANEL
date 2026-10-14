import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import { useCreateExpenseMutation } from "@/services/finance/financeApiSlice";
import toast from "react-hot-toast";
import { DollarSign, Tag, Calendar, Building, FileText, Link as LinkIcon } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Office Rent & Facilities",
  "Hardware & Devices",
  "Software & Cloud Subscriptions",
  "Server & Infrastructure",
  "Marketing & Advertising",
  "Utilities & Electricity",
  "Team Refreshments & Events",
  "Office Supplies & Furniture",
  "Legal, Audit & Taxes",
  "Other Operational Expense",
];

export default function AddExpenseModal({ isOpen, onClose }) {
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const [formData, setFormData] = useState({
    title: "",
    category: EXPENSE_CATEGORIES[0],
    amount: "",
    vendor: "",
    expenseDate: new Date().toISOString().split("T")[0],
    receiptUrl: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error("Please enter the expense title");
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }

    try {
      await createExpense({
        title: formData.title.trim(),
        category: formData.category,
        amount: amt,
        vendor: formData.vendor?.trim() || undefined,
        expenseDate: formData.expenseDate,
        receiptUrl: formData.receiptUrl?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      }).unwrap();

      toast.success("Expense requisition submitted! Awaiting CEO & COO dual approvals.");
      onClose();
      setFormData({
        title: "",
        category: EXPENSE_CATEGORIES[0],
        amount: "",
        vendor: "",
        expenseDate: new Date().toISOString().split("T")[0],
        receiptUrl: "",
        notes: "",
      });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create expense requisition");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Company Expense / Cost"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
          <strong>Note:</strong> All company expenses require dual approval from both the <strong>CEO</strong> and <strong>COO</strong> before disbursement from the Company Cost Fund.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Expense Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. New Mac Studio M2 / AWS Cloud Bill"
            required
            startIcon={Tag}
          />

          <TextField
            label="Amount ($) *"
            name="amount"
            type="number"
            step="any"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 1500"
            required
            startIcon={DollarSign}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <TextField
            label="Vendor / Supplier"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            placeholder="e.g. Apple Store, Amazon, Landlord"
            startIcon={Building}
          />

          <TextField
            label="Expense Date"
            name="expenseDate"
            type="date"
            value={formData.expenseDate}
            onChange={handleChange}
            startIcon={Calendar}
          />

          <TextField
            label="Receipt / Invoice URL"
            name="receiptUrl"
            type="url"
            value={formData.receiptUrl}
            onChange={handleChange}
            placeholder="https://drive.google.com/... or receipt link"
            startIcon={LinkIcon}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-500" />
            Justification & Description
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Reason for purchase, team benefit, quotation reference..."
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Expense Requisition"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

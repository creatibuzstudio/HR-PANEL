import React, { useState } from "react";
import Modal from "@/components/ui/modal";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import { useCreateCapitalMutation } from "@/services/finance/financeApiSlice";
import { useGetUserWithSearchQuery } from "@/services/user/userApiSlice";
import toast from "react-hot-toast";
import {
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
  Percent,
  FileText,
  UserCheck,
  Search,
} from "lucide-react";

export default function AddCapitalModal({ isOpen, onClose }) {
  const [createCapital, { isLoading }] = useCreateCapitalMutation();
  const { data: usersData } = useGetUserWithSearchQuery({ page: 1, limit: 100 });

  const systemUsers = usersData?.items || [];

  const [formData, setFormData] = useState({
    userId: "",
    investorName: "",
    email: "",
    phone: "",
    amount: "",
    investmentDate: new Date().toISOString().split("T")[0],
    equityPercentage: "",
    paymentMethod: "Bank Transfer",
    notes: "",
  });

  const handleSelectUser = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData((prev) => ({
        ...prev,
        userId: "",
      }));
      return;
    }
    const selectedUser = systemUsers.find((u) => u.id === selectedId);
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        userId: selectedUser.id,
        investorName: selectedUser.name || "",
        email: selectedUser.email || "",
        phone: selectedUser.phone || "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.investorName?.trim()) {
      toast.error("Please enter or select the investor name");
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }

    try {
      await createCapital({
        userId: formData.userId || undefined,
        investorName: formData.investorName.trim(),
        investorEmail: formData.email?.trim() || undefined,
        investorPhone: formData.phone?.trim() || undefined,
        amount: amt,
        investmentDate: formData.investmentDate,
        equityPercentage: formData.equityPercentage
          ? parseFloat(formData.equityPercentage)
          : undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes?.trim() || undefined,
      }).unwrap();

      toast.success("Investor capital recorded successfully with official invoice!");
      onClose();
      setFormData({
        userId: "",
        investorName: "",
        email: "",
        phone: "",
        amount: "",
        investmentDate: new Date().toISOString().split("T")[0],
        equityPercentage: "",
        paymentMethod: "Bank Transfer",
        notes: "",
      });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to record investor capital");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Investor Capital & Generate Invoice"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamic User Selection from User API */}
        <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1.5">
          <label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" />
              Link Existing User / Client (User API)
            </span>
            <span className="text-[11px] text-gray-500 font-normal">
              Auto-fills name, email, phone
            </span>
          </label>
          <select
            value={formData.userId}
            onChange={handleSelectUser}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Choose User from User API or type manually below --</option>
            {systemUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email}) — [Role: {u.role?.toUpperCase() || "USER"}]
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Investor Name *"
            name="investorName"
            value={formData.investorName}
            onChange={handleChange}
            placeholder="e.g. John Doe / Venture Partner"
            required
            startIcon={User}
          />

          <TextField
            label="Investment Amount ($) *"
            name="amount"
            type="number"
            step="any"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g. 25000"
            required
            startIcon={DollarSign}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="investor@example.com"
            startIcon={Mail}
          />

          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+880 1..."
            startIcon={Phone}
          />

          <TextField
            label="Investment Date"
            name="investmentDate"
            type="date"
            value={formData.investmentDate}
            onChange={handleChange}
            startIcon={Calendar}
          />

          <TextField
            label="Equity / Share (%)"
            name="equityPercentage"
            type="number"
            step="any"
            value={formData.equityPercentage}
            onChange={handleChange}
            placeholder="e.g. 5"
            startIcon={Percent}
          />

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Wire Transfer">Wire Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="Crypto">Crypto / USDT</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-500" />
            Notes & Investment Terms
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Terms, tranche conditions, official agreement references..."
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
            {isLoading ? "Saving..." : "Save Capital & Issue Invoice"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

import React from "react";
import Modal from "@/components/ui/modal";
import { Mail, Phone, MapPin, Calendar, UserCheck, Shield } from "lucide-react";
import moment from "moment";
import PrimaryButton from "@/components/ui/buttons/primary-button";

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  onEdit,
}) {
  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Details"
      size="lg"
    >
      <div className="space-y-6 py-2">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60">
          <img
            src={
              customer.picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                customer.name || "Customer"
              )}&background=0D8ABC&color=fff&size=160`
            }
            alt={customer.name || "Customer"}
            className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                customer.name || "Customer"
              )}&background=0D8ABC&color=fff&size=160`;
            }}
          />
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {customer.name || "Unnamed Customer"}
            </h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <UserCheck className="w-3.5 h-3.5" />
                Client Account
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {customer.id?.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Email Address
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-all">
                {customer.email || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="p-2 rounded-md bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Phone Number
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {customer.phone || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Location / Address
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {customer.location || customer.address || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Member Since
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {customer.createdAt
                  ? moment(customer.createdAt).format("MMMM DD, YYYY")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
          <PrimaryButton variant="secondary" onClick={onClose}>
            Close
          </PrimaryButton>
          {onEdit && (
            <PrimaryButton
              onClick={() => {
                onClose();
                onEdit(customer);
              }}
            >
              Edit Customer
            </PrimaryButton>
          )}
        </div>
      </div>
    </Modal>
  );
}

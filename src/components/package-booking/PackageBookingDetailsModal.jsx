import React, { useState } from "react";
import Modal from "@/components/ui/modal.jsx";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import moment from "moment";
import {
  User,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  Copy,
  Check,
  Edit,
  Tag,
  ShieldCheck,
  Layers,
  Phone,
  Send,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUpdateBookingMutation } from "@/services/package-booking/packageBookingApiSlice";

const getStatusBadge = (status) => {
  const norm = (status || "PENDING").toUpperCase();
  switch (norm) {
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200";
    case "PENDING":
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200";
  }
};

const PackageBookingDetailsModal = ({
  isOpen,
  onClose,
  booking,
  onEdit,
  onReply,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [updateBooking, { isLoading: isUpdatingStatus }] = useUpdateBookingMutation();

  if (!booking) return null;

  const pkg = booking.package;

  const handleCopyId = () => {
    if (booking.id) {
      navigator.clipboard.writeText(booking.id);
      setCopiedId(true);
      toast.success("Booking ID copied to clipboard");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateBooking({
        id: booking.id,
        data: { status: newStatus },
      }).unwrap();
      toast.success(`Booking status changed to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Package Booking Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Booking ID:
              </span>
              <code className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                {booking.id}
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition p-1"
                title="Copy ID"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Booked on:{" "}
                {booking.createdAt
                  ? moment(booking.createdAt).format("MMMM DD, YYYY [at] hh:mm A")
                  : "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                booking.status
              )}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {booking.status || "PENDING"}
            </span>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Quick Status Update:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(
              (st) => {
                const isActive = (booking.status || "PENDING").toUpperCase() === st;
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={isActive || isUpdatingStatus}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {st}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Customer & Company Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Details */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/40 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <User className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                Client Contact
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  booking.name || "Client"
                )}&background=3b82f6&color=fff&size=128`}
                alt={booking.name}
                className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {booking.name || "N/A"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{booking.userEmail || "N/A"}</span>
                </div>
                {booking.whatsappNumber && (
                  <div className="text-xs flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <a
                      href={`https://wa.me/${booking.whatsappNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                    >
                      {booking.whatsappNumber}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/40 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700/60">
              <Building className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                Company Details
              </h4>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-400 block">Company Name</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {booking.companyName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Company Email</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {booking.companyEmail || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booked Package Card */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Booked Package
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20">
              <Calendar className="w-3 h-3" />
              Cycle: {booking.billingCycle || "Standard"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                {pkg?.name || "Package ID: " + booking.packageId}
              </div>
              {pkg?.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-md">
                  {pkg.description}
                </p>
              )}
              {pkg?.category && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <Tag className="w-3 h-3 text-gray-400" />
                  Category: <strong>{pkg.category.name}</strong>
                </span>
              )}
            </div>

            <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-w-[130px]">
              <span className="text-xs text-gray-400 font-medium">Plan Price</span>
              <div className="text-2xl font-black text-primary">
                ${pkg?.price ?? "—"}
              </div>
              <span className="text-[11px] text-gray-500">
                Duration: {pkg?.duration || booking.billingCycle || "—"}
              </span>
            </div>
          </div>

          {/* Package Features List if available */}
          {pkg?.features && Array.isArray(pkg.features) && pkg.features.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                Included Features:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pkg.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-400">
            Last Updated:{" "}
            {booking.updatedAt
              ? moment(booking.updatedAt).fromNow()
              : "N/A"}
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Close
            </PrimaryButton>
            <PrimaryButton
              type="button"
              onClick={() => {
                onClose();
                onReply?.(booking);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-3.5 h-3.5" />
              Reply via Email
            </PrimaryButton>
            <PrimaryButton
              type="button"
              onClick={() => {
                onClose();
                onEdit?.(booking);
              }}
              className="flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Booking
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PackageBookingDetailsModal;
